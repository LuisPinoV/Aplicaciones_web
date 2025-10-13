import mysql from 'mysql2/promise';
import { faker } from '@faker-js/faker';

// --- CONFIGURACIÓN DE LA BASE DE DATOS ---
// !!! REEMPLAZA ESTOS VALORES CON LOS DE TU BASE DE DATOS DE AWS !!!
const dbConfig = {
    host: 'bdd-ionic.c72qu2gsuzd0.us-east-1.rds.amazonaws.com', // Ejemplo: u2gsuzd0.us-east-1.rds.amazonaws.com
    user: 'admin',             // Ejemplo: admin
    password: 'admin123!',
    database: 'bbdd_web'   // El nombre de la base de datos/schema
};

// Función para formatear la fecha a YYYY-MM-DD
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (`0${d.getMonth() + 1}`).slice(-2);
    const day = (`0${d.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
}

async function llenarTabla() {
    let connection;
    try {
        // Conectar a la base de datos
        connection = await mysql.createConnection(dbConfig);
        console.log('Conexión a la base de datos exitosa.');

        const totalRegistros = 1500;
        console.log(`Iniciando inserción de ${totalRegistros} registros...`);

        // Preparar la consulta SQL
        const sql = `
            INSERT INTO FichaMedica (Rut, nombre, fechaNacimiento, sexo, tipoSangre, altura, peso, genero)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;

        // Bucle para generar e insertar los datos
        for (let i = 0; i < totalRegistros; i++) {
            const sexo = faker.helpers.arrayElement(['Masculino', 'Femenino']);
            
            const paciente = [
                faker.string.numeric({ length: 8, allowLeadingZeros: false }), // Rut
                faker.person.fullName({ sex: sexo === 'Masculino' ? 'male' : 'female' }), // nombre
                formatDate(faker.date.past({ years: 80, refDate: '2005-01-01' })), // fechaNacimiento
                sexo, // sexo
                faker.helpers.arrayElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']), // tipoSangre
                faker.number.float({ min: 1.50, max: 2.00, precision: 0.01 }), // altura
                faker.number.int({ min: 50, max: 100 }), // peso
                sexo // genero (usando el mismo valor que sexo)
            ];

            // Ejecutar la inserción
            await connection.execute(sql, paciente);

            // Mostrar progreso en la consola
            if ((i + 1) % 100 === 0) {
                console.log(` -> Registros insertados: ${i + 1} de ${totalRegistros}`);
            }
        }

        console.log('¡Proceso completado! Se insertaron todos los registros.');

    } catch (error) {
        console.error('Ocurrió un error:', error);
    } finally {
        // Cerrar la conexión
        if (connection) {
            await connection.end();
            console.log('Conexión cerrada.');
        }
    }
}

// Ejecutar la función principal
llenarTabla();