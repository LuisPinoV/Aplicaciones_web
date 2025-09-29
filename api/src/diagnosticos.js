import pool from './db.js';

export const getDiagnosticosByFicha = async (event) => {
  try {
    const id = event.pathParameters.id;
    const [diagnosticos] = await pool.query(`
      SELECT fecha, descripcion
      FROM Diagnostico
      WHERE idFichaMedica = ?;
    `, [id]);
    return {
      statusCode: 200,
      body: JSON.stringify(diagnosticos),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error al obtener diagnósticos', error: err.message }),
    };
  }
};

export const getDiagnosticos = async () => {
  try {
    const [rows] = await pool.query(`SELECT * FROM Diagnostico`);
    return {
      statusCode: 200,
      body: JSON.stringify(rows),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error al obtener diagnostico', error: err.message }),
    };
  }
};

export const createDiagnostico = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const fields = Object.keys(data);
    const values = Object.values(data);

    const placeholders = fields.map(() => '?').join(', ');
    const [result] = await pool.query(
      `INSERT INTO Diagnostico (${fields.join(', ')}) VALUES (${placeholders})`,
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
      body: JSON.stringify({ message: 'Error al crear diagnostico', error: err.message }),
    };
  }
};