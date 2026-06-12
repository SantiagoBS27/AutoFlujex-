const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const login = (req, res) => {
    const { email, password } = req.body;

    const sqlLOG = `
        SELECT id_user, name, email, password_hash1, password_hash2
        FROM user 
        WHERE email = ? 
    `;

    db.query(sqlLOG, [email], (err, result) => {
        if (err){
            console.log(err); 
            return res.send("Error en la verificacion"); 
        }
        if (result.length == 0){
            return res.status(401).send("Usuario no encontrado");
        }

        const hash1 = result[0].password_hash1; 
        const hash2 = result[0].password_hash2; 

        bcrypt.compare(password, hash1, (err, match1) => {
            if (err){
                console.log(err);
                return res.status(500).send("Error en bcrypt");
            }
            if (!match1){
                return res.status(401).send("Contraseña incorrecta");
            } 

            bcrypt.compare(hash1, hash2, (err, match2) => {
                if(match2){
                    const token = jwt.sign(
                        { id: result[0].id_user, name: result[0].name },
                        process.env.JWT_SECRET,
                        { expiresIn: '7d' }
                    );

                    return res.json({
                        message: "Login exitoso",
                        token
                    });
                } else {
                    return res.status(401).send("Error en segundo hash");
                }
            }); 
        }); 
    }); 
};

const signup = (req, res) => {
    const { name, last1, last2, email, password } = req.body;

    if (!name || !last1 || !last2 || !email || !password) {
        return res.status(400).send("Faltan datos");
    }

    const sqlINS = `
        INSERT INTO user 
        (name, last_name1, last_name2, email, password_hash1, password_hash2, created_at)
        VALUES (?, ?, ?, ?, ?, ?,  NOW())
    `;

    const sqlSER = `
        SELECT email
        FROM user 
        WHERE email = ? 
    `; 

    db.query(sqlSER, [email], (err, result) => {
        if(err){
            console.log(err);
            return res.status(500).send("Error en la verificación");
        }
        if(result.length > 0){
            return res.status(400).send("El correo ya está registrado"); 
        }
        bcrypt.hash(password, 10, (err, hash1) => {
            if(err){
                console.log(err);
                return res.status(500).send("Error al encriptar");
            }

            bcrypt.hash(hash1, 10, (err, hash2) => {
                if(err){
                    console.log(err);
                    return res.status(500).send("Error al encriptar");
                }
                db.query(sqlINS, [name, last1, last2, email, hash1, hash2], (err, result) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send("Error al registrar usuario");
                    } else {
                        const userId = result.insertId; 
                        const defaultAccounts = [
                            { name: "Cine", type: 3 },
                            { name: "Entretenimiento", type: 3 },
                            { name: "Comida", type: 3 },
                        ];
                        defaultAccounts.forEach(acc => {
                            const sql = `
                                INSERT INTO account 
                                (id_user, id_currency, id_type, account_name, created_at)
                                VALUES(?, ?, ?, ?, NOW())
                            `;
                            db.query(sql, [userId, 1, acc.type, acc.name], (err, result) => {
                                if (err) {
                                    console.log(err);
                                }
                            }); 
                        }); 
                        res.send("Usuario creado correctamente");
                    }
                }); 
            }); 
        }); 
    }); 
};

module.exports = { login, signup };