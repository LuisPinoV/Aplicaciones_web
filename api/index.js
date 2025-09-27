import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'ionic',
  password: 'Larsi@123456',
  database: 'bbdd_web'
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 as test');
    res.json({ status: 'OK', database: 'Connected', test: rows });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ status: 'ERROR', error: err.message });
  }
});

// Endpoint de prueba
app.get('/fichas', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM FichaMedica');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Insertar ficha médica
app.post('/fichas', async (req, res) => {
  try {
    const { Rut, nombre, fechaNacimiento, sexo, tipoSangre, altura, peso, genero } = req.body;

    const [result] = await pool.query(
      `INSERT INTO FichaMedica 
       (Rut, nombre, fechaNacimiento, sexo, tipoSangre, altura, peso, genero)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [Rut, nombre, fechaNacimiento, sexo, tipoSangre, altura, peso, genero]
    );

    res.json({ success: true, idFichaMedica: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoints para pacientes
app.get('/pacientes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM FichaMedica');
    // Transform to match expected format
    const pacientes = rows.map(row => ({
      id: row.idFichaMedica,
      rut: row.Rut,
      nombre: row.nombre,
      edad: row.edad || 0,
      sexo: row.sexo,
      grupo_sanguineo: row.tipoSangre,
      telefono: row.telefono || '',
      mail: row.mail || ''
    }));
    res.json(pacientes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoints para diagnósticos
app.get('/diagnosticos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Diagnostico');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoints para hospitalizaciones
app.get('/hospitalizaciones', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Hospitalizacion');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoints para consultas
app.get('/consultas', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Consulta');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('API escuchando en http://localhost:3000'));
