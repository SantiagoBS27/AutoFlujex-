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
            IFNULL(SUM(t.amount), 0) AS gasto_mes,
            COUNT(t.id_transaction) AS transacciones_mes
        FROM transaction t
        JOIN account a ON a.id_account = t.id_dest_account
        WHERE a.id_user = ?
        AND t.id_provider IS NOT NULL
        AND MONTH(t.date) = MONTH(CURDATE())
        AND YEAR(t.date) = YEAR(CURDATE())
    `;

    const sqlProviders = `
        SELECT COUNT(*) AS total_providers
        FROM provider
        WHERE id_user = ?
    `;

    db.query(sqlStats, [userId], (err, statsResult) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error");
        }

        db.query(sqlProviders, [userId], (err, providerResult) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error");
            }

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

module.exports = { getAccounts, getTypes, getCurrencies, createAccount, getStats, getProviders, getEmails };
