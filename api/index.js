import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'bdd-ionic.c72qu2gsuzd0.us-east-1.rds.amazonaws.com',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin123!',
  database: process.env.DB_NAME || 'bbdd_web',
  port: process.env.DB_PORT || 3306
});

app.get('/fichas', async (req, res) => {
  try {
    const limitParam = req.query?.limit ? Number(req.query.limit) : null;
    const offsetParam = req.query?.offset ? Number(req.query.offset) : 0;

    let rows;
    let pagination = null;

    if (limitParam && !isNaN(limitParam) && limitParam > 0) {
      const [data] = await pool.query(
        `SELECT f.idFichaMedica, u.Rut, u.nombre, u.fechaNacimiento, u.sexo, u.tipoSangre, f.altura, f.peso, f.genero
         FROM FichaMedica f
         JOIN Usuario u ON f.idUsuario = u.idUsuario
         ORDER BY f.idFichaMedica DESC
         LIMIT ? OFFSET ?`,
        [limitParam, offsetParam]
      );

      const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM FichaMedica');
      rows = data;
      pagination = {
        limit: limitParam,
        offset: offsetParam,
        total,
        nextOffset: offsetParam + limitParam < total ? offsetParam + limitParam : null,
        hasMore: offsetParam + limitParam < total
      };
    } else {
      const [data] = await pool.query(
        `SELECT f.idFichaMedica, u.Rut, u.nombre, u.fechaNacimiento, u.sexo, u.tipoSangre, f.altura, f.peso, f.genero
         FROM FichaMedica f
         JOIN Usuario u ON f.idUsuario = u.idUsuario
         ORDER BY f.idFichaMedica ASC`
      );
      rows = data;
    }

    res.json({ data: rows, pagination });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/fichas/:id', async (req, res) => {
  const id = req.params.id;
  const { nombre, Rut, fechaNacimiento, sexo, tipoSangre, altura, peso, genero } = req.body;

  try {
    const [existe] = await pool.query(
      'SELECT * FROM FichaMedica WHERE idFichaMedica = ?',
      [id]
    );

    if (existe.length === 0) {
      return res.status(404).json({ error: 'Ficha no encontrada' });
    }

    const idUsuario = existe[0].idUsuario;

    await pool.query(
      `UPDATE Usuario SET nombre = ?, Rut = ?, fechaNacimiento = ?, sexo = ?, tipoSangre = ? WHERE idUsuario = ?`,
      [nombre, Rut, fechaNacimiento, sexo, tipoSangre, idUsuario]
    );

    await pool.query(
      `UPDATE FichaMedica SET altura = ?, peso = ?, genero = ? WHERE idFichaMedica = ?`,
      [altura, peso, genero, id]
    );

    const [actualizada] = await pool.query(
      `SELECT f.idFichaMedica, u.Rut, u.nombre, u.fechaNacimiento, u.sexo, u.tipoSangre, f.altura, f.peso, f.genero
       FROM FichaMedica f
       JOIN Usuario u ON f.idUsuario = u.idUsuario
       WHERE f.idFichaMedica = ?`,
      [id]
    );

    res.status(200).json(actualizada[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/fichas', async (req, res) => {
  try {
    const { Rut, nombre, fechaNacimiento, sexo, tipoSangre, altura, peso, genero, contraseña } = req.body;

    const [usuario] = await pool.query(
      `INSERT INTO Usuario (Rut, contraseña, nombre, fechaNacimiento, sexo, tipoSangre)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [Rut, contraseña || '1234', nombre, fechaNacimiento, sexo, tipoSangre]
    );

    const idUsuario = usuario.insertId;

    const [ficha] = await pool.query(
      `INSERT INTO FichaMedica (idUsuario, altura, peso, genero)
       VALUES (?, ?, ?, ?)`,
      [idUsuario, altura, peso, genero]
    );

    res.json({ success: true, idFichaMedica: ficha.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar una ficha médica
app.delete('/fichas/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
    // Primero verificar si existe la ficha
    const [existe] = await pool.query(
      'SELECT * FROM FichaMedica WHERE idFichaMedica = ?',
      [id]
    );

    if (existe.length === 0) {
      return res.status(404).json({ error: 'Ficha no encontrada' });
    }

    const idUsuario = existe[0].idUsuario;

    // Eliminar registros relacionados en orden (respetando foreign keys)
    // 1. Eliminar ConsultaMedicamento
    await pool.query(
      `DELETE cm FROM ConsultaMedicamento cm
       JOIN Consulta c ON cm.idConsulta = c.idConsulta
       WHERE c.idFichaMedica = ?`,
      [id]
    );

    // 2. Eliminar Consultas
    await pool.query('DELETE FROM Consulta WHERE idFichaMedica = ?', [id]);

    // 3. Eliminar Diagnósticos
    await pool.query('DELETE FROM Diagnostico WHERE idFichaMedica = ?', [id]);

    // 4. Eliminar Hospitalizaciones
    await pool.query('DELETE FROM Hospitalizacion WHERE idFichaMedica = ?', [id]);

    // 5. Eliminar la Ficha Médica
    await pool.query('DELETE FROM FichaMedica WHERE idFichaMedica = ?', [id]);

    // 6. Eliminar el Usuario
    await pool.query('DELETE FROM Usuario WHERE idUsuario = ?', [idUsuario]);

    res.status(200).json({ 
      success: true, 
      message: 'Ficha médica eliminada correctamente',
      idFichaMedica: id 
    });
  } catch (err) {
    console.error('Error al eliminar ficha:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/pacientes', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT f.idFichaMedica, u.Rut, u.nombre, u.sexo, u.tipoSangre
       FROM FichaMedica f
       JOIN Usuario u ON f.idUsuario = u.idUsuario`
    );
    const pacientes = rows.map(r => ({
      id: r.idFichaMedica,
      rut: r.Rut,
      nombre: r.nombre,
      edad: 0,
      sexo: r.sexo,
      grupo_sanguineo: r.tipoSangre,
      telefono: '',
      mail: ''
    }));
    res.json(pacientes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/fichas/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [ficha] = await pool.query(
      `SELECT f.idFichaMedica, u.Rut, u.nombre, u.fechaNacimiento, u.sexo, u.tipoSangre, f.altura, f.peso, f.genero
       FROM FichaMedica f
       JOIN Usuario u ON f.idUsuario = u.idUsuario
       WHERE f.idFichaMedica = ?`,
      [id]
    );
    if (!ficha.length) return res.status(404).json({ error: 'Ficha no encontrada' });

    const [diagnosticos] = await pool.query('SELECT * FROM Diagnostico WHERE idFichaMedica = ?', [id]);
    const [hospitalizaciones] = await pool.query('SELECT * FROM Hospitalizacion WHERE idFichaMedica = ?', [id]);
    const [consultas] = await pool.query(
      `SELECT c.*, m.nombre AS medicoNombre, tm.tipoMedico
       FROM Consulta c
       LEFT JOIN Medico m ON c.idMedico = m.idMedico
       LEFT JOIN TipoMedico tm ON m.idTipoMedico = tm.idTipoMedico
       WHERE c.idFichaMedica = ?`,
      [id]
    );

    res.json({ ficha: ficha[0], diagnosticos, hospitalizaciones, consultas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/fichas/:id/medicamentos', async (req, res) => {
  const id = req.params.id;
  try {
    const [medicamentos] = await pool.query(
      `SELECT 
        m.nombre,
        m.descripcion,
        cm.cantidad,
        cm.formato,
        cm.tiempoConsumo,
        cm.frecuenciaConsumo
      FROM ConsultaMedicamento cm
      JOIN Medicamento m ON cm.idMedicamento = m.idMedicamento
      JOIN Consulta c ON cm.idConsulta = c.idConsulta
      WHERE c.idFichaMedica = ?`,
      [id]
    );
    res.json(medicamentos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/fichas/:id/procedimientos', async (req, res) => {
  const id = req.params.id;
  try {
    const [procedimientos] = await pool.query(
      `SELECT p.idProcedimiento, p.nombre, p.descripcion, tp.idTipoProcedimiento, tp.tipoprocedimiento AS tipoProcedimiento
       FROM Consulta c
       JOIN ConsultaProcedimiento cp ON c.idConsulta = cp.idConsulta
       JOIN Procedimiento p ON cp.idProcedimiento = p.idProcedimiento
       JOIN TipoProcedimiento tp ON p.idTipoProcedimiento = tp.idTipoProcedimiento
       WHERE c.idFichaMedica = ? AND tp.idTipoProcedimiento = 1`,
      [id]
    );
    res.json(procedimientos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Exámenes con paginación
app.get('/fichas/:id/examenes', async (req, res) => {
  const id = req.params.id;

  try {
    const limitParam = req.query?.limit ? Number(req.query.limit) : null;
    const offsetParam = req.query?.offset ? Number(req.query.offset) : 0;

    let rows;
    let pagination = null;

    if (limitParam && !isNaN(limitParam) && limitParam > 0) {
      const [data] = await pool.query(
        `
        SELECT 
          e.idExamen,
          e.nombre AS nombreExamen,
          e.descripcion AS descripcionExamen,
          te.idTipoExamen,
          te.tipoExamen AS tipoExamen,
          fme.fecha AS fechaExamen,
          fme.descripcion AS descripcionFicha
        FROM FichaMedicaExamen fme
        JOIN Examen e ON fme.idExamen = e.idExamen
        JOIN TipoExamen te ON e.idTipoExamen = te.idTipoExamen
        WHERE fme.idFichaMedica = ?
        ORDER BY fme.fecha DESC
        LIMIT ? OFFSET ?
        `,
        [id, limitParam, offsetParam]
      );

      const [[{ total }]] = await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM FichaMedicaExamen
        WHERE idFichaMedica = ?
        `,
        [id]
      );

      rows = data;
      pagination = {
        limit: limitParam,
        offset: offsetParam,
        total,
        nextOffset: offsetParam + limitParam < total ? offsetParam + limitParam : null,
        hasMore: offsetParam + limitParam < total,
      };
    } else {
      const [data] = await pool.query(
        `
        SELECT 
          e.idExamen,
          e.nombre AS nombreExamen,
          e.descripcion AS descripcionExamen,
          te.idTipoExamen,
          te.tipoExamen AS tipoExamen,
          fme.fecha AS fechaExamen,
          fme.descripcion AS descripcionFicha
        FROM FichaMedicaExamen fme
        JOIN Examen e ON fme.idExamen = e.idExamen
        JOIN TipoExamen te ON e.idTipoExamen = te.idTipoExamen
        WHERE fme.idFichaMedica = ?
        ORDER BY fme.fecha DESC
        `,
        [id]
      );
      rows = data;
    }

    res.json({ data: rows, pagination });

  } catch (err) {
    console.error('Error al obtener exámenes:', err);
    res.status(500).json({ error: err.message });
  }
});

// Estadísticas de exámenes
app.get('/fichas/:id/examenes/estadisticas', async (req, res) => {
  const id = req.params.id;

  try {
    // Total de exámenes asociados a la ficha médica
    const [[{ total }]] = await pool.query(
      `
      SELECT COUNT(fme.idExamen) AS total
      FROM FichaMedicaExamen fme
      WHERE fme.idFichaMedica = ?
      `,
      [id]
    );

    // Fecha límite: últimos 3 meses
    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);

    const [[{ recientes }]] = await pool.query(
      `
      SELECT COUNT(fme.idExamen) AS recientes
      FROM FichaMedicaExamen fme
      WHERE fme.idFichaMedica = ? AND fme.fecha >= ?
      `,
      [id, tresMesesAtras]
    );

    // Fecha límite: último año
    const unAnoAtras = new Date();
    unAnoAtras.setFullYear(unAnoAtras.getFullYear() - 1);

    const [[{ activos }]] = await pool.query(
      `
      SELECT COUNT(fme.idExamen) AS activos
      FROM FichaMedicaExamen fme
      WHERE fme.idFichaMedica = ? AND fme.fecha >= ?
      `,
      [id, unAnoAtras]
    );

    res.json({ total, recientes, activos });

  } catch (err) {
    console.error('Error al obtener estadísticas de exámenes:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/fichas/:id/hospitalizaciones', async (req, res) => {
  const id = req.params.id;
  try {
    const [hospitalizaciones] = await pool.query(
      `SELECT h.idHospitalizacion, h.fecha, h.duracion, h.institucionMedica
       FROM Hospitalizacion h
       WHERE h.idFichaMedica = ?`,
      [id]
    );
    res.json(hospitalizaciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/fichas/:id/consultas', async (req, res) => {
  const id = req.params.id;
  try {
    const [consultas] = await pool.query(
      `SELECT c.fecha, m.nombre AS medicoNombre, c.institucionMedica, c.descripcion
       FROM Consulta c
       JOIN Medico m ON m.idMedico = c.idMedico
       WHERE c.idFichaMedica = ?`,
      [id]
    );
    res.json(consultas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/fichas/:id/diagnosticos', async (req, res) => {
  const id = req.params.id;

  try {
    const limitParam = req.query?.limit ? Number(req.query.limit) : null;
    const offsetParam = req.query?.offset ? Number(req.query.offset) : 0;

    let rows;
    let pagination = null;

    if (limitParam && !isNaN(limitParam) && limitParam > 0) {
      // Consulta paginada
      const [data] = await pool.query(
        `
        SELECT idDiagnostico, fecha, descripcion
        FROM Diagnostico
        WHERE idFichaMedica = ?
        ORDER BY fecha DESC
        LIMIT ? OFFSET ?
        `,
        [id, limitParam, offsetParam]
      );

      // Contar total
      const [[{ total }]] = await pool.query(
        'SELECT COUNT(*) AS total FROM Diagnostico WHERE idFichaMedica = ?',
        [id]
      );

      rows = data;
      pagination = {
        limit: limitParam,
        offset: offsetParam,
        total,
        nextOffset: offsetParam + limitParam < total ? offsetParam + limitParam : null,
        hasMore: offsetParam + limitParam < total,
      };
    } else {
      // Si no se especifica límite, devolver todo
      const [data] = await pool.query(
        `
        SELECT idDiagnostico, fecha, descripcion
        FROM Diagnostico
        WHERE idFichaMedica = ?
        ORDER BY fecha DESC
        `,
        [id]
      );
      rows = data;
    }

    res.json({ data: rows, pagination });

  } catch (err) {
    console.error('Error al obtener diagnósticos:', err);
    res.status(500).json({ error: err.message });
  }
});

// Estadísticas de diagnósticos
app.get('/fichas/:id/diagnosticos/estadisticas', async (req, res) => {
  const id = req.params.id;

  try {
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM Diagnostico WHERE idFichaMedica = ?',
      [id]
    );

    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
    const [[{ recientes }]] = await pool.query(
      'SELECT COUNT(*) AS recientes FROM Diagnostico WHERE idFichaMedica = ? AND fecha >= ?',
      [id, tresMesesAtras]
    );

    const unAnoAtras = new Date();
    unAnoAtras.setFullYear(unAnoAtras.getFullYear() - 1);
    const [[{ activos }]] = await pool.query(
      'SELECT COUNT(*) AS activos FROM Diagnostico WHERE idFichaMedica = ? AND fecha >= ?',
      [id, unAnoAtras]
    );

    res.json({ total, recientes, activos });
  } catch (err) {
    console.error('Error al obtener estadísticas:', err);
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV !== 'production' && !process.env.LAMBDA_RUNTIME_DIR) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`API corriendo en puerto ${PORT}`));
}

app.get('/health', async (req, res) => {
  const status = {
    dbConnected: false,
    dbName: process.env.DB_NAME,
    tables: [],
    error: null
  };

  try {
    const [dbInfo] = await pool.query('SELECT DATABASE() AS currentDB, VERSION() AS version');
    status.dbConnected = true;
    status.dbVersion = dbInfo[0].version;
    status.currentDB = dbInfo[0].currentDB;

    const [tables] = await pool.query('SHOW TABLES');
    status.tables = tables.map(t => Object.values(t)[0]);

    res.status(200).json({
      ok: true,
      message: 'Conexión a base de datos exitosa',
      ...status
    });
  } catch (error) {
    status.error = {
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      stack: error.stack
    };
    res.status(500).json({
      ok: false,
      message: 'Error al conectar a la base de datos',
      ...status
    });
  }
});

export default app;
