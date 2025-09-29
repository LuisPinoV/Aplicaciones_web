import pool from './db.js';

export const getPacientes = async () => {
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
    return {
      statusCode: 200,
      body: JSON.stringify(pacientes),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error al obtener pacientes', error: err.message }),
    };
  }
};