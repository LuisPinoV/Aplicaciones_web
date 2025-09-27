const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: "54.160.52.164", //Ip publica de la EC2
  user: "ionic", // usuario de la base de datos
  password: "Larsi@123456", // contraseña del usuairio
  database: "bbdd_web" // esquema base de datos
});

app.get("/FichaMedica", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM FichaMedica");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/FichaMedica", async (req, res) => {
  try {
    const { rut, nombre, fechaNacimiento, sexo, tipoSangre, altura, peso, genero } = req.body;
    const [result] = await pool.query(
      "INSERT INTO FichaMedica (rut, nombre, fechaNacimiento, sexo, tipoSangre, altura, peso, genero) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [rut, nombre, fechaNacimiento, sexo, tipoSangre, altura, peso, genero]
    );
    res.json({ id: result.insertId, rut, nombre, fechaNacimiento, sexo, tipoSangre, altura, peso, genero });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Servidor corriendo en puerto 3000");
});

