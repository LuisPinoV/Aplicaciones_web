// poblar.js
const mysql = require('mysql2/promise');
const { faker } = require('@faker-js/faker');

// ==========================
// PARAMETROS CONFIGURABLES
// ==========================
const N_USUARIOS = 5000;
const N_CONSULTAS = 10000;

const N_TIPOS_GENERALES = 30; // Para tipos de alergia, cirujia, etc.
const N_ITEMS_GENERALES = 30; // Para alergias, cirugias, enfermedades, etc.

const N_MEDICOS = 100;
const N_TIPO_MEDICO = 10;

const N_TIPO_MEDICAMENTO = 20;
const N_MEDICAMENTO = 50;

const N_TIPO_EXAMEN = 10;
const N_EXAMEN = 30;

// ==========================
// CONEXIÓN
// ==========================
const pool = mysql.createPool({
    host: 'bbdd-web.crguq6uow5v7.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Admin123!',
    database: 'bbdd_web',
    multipleStatements: true
});

// ==========================
// FUNCIONES AUXILIARES
// ==========================
function randomDate(start, end) {
    return faker.date.between({ from: start, to: end }).toISOString().slice(0, 19).replace("T", " ");
}

async function insertMany(query, values) {
    await pool.query(query, [values]);
}

// ==========================
// POBLAR TIPOS GENERALES
// ==========================
async function poblarTipos() {
    console.log("Insertando tipos generales...");

    // TipoAlergia
    const tiposAlergia = Array.from({ length: N_TIPOS_GENERALES }, () => [
        faker.lorem.word()
    ]);
    await insertMany(`INSERT INTO TipoAlergia(tipoAlergia) VALUES ?`, tiposAlergia);

    // TipoCirujia
    const tiposCirujia = Array.from({ length: N_TIPOS_GENERALES }, () => [
        faker.lorem.word()
    ]);
    await insertMany(`INSERT INTO TipoCirujia(tipoCirujia) VALUES ?`, tiposCirujia);

    // TipoEnfermedad
    const tiposEnfermedad = Array.from({ length: N_TIPOS_GENERALES }, () => [
        faker.lorem.word()
    ]);
    await insertMany(`INSERT INTO TipoEnfermedad(tipoEnfermedad) VALUES ?`, tiposEnfermedad);

    // TipoMedico
    const tiposMedico = Array.from({ length: N_TIPO_MEDICO }, () => [
        faker.person.jobType()
    ]);
    await insertMany(`INSERT INTO TipoMedico(tipoMedico) VALUES ?`, tiposMedico);

    // TipoMedicamento
    const tiposMedicamento = Array.from({ length: N_TIPO_MEDICAMENTO }, () => [
        faker.commerce.department()
    ]);
    await insertMany(`INSERT INTO TipoMedicamento(tipoMedicamento) VALUES ?`, tiposMedicamento);

    // TipoExamen
    const tiposExamen = Array.from({ length: N_TIPO_EXAMEN }, () => [
        faker.lorem.word()
    ]);
    await insertMany(`INSERT INTO TipoExamen(tipoExamen) VALUES ?`, tiposExamen);

    console.log("✔ Tipos insertados");
}

