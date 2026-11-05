#!/usr/bin/env bash
# Local deploy for vipboost01, run from the operator's machine.
#
# Replaces the former GitHub Actions workflows (removed 2026-11-05, owner
# decision: no GitHub Actions and no runners):
#   .github/workflows/deploy.yml       -> targets: vercel, railway, ssh
#   .github/workflows/deploy-free.yml  -> targets: pages, render
#
# Usage: scripts/deploy.sh <target> [<target> ...]
#   vercel   frontend/ -> Vercel production   (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
#   railway  repo -> Railway service vip-host-api (RAILWAY_TOKEN)
#   ssh      self-hosted docker-compose redeploy over ssh (SERVER_HOST, optional SERVER_USER);
#            disabled like the workflow job (`if: false`) unless VIPBOOST_ENABLE_SSH_DEPLOY=1
#   pages    build frontend/ and publish dist/ to the gh-pages branch (optional API_URL)
#   render   trigger a Render deploy of the backend (RENDER_DEPLOY_TOKEN, RENDER_BACKEND_SERVICE_ID)
#   all      vercel railway pages render (+ ssh when enabled), i.e. what one push to main ran
#
# The workflows ran on every push to main, so every target refuses to run
# unless the working tree is clean and HEAD == origin/main (after a fetch).
# Builds and uploads use a pristine `git archive` export of HEAD (what
# actions/checkout produced), never the working copy.
#
# Secrets are read from the environment only, under the same names the
# workflows used. They are passed to the CLIs through the environment or
# stdin, never on argv, and are never echoed or written to disk.

set -euo pipefail

readonly DEFAULT_BRANCH=main
readonly RAILWAY_SERVICE=vip-host-api
readonly NODE_MAJOR_EXPECTED=20

ROOT="$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)"
cd "$ROOT"

