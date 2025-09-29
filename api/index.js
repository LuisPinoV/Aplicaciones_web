import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

/*const pool = mysql.createPool({
  host: 'localhost',
  user: 'ionic',
  password: 'Larsi@123456',
  database: 'bbdd_web'
});*/

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'ionic',
  password: process.env.DB_PASSWORD || 'Larsi@123456',
  database: process.env.DB_NAME || 'bbdd_web'
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API escuchando en http://0.0.0.0:${PORT}`);
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

app.get('/fichas/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [ficha] = await pool.query('SELECT * FROM FichaMedica WHERE idFichaMedica = ?', [id]);
    if (!ficha.length) return res.status(404).json({ error: 'Ficha no encontrada' });

    const [diagnosticos] = await pool.query('SELECT * FROM Diagnostico WHERE idFichaMedica = ?', [id]);
    const [hospitalizaciones] = await pool.query('SELECT * FROM Hospitalizacion WHERE idFichaMedica = ?', [id]);
    const [consultas] = await pool.query(
      `SELECT c.*, m.nombre AS medicoNombre, tm.tipoMedico
       FROM Consulta c
       LEFT JOIN Medico m ON c.idMedico = m.idMedico
       LEFT JOIN TipoMedico tm ON m.idTipoMedico = tm.idTipoMedico
       WHERE c.idFichaMedica = ?`, [id]);

    res.json({
      ficha: ficha[0],
      diagnosticos,
      hospitalizaciones,
      consultas
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para obtener medicamentos de una ficha
app.get('/fichas/:id/medicamentos', async (req, res) => {
  const id = req.params.id;
  try {
    const [medicamentos] = await pool.query(
      `SELECT m.idMedicamento, m.nombre
       FROM Medicamento m
       INNER JOIN ConsultaMedicamento cm ON cm.idMedicamento = m.idMedicamento
       INNER JOIN Consulta c ON c.idConsulta = cm.idConsulta
       WHERE c.idFichaMedica = ?`, [id]);

    res.json(medicamentos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// procedimientos(examenes) de una ficha
app.get('/fichas/:id/procedimientos', async (req, res) => {
  const id = req.params.id;
  try {
    const [procedimientos] = await pool.query(`
      SELECT p.idProcedimiento, p.nombre, tp.idTipoProcedimiento, tp.tipoprocedimiento AS tipoProcedimiento
      FROM Consulta c
      JOIN ConsultaProcedimiento cp ON c.idConsulta = cp.idConsulta
      JOIN Procedimiento p ON cp.idProcedimiento = p.idProcedimiento
      JOIN TipoProcedimiento tp ON p.IdTipoProcedimiento = tp.idTipoProcedimiento
      WHERE c.idFichaMedica = ? AND tp.idTipoProcedimiento = 1
    `, [id])

    res.json(procedimientos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// procedimientos totales de una ficha
app.get('/fichas/:id/medicamentos', async (req, res) => {
  const idFicha = req.params.id;
  try {
    const [medicamentos] = await pool.query(`
      SELECT m.idMedicamento,
             m.nombre AS nombreMedicamento,
             m.dosis,
             m.frecuencia
      FROM Consulta c
      JOIN ConsultaMedicamento cm ON c.idConsulta = cm.idConsulta
      JOIN Medicamento m ON cm.idMedicamento = m.idMedicamento
      WHERE c.idFichaMedica = ?
    `, [idFicha]);
    res.json(medicamentos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// alergias de un paciente
app.get('/fichas/:id/alergias', async (req, res) => {
  const idFicha = req.params.id;
  try {
    const [alergias] = await pool.query(`
      SELECT pa.idPadecimiento,
             pa.nombre AS nombrePadecimiento,
             pa.descripcion
      FROM padecimiento pa
      JOIN fichamedicapadecimiento fp ON fp.idFichaMedica = pa.idPadecimiento
      JOIN fichamedica f ON f.idFichaMedica = fp.idFichaMedica
      JOIN tipopadecimiento tp ON tp.idTipoPadecimiento = pa.idTipoPadecimiento
      WHERE f.idFichaMedica = ?;
    `, [idFicha]);
    res.json(alergias);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/fichas/:id/examenes', async (req, res) => {
  const idFicha = req.params.id;

  try {
    const [examenes] = await pool.query(`
      SELECT p.idProcedimiento,
             p.nombre      AS nombreExamen,
             p.descripcion AS descripcionExamen,
             tp.idTipoProcedimiento,
             tp.tipoprocedimiento     AS tipoProcedimiento
      FROM Consulta c
      JOIN ConsultaProcedimiento cp ON c.idConsulta = cp.idConsulta
      JOIN Procedimiento p          ON cp.idProcedimiento = p.idProcedimiento
      JOIN TipoProcedimiento tp     ON p.idTipoProcedimiento = tp.idTipoProcedimiento
      WHERE c.idFichaMedica = ?
        AND p.idTipoProcedimiento = 2
    `, [idFicha]);

    res.json(examenes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// hospitalizaciones de una ficha médica
app.get('/fichas/:id/hospitalizaciones', async (req, res) => {
  const idFicha = req.params.id;

  try {
    const [hospitalizaciones] = await pool.query(`
      SELECT 
          h.idHospitalizacion,
          h.fecha,
          h.duracion,
          h.institucionMedica
      FROM Hospitalizacion h
      JOIN FichaMedica f ON f.idFichaMedica = h.idFichaMedica
      WHERE f.idFichaMedica = ?;
    `, [idFicha]);

    res.json(hospitalizaciones);
  } catch (err) {
    console.error('Error obteniendo hospitalizaciones:', err);
    res.status(500).json({ error: err.message });
  }
});

// Obtener consultas de una ficha médica
app.get('/fichas/:id/consultas', async (req, res) => {
  const idFicha = req.params.id;

  try {
    const [consultas] = await pool.query(`
      SELECT 
        c.fecha,
        m.nombre AS medicoNombre,
        c.institucionMedica,
        c.descripcion
      FROM Consulta c
      JOIN Medico m ON m.idMedico = c.idMedico
      WHERE c.idFichaMedica = ?;
    `, [idFicha]);

    res.json(consultas);
  } catch (err) {
    console.error('Error obteniendo consultas:', err);
    res.status(500).json({ error: err.message });
  }
});

// Obtener diagnósticos de una ficha médica
app.get('/fichas/:id/diagnosticos', async (req, res) => {
  const idFicha = req.params.id;

  try {
    const [diagnosticos] = await pool.query(`
      SELECT 
        fecha,
        descripcion
      FROM Diagnostico
      WHERE idFichaMedica = ?;
    `, [idFicha]);

    res.json(diagnosticos);
  } catch (err) {
    console.error('Error obteniendo diagnósticos:', err);
    res.status(500).json({ error: err.message });
  }
});

// Obtener medicamentos de una ficha médica
app.get('/fichas/:id/medicamentos', async (req, res) => {
  const idFicha = req.params.id;

  try {
    const [medicamentos] = await pool.query(`
      SELECT 
        m.nombre,
        m.descripcion,
        cm.cantidad,
        cm.formato,
        cm.tiempoConsumo,
        cm.frecuenciaConsumo
      FROM ConsultaMedicamento cm
      JOIN Medicamento m ON cm.idMedicamento = m.idMedicamento
      JOIN Consulta c ON cm.idConsulta = c.idConsulta
      WHERE c.idFichaMedica = ?;
    `, [idFicha]);

    res.json(medicamentos);
  } catch (err) {
    console.error('Error obteniendo medicamentos:', err);
    res.status(500).json({ error: err.message });
  }
});

// Procedimientos (idTipoProcedimiento = 1) de una ficha
app.get('/fichas/:id/procedimientos', async (req, res) => {
  const id = req.params.id;
  try {
    const [procedimientos] = await pool.query(`
      SELECT p.idProcedimiento, p.nombre, p.descripcion, tp.idTipoProcedimiento, tp.tipoprocedimiento AS tipoProcedimiento
      FROM Consulta c
      JOIN ConsultaProcedimiento cp ON c.idConsulta = cp.idConsulta
      JOIN Procedimiento p ON cp.idProcedimiento = p.idProcedimiento
      JOIN TipoProcedimiento tp ON p.IdTipoProcedimiento = tp.idTipoProcedimiento
      WHERE c.idFichaMedica = ? AND tp.idTipoProcedimiento = 1
    `, [id]);

    res.json(procedimientos);
  } catch (err) {
    console.error('Error obteniendo procedimientos:', err);
    res.status(500).json({ error: err.message });
  }
});


export default app;
