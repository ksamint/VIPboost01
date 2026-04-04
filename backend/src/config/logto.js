import { config } from '../config/index.js';

const LOGTO_ENDPOINT = process.env.LOGTO_ENDPOINT;
const LOGTO_APP_ID = process.env.LOGTO_APP_ID;
const LOGTO_APP_SECRET = process.env.LOGTO_APP_SECRET;

export class LogtoClient {
  constructor() {
    this.endpoint = LOGTO_ENDPOINT;
    this.appId = LOGTO_APP_ID;
    this.appSecret = LOGTO_APP_SECRET;
  }

  async getAccessToken() {
    const response = await fetch(`${this.endpoint}/oidc/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        app_id: this.appId,
        app_secret: this.appSecret,
      }),
    });

    const data = await response.json();
    return data.access_token;
  }

  async verifyToken(token) {
    const response = await fetch(`${this.endpoint}/api/session/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    return response.json();
  }

  generateSignInUri(state, redirectUri) {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile',
      state,
    });

    return `${this.endpoint}/oidc/auth?${params.toString()}`;
  }
}

export const logtoClient = new LogtoClient();