log() { printf '==> %s\n' "$*" >&2; }
warn() { printf 'warning: %s\n' "$*" >&2; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

usage() {
  sed -n '2,/^$/{s/^# \{0,1\}//;p}' "${BASH_SOURCE[0]}" >&2
  exit "${1:-2}"
}

require_env() {
  local name missing=()
  for name in "$@"; do
    [ -n "${!name:-}" ] || missing+=("$name")
  done
  [ "${#missing[@]}" -eq 0 ] || die "missing required environment variable(s): ${missing[*]}"
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "'$1' is required but not on PATH"
}

# Trigger guard: the workflows ran only for pushes to main.
guard_synced_with_origin() {
  log "checking working tree and origin/$DEFAULT_BRANCH"
  git fetch --quiet origin "$DEFAULT_BRANCH"
  local remote head
  remote="$(git rev-parse FETCH_HEAD)"
  head="$(git rev-parse HEAD)"
  [ -z "$(git status --porcelain)" ] \
    || die "working tree is not clean; commit or stash first"
  [ "$head" = "$remote" ] \
    || die "HEAD ($head) != origin/$DEFAULT_BRANCH ($remote); deploy only what is on origin/$DEFAULT_BRANCH"
  DEPLOY_SHA="$head"
  log "deploying $DEPLOY_SHA"
}

check_node() {
  require_cmd node
  local major
  major="$(node -p 'process.versions.node.split(".")[0]')"
  [ "$major" = "$NODE_MAJOR_EXPECTED" ] \
    || warn "the workflows used Node $NODE_MAJOR_EXPECTED; this machine has Node $(node --version)"
}

WORK=""
cleanup() { [ -z "$WORK" ] || rm -rf "$WORK"; }
trap cleanup EXIT

# Pristine copy of HEAD, the equivalent of actions/checkout.
export_tree() {
  if [ -z "$WORK" ]; then
    WORK="$(mktemp -d "${TMPDIR:-/tmp}/vipboost-deploy.XXXXXX")"
    mkdir "$WORK/src"
    git archive --format=tar "$DEPLOY_SHA" | tar -x -C "$WORK/src"
  fi
  SRC="$WORK/src"
}

# --- deploy.yml: deploy-frontend (amondnet/vercel-action, --prod, ./frontend)
deploy_vercel() {
  require_env VERCEL_TOKEN VERCEL_ORG_ID VERCEL_PROJECT_ID
  export_tree
  log "vercel: deploying frontend/ to production"
  # The Vercel CLI reads VERCEL_TOKEN, VERCEL_ORG_ID and VERCEL_PROJECT_ID
  # from the environment, so the token never appears on argv.
  (
    cd "$SRC/frontend"
    export VERCEL_TOKEN VERCEL_ORG_ID VERCEL_PROJECT_ID
    npx --yes "vercel@${VERCEL_CLI_VERSION:-latest}" deploy --prod --yes \
      --meta "githubCommitSha=$DEPLOY_SHA"
  )
}

# --- deploy.yml: deploy-backend (codegene/railway-deploy-action, service vip-host-api)
deploy_railway() {
  require_env RAILWAY_TOKEN
  export_tree
  log "railway: deploying service $RAILWAY_SERVICE"
  local railway=(railway)
  command -v railway >/dev/null 2>&1 \
    || railway=(npx --yes "@railway/cli@${RAILWAY_CLI_VERSION:-latest}")
  (
    cd "$SRC"
    export RAILWAY_TOKEN
    NODE_ENV=production "${railway[@]}" up --ci --service "$RAILWAY_SERVICE"
  )
}

# --- deploy.yml: deploy-self-hosted (appleboy/ssh-action), `if: false` in the workflow
deploy_ssh() {
  [ "${VIPBOOST_ENABLE_SSH_DEPLOY:-0}" = 1 ] \
    || die "ssh target is disabled, as the workflow job was (if: false); set VIPBOOST_ENABLE_SSH_DEPLOY=1 once the server is configured"
  require_env SERVER_HOST
  require_cmd ssh
  # Authentication uses the operator's own ~/.ssh/config and agent; the
  # workflow's SERVER_SSH_KEY secret is not needed. SERVER_HOST may be a
  # host alias from ~/.ssh/config.
  local dest="${SERVER_USER:+$SERVER_USER@}$SERVER_HOST"
  log "ssh: redeploying docker-compose stack in /opt/vip-host-ai on $SERVER_HOST"
  # Same script the workflow ran, plus `set -e` so a failed cd/pull stops it.
  ssh -- "$dest" 'bash -seu' <<'EOF'
cd /opt/vip-host-ai
git pull origin main
docker-compose down
docker-compose up -d --build
EOF
}

# --- deploy-free.yml: deploy-frontend + pages (build, then actions/deploy-pages)
deploy_pages() {
  require_cmd npm
  check_node
  export_tree
  [ -n "${API_URL:-}" ] || warn "API_URL is not set; building with an empty VITE_API_URL (as the workflow did when the secret was unset)"
  log "pages: building frontend"
  (
    cd "$SRC/frontend"
    npm ci
    VITE_API_URL="${API_URL:-}" npm run build
  )
  publish_gh_pages "$SRC/frontend/dist"
}

# Commit a directory as the next gh-pages commit (orphan on first run) and
# push it, without touching the operator's working copy or index.
publish_gh_pages() {
  local dist="$1" gitdir index tree parent="" commit
  [ -d "$dist" ] || die "build output $dist not found"
  gitdir="$(git rev-parse --absolute-git-dir)"
  index="$WORK/gh-pages.index"

  # actions/deploy-pages publishes the artifact as-is (no Jekyll).
  touch "$dist/.nojekyll"

  if git ls-remote --exit-code --heads origin gh-pages >/dev/null 2>&1; then
    git fetch --quiet --depth=1 origin gh-pages
    parent="$(git rev-parse FETCH_HEAD)"
    # Keep a custom domain set in the repo's Pages settings.
    if [ ! -e "$dist/CNAME" ] && git cat-file -e "$parent:CNAME" 2>/dev/null; then
      git cat-file blob "$parent:CNAME" >"$dist/CNAME"
    fi
  fi

  GIT_DIR="$gitdir" GIT_WORK_TREE="$dist" GIT_INDEX_FILE="$index" \
    git -C "$dist" add --all --force .
  tree="$(GIT_DIR="$gitdir" GIT_INDEX_FILE="$index" git write-tree)"

  if [ -n "$parent" ]; then
    if [ "$(git rev-parse "$parent^{tree}")" = "$tree" ]; then
      log "pages: gh-pages already has this build; nothing to publish"
      return 0
    fi
    commit="$(git commit-tree "$tree" -p "$parent" -m "Deploy frontend from $DEPLOY_SHA")"
  else
    log "pages: gh-pages does not exist yet; creating it as an orphan branch"
    commit="$(git commit-tree "$tree" -m "Deploy frontend from $DEPLOY_SHA")"
  fi
  log "pages: pushing $commit to origin/gh-pages"
  git push origin "$commit:refs/heads/gh-pages"
}

# --- deploy-free.yml: deploy-backend (render-com/deploy-action)
deploy_render() {
  require_env RENDER_DEPLOY_TOKEN
  require_cmd curl
  case "$RENDER_DEPLOY_TOKEN" in
    https://*)
      # The secret holds a deploy hook URL (its key is in the query string),
      # so hand the URL to curl on stdin instead of argv.
      log "render: calling deploy hook"
      printf 'url = "%s"\n' "$RENDER_DEPLOY_TOKEN" \
        | curl --fail --silent --show-error -X POST --config -
      ;;
    *)
      # The secret holds a Render API key: POST /v1/services/{id}/deploys.
      require_env RENDER_BACKEND_SERVICE_ID
      log "render: triggering deploy of service $RENDER_BACKEND_SERVICE_ID"
      printf 'Authorization: Bearer %s\n' "$RENDER_DEPLOY_TOKEN" \
        | curl --fail --silent --show-error -X POST -H @- \
            -H 'Accept: application/json' -H 'Content-Type: application/json' \
            --data '{"clearCache":"do_not_clear"}' \
            "https://api.render.com/v1/services/$RENDER_BACKEND_SERVICE_ID/deploys"
      ;;
  esac
  printf '\n'
}

main() {
  [ "$#" -gt 0 ] || usage
  local targets=() t
  for t in "$@"; do
    case "$t" in
      -h|--help) usage 0 ;;
      all)
        targets+=(vercel railway pages render)
        [ "${VIPBOOST_ENABLE_SSH_DEPLOY:-0}" != 1 ] || targets+=(ssh)
        ;;
      vercel|railway|ssh|pages|render) targets+=("$t") ;;
      *) printf 'error: unknown target: %s\n\n' "$t" >&2; usage ;;
    esac
  done
  require_cmd git
  guard_synced_with_origin
  for t in "${targets[@]}"; do
    "deploy_$t"
  done
  log "done: ${targets[*]}"
}

main "$@"
