import pool from './db.js';

export const getExamenesByFicha = async (event) => {
  try {
    const id = event.pathParameters.id;
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
    return {
      statusCode: 200,
      body: JSON.stringify(examenes),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error al obtener exámenes', error: err.message }),
    };
  }
};

export const getExamenes = async () => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, tp.tipoprocedimiento AS tipoProcedimiento
      FROM Procedimiento p
      JOIN TipoProcedimiento tp ON p.idTipoProcedimiento = tp.idTipoProcedimiento
      WHERE p.idTipoProcedimiento = 2
    `);
    return {
      statusCode: 200,
      body: JSON.stringify(rows),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error al obtener exámenes', error: err.message }),
    };
  }
};

export const createExamen = async (event) => {
  try {
    const data = JSON.parse(event.body);
    // Asegurar que es tipo examen (idTipoProcedimiento = 2)
    data.idTipoProcedimiento = 2;
    
    const fields = Object.keys(data);
    const values = Object.values(data);

    const placeholders = fields.map(() => '?').join(', ');
    const [result] = await pool.query(
      `INSERT INTO Procedimiento (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    return {
      statusCode: 201,
      body: JSON.stringify({ id: result.insertId }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error al crear examen', error: err.message }),
    };
  }
};