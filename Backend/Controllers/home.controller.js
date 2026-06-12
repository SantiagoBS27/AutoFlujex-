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
            t.name AS type_name
        FROM account a
        JOIN currencyType c ON c.id_currency = a.id_currency
        JOIN accounttype t ON t.id_type = a.id_type
        WHERE a.id_user = ?  
        AND a.deactivated_at IS NULL
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

module.exports = { getAccounts };