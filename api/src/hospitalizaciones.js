import pool from './db.js';

export const getHospitalizacionesByFicha = async (event) => {
  try {
    const id = event.pathParameters.id;
    const [hospitalizaciones] = await pool.query(`
      SELECT h.idHospitalizacion, h.fecha, h.duracion, h.institucionMedica
      FROM Hospitalizacion h
      WHERE h.idFichaMedica = ?;
    `, [id]);
    return {
      statusCode: 200,
      body: JSON.stringify(hospitalizaciones),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error al obtener hospitalizaciones', error: err.message }),
    };
  }
};

export const getHospitalizaciones = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM Hospitalizacion');
    return {
      statusCode: 200,
      body: JSON.stringify(rows),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error al obtener hospitalizaciones', error: err.message }),
    };
  }
};

export const createHospitalizacion = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const fields = Object.keys(data);
    const values = Object.values(data);

    const placeholders = fields.map(() => '?').join(', ');
    const [result] = await pool.query(
      `INSERT INTO Hospitalizacion (${fields.join(', ')}) VALUES (${placeholders})`,
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
      body: JSON.stringify({ message: 'Error al crear hospitalizacion', error: err.message }),
    };
  }
};