# VIP Host AI Copilot

A mobile-first H5 WebApp for VIP Casino Hosts featuring AI-powered customer insights and simulation training.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Zustand
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **AI**: OpenRouter API (Claude, GPT, etc.)
- **Containerization**: Docker, Docker Compose

## Project Structure

```
vip-host-ai/
├── backend/              # Express.js API
│   ├── prisma/           # Database schema
│   └── src/
│       ├── config/       # Configuration
│       ├── controllers/  # Route handlers
│       ├── middleware/    # Auth, RBAC, validation
│       ├── routes/       # API routes
│       ├── services/      # Business logic, AI
│       └── app.js         # Entry point
├── frontend/             # React SPA
│   └── src/
│       ├── components/   # UI components
│       ├── pages/        # 8 main pages
│       ├── stores/       # Zustand state
│       └── services/     # API client
├── docker-compose.yml     # Full stack deployment
└── .env.example          # Environment template
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)

### 1. Clone and Configure

```bash
# Clone the repository
git clone <repository-url>
cd vip-host-ai

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

### 2. Start with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at:
- Frontend: http://localhost
- Backend API: http://localhost:3000
- API Health: http://localhost:3000/health

### 3. Local Development

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Deployment

There are no GitHub Actions workflows (owner decision 2026-11-05). Deploys run from the
operator's machine with `scripts/deploy.sh`, one target or several at a time:

```bash
scripts/deploy.sh vercel           # frontend/ -> Vercel production
scripts/deploy.sh railway          # backend -> Railway service vip-host-api
scripts/deploy.sh pages            # build frontend/ and publish dist/ to the gh-pages branch
scripts/deploy.sh render           # trigger a Render deploy of the backend
scripts/deploy.sh ssh              # docker-compose redeploy on a self-hosted server (disabled by default)
scripts/deploy.sh all              # vercel railway pages render (+ ssh when enabled)
```

Every target refuses to run unless the working tree is clean and `HEAD` equals `origin/main`, and
builds from a clean `git archive` export of `HEAD`. Secrets come from the environment only:

| Target | Environment variables |
|--------|-----------------------|
| `vercel` | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` |
| `railway` | `RAILWAY_TOKEN` |
| `pages` | `API_URL` (optional, becomes `VITE_API_URL`); pushes with your own git credentials |
| `render` | `RENDER_DEPLOY_TOKEN` (API key, or a deploy hook URL), `RENDER_BACKEND_SERVICE_ID` (API key only) |
| `ssh` | `VIPBOOST_ENABLE_SSH_DEPLOY=1`, `SERVER_HOST` (may be a `~/.ssh/config` alias), optional `SERVER_USER`; uses your own SSH config and agent |

GitHub Pages must be set to **Settings → Pages → Build and deployment → Source: Deploy from a
branch**, branch `gh-pages`, folder `/ (root)`.

## Default Credentials

After first startup, a default admin user is created:

- **Username**: admin
- **Password**: admin123

**IMPORTANT**: Change these credentials in production!

## Features

### Core Features (MVP)

1. **Authentication**
   - JWT-based login/registration
   - Role-based access control (VIP Host, Team Manager, System Admin)
   - Onboarding flow with personality assessment

2. **Today Feed**
   - Personalized daily greeting
   - Material timeline (images, videos, text)
   - Calendar view for historical materials
   - Copy/share functionality

3. **Client Hub**
   - AI-powered customer insights
   - Case study database
   - Simulation training

4. **AI Simulation Room**
   - 5 preset scenarios (complaint, conversion, recovery, etc.)
   - Real-time chat interface
   - Structured feedback with scores

5. **Profile & Gamification**
   - Daily tasks tracking
   - Badge/achievement system
   - Team stats (for managers)

### Admin Features

6. **Team Dashboard** (Team Manager)
   - DAU tracking
   - Member performance metrics
   - Simulation completion rates

7. **Material Push** (System Admin)
   - Create materials (image/video/text)
   - Target user selection
   - Push scheduling

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/auth/refresh` | POST | Refresh tokens |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/me/profile` | PUT | Update profile |
| `/api/materials/today` | GET | Today's materials |
| `/api/materials/calendar` | GET | Calendar data |
| `/api/ai/insights` | POST | Generate AI insights |
| `/api/ai/simulate` | POST | Start simulation |
| `/api/ai/simulate/:id/message` | POST | Send message |
| `/api/tasks/daily` | GET | Get daily tasks |
| `/api/admin/team/stats` | GET | Team statistics |
| `/api/admin/materials` | POST | Push material |

## Role-Based Access

| Role | Permissions |
|------|-------------|
| VIP Host | Basic access: Today, Client, Profile |
| Team Manager | + Team Dashboard, view team members |
| System Admin | + Material Push, manage all users |

## Security Features

- **PII Masking**: All customer data is masked before AI API calls
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: API request throttling
- **Input Validation**: Zod schema validation
- **RBAC**: Role-based permissions

## Environment Variables

See `.env.example` for all configuration options.

Key variables:
- `JWT_SECRET`: JWT signing key (min 32 chars)
- `OPENROUTER_API_KEY`: Your OpenRouter API key
- `AI_PROVIDER`: Currently supports `openrouter`
- `CORS_ORIGIN`: Allowed origins for CORS

## License

Proprietary - All rights reserved.
