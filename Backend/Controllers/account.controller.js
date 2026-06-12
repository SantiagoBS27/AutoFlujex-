const db = require('../db');

const getAccountDetail = (req, res) => {
    const userId = req.user.id;
    const accountId = req.params.id;

    const sqlAccount = `
        SELECT 
            a.id_account,
            a.account_name,
            a.balance,
            c.iso,
            t.name AS type_name
        FROM account a
        JOIN currencyType c ON c.id_currency = a.id_currency
        JOIN accounttype t ON t.id_type = a.id_type
        WHERE a.id_account = ?
        AND a.id_user = ?
    `;

    const sqlProviders = `
        SELECT id_provider, name, email_identifier
        FROM provider
        WHERE id_account = ?
        AND id_user = ?
    `;

    db.query(sqlAccount, [accountId, userId], (err, accResult) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Error");
        }
        if (accResult.length === 0) {
            return res.status(404).send("Cuenta no encontrada");
        }

        db.query(sqlProviders, [accountId, userId], (err, provResult) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Error");
            }

            res.json({
                account: accResult[0],
                providers: provResult
            });
        });
    });
};

module.exports = { getAccountDetail };