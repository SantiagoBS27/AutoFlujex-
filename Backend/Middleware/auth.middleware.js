// middleware para verificar el token JWT en las rutas protegidas y poder extraer los datos del usuario (id,nombre) 
//que se encuentran dentro del token.
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send("Token no proporcionado");
    }

    const token = authHeader.split(" ")[1]; // "Bearer <token>"

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send("Token inválido");
        }
        req.user = decoded; // { id, name }
        next();
    });
};

module.exports = verifyToken;