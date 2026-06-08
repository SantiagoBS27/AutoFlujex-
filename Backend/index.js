const express = require("express");
const cors = require("cors"); 
require('dotenv').config();

const authRoutes = require('./Routes/auth.routes');

const app = express();
const port = 3227

const corsOptions = {
    origin: [
        "http://localhost:5173"
    ]
}

app.use(cors(corsOptions)); 
app.use(express.json()); 

app.get("/api", (req, res) =>{
    res.send("API funcionando");
}); 

app.use('/auth', authRoutes);

app.listen(port, "0.0.0.0", () => {
  console.log("Servidor corriendo en http://localhost:"+port);
});


