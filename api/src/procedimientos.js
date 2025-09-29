import pool from './db.js';

export const getProcedimientosByFicha = async (event) => {
  try {
    const id = event.pathParameters.id;
    const [procedimientos] = await pool.query(`
      SELECT p.idProcedimiento, p.nombre, p.descripcion, tp.idTipoProcedimiento, tp.tipoprocedimiento AS tipoProcedimiento
      FROM Consulta c
      JOIN ConsultaProcedimiento cp ON c.idConsulta = cp.idConsulta
      JOIN Procedimiento p ON cp.idProcedimiento = p.idProcedimiento
      JOIN TipoProcedimiento tp ON p.idTipoProcedimiento = tp.idTipoProcedimiento
      WHERE c.idFichaMedica = ? AND tp.idTipoProcedimiento = 1
    `, [id]);
    return {
      statusCode: 200,
      body: JSON.stringify(procedimientos),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error al obtener procedimientos', error: err.message }),
    };
  }
};

export const getProcedimientos = async () => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, tp.tipoprocedimiento AS tipoProcedimiento
      FROM Procedimiento p
      JOIN TipoProcedimiento tp ON p.idTipoProcedimiento = tp.idTipoProcedimiento
      WHERE p.idTipoProcedimiento = 1
    `);
    return {
      statusCode: 200,
      body: JSON.stringify(rows),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error al obtener procedimientos', error: err.message }),
    };
  }
};

export const createProcedimiento = async (event) => {
  try {
    const data = JSON.parse(event.body);
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
      body: JSON.stringify({ message: 'Error al crear procedimiento', error: err.message }),
    };
  }
};