import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'bbdd-web.c1m4yqkk8xfv.us-east-1.rds.amazonaws.com',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'Admin123!',
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

app.get('/fichas/:id/cirugias', async (req, res) => {
  const { id } = req.params;

  try {
    const [cirugias] = await pool.query(
      `SELECT 
        c.idCirujia,
        c.nombre AS nombreCirugia,
        c.descripcion AS descripcionCirugia,
        t.tipoCirujia AS tipoCirugia,
        fc.fecha AS fechaCirugia
      FROM 
        FichaMedicaCirujia fc
      JOIN 
        Cirujia c ON fc.idCirujia = c.idCirujia
      JOIN 
        TipoCirujia t ON c.idTipoCirujia = t.idTipoCirujia
      WHERE 
        fc.idFichaMedica = ?
      ORDER BY 
        fc.fecha DESC;`,
      [id]
    );

    if (cirugias.length === 0) {
      return res.status(404).json({ error: 'No se encontraron cirugías para esta ficha médica' });
    }

    res.json(cirugias);
  } catch (err) {
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

app.get('/dashboard/tiposangre', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT \`tipoSangre\` AS tipoSangre, COUNT(*) AS cantidad 
      FROM Usuario 
      GROUP BY \`tipoSangre\`
    `);
    res.json({ data: rows });
  } catch (err) {
    console.error('🔥 Error en /dashboard/tiposangre:', err);
    res.status(500).json({ error: err.message });
  }
});

