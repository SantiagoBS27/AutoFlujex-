const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const { google } = require('googleapis');
const { oauth2Client } = require('../Controllers/gmail.controller');
const db = require('../db');

const getAccessToken = async (credential) => {
  oauth2Client.setCredentials({
    access_token: credential.access_token,
    refresh_token: credential.refresh_token,
    expiry_date: new Date(credential.token_expiry).getTime()
  });

  const { token } = await oauth2Client.getAccessToken();

  // Actualizar token en BD si fue refrescado
  await db.promise().query(
    'UPDATE email_credential SET access_token = ? WHERE id_user = ?',
    [token, credential.id_user]
  );

  return token;
};

const processMailbox = async (credential) => {
  const accessToken = await getAccessToken(credential);

  console.log('Access token:', accessToken);
  console.log('Email:', credential.email);

const client = new ImapFlow({
  host: 'imap.gmail.com',
  port: 993,
  secure: true,
  auth: {
    user: credential.email,
    accessToken: accessToken
  },
  authMethod: 'XOAUTH2',
  logger: false
});

  await client.connect();
  const lock = await client.getMailboxLock('INBOX');

  try {
    for await (const message of client.fetch('1:*', { envelope: true, source: true })) {
      const parsed = await simpleParser(message.source);
      const remitente = parsed.from?.value[0]?.address;
      const asunto = parsed.subject || '';
      const fecha = parsed.date || new Date();

      // Verificar si ya fue procesado
      const [existing] = await db.promise().query(
        'SELECT id_correo FROM correo WHERE remitente = ? AND asunto = ? AND fecha_correo = ?',
        [remitente, asunto, fecha]
      );
      if (existing.length > 0) continue;

      // Buscar proveedor
      const [providers] = await db.promise().query(
        'SELECT id_provider FROM provider WHERE email_identifier = ? AND id_user = ?',
        [remitente, credential.id_user]
      );

      const id_provider = providers.length > 0 ? providers[0].id_provider : null;

      // Guardar correo
      const [result] = await db.promise().query(
        'INSERT INTO correo (id_user, id_provider, asunto, remitente, fecha_correo, procesado) VALUES (?, ?, ?, ?, ?, ?)',
        [credential.id_user, id_provider, asunto, remitente, fecha, id_provider ? 0 : 0]
      );

      // Si proveedor desconocido, generar alerta
      if (!id_provider) {
        const [tipoAlerta] = await db.promise().query(
          'SELECT id_tipo_alerta FROM tipo_alerta WHERE nombre = ?',
          ['proveedor_desconocido']
        );
        if (tipoAlerta.length > 0) {
          await db.promise().query(
            'INSERT INTO alerta (id_tipo_alerta, id_user, id_correo, descripcion) VALUES (?, ?, ?, ?)',
            [tipoAlerta[0].id_tipo_alerta, credential.id_user, result.insertId, `Correo de remitente desconocido: ${remitente}`]
          );
        }
      }
    }
  } finally {
    lock.release();
    await client.logout();
  }
};

const runDaemon = async () => {
  console.log('runDaemon ejecutado');
  db.query('SELECT * FROM email_credential', async (err, credentials) => {
    if (err) return console.error('Error obteniendo credenciales:', err);
    for (const credential of credentials) {
      try {
        await processMailbox(credential);
        console.log(`Correos procesados para usuario ${credential.id_user}`);
      } catch (e) {
        console.error(`Error procesando correos de usuario ${credential.id_user}:`, e);
      }
    }
  });
};

module.exports = { runDaemon };