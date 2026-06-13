const db = require('../db');

const getAccounts = (req, res) => {
    const userId = req.user.id;
    const userName = req.user.name;

    const sqlAcc = `
        SELECT 
            a.account_name, 
            a.balance, 
            a.id_account, 
            c.iso,
            t.name AS type_name,
            COUNT(p.id_provider) AS provider_count
        FROM account a
        JOIN currencyType c ON c.id_currency = a.id_currency
        JOIN accounttype t ON t.id_type = a.id_type
        LEFT JOIN provider p ON p.id_account = a.id_account
        WHERE a.id_user = ?  
        AND a.deactivated_at IS NULL
        GROUP BY a.id_account, a.account_name, a.balance, c.iso, t.name
    `;

    db.query(sqlAcc, [userId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error");
        }

        res.json({
            name: userName,
            accounts: result
        });
    });
};

const getTypes = (req, res) => {
    const sql = "SELECT id_type, name FROM accounttype";

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error");
        }
        res.json(result);
    });
};

const getCurrencies = (req, res) => {
    const sql = "SELECT id_currency, iso FROM currencyType";

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error");
        }
        res.json(result);
    });
};

const createAccount = (req, res) => {
    const userId = req.user.id; // viene del token
    const { currencyId, accountName } = req.body;

    if (!currencyId || !accountName) {
        return res.status(400).send("Faltan datos");
    }

    const sqlCre = `
        INSERT INTO account
        (id_user, id_currency, id_type, account_name, created_at)
        VALUES(?, ?, 3, ?, NOW())
    `;

    db.query(sqlCre, [userId, currencyId, accountName], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error");
        }
        res.send("Cuenta creada correctamente");
    });
};

const getStats = (req, res) => {
    const userId = req.user.id;
    const sqlStats = `
        SELECT 
            IFNULL(SUM(c.monto), 0) AS gasto_mes,
            COUNT(c.id_correo) AS transacciones_mes
        FROM correo c
        JOIN provider p ON p.id_provider = c.id_provider
        WHERE p.id_user = ?
        AND c.monto IS NOT NULL
        AND MONTH(c.fecha_correo) = MONTH(CURDATE())
        AND YEAR(c.fecha_correo) = YEAR(CURDATE())
    `;
    const sqlProviders = `
        SELECT COUNT(*) AS total_providers
        FROM provider
        WHERE id_user = ?
    `;
    db.query(sqlStats, [userId], (err, statsResult) => {
        if (err) return res.status(500).send("Error");
        db.query(sqlProviders, [userId], (err, providerResult) => {
            if (err) return res.status(500).send("Error");
            res.json({
                gasto_mes: statsResult[0].gasto_mes,
                transacciones_mes: statsResult[0].transacciones_mes,
                total_providers: providerResult[0].total_providers
            });
        });
    });
};

const getProviders = (req, res) => {
    const userId = req.user.id;
    const sql = `
        SELECT id_provider, name, email_identifier, activo
        FROM provider
        WHERE id_user = ?
    `;
    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).send("Error");
        res.json(result);
    });
};

const saveEmailCredential = (req, res) => {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const { app_password } = req.body;

    if (!app_password) {
        return res.status(400).send("Faltan datos");
    }

    db.query(
        `INSERT INTO email_credential (id_user, email, app_password)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE email = VALUES(email), app_password = VALUES(app_password)`,
        [userId, userEmail, app_password],
        (err) => {
            if (err) return res.status(500).send("Error al guardar credencial");
            res.send("Correo conectado correctamente");
        }
    );
};

const getEmails = (req, res) => {
    const userId = req.user.id;
    const sql = `
        SELECT 
            c.id_correo,
            c.asunto,
            c.remitente,
            c.fecha_correo,
            c.procesado,
            p.name AS proveedor,
            a.id_alerta,
            a.resuelta
        FROM correo c
        LEFT JOIN provider p ON p.id_provider = c.id_provider
        LEFT JOIN alerta a ON a.id_correo = c.id_correo
        WHERE c.id_user = ?
        ORDER BY c.fecha_correo DESC
    `;
    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).send("Error");
        res.json(result);
    });
};

const getAlerts = (req, res) => {
    const userId = req.user.id;
    const sql = `
        SELECT 
            a.id_alerta,
            a.descripcion,
            a.fecha_generacion,
            a.resuelta,
            c.id_correo,
            c.asunto,
            c.remitente,
            c.fecha_correo,
            ta.nombre AS tipo
        FROM alerta a
        JOIN correo c ON c.id_correo = a.id_correo
        JOIN tipo_alerta ta ON ta.id_tipo_alerta = a.id_tipo_alerta
        WHERE a.id_user = ? AND a.resuelta = 0
        ORDER BY a.fecha_generacion DESC
    `;
    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).send("Error");
        res.json(result);
    });
};

const getEmailStatus = (req, res) => {
    const userId = req.user.id;
    db.query(
        'SELECT id_credential FROM email_credential WHERE id_user = ?',
        [userId],
        (err, result) => {
            if (err) return res.status(500).send("Error");
            res.json({ connected: result.length > 0 });
        }
    );
};

const resolveAlert = (req, res) => {
    const userId = req.user.id;
    const { id_alerta, id_correo, name, email_identifier, id_account } = req.body;

    if (!name || !email_identifier || !id_account) {
        return res.status(400).send("Faltan datos");
    }

    db.query(
        'INSERT INTO provider (id_user, name, email_identifier, id_account) VALUES (?, ?, ?, ?)',
        [userId, name, email_identifier, id_account],
        (err, result) => {
            if (err) return res.status(500).send("Error al crear proveedor");
            const id_provider = result.insertId;

            db.query(
                'UPDATE correo SET id_provider = ? WHERE remitente = ? AND id_user = ?',
                [id_provider, email_identifier, userId],
                (err) => {
                    if (err) return res.status(500).send("Error al actualizar correos");

                    db.query(
                        `UPDATE alerta a
                        JOIN correo c ON c.id_correo = a.id_correo
                        SET a.resuelta = 1
                        WHERE c.remitente = ? AND a.id_user = ?`,
                        [email_identifier, userId],
                        (err) => {
                            if (err) return res.status(500).send("Error al resolver alertas");
                            res.send("Proveedor creado y alertas resueltas");
                        }
                    );
                }
            );
        }
    );
};

const ignoreAlert = (req, res) => {
    const { id_alerta } = req.body;
    db.query(
        'UPDATE alerta SET resuelta = 1 WHERE id_alerta = ?',
        [id_alerta],
        (err) => {
            if (err) return res.status(500).send("Error");
            res.send("Alerta ignorada");
        }
    );
};

module.exports = { getAccounts, getEmailStatus, getTypes, getCurrencies, createAccount, getStats, getProviders, saveEmailCredential, getEmails, getAlerts, resolveAlert, ignoreAlert };
