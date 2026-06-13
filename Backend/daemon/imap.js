const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const db = require('../db');
const { parseEmail } = require('./parser');

const processMailbox = async (credential) => {
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: credential.email,
      pass: credential.app_password
    },
    logger: false
  });

  await client.connect();
  const lock = await client.getMailboxLock('INBOX');

  try {
    for await (const message of client.fetch({ seen: false }, { envelope: true, source: true })) {
      const parsed = await simpleParser(message.source);
      const remitente = parsed.from?.value[0]?.address;
      const asunto = parsed.subject || '';
      const fecha = parsed.date || new Date();
      const cuerpo = parsed.text || parsed.html || '';
      console.log('cuerpo:', cuerpo.substring(0, 300));

      const [existing] = await db.promise().query(
        'SELECT id_correo FROM correo WHERE remitente = ? AND asunto = ? AND fecha_correo = ?',
        [remitente, asunto, fecha]
      );
      if (existing.length > 0) continue;

      const [providers] = await db.promise().query(
        'SELECT id_provider FROM provider WHERE email_identifier = ? AND id_user = ?',
        [remitente, credential.id_user]
      );

      const id_provider = providers.length > 0 ? providers[0].id_provider : null;

      const [result] = await db.promise().query(
        'INSERT INTO correo (id_user, id_provider, asunto, remitente, fecha_correo, procesado, cuerpo) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [credential.id_user, id_provider, asunto, remitente, fecha, 0, cuerpo]
      );

      const parsed_data = parseEmail(remitente, cuerpo);
      console.log('remitente:', remitente);
    console.log('parsed_data:', parsed_data);
    console.log('id_provider:', id_provider);
        if (parsed_data && parsed_data.monto) {
            await db.promise().query(
                'UPDATE correo SET monto = ? WHERE id_correo = ?',
                [parsed_data.monto, result.insertId]
            );
            if (id_provider) {
                await db.promise().query(
                    `UPDATE account a
                    JOIN provider p ON p.id_account = a.id_account
                    SET a.balance = a.balance + ?
                    WHERE p.id_provider = ?`,
                    [parsed_data.monto, id_provider]
                );
            }
        }

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
        console.error(`Error procesando correos de usuario ${credential.id_user}:`, e.message);
      }
    }
  });
};

module.exports = { runDaemon };