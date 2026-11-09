const { google } = require('googleapis');
const { YouTubeAuth } = require('./db');

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/yt-analytics.readonly'
];

function getRedirectUri(port = 4242) {
  return `http://127.0.0.1:${port}/api/youtube/oauth/callback`;
}

function getOAuthClient(port = 4242) {
  const authRecord = YouTubeAuth.get();
  if (!authRecord || !authRecord.client_id || !authRecord.client_secret) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    authRecord.client_id,
    authRecord.client_secret,
    getRedirectUri(port)
  );

  if (authRecord.access_token) {
    oauth2Client.setCredentials({
      access_token: authRecord.access_token,
      refresh_token: authRecord.refresh_token,
      expiry_date: authRecord.expiry_date,
      token_type: authRecord.token_type,
      scope: authRecord.scope
    });

    // Auto-update refreshed tokens in local SQLite database
    oauth2Client.on('tokens', (tokens) => {
      console.log('[YouTube Auth] Refreshed tokens received from Google');
      YouTubeAuth.saveTokens(tokens);
    });
  }

  return oauth2Client;
}

function getAuthUrl(clientId, clientSecret, port = 4242, scopeOverride = null) {
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    getRedirectUri(port)
  );

  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // ensures refresh_token is returned
    prompt: 'consent select_account', // forces account chooser and consent
    scope: scopeOverride || SCOPES
  });
}

module.exports = {
  SCOPES,
  getRedirectUri,
  getOAuthClient,
  getAuthUrl
};
