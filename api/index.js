import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',     // IP pública de tu EC2 (o 'localhost' si corre en la misma máquina)
  user: process.env.DB_USER || 'ionic',           // usuario MySQL
  password: process.env.DB_PASSWORD || 'Larsi@123456',// contraseña MySQL
  database: process.env.DB_NAME || 'bbdd_web',     // base de datos
  port: process.env.DB_PORT || 3306
});

// ================== ENDPOINTS ==================

// Todas las fichas médicas
app.get('/fichas', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM FichaMedica');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Insertar una ficha médica
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

// Lista de pacientes en formato reducido
app.get('/pacientes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM FichaMedica');
    const pacientes = rows.map(r => ({
      id: r.idFichaMedica,
      rut: r.Rut,
      nombre: r.nombre,
      edad: r.edad || 0,
      sexo: r.sexo,
      grupo_sanguineo: r.tipoSangre,
      telefono: r.telefono || '',
      mail: r.mail || ''
    }));
    res.json(pacientes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ======== Endpoints relacionados a una ficha ========

// Ficha completa con relaciones
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

    res.json({ ficha: ficha[0], diagnosticos, hospitalizaciones, consultas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Medicamentos de una ficha
app.get('/fichas/:id/medicamentos', async (req, res) => {
  const id = req.params.id;
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
    `, [id]);
    res.json(medicamentos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Procedimientos (tipo 1)
app.get('/fichas/:id/procedimientos', async (req, res) => {
  const id = req.params.id;
  try {
    const [procedimientos] = await pool.query(`
      SELECT p.idProcedimiento, p.nombre, p.descripcion, tp.idTipoProcedimiento, tp.tipoprocedimiento AS tipoProcedimiento
      FROM Consulta c
      JOIN ConsultaProcedimiento cp ON c.idConsulta = cp.idConsulta
      JOIN Procedimiento p ON cp.idProcedimiento = p.idProcedimiento
      JOIN TipoProcedimiento tp ON p.idTipoProcedimiento = tp.idTipoProcedimiento
      WHERE c.idFichaMedica = ? AND tp.idTipoProcedimiento = 1
    `, [id]);
    res.json(procedimientos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Exámenes (tipo 2)
app.get('/fichas/:id/examenes', async (req, res) => {
  const id = req.params.id;
  try {
    const [examenes] = await pool.query(`
      SELECT p.idProcedimiento,
             p.nombre      AS nombreExamen,
             p.descripcion AS descripcionExamen,
             tp.idTipoProcedimiento,
             tp.tipoprocedimiento AS tipoProcedimiento
      FROM Consulta c
      JOIN ConsultaProcedimiento cp ON c.idConsulta = cp.idConsulta
      JOIN Procedimiento p ON cp.idProcedimiento = p.idProcedimiento
      JOIN TipoProcedimiento tp ON p.idTipoProcedimiento = tp.idTipoProcedimiento
      WHERE c.idFichaMedica = ? AND p.idTipoProcedimiento = 2
    `, [id]);
    res.json(examenes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Hospitalizaciones
app.get('/fichas/:id/hospitalizaciones', async (req, res) => {
  const id = req.params.id;
  try {
    const [hospitalizaciones] = await pool.query(`
      SELECT h.idHospitalizacion, h.fecha, h.duracion, h.institucionMedica
      FROM Hospitalizacion h
      WHERE h.idFichaMedica = ?;
    `, [id]);
    res.json(hospitalizaciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Consultas
app.get('/fichas/:id/consultas', async (req, res) => {
  const id = req.params.id;
  try {
    const [consultas] = await pool.query(`
      SELECT c.fecha, m.nombre AS medicoNombre, c.institucionMedica, c.descripcion
      FROM Consulta c
      JOIN Medico m ON m.idMedico = c.idMedico
      WHERE c.idFichaMedica = ?;
    `, [id]);
    res.json(consultas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Diagnósticos
app.get('/fichas/:id/diagnosticos', async (req, res) => {
  const id = req.params.id;
  try {
    const [diagnosticos] = await pool.query(`
      SELECT fecha, descripcion
      FROM Diagnostico
      WHERE idFichaMedica = ?;
    `, [id]);
    res.json(diagnosticos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// =============== EXPORT FOR SERVERLESS ===============
// Solo ejecutar listen() si no está en ambiente serverless
if (process.env.NODE_ENV !== 'production' && !process.env.LAMBDA_RUNTIME_DIR) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`API corriendo en puerto ${PORT}`));
}

export default app;
