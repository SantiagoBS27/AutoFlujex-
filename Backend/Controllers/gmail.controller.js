const { google } = require('googleapis');
const db = require('../db');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/userinfo.email'
];

const getAuthUrl = (req, res) => {
  const { id_user } = req.query;
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state: id_user,
    prompt: 'consent'
  });
  res.json({ url });
};

const handleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const { tokens } = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    const email = data.email;

    const id_user = state;
    const expiry = new Date(tokens.expiry_date);

    db.query(
      `INSERT INTO email_credential (id_user, email, access_token, refresh_token, token_expiry)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         email = VALUES(email),
         access_token = VALUES(access_token),
         refresh_token = VALUES(refresh_token),
         token_expiry = VALUES(token_expiry)`,
      [id_user, email, tokens.access_token, tokens.refresh_token, expiry],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Correo conectado correctamente' });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAuthUrl, 
  handleCallback, 
  oauth2Client
};