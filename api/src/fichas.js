import pool from './db.js';

export const getFichas = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM FichaMedica');
    return {
      statusCode: 200,
      body: JSON.stringify(rows),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error al obtener fichas', error: err.message }),
    };
  }
};

export const createFicha = async (event) => {
  try {
    const { Rut, nombre, fechaNacimiento, sexo, tipoSangre, altura, peso, genero } = JSON.parse(event.body);
    const [result] = await pool.query(
      `INSERT INTO FichaMedica
       (Rut, nombre, fechaNacimiento, sexo, tipoSangre, altura, peso, genero)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [Rut, nombre, fechaNacimiento, sexo, tipoSangre, altura, peso, genero]
    );
    return {
      statusCode: 201,
      body: JSON.stringify({ success: true, idFichaMedica: result.insertId }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error al crear ficha', error: err.message }),
    };
  }
};

export const getFichaById = async (event) => {
  try {
    const id = event.pathParameters.id;
    const [ficha] = await pool.query('SELECT * FROM FichaMedica WHERE idFichaMedica = ?', [id]);
    if (!ficha.length) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Ficha no encontrada' }),
      };
    }

    const [diagnosticos] = await pool.query('SELECT * FROM Diagnostico WHERE idFichaMedica = ?', [id]);
    const [hospitalizaciones] = await pool.query('SELECT * FROM Hospitalizacion WHERE idFichaMedica = ?', [id]);
    const [consultas] = await pool.query(
      `SELECT c.*, m.nombre AS medicoNombre, tm.tipoMedico
       FROM Consulta c
       LEFT JOIN Medico m ON c.idMedico = m.idMedico
       LEFT JOIN TipoMedico tm ON m.idTipoMedico = tm.idTipoMedico
       WHERE c.idFichaMedica = ?`, [id]);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        ficha: ficha[0], 
        diagnosticos, 
        hospitalizaciones, 
        consultas 
      }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error al obtener ficha completa', error: err.message }),
    };
  }
};