// Top 10 diagnósticos más comunes
app.get('/dashboard/diagnosticos', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT descripcion, COUNT(*) AS cantidad 
      FROM Diagnostico 
      GROUP BY descripcion 
      ORDER BY cantidad DESC 
      LIMIT 10
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Top 10 medicamentos más prescritos
app.get('/dashboard/medicamentos', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.nombre AS medicamento, COUNT(*) AS vecesPrescrito 
      FROM ConsultaMedicamento cm 
      JOIN Medicamento m ON cm.idMedicamento = m.idMedicamento 
      GROUP BY m.nombre 
      ORDER BY vecesPrescrito DESC 
      LIMIT 10
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cantidad de exámenes por tipo
app.get('/dashboard/examenes', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT te.tipoExamen, COUNT(e.idExamen) AS cantidad 
      FROM Examen e 
      JOIN TipoExamen te ON e.idTipoExamen = te.idTipoExamen 
      GROUP BY te.tipoExamen 
      ORDER BY cantidad DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Top 10 enfermedades más frecuentes
app.get('/dashboard/enfermedades', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.nombre AS enfermedad, COUNT(*) AS cantidad 
      FROM FichaMedicaEnfermedad fme 
      JOIN Enfermedad e ON fme.idEnfermedad = e.idEnfermedad 
      GROUP BY e.nombre 
      ORDER BY cantidad DESC 
      LIMIT 10
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Top 10 alergias más comunes
app.get('/dashboard/alergias', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.nombre AS alergia, COUNT(*) AS cantidad 
      FROM FichaMedicaAlergia fma 
      JOIN Alergia a ON fma.idAlergia = a.idAlergia 
      GROUP BY a.nombre 
      ORDER BY cantidad DESC 
      LIMIT 10
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Top 10 cirugías más realizadas
app.get('/dashboard/cirugias', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.nombre AS cirujia, COUNT(*) AS cantidad 
      FROM FichaMedicaCirujia fmc 
      JOIN Cirujia c ON fmc.idCirujia = c.idCirujia 
      GROUP BY c.nombre 
      ORDER BY cantidad DESC 
      LIMIT 10
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// login
app.post('/login', async (req, res) => {
  const { Rut, password } = req.body;

  if (!Rut || !password) {
    return res.status(400).json({
      ok: false,
      error: 'RUT y contraseña son obligatorios',
    });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM Usuario WHERE Rut = ?', [Rut]);

    if (rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Usuario no encontrado',
      });
    }

    const user = rows[0];

    if (user.contraseña !== password) {
      return res.status(401).json({
        ok: false,
        error: 'Contraseña incorrecta',
      });
    }

    const [fichaMedicaRows] = await pool.query('SELECT idFichaMedica FROM FichaMedica WHERE idUsuario = ?', [user.idUsuario]);

    if (fichaMedicaRows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Ficha médica no encontrada',
      });
    }

    const idFichaMedica = fichaMedicaRows[0].idFichaMedica;

    return res.status(200).json({
      ok: true,
      message: 'Login exitoso',
      user: {
        idUsuario: user.idUsuario,
        nombre: user.nombre,
        Rut: user.Rut,
        idFichaMedica: idFichaMedica,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      error: 'Error interno del servidor',
    });
  }
});




// Examenes

app.get('/fichas/:id/examenes', async (req, res) => {
  const id = req.params.id;

  try {
    const limitParam = req.query?.limit ? Number(req.query.limit) : null;
    const offsetParam = req.query?.offset ? Number(req.query.offset) : 0;

    let examenes;
    let pagination = null;

    const baseQuery = `
      SELECT 
        fme.idFichaMedicaExamen,
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
    `;

    if (limitParam && !isNaN(limitParam) && limitParam > 0) {
      const [data] = await pool.query(`${baseQuery} LIMIT ? OFFSET ?`, [id, limitParam, offsetParam]);
      const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM FichaMedicaExamen WHERE idFichaMedica = ?`, [id]);
      examenes = data;
      pagination = {
        limit: limitParam,
        offset: offsetParam,
        total,
        nextOffset: offsetParam + limitParam < total ? offsetParam + limitParam : null,
        hasMore: offsetParam + limitParam < total,
      };
    } else {
      const [data] = await pool.query(baseQuery, [id]);
      examenes = data;
    }

    for (const examen of examenes) {
      const [resultadosObtenidos] = await pool.query(
        `SELECT idResultadoObtenido, nombre, valor, formato
         FROM ResultadoObtenido
         WHERE idFichaMedicaExamen = ?`,
        [examen.idFichaMedicaExamen]
      );

      const [resultadosEsperados] = await pool.query(
        `SELECT idResultadoEsperado, nombre, valor, formato
         FROM ResultadoEsperado
         WHERE idExamen = ?`,
        [examen.idExamen]
      );

      examen.resultadosObtenidos = resultadosObtenidos;
      examen.resultadosEsperados = resultadosEsperados;
    }

    res.json({ data: examenes, pagination });
  } catch (err) {
    console.error('Error al obtener exámenes:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/fichas/:id/examenes/estadisticas', async (req, res) => {
  const id = req.params.id;

  try {
    const [[{ total }]] = await pool.query(
      `
      SELECT COUNT(fme.idExamen) AS total
      FROM FichaMedicaExamen fme
      WHERE fme.idFichaMedica = ?
      `,
      [id]
    );

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

app.put('/fichas/examenes/:idFichaMedicaExamen', async (req, res) => {
  const { idFichaMedicaExamen } = req.params;
  const { idExamen, descripcionFicha, fechaExamen, resultadosObtenidos } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existe] = await conn.query(
      'SELECT * FROM FichaMedicaExamen WHERE idFichaMedicaExamen = ?',
      [idFichaMedicaExamen]
    );

    if (existe.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ error: 'Registro de examen no encontrado' });
    }

    await conn.query(
      `UPDATE FichaMedicaExamen
       SET idExamen = ?, descripcion = ?, fecha = ?
       WHERE idFichaMedicaExamen = ?`,
      [idExamen, descripcionFicha, fechaExamen, idFichaMedicaExamen]
    );

    if (Array.isArray(resultadosObtenidos) && resultadosObtenidos.length > 0) {
      for (const resultado of resultadosObtenidos) {
        const { idResultadoObtenido, nombre, valor, formato } = resultado;

        const [resExiste] = await conn.query(
          'SELECT * FROM ResultadoObtenido WHERE idResultadoObtenido = ? AND idFichaMedicaExamen = ?',
          [idResultadoObtenido, idFichaMedicaExamen]
        );

        if (resExiste.length > 0) {
          await conn.query(
            `UPDATE ResultadoObtenido
             SET nombre = ?, valor = ?, formato = ?
             WHERE idResultadoObtenido = ?`,
            [nombre, valor, formato, idResultadoObtenido]
          );
        }
      }
    }

    await conn.commit();
    res.json({ success: true, message: 'Examen y resultados actualizados correctamente' });

  } catch (err) {
    await conn.rollback();
    console.error('Error al actualizar examen:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

app.delete('/fichas/examenes/:idFichaMedicaExamen', async (req, res) => {
  const { idFichaMedicaExamen } = req.params;

  try {
    const [existe] = await pool.query(
      'SELECT * FROM FichaMedicaExamen WHERE idFichaMedicaExamen = ?',
      [idFichaMedicaExamen]
    );

    if (existe.length === 0) {
      return res.status(404).json({ error: 'Registro de examen no encontrado' });
    }

    await pool.query(
      'DELETE FROM ResultadoObtenido WHERE idFichaMedicaExamen = ?',
      [idFichaMedicaExamen]
    );

    await pool.query(
      'DELETE FROM FichaMedicaExamen WHERE idFichaMedicaExamen = ?',
      [idFichaMedicaExamen]
    );

    res.json({ success: true, message: 'Examen eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar examen:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/examenes', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.idExamen,
        e.nombre AS nombreExamen,
        e.descripcion AS descripcionExamen,
        te.idTipoExamen,
        te.tipoExamen AS tipoExamen
      FROM Examen e
      JOIN TipoExamen te ON e.idTipoExamen = te.idTipoExamen
      ORDER BY e.nombre ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error('Error al obtener exámenes disponibles:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/fichas/examenes/:idFichaMedicaExamen', async (req, res) => {
  const { idFichaMedicaExamen } = req.params;

  try {
    const [examenRows] = await pool.query(
      `
      SELECT 
        fme.idFichaMedicaExamen,
        fme.idFichaMedica,
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
      WHERE fme.idFichaMedicaExamen = ?
      `,
      [idFichaMedicaExamen]
    );

    if (examenRows.length === 0) {
      return res.status(404).json({ error: 'Examen no encontrado' });
    }

    const examen = examenRows[0];

    const [resultadosObtenidos] = await pool.query(
      `
      SELECT 
        idResultadoObtenido,
        idFichaMedicaExamen,
        nombre,
        valor,
        formato
      FROM ResultadoObtenido
      WHERE idFichaMedicaExamen = ?
      ORDER BY idResultadoObtenido ASC
      `,
      [idFichaMedicaExamen]
    );

    const [resultadosEsperados] = await pool.query(
      `
      SELECT 
        idResultadoEsperado,
        idExamen,
        nombre,
        valor,
        formato
      FROM ResultadoEsperado
      WHERE idExamen = ?
      ORDER BY idResultadoEsperado ASC
      `,
      [examen.idExamen]
    );

    examen.resultadosObtenidos = resultadosObtenidos;
    examen.resultadosEsperados = resultadosEsperados;

    res.json(examen);
  } catch (err) {
    console.error('Error al obtener examen completo:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/fichas/examenes', async (req, res) => {
  const { idFichaMedica, idExamen, fechaExamen, descripcionFicha, resultados } = req.body;

  try {
    if (!idFichaMedica || !idExamen || !fechaExamen) {
      return res.status(400).json({ error: 'Faltan datos necesarios. Asegúrese de que todos los campos estén presentes.' });
    }

    if (!Array.isArray(resultados) || resultados.length === 0) {
      return res.status(400).json({ error: 'No se han proporcionado resultados.' });
    }

    const [result] = await pool.query(
      `INSERT INTO FichaMedicaExamen (idFichaMedica, idExamen, fecha, descripcion)
       VALUES (?, ?, ?, ?)`,
      [idFichaMedica, idExamen, fechaExamen, descripcionFicha]
    );


    const idFichaMedicaExamen = result.insertId;

    if (!idFichaMedicaExamen) {
      return res.status(500).json({ error: 'No se pudo generar el idFichaMedicaExamen.' });
    }

    for (const resultado of resultados) {
      if (!resultado.nombre || !resultado.valor || !resultado.formato) {
        return res.status(400).json({ error: 'Cada resultado debe tener nombre, valor y formato.' });
      }

      await pool.query(
        `INSERT INTO ResultadoObtenido (idFichaMedicaExamen, nombre, valor, formato)
         VALUES (?, ?, ?, ?)`,
        [idFichaMedicaExamen, resultado.nombre, resultado.valor, resultado.formato]
      );
    }

    res.json({ 
      success: true, 
      message: 'Examen agregado correctamente con sus resultados.',
      idFichaMedicaExamen: idFichaMedicaExamen,
      data: {
        idFichaMedicaExamen,
        idFichaMedica,
        idExamen,
        fechaExamen,
        descripcionFicha
      }
    });
  } catch (err) {
    console.error('Error al agregar examen:', err);
    res.status(500).json({ error: 'Error en el servidor. Intente nuevamente.' });
  }
});

app.get('/resultados/esperados/:idExamen', async (req, res) => {
  const { idExamen } = req.params;

  try {
    const [resultados] = await pool.query(
      `SELECT idResultadoEsperado, nombre, valor, formato 
       FROM ResultadoEsperado 
       WHERE idExamen = ?`, 
      [idExamen]
    );

    if (resultados.length === 0) {
      return res.status(404).json({ error: 'No se encontraron resultados esperados para este examen' });
    }

    res.json(resultados);
  } catch (err) {
    console.error('Error al obtener resultados esperados:', err);
    res.status(500).json({ error: err.message });
  }
});



// Diagnosticos

app.get('/fichas/:id/diagnosticos', async (req, res) => {
  const id = req.params.id;

  try {
    const limitParam = req.query?.limit ? Number(req.query.limit) : null;
    const offsetParam = req.query?.offset ? Number(req.query.offset) : 0;

    let rows;
    let pagination = null;

    if (limitParam && !isNaN(limitParam) && limitParam > 0) {
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

app.get('/fichas/diagnosticos/:idDiagnostico', async (req, res) => {
  const { idDiagnostico } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        idDiagnostico,
        idFichaMedica,
        fecha,
        descripcion
      FROM Diagnostico
      WHERE idDiagnostico = ?
      `,
      [idDiagnostico]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Diagnóstico no encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error al obtener diagnóstico:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/fichas/diagnosticos', async (req, res) => {
  try {
    const { idFichaMedica, fecha, descripcionFicha } = req.body;

    if (idFichaMedica === undefined || idFichaMedica === null) {
      return res.status(400).json({ error: 'El campo idFichaMedica es obligatorio' });
    }

    if (!fecha || typeof fecha !== 'string') {
      return res.status(400).json({ error: 'El campo fecha es obligatorio y debe ser un string' });
    }

    if (!descripcionFicha || descripcionFicha.trim() === '') {
      return res.status(400).json({ error: 'El campo descripcion es obligatorio' });
    }

    const fechaValida = !isNaN(new Date(fecha).getTime());
    if (!fechaValida) {
      return res.status(400).json({ error: 'El formato de la fecha no es válido (use YYYY-MM-DD)' });
    }

    const [result] = await pool.query(
      `
      INSERT INTO Diagnostico (idFichaMedica, fecha, descripcion)
      VALUES (?, ?, ?)
      `,
      [idFichaMedica, fecha, descripcionFicha]
    );

    res.json({
      success: true,
      message: 'Diagnóstico agregado correctamente',
      idDiagnostico: result.insertId
    });

  } catch (err) {
    res.status(500).json({
      error: 'Error interno del servidor',
      detalle: err.message,
      sqlMessage: err.sqlMessage,
      sql: err.sql
    });
  }
});


app.put('/fichas/diagnosticos/:idDiagnostico', async (req, res) => {
  const { idDiagnostico } = req.params;
  const { fechaDiagnostico, descripcion } = req.body;

  try {
    const [existe] = await pool.query(
      'SELECT * FROM Diagnostico WHERE idDiagnostico = ?',
      [idDiagnostico]
    );

    if (existe.length === 0) {
      return res.status(404).json({ error: 'Diagnóstico no encontrado' });
    }

    await pool.query(
      `
      UPDATE Diagnostico
      SET fecha = ?, descripcion = ?
      WHERE idDiagnostico = ?
      `,
      [fechaDiagnostico, descripcion, idDiagnostico]
    );

    res.json({ success: true, message: 'Diagnóstico actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar diagnóstico:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/fichas/diagnosticos/:idDiagnostico', async (req, res) => {
  const { idDiagnostico } = req.params;

  try {
    const [existe] = await pool.query(
      'SELECT * FROM Diagnostico WHERE idDiagnostico = ?',
      [idDiagnostico]
    );

    if (existe.length === 0) {
      return res.status(404).json({ error: 'Diagnóstico no encontrado' });
    }

    await pool.query(
      'DELETE FROM Diagnostico WHERE idDiagnostico = ?',
      [idDiagnostico]
    );

    res.json({ success: true, message: 'Diagnóstico eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar diagnóstico:', err);
    res.status(500).json({ error: err.message });
  }
});

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




// Hospitalizaciones

app.get('/fichas/:id/hospitalizaciones', async (req, res) => {
  const id = req.params.id;

  try {
    const limitParam = req.query?.limit ? Number(req.query.limit) : null;
    const offsetParam = req.query?.offset ? Number(req.query.offset) : 0;

    let rows;
    let pagination = null;

    if (limitParam && !isNaN(limitParam) && limitParam > 0) {
      const [data] = await pool.query(
        `
        SELECT idHospitalizacion, fecha, duracion, institucionMedica
        FROM Hospitalizacion
        WHERE idFichaMedica = ?
        ORDER BY fecha DESC
        LIMIT ? OFFSET ?
        `,
        [id, limitParam, offsetParam]
      );

      const [[{ total }]] = await pool.query(
        'SELECT COUNT(*) AS total FROM Hospitalizacion WHERE idFichaMedica = ?',
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
        SELECT idHospitalizacion, fecha, duracion, institucionMedica
        FROM Hospitalizacion
        WHERE idFichaMedica = ?
        ORDER BY fecha DESC
        `,
        [id]
      );
      rows = data;
    }

    res.json({ data: rows, pagination });

  } catch (err) {
    console.error('Error al obtener hospitalizaciones:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/fichas/hospitalizaciones/:idHospitalizacion', async (req, res) => {
  const { idHospitalizacion } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        idHospitalizacion,
        idFichaMedica,
        fecha,
        duracion, 
        institucionMedica
      FROM Hospitalizacion
      WHERE idHospitalizacion = ?
      `,
      [idHospitalizacion]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Hospitalización no encontrada' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error al obtener la hospitalización:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/fichas/hospitalizaciones', async (req, res) => {
  try {
    const { idFichaMedica, fecha, duracion, institucionMedica } = req.body;

    // --- Validaciones básicas ---
    if (idFichaMedica === undefined || idFichaMedica === null || isNaN(Number(idFichaMedica))) {
      return res.status(400).json({ error: 'El campo idFichaMedica es obligatorio y debe ser numérico.' });
    }

    if (!fecha || typeof fecha !== 'string' || fecha.trim() === '') {
      return res.status(400).json({ error: 'El campo fecha es obligatorio y debe ser un string válido.' });
    }

    const fechaValida = !isNaN(new Date(fecha).getTime());
    if (!fechaValida) {
      return res.status(400).json({ error: 'El formato de la fecha no es válido (use YYYY-MM-DD).' });
    }

    if (duracion === undefined || duracion === null || isNaN(Number(duracion))) {
      return res.status(400).json({ error: 'El campo duracion es obligatorio y debe ser numérico.' });
    }

    if (!institucionMedica || typeof institucionMedica !== 'string' || institucionMedica.trim() === '') {
      return res.status(400).json({ error: 'El campo institucionMedica es obligatorio y debe ser texto válido.' });
    }

    // --- Inserción ---
    const [result] = await pool.query(
      `
      INSERT INTO Hospitalizacion (idFichaMedica, fecha, duracion, institucionMedica)
      VALUES (?, ?, ?, ?)
      `,
      [Number(idFichaMedica), fecha.trim(), Number(duracion), institucionMedica.trim()]
    );

    res.json({
      success: true,
      message: 'Hospitalización agregada correctamente.',
      idHospitalizacion: result.insertId,
      data: {
        idFichaMedica,
        fecha,
        duracion,
        institucionMedica
      }
    });

  } catch (err) {
    console.error('Error al agregar hospitalización:', err);
    res.status(500).json({
      error: 'Error interno del servidor',
      detalle: err.message,
      sqlMessage: err.sqlMessage || null
    });
  }
});



app.put('/fichas/hospitalizaciones/:idHospitalizacion', async (req, res) => {
  const { idHospitalizacion } = req.params;
  const { fecha, institucionMedica, duracion } = req.body;

  try {
    const [existe] = await pool.query(
      'SELECT * FROM Hospitalizacion WHERE idHospitalizacion = ?',
      [idHospitalizacion]
    );

    if (existe.length === 0) {
      return res.status(404).json({ error: 'Hospitalización no encontrado' });
    }

    await pool.query(
      `
      UPDATE Hospitalizacion
      SET fecha = ?, duracion = ?, institucionMedica = ?
      WHERE idHospitalizacion = ?
      `,
      [fecha, duracion, institucionMedica, idHospitalizacion]
    );

    res.json({ success: true, message: 'Hospitalización actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar hospitalización:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/fichas/hospitalizaciones/:idHospitalizacion', async (req, res) => {
  const { idHospitalizacion } = req.params;

  try {
    const [existe] = await pool.query(
      'SELECT * FROM Hospitalizacion WHERE idHospitalizacion = ?',
      [idHospitalizacion]
    );

    if (existe.length === 0) {
      return res.status(404).json({ error: 'Hospitalización no encontrada' });
    }

    await pool.query(
      'DELETE FROM Hospitalizacion WHERE idHospitalizacion = ?',
      [idHospitalizacion]
    );

    res.json({ success: true, message: 'Hospitalización eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar hospitalización:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/fichas/:id/hospitalizaciones/estadisticas', async (req, res) => {
  const id = req.params.id;

  try {
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM Hospitalizacion WHERE idFichaMedica = ?',
      [id]
    );

    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
    const [[{ recientes }]] = await pool.query(
      'SELECT COUNT(*) AS recientes FROM Hospitalizacion WHERE idFichaMedica = ? AND fecha >= ?',
      [id, tresMesesAtras]
    );

    const unAnoAtras = new Date();
    unAnoAtras.setFullYear(unAnoAtras.getFullYear() - 1);
    const [[{ activos }]] = await pool.query(
      'SELECT COUNT(*) AS activos FROM Hospitalizacion WHERE idFichaMedica = ? AND fecha >= ?',
      [id, unAnoAtras]
    );

    res.json({ total, recientes, activos });
  } catch (err) {
    console.error('Error al obtener estadísticas:', err);
    res.status(500).json({ error: err.message });
  }
});





// Consultas

app.get('/fichas/:id/consultas', async (req, res) => {
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
          c.idConsulta, 
          c.fecha, 
          m.nombre AS medicoNombre, 
          c.institucionMedica, 
          c.descripcion
        FROM Consulta c
        LEFT JOIN Medico m ON c.idMedico = m.idMedico
        WHERE c.idFichaMedica = ?
        ORDER BY c.fecha DESC
        LIMIT ? OFFSET ?
        `,
        [id, limitParam, offsetParam]
      );

      const [countResult] = await pool.query(
        'SELECT COUNT(*) AS total FROM Consulta WHERE idFichaMedica = ?',
        [id]
      );

      rows = data;
      const total = countResult[0].total;

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
          c.idConsulta, 
          c.fecha, 
          m.nombre AS medicoNombre, 
          c.institucionMedica, 
          c.descripcion
        FROM Consulta c
        LEFT JOIN Medico m ON c.idMedico = m.idMedico
        WHERE c.idFichaMedica = ?
        ORDER BY c.fecha DESC
        `,
        [id]
      );
      rows = data;
    }

    res.json({ data: rows, pagination });

  } catch (err) {
    console.error('Error al obtener consultas:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/fichas/consultas/:idConsulta', async (req, res) => {
  const { idConsulta } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        c.idConsulta,
        c.idFichaMedica,
        c.fecha, 
        c.idMedico,
        m.nombre AS medicoNombre,
        c.institucionMedica, 
        c.descripcion
      FROM Consulta c
      LEFT JOIN Medico m ON c.idMedico = m.idMedico
      WHERE c.idConsulta = ?
      `,
      [idConsulta]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Consulta no encontrada' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error al obtener la consulta:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/fichas/consultas', async (req, res) => {
  try {
    const { idFichaMedica, idMedico, institucionMedica, fecha, descripcion } = req.body;

    if (idFichaMedica === undefined || idFichaMedica === null || isNaN(Number(idFichaMedica))) {
      return res.status(400).json({ error: 'El campo idFichaMedica es obligatorio y debe ser numérico' });
    }

    if (idMedico === undefined || idMedico === null || isNaN(Number(idMedico))) {
      return res.status(400).json({ error: 'El campo idMedico es obligatorio y debe ser numérico' });
    }

    if (!institucionMedica || typeof institucionMedica !== 'string' || institucionMedica.trim() === '') {
      return res.status(400).json({ error: 'El campo institucionMedica es obligatorio y debe ser un string' });
    }

    if (!fecha || typeof fecha !== 'string') {
      return res.status(400).json({ error: 'El campo fecha es obligatorio y debe ser un string' });
    }

    const fechaValida = !isNaN(new Date(fecha).getTime());
    if (!fechaValida) {
      return res.status(400).json({ error: 'El formato de la fecha no es válido (use YYYY-MM-DD)' });
    }

    if (!descripcion || typeof descripcion !== 'string' || descripcion.trim() === '') {
      return res.status(400).json({ error: 'El campo descripcion es obligatorio y debe ser un string' });
    }

    const [result] = await pool.query(
      `INSERT INTO Consulta (idFichaMedica, idMedico, fecha, institucionMedica, descripcion)
       VALUES (?, ?, ?, ?, ?)`,
      [Number(idFichaMedica), Number(idMedico), fecha, institucionMedica.trim(), descripcion.trim()]
    );

    res.json({
      success: true,
      message: 'Consulta agregada correctamente',
      idConsulta: result.insertId
    });

  } catch (err) {
    console.error('Error al agregar consulta:', err);
    res.status(500).json({
      error: 'Error interno del servidor',
      detalle: err.message,
      sqlMessage: err.sqlMessage,
      sql: err.sql
    });
  }
});

app.put('/fichas/consultas/:idConsulta', async (req, res) => {
  const { idConsulta } = req.params;
  const { fecha, idMedico, institucionMedica, descripcion } = req.body;

  try {
    const [existe] = await pool.query(
      'SELECT * FROM Consulta WHERE idConsulta = ?',
      [idConsulta]
    );

    if (existe.length === 0) {
      return res.status(404).json({ error: 'Consulta no encontrada' });
    }

    await pool.query(
      `
      UPDATE Consulta
      SET fecha = ?, idMedico = ?, institucionMedica = ?, descripcion = ?
      WHERE idConsulta = ?
      `,
      [fecha, idMedico, institucionMedica, descripcion, idConsulta]
    );

    res.json({ success: true, message: 'Consulta actualizada correctamente' });
  } catch (err) {
    console.error('Error al actualizar consulta:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/medicos', async (req, res) => {
  try {
    const [medicos] = await pool.query(
      'SELECT idMedico, nombre FROM Medico ORDER BY nombre ASC'
    );
    res.json(medicos);
  } catch (err) {
    console.error('Error al obtener médicos:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/medicos', async (req, res) => {
  const { nombre } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO Medico (nombre) VALUES (?)',
      [nombre]
    );

    res.json({
      idMedico: result.insertId,
      nombre
    });
  } catch (err) {
    console.error('Error al crear médico:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/fichas/consultas/:idConsulta', async (req, res) => {
  const { idConsulta } = req.params;

  if (!idConsulta || isNaN(Number(idConsulta))) {
    return res.status(400).json({ error: 'ID de consulta inválido.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existe] = await conn.query(
      'SELECT idConsulta FROM Consulta WHERE idConsulta = ?',
      [idConsulta]
    );

    if (existe.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ error: 'Consulta no encontrada.' });
    }

    await conn.query(
      'DELETE FROM ConsultaMedicamento WHERE idConsulta = ?',
      [idConsulta]
    );

    await conn.query(
      'DELETE FROM Consulta WHERE idConsulta = ?',
      [idConsulta]
    );

    await conn.commit();

    res.json({
      success: true,
      message: 'Consulta y sus medicamentos asociados eliminados correctamente.',
    });
  } catch (err) {
    await conn.rollback();
    console.error('Error al eliminar consulta:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

app.get('/fichas/:id/consultas/estadisticas', async (req, res) => {
  const id = req.params.id;

  try {
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM Consulta WHERE idFichaMedica = ?',
      [id]
    );

    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
    const [[{ recientes }]] = await pool.query(
      'SELECT COUNT(*) AS recientes FROM Consulta WHERE idFichaMedica = ? AND fecha >= ?',
      [id, tresMesesAtras]
    );

    const unAnoAtras = new Date();
    unAnoAtras.setFullYear(unAnoAtras.getFullYear() - 1);
    const [[{ activos }]] = await pool.query(
      'SELECT COUNT(*) AS activos FROM Consulta WHERE idFichaMedica = ? AND fecha >= ?',
      [id, unAnoAtras]
    );

    res.json({ total, recientes, activos });
  } catch (err) {
    console.error('Error al obtener estadísticas:', err);
    res.status(500).json({ error: err.message });
  }
});






// Procedimientos

app.get('/fichas/:id/procedimientos', async (req, res) => {
  const id = req.params.id;

  try {
    const limitParam = req.query?.limit ? Number(req.query.limit) : null;
    const offsetParam = req.query?.offset ? Number(req.query.offset) : 0;

    let procedimientos;
    let pagination = null;

    const baseQuery = `
      SELECT 
        fmc.idFichaMedicaCirujia,
        c.idCirujia,
        c.nombre AS nombreCirujia,
        c.descripcion AS descripcionCirujia,
        tc.idTipoCirujia,
        tc.tipoCirujia AS tipoCirujia,
        fmc.fecha,
        fmc.descripcion
      FROM FichaMedicaCirujia fmc
      JOIN Cirujia c ON fmc.idCirujia = c.idCirujia
      JOIN TipoCirujia tc ON c.idTipoCirujia = tc.idTipoCirujia
      WHERE fmc.idFichaMedica = ?
      ORDER BY fmc.fecha DESC
    `;

    if (limitParam && !isNaN(limitParam) && limitParam > 0) {
      const [data] = await pool.query(`${baseQuery} LIMIT ? OFFSET ?`, [id, limitParam, offsetParam]);
      const [[{ total }]] = await pool.query(
        `SELECT COUNT(*) AS total FROM FichaMedicaCirujia WHERE idFichaMedica = ?`,
        [id]
      );

      procedimientos = data;
      pagination = {
        limit: limitParam,
        offset: offsetParam,
        total,
        nextOffset: offsetParam + limitParam < total ? offsetParam + limitParam : null,
        hasMore: offsetParam + limitParam < total,
      };
    } else {
      const [data] = await pool.query(baseQuery, [id]);
      procedimientos = data;
    }

    res.json({ data: procedimientos, pagination });
  } catch (err) {
    console.error('Error al obtener procedimientos:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/fichas/:id/procedimientos/estadisticas', async (req, res) => {
  const id = req.params.id;

  try {
    const [[{ total }]] = await pool.query(
      `
      SELECT COUNT(fmc.idCirujia) AS total
      FROM FichaMedicaCirujia fmc
      WHERE fmc.idFichaMedica = ?
      `,
      [id]
    );

    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);

    const [[{ recientes }]] = await pool.query(
      `
      SELECT COUNT(fmc.idCirujia) AS recientes
      FROM FichaMedicaCirujia fmc
      WHERE fmc.idFichaMedica = ? AND fmc.fecha >= ?
      `,
      [id, tresMesesAtras]
    );

    const unAnoAtras = new Date();
    unAnoAtras.setFullYear(unAnoAtras.getFullYear() - 1);

    const [[{ activos }]] = await pool.query(
      `
      SELECT COUNT(fmc.idCirujia) AS activos
      FROM FichaMedicaCirujia fmc
      WHERE fmc.idFichaMedica = ? AND fmc.fecha >= ?
      `,
      [id, unAnoAtras]
    );

    res.json({ total, recientes, activos });
  } catch (err) {
    console.error('Error al obtener estadísticas de procedimientos:', err);
    res.status(500).json({ error: err.message });
  }
});


app.put('/fichas/procedimientos/:idFichaMedicaCirujia', async (req, res) => {
  const { idFichaMedicaCirujia } = req.params;
  const { idCirujia, descripcion, fecha } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existe] = await conn.query(
      'SELECT * FROM FichaMedicaCirujia WHERE idFichaMedicaCirujia = ?',
      [idFichaMedicaCirujia]
    );

    if (existe.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ error: 'Registro de procedimiento no encontrado' });
    }

    await conn.query(
      `
      UPDATE FichaMedicaCirujia
      SET idCirujia = ?, descripcion = ?, fecha = ?
      WHERE idFichaMedicaCirujia = ?
      `,
      [idCirujia, descripcion, fecha, idFichaMedicaCirujia]
    );

    await conn.commit();
    res.json({ success: true, message: 'Procedimiento actualizado correctamente' });

  } catch (err) {
    await conn.rollback();
    console.error('Error al actualizar procedimiento:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

app.delete('/fichas/procedimientos/:idFichaMedicaCirujia', async (req, res) => {
  const { idFichaMedicaCirujia } = req.params;

  try {
    const [existe] = await pool.query(
      'SELECT * FROM FichaMedicaCirujia WHERE idFichaMedicaCirujia = ?',
      [idFichaMedicaCirujia]
    );

    if (existe.length === 0) {
      return res.status(404).json({ error: 'Registro de procedimiento no encontrado' });
    }

    await pool.query(
      'DELETE FROM FichaMedicaCirujia WHERE idFichaMedicaCirujia = ?',
      [idFichaMedicaCirujia]
    );

    res.json({ success: true, message: 'Procedimiento eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar procedimiento:', err);
    res.status(500).json({ error: err.message });
  }
});


app.get('/procedimientos', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.idCirujia,
        c.nombre AS nombreCirujia,
        c.descripcion AS descripcionCirujia,
        tc.idTipoCirujia,
        tc.tipoCirujia AS tipoCirujia
      FROM Cirujia c
      JOIN TipoCirujia tc ON c.idTipoCirujia = tc.idTipoCirujia
      ORDER BY c.nombre ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error('Error al obtener procedimientos disponibles:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/fichas/procedimientos/:idFichaMedicaCirujia', async (req, res) => {
  const { idFichaMedicaCirujia } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        fmc.idFichaMedicaCirujia,
        fmc.idFichaMedica,
        c.idCirujia,
        c.nombre AS nombreCirujia,
        c.descripcion AS descripcionCirujia,
        tc.idTipoCirujia,
        tc.tipoCirujia AS tipoCirujia,
        fmc.fecha,
        fmc.descripcion
      FROM FichaMedicaCirujia fmc
      JOIN Cirujia c ON fmc.idCirujia = c.idCirujia
      JOIN TipoCirujia tc ON c.idTipoCirujia = tc.idTipoCirujia
      WHERE fmc.idFichaMedicaCirujia = ?
      `,
      [idFichaMedicaCirujia]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Procedimiento no encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error al obtener procedimiento completo:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/fichas/procedimientos', async (req, res) => {
  const { idFichaMedica, idCirujia, fecha, descripcion } = req.body;

  try {
    if (!idFichaMedica || !idCirujia || !fecha) {
      return res.status(400).json({
        error: 'Faltan datos necesarios. Asegúrese de que todos los campos estén presentes.'
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO FichaMedicaCirujia (idFichaMedica, idCirujia, fecha, descripcion)
      VALUES (?, ?, ?, ?)
      `,
      [idFichaMedica, idCirujia, fecha, descripcion]
    );

    const idFichaMedicaCirujia = result.insertId;

    res.json({
      success: true,
      message: 'Procedimiento agregado correctamente.',
      idFichaMedicaCirujia,
      data: {
        idFichaMedicaCirujia,
        idFichaMedica,
        idCirujia,
        fecha,
        descripcion
      }
    });

  } catch (err) {
    console.error('Error al agregar procedimiento:', err);
    res.status(500).json({ error: 'Error en el servidor. Intente nuevamente.' });
  }
});






// Consultas

app.get('/fichas/:id/consultas', async (req, res) => {
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
          c.idConsulta, 
          c.fecha, 
          m.nombre AS medicoNombre, 
          c.institucionMedica, 
          c.descripcion
        FROM Consulta c
        LEFT JOIN Medico m ON c.idMedico = m.idMedico
        WHERE c.idFichaMedica = ?
        ORDER BY c.fecha DESC
        LIMIT ? OFFSET ?
        `,
        [id, limitParam, offsetParam]
      );

      const [countResult] = await pool.query(
        'SELECT COUNT(*) AS total FROM Consulta WHERE idFichaMedica = ?',
        [id]
      );

      rows = data;
      const total = countResult[0].total;

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
          c.idConsulta, 
          c.fecha, 
          m.nombre AS medicoNombre, 
          c.institucionMedica, 
          c.descripcion
        FROM Consulta c
        LEFT JOIN Medico m ON c.idMedico = m.idMedico
        WHERE c.idFichaMedica = ?
        ORDER BY c.fecha DESC
        `,
        [id]
      );
      rows = data;
    }

    res.json({ data: rows, pagination });

  } catch (err) {
    console.error('Error al obtener consultas:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/fichas/consultas/:idConsulta', async (req, res) => {
  const { idConsulta } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        c.idConsulta,
        c.idFichaMedica,
        c.fecha, 
        c.idMedico,
        m.nombre AS medicoNombre,
        c.institucionMedica, 
        c.descripcion
      FROM Consulta c
      LEFT JOIN Medico m ON c.idMedico = m.idMedico
      WHERE c.idConsulta = ?
      `,
      [idConsulta]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Consulta no encontrada' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error al obtener la consulta:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/fichas/consultas', async (req, res) => {
  try {
    const { idFichaMedica, idMedico, institucionMedica, fecha, descripcion } = req.body;

    if (idFichaMedica === undefined || idFichaMedica === null || isNaN(Number(idFichaMedica))) {
      return res.status(400).json({ error: 'El campo idFichaMedica es obligatorio y debe ser numérico' });
    }

    if (idMedico === undefined || idMedico === null || isNaN(Number(idMedico))) {
      return res.status(400).json({ error: 'El campo idMedico es obligatorio y debe ser numérico' });
    }

    if (!institucionMedica || typeof institucionMedica !== 'string' || institucionMedica.trim() === '') {
      return res.status(400).json({ error: 'El campo institucionMedica es obligatorio y debe ser un string' });
    }

    if (!fecha || typeof fecha !== 'string') {
      return res.status(400).json({ error: 'El campo fecha es obligatorio y debe ser un string' });
    }

    const fechaValida = !isNaN(new Date(fecha).getTime());
    if (!fechaValida) {
      return res.status(400).json({ error: 'El formato de la fecha no es válido (use YYYY-MM-DD)' });
    }

    if (!descripcion || typeof descripcion !== 'string' || descripcion.trim() === '') {
      return res.status(400).json({ error: 'El campo descripcion es obligatorio y debe ser un string' });
    }

    const [result] = await pool.query(
      `INSERT INTO Consulta (idFichaMedica, idMedico, fecha, institucionMedica, descripcion)
       VALUES (?, ?, ?, ?, ?)`,
      [Number(idFichaMedica), Number(idMedico), fecha, institucionMedica.trim(), descripcion.trim()]
    );

    res.json({
      success: true,
      message: 'Consulta agregada correctamente',
      idConsulta: result.insertId
    });

  } catch (err) {
    console.error('Error al agregar consulta:', err);
    res.status(500).json({
      error: 'Error interno del servidor',
      detalle: err.message,
      sqlMessage: err.sqlMessage,
      sql: err.sql
    });
  }
});

app.put('/fichas/consultas/:idConsulta', async (req, res) => {
  const { idConsulta } = req.params;
  const { fecha, idMedico, institucionMedica, descripcion } = req.body;

  try {
    const [existe] = await pool.query(
      'SELECT * FROM Consulta WHERE idConsulta = ?',
      [idConsulta]
    );

    if (existe.length === 0) {
      return res.status(404).json({ error: 'Consulta no encontrada' });
    }

    await pool.query(
      `
      UPDATE Consulta
      SET fecha = ?, idMedico = ?, institucionMedica = ?, descripcion = ?
      WHERE idConsulta = ?
      `,
      [fecha, idMedico, institucionMedica, descripcion, idConsulta]
    );

    res.json({ success: true, message: 'Consulta actualizada correctamente' });
  } catch (err) {
    console.error('Error al actualizar consulta:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/medicos', async (req, res) => {
  try {
    const [medicos] = await pool.query(
      'SELECT idMedico, nombre FROM Medico ORDER BY nombre ASC'
    );
    res.json(medicos);
  } catch (err) {
    console.error('Error al obtener médicos:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/medicos', async (req, res) => {
  const { nombre } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO Medico (nombre) VALUES (?)',
      [nombre]
    );

    res.json({
      idMedico: result.insertId,
      nombre
    });
  } catch (err) {
    console.error('Error al crear médico:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/fichas/consultas/:idConsulta', async (req, res) => {
  const { idConsulta } = req.params;

  if (!idConsulta || isNaN(Number(idConsulta))) {
    return res.status(400).json({ error: 'ID de consulta inválido.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existe] = await conn.query(
      'SELECT idConsulta FROM Consulta WHERE idConsulta = ?',
      [idConsulta]
    );

    if (existe.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ error: 'Consulta no encontrada.' });
    }

    await conn.query(
      'DELETE FROM ConsultaMedicamento WHERE idConsulta = ?',
      [idConsulta]
    );

    await conn.query(
      'DELETE FROM Consulta WHERE idConsulta = ?',
      [idConsulta]
    );

    await conn.commit();

    res.json({
      success: true,
      message: 'Consulta y sus medicamentos asociados eliminados correctamente.',
    });
  } catch (err) {
    await conn.rollback();
    console.error('Error al eliminar consulta:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

app.get('/fichas/:id/consultas/estadisticas', async (req, res) => {
  const id = req.params.id;

  try {
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM Consulta WHERE idFichaMedica = ?',
      [id]
    );

    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
    const [[{ recientes }]] = await pool.query(
      'SELECT COUNT(*) AS recientes FROM Consulta WHERE idFichaMedica = ? AND fecha >= ?',
      [id, tresMesesAtras]
    );

    const unAnoAtras = new Date();
    unAnoAtras.setFullYear(unAnoAtras.getFullYear() - 1);
    const [[{ activos }]] = await pool.query(
      'SELECT COUNT(*) AS activos FROM Consulta WHERE idFichaMedica = ? AND fecha >= ?',
      [id, unAnoAtras]
    );

    res.json({ total, recientes, activos });
  } catch (err) {
    console.error('Error al obtener estadísticas:', err);
    res.status(500).json({ error: err.message });
  }
});





// Medicamentos

app.get('/fichas/:id/medicamentos', async (req, res) => {
  const id = req.params.id;

  try {
    const limitParam = req.query?.limit ? Number(req.query.limit) : null;
    const offsetParam = req.query?.offset ? Number(req.query.offset) : 0;

    let rows;
    let pagination = null;

    const baseQuery = `
      SELECT 
        cm.idConsultaMedicamento,
        m.idMedicamento,
        m.nombre AS nombreMedicamento,
        m.descripcion AS descripcionMedicamento,
        tm.tipoMedicamento,
        cm.cantidad,
        cm.formato,
        cm.tiempoConsumo,
        cm.frecuenciaConsumo,
        c.fecha AS fechaConsulta,
        c.institucionMedica
      FROM ConsultaMedicamento cm
      JOIN Medicamento m ON cm.idMedicamento = m.idMedicamento
      JOIN TipoMedicamento tm ON m.idTipoMedicamento = tm.idTipoMedicamento
      JOIN Consulta c ON cm.idConsulta = c.idConsulta
      WHERE c.idFichaMedica = ?
      ORDER BY c.fecha DESC
    `;

    if (limitParam && !isNaN(limitParam) && limitParam > 0) {
      // Consulta paginada
      const [data] = await pool.query(`${baseQuery} LIMIT ? OFFSET ?`, [id, limitParam, offsetParam]);
      const [[{ total }]] = await pool.query(
        `SELECT COUNT(*) AS total
         FROM ConsultaMedicamento cm
         JOIN Consulta c ON cm.idConsulta = c.idConsulta
         WHERE c.idFichaMedica = ?`,
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
      const [data] = await pool.query(baseQuery, [id]);
      rows = data;
    }

    res.json({ data: rows, pagination });

  } catch (err) {
    console.error('Error al obtener medicamentos:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/fichas/medicamentos/:idConsultaMedicamento', async (req, res) => {
  const { idConsultaMedicamento } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        cm.idConsultaMedicamento,
        cm.idConsulta,
        c.idFichaMedica,
        c.fecha AS fechaConsulta,
        c.institucionMedica,
        m.idMedicamento,
        m.nombre AS nombreMedicamento,
        m.descripcion AS descripcionMedicamento,
        tm.idTipoMedicamento,
        tm.tipoMedicamento,
        cm.cantidad,
        cm.formato,
        cm.tiempoConsumo,
        cm.frecuenciaConsumo
      FROM ConsultaMedicamento cm
      JOIN Consulta c ON cm.idConsulta = c.idConsulta
      JOIN Medicamento m ON cm.idMedicamento = m.idMedicamento
      JOIN TipoMedicamento tm ON m.idTipoMedicamento = tm.idTipoMedicamento
      WHERE cm.idConsultaMedicamento = ?
      `,
      [idConsultaMedicamento]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Medicamento no encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error al obtener el medicamento:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/fichas/medicamentos/:idConsultaMedicamento', async (req, res) => {
  const { idConsultaMedicamento } = req.params;
  const { idMedicamento, cantidad, formato, tiempoConsumo, frecuenciaConsumo } = req.body;

  try {
    const [existe] = await pool.query(
      'SELECT * FROM ConsultaMedicamento WHERE idConsultaMedicamento = ?',
      [idConsultaMedicamento]
    );

    if (existe.length === 0) {
      return res.status(404).json({ error: 'Medicamento no encontrado' });
    }

    await pool.query(
      `
      UPDATE ConsultaMedicamento
      SET idMedicamento = ?, cantidad = ?, formato = ?, tiempoConsumo = ?, frecuenciaConsumo = ?
      WHERE idConsultaMedicamento = ?
      `,
      [idMedicamento, cantidad, formato, tiempoConsumo, frecuenciaConsumo, idConsultaMedicamento]
    );

    res.json({ success: true, message: 'Medicamento actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar medicamento:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/medicamentos', async (req, res) => {
  try {
    const [medicamentos] = await pool.query(`
      SELECT 
        m.idMedicamento,
        m.nombre AS nombreMedicamento,
        m.descripcion AS descripcionMedicamento,
        tm.idTipoMedicamento,
        tm.tipoMedicamento
      FROM Medicamento m
      JOIN TipoMedicamento tm ON m.idTipoMedicamento = tm.idTipoMedicamento
      ORDER BY m.nombre ASC
    `);

    res.json(medicamentos);
  } catch (err) {
    console.error('Error al obtener medicamentos:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/fichas/medicamentos/:idConsultaMedicamento', async (req, res) => {
  const { idConsultaMedicamento } = req.params;

  // --- Validación básica ---
  if (!idConsultaMedicamento || isNaN(Number(idConsultaMedicamento))) {
    return res.status(400).json({
      error: 'El parámetro idConsultaMedicamento es obligatorio y debe ser numérico.'
    });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1️⃣ Verificar si existe
    const [existe] = await conn.query(
      'SELECT idConsultaMedicamento FROM ConsultaMedicamento WHERE idConsultaMedicamento = ?',
      [idConsultaMedicamento]
    );

    if (!existe || existe.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'El medicamento no existe o ya fue eliminado.' });
    }

    // 2️⃣ Intentar eliminar
    const [resultado] = await conn.query(
      'DELETE FROM ConsultaMedicamento WHERE idConsultaMedicamento = ?',
      [idConsultaMedicamento]
    );

    if (resultado.affectedRows === 0) {
      await conn.rollback();
      return res.status(500).json({
        error: 'No se pudo eliminar el registro. Verifique las restricciones o claves foráneas.'
      });
    }

    await conn.commit();

    res.json({
      success: true,
      message: 'Medicamento eliminado correctamente.',
      idEliminado: Number(idConsultaMedicamento)
    });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Error al eliminar medicamento:', err);
    res.status(500).json({
      error: 'Error interno del servidor',
      detalle: err.message,
      sqlMessage: err.sqlMessage || null
    });
  } finally {
    if (conn) conn.release();
  }
});


app.get('/fichas/:id/medicamentos/estadisticas', async (req, res) => {
  const id = req.params.id;

  try {
    const [[{ total }]] = await pool.query(
      `
      SELECT COUNT(cm.idConsultaMedicamento) AS total
      FROM ConsultaMedicamento cm
      JOIN Consulta c ON cm.idConsulta = c.idConsulta
      WHERE c.idFichaMedica = ?
      `,
      [id]
    );

    res.json({ total });
  } catch (err) {
    console.error('Error al obtener estadísticas de medicamentos:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Obtener medicamentos disponibles
app.get('/medicamentos', async (req, res) => {
  try {
    const [medicamentos] = await pool.query(`
      SELECT 
        m.idMedicamento,
        m.nombreMedicamento,
        m.descripcionMedicamento,
        m.idTipoMedicamento,
        tm.tipoMedicamento
      FROM Medicamento m
      INNER JOIN TipoMedicamento tm ON m.idTipoMedicamento = tm.idTipoMedicamento
      ORDER BY m.nombreMedicamento ASC
    `);
    
    res.json(medicamentos);
  } catch (err) {
    console.error('Error al obtener medicamentos:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Obtener tipos de medicamentos
app.get('/tipos-medicamentos', async (req, res) => {
  try {
    const [tipos_medicamentos] = await pool.query(`
      SELECT 
        idTipoMedicamento,
        tipoMedicamento
      FROM TipoMedicamento
      ORDER BY tipoMedicamento ASC
    `);

    res.json(tipos_medicamentos);
  } catch (err) {
    console.error('Error al obtener tipos-medicamentos:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST - Crear nuevo medicamento en el catálogo
app.post('/medicamentos', async (req, res) => {
  try {
    const { nombreMedicamento, descripcionMedicamento, idTipoMedicamento } = req.body;
    
    if (!nombreMedicamento || !idTipoMedicamento) {
      return res.status(400).json({ error: 'Nombre y tipo de medicamento son requeridos' });
    }

    const [result] = await pool.query(`
      INSERT INTO Medicamento (nombreMedicamento, descripcionMedicamento, idTipoMedicamento)
      VALUES (?, ?, ?)
    `, [nombreMedicamento, descripcionMedicamento || null, idTipoMedicamento]);
    
    // Obtener el medicamento recién creado con su tipo
    const [nuevoMedicamento] = await pool.query(`
      SELECT 
        m.idMedicamento,
        m.nombreMedicamento,
        m.descripcionMedicamento,
        m.idTipoMedicamento,
        tm.tipoMedicamento
      FROM Medicamento m
      INNER JOIN TipoMedicamento tm ON m.idTipoMedicamento = tm.idTipoMedicamento
      WHERE m.idMedicamento = ?
    `, [result.insertId]);
    
    res.json(nuevoMedicamento[0]);
  } catch (err) {
    console.error('Error al crear medicamento:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST - Agregar medicamento (crea consulta y luego agrega el medicamento)
app.post('/fichas/medicamentos', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      idFichaMedica,
      idMedicamento,
      cantidad,
      formato,
      tiempoConsumo,
      frecuenciaConsumo
    } = req.body;

    // --- Validaciones ---
    if (!idFichaMedica || isNaN(Number(idFichaMedica))) {
      return res.status(400).json({ error: 'idFichaMedica es obligatorio y debe ser numérico.' });
    }

    if (!idMedicamento || isNaN(Number(idMedicamento))) {
      return res.status(400).json({ error: 'idMedicamento es obligatorio y debe ser numérico.' });
    }

    if (cantidad === undefined || cantidad === null || isNaN(Number(cantidad))) {
      return res.status(400).json({ error: 'cantidad es obligatoria y debe ser numérica.' });
    }

    if (!formato || typeof formato !== 'string' || formato.trim() === '') {
      return res.status(400).json({ error: 'formato es obligatorio y debe ser texto válido.' });
    }

    if (tiempoConsumo === undefined || tiempoConsumo === null || isNaN(Number(tiempoConsumo))) {
      return res.status(400).json({ error: 'tiempoConsumo es obligatorio y debe ser numérico.' });
    }

    if (!frecuenciaConsumo || typeof frecuenciaConsumo !== 'string' || frecuenciaConsumo.trim() === '') {
      return res.status(400).json({ error: 'frecuenciaConsumo es obligatorio y debe ser texto válido.' });
    }

    // --- 1️⃣ Crear nueva consulta asociada ---
    const [consultaResult] = await connection.query(
      `
      INSERT INTO Consulta (idFichaMedica, fecha)
      VALUES (?, NOW())
      `,
      [idFichaMedica]
    );

    const idConsulta = consultaResult.insertId;

    // --- 2️⃣ Insertar medicamento asociado ---
    const [medicamentoResult] = await connection.query(
      `
      INSERT INTO ConsultaMedicamento (
        idConsulta,
        idMedicamento,
        cantidad,
        formato,
        tiempoConsumo,
        frecuenciaConsumo
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        idConsulta,
        idMedicamento,
        Number(cantidad),
        formato.trim(),
        Number(tiempoConsumo),
        frecuenciaConsumo.trim()
      ]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Medicamento agregado correctamente.',
      idConsultaMedicamento: medicamentoResult.insertId,
      idConsulta,
      data: {
        idFichaMedica,
        idMedicamento,
        cantidad,
        formato,
        tiempoConsumo,
        frecuenciaConsumo
      }
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error al agregar medicamento:', err);
    res.status(500).json({
      error: 'Error interno del servidor',
      detalle: err.message,
      sqlMessage: err.sqlMessage || null
    });
  } finally {
    connection.release();
  }
});








// Alergias

app.get('/fichas/:id/alergias', async (req, res) => {
  const id = req.params.id;

  try {
    const limitParam = req.query?.limit ? Number(req.query.limit) : null;
    const offsetParam = req.query?.offset ? Number(req.query.offset) : 0;

    let rows;
    let pagination = null;

    const baseQuery = `
      SELECT 
        fma.idFichaMedicaAlergia,
        fma.fecha AS fechaAlergia,
        a.idAlergia,
        a.nombre AS nombreAlergia,
        a.descripcion AS descripcionAlergia,
        ta.idTipoAlergia,
        ta.tipoAlergia
      FROM FichaMedicaAlergia fma
      JOIN Alergia a ON fma.idAlergia = a.idAlergia
      JOIN TipoAlergia ta ON a.idTipoAlergia = ta.idTipoAlergia
      WHERE fma.idFichaMedica = ?
      ORDER BY fma.fecha DESC
    `;

    if (limitParam && !isNaN(limitParam) && limitParam > 0) {
      // --- Consulta paginada ---
      const [data] = await pool.query(`${baseQuery} LIMIT ? OFFSET ?`, [id, limitParam, offsetParam]);

      const [[{ total }]] = await pool.query(
        'SELECT COUNT(*) AS total FROM FichaMedicaAlergia WHERE idFichaMedica = ?',
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
      // --- Consulta completa sin límite ---
      const [data] = await pool.query(baseQuery, [id]);
      rows = data;
    }

    res.json({ data: rows, pagination });

  } catch (err) {
    console.error('Error al obtener alergias:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/fichas/alergias/:idFichaMedicaAlergia', async (req, res) => {
  const { idFichaMedicaAlergia } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        fma.idFichaMedicaAlergia,
        fma.idAlergia,
        a.idTipoAlergia,
        a.nombre AS nombreAlergia,
        a.descripcion AS descripcionAlergia,
        ta.tipoAlergia,
        fma.fecha AS fechaAlergia
      FROM FichaMedicaAlergia fma
      JOIN Alergia a ON fma.idAlergia = a.idAlergia
      JOIN TipoAlergia ta ON a.idTipoAlergia = ta.idTipoAlergia
      WHERE fma.idFichaMedicaAlergia = ?
      `,
      [idFichaMedicaAlergia]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Alergia no encontrada' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error al obtener alergia:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/fichas/alergias', async (req, res) => {
  try {
    const { idFichaMedica, idAlergia, fecha } = req.body;

    // --- Validaciones ---
    if (idFichaMedica === undefined || idFichaMedica === null || isNaN(Number(idFichaMedica))) {
      return res.status(400).json({ error: 'El campo idFichaMedica es obligatorio y debe ser numérico.' });
    }

    if (idAlergia === undefined || idAlergia === null || isNaN(Number(idAlergia))) {
      return res.status(400).json({ error: 'El campo idAlergia es obligatorio y debe ser numérico.' });
    }

    if (!fecha || typeof fecha !== 'string' || fecha.trim() === '') {
      return res.status(400).json({ error: 'El campo fecha es obligatorio y debe ser un string válido.' });
    }

    const fechaValida = !isNaN(new Date(fecha).getTime());
    if (!fechaValida) {
      return res.status(400).json({ error: 'El formato de la fecha no es válido (use YYYY-MM-DD).' });
    }

    // --- Inserción ---
    const [result] = await pool.query(
      `
      INSERT INTO FichaMedicaAlergia (idFichaMedica, idAlergia, fecha)
      VALUES (?, ?, ?)
      `,
      [Number(idFichaMedica), Number(idAlergia), fecha.trim()]
    );

    res.json({
      success: true,
      message: 'Alergia agregada correctamente.',
      idFichaMedicaAlergia: result.insertId,
      data: {
        idFichaMedica,
        idAlergia,
        fecha
      }
    });

  } catch (err) {
    console.error('Error al agregar alergia:', err);
    res.status(500).json({
      error: 'Error interno del servidor',
      detalle: err.message,
      sqlMessage: err.sqlMessage,
      sql: err.sql
    });
  }
});

app.put('/fichas/alergias/:idFichaMedicaAlergia', async (req, res) => {
  const { idFichaMedicaAlergia } = req.params;
  const { idAlergia, fechaAlergia } = req.body;

  try {
    // --- Validaciones ---
    if (!idFichaMedicaAlergia || isNaN(Number(idFichaMedicaAlergia))) {
      return res.status(400).json({ error: 'El parámetro idFichaMedicaAlergia es obligatorio y debe ser numérico.' });
    }

    if (idAlergia && isNaN(Number(idAlergia))) {
      return res.status(400).json({ error: 'El campo idAlergia debe ser numérico si se incluye.' });
    }

    if (fechaAlergia && (typeof fechaAlergia !== 'string' || fechaAlergia.trim() === '')) {
      return res.status(400).json({ error: 'El campo fechaAlergia debe ser un string válido.' });
    }

    if (fechaAlergia) {
      const fechaValida = !isNaN(new Date(fechaAlergia).getTime());
      if (!fechaValida) {
        return res.status(400).json({ error: 'El formato de la fecha no es válido (use YYYY-MM-DD).' });
      }
    }

    // --- Verificar existencia ---
    const [existe] = await pool.query(
      'SELECT * FROM FichaMedicaAlergia WHERE idFichaMedicaAlergia = ?',
      [idFichaMedicaAlergia]
    );

    if (existe.length === 0) {
      return res.status(404).json({ error: 'Alergia no encontrada.' });
    }

    // --- Actualización ---
    await pool.query(
      `
      UPDATE FichaMedicaAlergia
      SET 
        idAlergia = COALESCE(?, idAlergia),
        fecha = COALESCE(?, fecha)
      WHERE idFichaMedicaAlergia = ?
      `,
      [idAlergia || null, fechaAlergia || null, idFichaMedicaAlergia]
    );

    res.json({
      success: true,
      message: 'Alergia actualizada correctamente.'
    });
  } catch (err) {
    console.error('Error al actualizar alergia:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/fichas/alergias/:idFichaMedicaAlergia', async (req, res) => {
  const { idFichaMedicaAlergia } = req.params;

  try {
    // --- Validación básica ---
    if (!idFichaMedicaAlergia || isNaN(Number(idFichaMedicaAlergia))) {
      return res.status(400).json({ error: 'El parámetro idFichaMedicaAlergia es obligatorio y debe ser numérico.' });
    }

    // --- Verificar existencia ---
    const [existe] = await pool.query(
      'SELECT * FROM FichaMedicaAlergia WHERE idFichaMedicaAlergia = ?',
      [idFichaMedicaAlergia]
    );

    if (existe.length === 0) {
      return res.status(404).json({ error: 'Alergia no encontrada.' });
    }

    // --- Eliminar registro ---
    const [resultado] = await pool.query(
      'DELETE FROM FichaMedicaAlergia WHERE idFichaMedicaAlergia = ?',
      [idFichaMedicaAlergia]
    );

    if (resultado.affectedRows === 0) {
      return res.status(500).json({ error: 'No se pudo eliminar la alergia. Intente nuevamente.' });
    }

    res.json({
      success: true,
      message: 'Alergia eliminada correctamente.',
      idEliminado: Number(idFichaMedicaAlergia)
    });
  } catch (err) {
    console.error('Error al eliminar alergia:', err);
    res.status(500).json({
      error: 'Error interno del servidor',
      detalle: err.message,
      sqlMessage: err.sqlMessage || null
    });
  }
});


app.get('/fichas/:id/alergias/estadisticas', async (req, res) => {
  const id = req.params.id;

  try {
    // --- Total de alergias ---
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM FichaMedicaAlergia WHERE idFichaMedica = ?',
      [id]
    );

    // --- Alergias registradas en los últimos 3 meses ---
    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);

    const [[{ recientes }]] = await pool.query(
      `
      SELECT COUNT(*) AS recientes
      FROM FichaMedicaAlergia
      WHERE idFichaMedica = ? AND fecha >= ?
      `,
      [id, tresMesesAtras]
    );

    // --- Alergias registradas en el último año ---
    const unAnoAtras = new Date();
    unAnoAtras.setFullYear(unAnoAtras.getFullYear() - 1);

    const [[{ activos }]] = await pool.query(
      `
      SELECT COUNT(*) AS activos
      FROM FichaMedicaAlergia
      WHERE idFichaMedica = ? AND fecha >= ?
      `,
      [id, unAnoAtras]
    );

    res.json({ total, recientes, activos });
  } catch (err) {
    console.error('Error al obtener estadísticas de alergias:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/alergias', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.idAlergia,
        a.nombre AS nombreAlergia,
        a.descripcion AS descripcionAlergia,
        ta.idTipoAlergia,
        ta.tipoAlergia AS tipoAlergia
      FROM Alergia a
      JOIN TipoAlergia ta ON a.idTipoAlergia = ta.idTipoAlergia
      ORDER BY ta.tipoAlergia ASC, a.nombre ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error('Error al obtener alergias disponibles:', err);
    res.status(500).json({ error: 'Error al obtener alergias disponibles' });
  }
});












// GET - Obtener todos los pacientes
app.get('/pacientes', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        idUsuario,
        nombre,
        Rut,
        fechaNacimiento,
        sexo,
        tipoSangre
      FROM Usuario
      ORDER BY nombre ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error('Error al obtener pacientes:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Obtener un paciente por ID
app.get('/pacientes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT 
        idUsuario,
        nombre,
        Rut,
        fechaNacimiento,
        sexo,
        tipoSangre
      FROM Usuario
      WHERE idUsuario = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error al obtener paciente:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST - Crear un nuevo paciente
app.post('/pacientes', async (req, res) => {
  try {
    const {
      nombre,
      Rut,
      fechaNacimiento,
      sexo,
      tipoSangre
    } = req.body;

    // Validaciones básicas
    if (!nombre || !Rut || !fechaNacimiento) {
      return res.status(400).json({ 
        error: 'Los campos nombre, RUT y fecha de nacimiento son obligatorios' 
      });
    }

    // Verificar si el RUT ya existe
    const [existing] = await pool.query(
      'SELECT idUsuario FROM Usuario WHERE Rut = ?',
      [Rut]
    );

    if (existing.length > 0) {
      return res.status(409).json({ 
        error: 'Ya existe un usuario con este RUT' 
      });
    }

    // Insertar nuevo paciente
    const [result] = await pool.query(`
      INSERT INTO Usuario (
        nombre,
        Rut,
        fechaNacimiento,
        sexo,
        tipoSangre
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Paciente')
    `, [nombre, Rut, fechaNacimiento, sexo, tipoSangre]);

    // Obtener el paciente recién creado
    const [newPaciente] = await pool.query(`
      SELECT 
        idUsuario,
        nombre,
        Rut,
        fechaNacimiento,
        sexo,
        tipoSangre
      FROM Usuario
      WHERE idUsuario = ?
    `, [result.insertId]);

    res.status(201).json(newPaciente[0]);
  } catch (err) {
    console.error('Error al crear paciente:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT - Actualizar un paciente existente
app.put('/pacientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      Rut,
      fechaNacimiento,
      sexo,
      tipoSangre
    } = req.body;

    // Verificar que el paciente existe
    const [existing] = await pool.query(
      'SELECT idUsuario FROM Usuario WHERE idUsuario = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    // Si se está actualizando el RUT, verificar que no exista en otro usuario
    if (Rut) {
      const [rutCheck] = await pool.query(
        'SELECT idUsuario FROM Usuario WHERE Rut = ? AND idUsuario != ?',
        [Rut, id]
      );

      if (rutCheck.length > 0) {
        return res.status(409).json({ 
          error: 'Ya existe otro usuario con este RUT' 
        });
      }
    }

    // Construir query de actualización solo con campos proporcionados
    const updates = [];
    const values = [];

    if (nombre !== undefined) {
      updates.push('nombre = ?');
      values.push(nombre);
    }
    if (Rut !== undefined) {
      updates.push('Rut = ?');
      values.push(Rut);
    }
    if (fechaNacimiento !== undefined) {
      updates.push('fechaNacimiento = ?');
      values.push(fechaNacimiento);
    }
    if (sexo !== undefined) {
      updates.push('sexo = ?');
      values.push(sexo);
    }
    if (tipoSangre !== undefined) {
      updates.push('tipoSangre = ?');
      values.push(tipoSangre);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    values.push(id);

    await pool.query(
      `UPDATE Usuario SET ${updates.join(', ')} WHERE idUsuario = ?`,
      values
    );

    // Obtener el paciente actualizado
    const [updated] = await pool.query(`
      SELECT 
        idUsuario,
        nombre,
        Rut,
        fechaNacimiento,
        sexo,
        tipoSangre
      FROM Usuario
      WHERE idUsuario = ?
    `, [id]);

    res.json(updated[0]);
  } catch (err) {
    console.error('Error al actualizar paciente:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Eliminar un paciente
app.delete('/pacientes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el paciente existe
    const [existing] = await pool.query(
      'SELECT idUsuario FROM Usuario WHERE idUsuario = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    // Eliminar paciente
    await pool.query('DELETE FROM Usuario WHERE idUsuario = ?', [id]);

    res.json({ message: 'Paciente eliminado exitosamente' });
  } catch (err) {
    console.error('Error al eliminar paciente:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Buscar pacientes por nombre o RUT
app.get('/pacientes/buscar/:termino', async (req, res) => {
  try {
    const { termino } = req.params;

    const [rows] = await pool.query(`
      SELECT 
        idUsuario,
        nombre,
        Rut,
        fechaNacimiento,
        sexo,
        tipoSangre
      FROM Usuario
      ORDER BY nombre ASC
      LIMIT 50
    `, [`%${termino}%`, `%${termino}%`]);

    res.json(rows);
  } catch (err) {
    console.error('Error al buscar pacientes:', err);
    res.status(500).json({ error: err.message });
  }
});















app.use((req, res) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  res.status(404).json({ error: "Ruta no encontrada" });
});

export default app;