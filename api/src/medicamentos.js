import pool from './db.js';

export const getMedicamentosByFicha = async (event) => {
  try {
    const id = event.pathParameters.id;
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
    return {
      statusCode: 200,
      body: JSON.stringify(medicamentos),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error al obtener medicamentos', error: err.message }),
    };
  }
};

export const getMedicamentos = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM Medicamento');
    return {
      statusCode: 200,
      body: JSON.stringify(rows),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error al obtener medicamentos', error: err.message }),
    };
  }
};

export const createMedicamento = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const fields = Object.keys(data);
    const values = Object.values(data);

    const placeholders = fields.map(() => '?').join(', ');
    const [result] = await pool.query(
      `INSERT INTO Medicamento (${fields.join(', ')}) VALUES (${placeholders})`,
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
      body: JSON.stringify({ message: 'Error al crear medicamento', error: err.message }),
    };
  }
};