// ==========================
// POBLAR CATALOGOS GENERALES
// ==========================
async function poblarCatalogos() {
    console.log("Insertando datos secundarios...");

    // Alergia
    await pool.query(`
        INSERT INTO Alergia(idTipoAlergia, nombre, descripcion)
        SELECT idTipoAlergia, '${faker.lorem.word()}', '${faker.lorem.sentence()}'
        FROM TipoAlergia LIMIT ${N_ITEMS_GENERALES};
    `);

    // Cirujia
    await pool.query(`
        INSERT INTO Cirujia(idTipoCirujia, nombre, descripcion)
        SELECT idTipoCirujia, '${faker.lorem.word()}', '${faker.lorem.sentence()}'
        FROM TipoCirujia LIMIT ${N_ITEMS_GENERALES};
    `);

    // Enfermedad
    await pool.query(`
        INSERT INTO Enfermedad(idTipoEnfermedad, nombre, descripcion)
        SELECT idTipoEnfermedad, '${faker.lorem.word()}', '${faker.lorem.sentence()}'
        FROM TipoEnfermedad LIMIT ${N_ITEMS_GENERALES};
    `);

    // Medicamento
    await pool.query(`
        INSERT INTO Medicamento(idTipoMedicamento, nombre, descripcion)
        SELECT idTipoMedicamento, '${faker.commerce.productName()}', '${faker.lorem.sentence()}'
        FROM TipoMedicamento LIMIT ${N_MEDICAMENTO};
    `);

    // Examen
    await pool.query(`
        INSERT INTO Examen(idTipoExamen, nombre, descripcion)
        SELECT idTipoExamen, '${faker.lorem.word()}', '${faker.lorem.sentence()}'
        FROM TipoExamen LIMIT ${N_EXAMEN};
    `);

    console.log("✔ Catálogos insertados");
}

// ==========================
// POBLAR MÉDICOS
// ==========================
async function poblarMedicos() {
    console.log("Insertando médicos...");

    const medicos = Array.from({ length: N_MEDICOS }, () => [
        faker.number.int({ min: 1, max: N_TIPO_MEDICO }),
        faker.person.fullName(),
        faker.string.numeric(9),
        faker.date.birthdate({ min: 25, max: 70 }).toISOString().slice(0, 10),
        faker.person.sex()
    ]);

    await insertMany(`
        INSERT INTO Medico(idTipoMedico, nombre, rut, fechaNacimiento, sexo)
        VALUES ?`, medicos);

    console.log("✔ Médicos insertados");
}

// ==========================
// POBLAR USUARIOS + FICHAS
// ==========================
async function poblarUsuarios() {
    console.log(`Insertando ${N_USUARIOS} usuarios...`);

    const usuarios = [];
    for (let i = 0; i < N_USUARIOS; i++) {
        usuarios.push([
            faker.string.numeric(9),
            faker.internet.password(),
            faker.date.birthdate().toISOString().slice(0, 10),
            faker.person.fullName(),
            faker.person.sex(),
            "O+"
        ]);
    }

    await insertMany(`
        INSERT INTO Usuario(rut, contraseña, fechaNacimiento, nombre, sexo, tipoSangre)
        VALUES ?`, usuarios);

    console.log("✔ Usuarios insertados");

    console.log("Insertando fichas médicas...");

    await pool.query(`
        INSERT INTO FichaMedica(idUsuario, altura, peso, genero)
        SELECT idUsuario,
               FLOOR(150 + RAND()*40),
               FLOOR(50 + RAND()*50),
               sexo
        FROM Usuario;
    `);

    console.log("✔ Fichas médicas insertadas");
}

// ==========================
// POBLAR CONSULTAS
// ==========================
async function poblarConsultas() {
    console.log(`Insertando ${N_CONSULTAS} consultas...`);

    const [medicos] = await pool.query("SELECT idMedico FROM Medico");
    const [fichas] = await pool.query("SELECT idFichaMedica FROM FichaMedica");

    const consultas = [];

    for (let i = 0; i < N_CONSULTAS; i++) {
        consultas.push([
            randomDate("2010-01-01", "2025-01-01"),
            faker.helpers.arrayElement(medicos).idMedico,
            faker.helpers.arrayElement(fichas).idFichaMedica,
            faker.company.name(),
            faker.lorem.sentence()
        ]);
    }

    await insertMany(`
        INSERT INTO Consulta(fecha, idMedico, idFichaMedica, institucionMedica, descripcion)
        VALUES ?`, consultas);

    console.log("✔ Consultas insertadas");
}

// ==========================
// EJECUCIÓN PRINCIPAL
// ==========================
(async () => {
    try {
        console.log("🚀 Poblando base de datos...");

        await poblarTipos();
        await poblarCatalogos();
        await poblarMedicos();
        await poblarUsuarios();
        await poblarConsultas();

        console.log("🎉 Población completada con éxito!");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
