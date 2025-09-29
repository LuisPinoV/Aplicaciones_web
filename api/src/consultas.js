import pool from './db.js';

export const getConsultasByFicha = async (event) => {
  try {
    const id = event.pathParameters.id;
    const [consultas] = await pool.query(`
      SELECT c.fecha, m.nombre AS medicoNombre, c.institucionMedica, c.descripcion
      FROM Consulta c
      JOIN Medico m ON m.idMedico = c.idMedico
      WHERE c.idFichaMedica = ?;
    `, [id]);
    return {
      statusCode: 200,
      body: JSON.stringify(consultas),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error al obtener consultas', error: err.message }),
    };
  }
};

export const getConsultas = async () => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, m.nombre AS medicoNombre, tm.tipoMedico
      FROM Consulta c
      LEFT JOIN Medico m ON c.idMedico = m.idMedico
      LEFT JOIN TipoMedico tm ON m.idTipoMedico = tm.idTipoMedico
    `);
    return {
      statusCode: 200,
      body: JSON.stringify(rows),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error al obtener consultas', error: err.message }),
    };
  }
};

export const createConsulta = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const fields = Object.keys(data);
    const values = Object.values(data);

    const placeholders = fields.map(() => '?').join(', ');
    const [result] = await pool.query(
      `INSERT INTO Consulta (${fields.join(', ')}) VALUES (${placeholders})`,
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
      body: JSON.stringify({ message: 'Error al crear consulta', error: err.message }),
    };
  }
};