import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';

const app = express();
const port = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// --- Conexión a la Base de Datos ---
const dbPath = path.resolve('database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al abrir la base de datos', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
    // Habilitar claves foráneas
    db.run("PRAGMA foreign_keys = ON;");
  }
});

// --- Rutas de la API (Endpoints) ---

// Endpoint para obtener todos los pacientes (fichas médicas)
app.get('/pacientes', (req, res) => {
  const sql = `SELECT * FROM fichamedica`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Endpoint para obtener un paciente por su Rut
app.get('/pacientes/rut/:rut', (req, res) => {
  const sql = `SELECT * FROM fichamedica WHERE Rut = ?`;
  db.get(sql, [req.params.rut], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ message: 'Paciente no encontrado' });
    }
  });
});

// Endpoint para obtener las consultas de un paciente
app.get('/pacientes/:idFichaMedica/consultas', (req, res) => {
    const sql = `
        SELECT c.idConsulta, c.fecha, c.institucionMedica, c.descripcion as motivo, m.nombre as medico
        FROM consulta c
        JOIN medico m ON c.idMedico = m.idMedico
        WHERE c.idFichaMedica = ?`;
    db.all(sql, [req.params.idFichaMedica], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Endpoint para obtener los diagnósticos de un paciente
app.get('/pacientes/:idFichaMedica/diagnosticos', (req, res) => {
    const sql = `SELECT idDiagnostico, fecha, descripcion as enfermedad FROM diagnostico WHERE idFichaMedica = ?`;
    db.all(sql, [req.params.idFichaMedica], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Endpoint para obtener los padecimientos (alergias) de un paciente
app.get('/pacientes/:idFichaMedica/padecimientos', (req, res) => {
    const sql = `
        SELECT p.nombre as alergia, p.descripcion as reaccion, fmp.fecha as fechaDiagnostico
        FROM padecimiento p
        JOIN fichamedicapadecimiento fmp ON p.idPadecimiento = fmp.idPadecimiento
        WHERE fmp.idFichaMedica = ? AND p.idTipoPadecimiento = (SELECT idTipoPadecimiento FROM tipopadecimiento WHERE tipoPadecimiento = 'Crónico')`; // Asumiendo que las alergias son crónicas
    db.all(sql, [req.params.idFichaMedica], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Endpoint para obtener las hospitalizaciones de un paciente
app.get('/pacientes/:idFichaMedica/hospitalizaciones', (req, res) => {
    const sql = `SELECT * FROM hospitalizacion WHERE idFichaMedica = ?`;
    db.all(sql, [req.params.idFichaMedica], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Endpoint para obtener los medicamentos de un paciente
app.get('/pacientes/:idFichaMedica/medicamentos', (req, res) => {
    const sql = `
        SELECT m.nombre, m.descripcion, cm.cantidad, cm.formato, cm.tiempoConsumo, cm.frecuenciaConsumo, c.fecha as fechaInicio
        FROM medicamento m
        JOIN consultamedicamento cm ON m.idMedicamento = cm.idMedicamento
        JOIN consulta c ON cm.idConsulta = c.idConsulta
        WHERE c.idFichaMedica = ?`;
    db.all(sql, [req.params.idFichaMedica], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Endpoint para obtener los procedimientos de un paciente
app.get('/pacientes/:idFichaMedica/procedimientos', (req, res) => {
    const sql = `
        SELECT p.nombre, p.descripcion, c.fecha
        FROM procedimiento p
        JOIN consultaprocedimiento cp ON p.idProcedimiento = cp.idProcedimiento
        JOIN consulta c ON cp.idConsulta = c.idConsulta
        WHERE c.idFichaMedica = ?`;
    db.all(sql, [req.params.idFichaMedica], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// --- Iniciar Servidor ---
app.listen(port, () => {
  console.log(`Servidor API corriendo en http://localhost:${port}`);
});
