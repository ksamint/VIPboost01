const LOGTO_ENDPOINT = process.env.LOGTO_ENDPOINT;
const LOGTO_APP_ID = process.env.LOGTO_APP_ID;
const LOGTO_APP_SECRET = process.env.LOGTO_APP_SECRET;

export class LogtoService {
  async getAccessToken() {
    if (!LOGTO_ENDPOINT || !LOGTO_APP_ID || !LOGTO_APP_SECRET) {
      throw new Error('Logto is not configured');
    }

    const response = await fetch(`${LOGTO_ENDPOINT}/oidc/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        app_id: LOGTO_APP_ID,
        app_secret: LOGTO_APP_SECRET,
      }),
    });

    const data = await response.json();
    return data.access_token;
  }

  async exchangeCode(code, redirectUri) {
    const response = await fetch(`${LOGTO_ENDPOINT}/oidc/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: LOGTO_APP_ID,
        client_secret: LOGTO_APP_SECRET,
      }),
    });

    return response.json();
  }

  async getUserInfo(accessToken) {
    const response = await fetch(`${LOGTO_ENDPOINT}/oidc/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.json();
  }

  generateSignInUri(redirectUri, state) {
    const params = new URLSearchParams({
      client_id: LOGTO_APP_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      state,
    });

    return `${LOGTO_ENDPOINT}/oidc/auth?${params.toString()}`;
  }
}

export const logtoService = new LogtoService();
