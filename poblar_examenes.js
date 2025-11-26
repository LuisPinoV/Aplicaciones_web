const mysql = require('mysql2/promise');
const { faker } = require('@faker-js/faker');

const N_TIPO_EXAMEN = 10;
const N_EXAMEN = 50;
const N_RESULTADOS_ESPERADOS = 150;
const N_FICHA_EXAMEN = 2000;

const pool = mysql.createPool({
    host: 'bbdd-web.crguq6uow5v7.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Admin123!',
    database: 'bbdd_web',
    multipleStatements: true
});

async function insertMany(query, values) {
    await pool.query(query, [values]);
}

function randomDate(start, end) {
    return faker.date.between({ from: start, to: end }).toISOString().slice(0, 10);
}

// ====================================
// POBLAR TipoExamen
// ====================================
async function poblarTipoExamen() {
    console.log("Insertando TipoExamen...");

    const tipos = Array.from({ length: N_TIPO_EXAMEN }, () => [
        faker.lorem.word()
    ]);

    await insertMany(`
        INSERT INTO TipoExamen(tipoExamen)
        VALUES ?
    `, tipos);

    console.log("✔ TipoExamen listo");
}

// ====================================
// POBLAR Examen
// ====================================
async function poblarExamen() {
    console.log("Insertando Examen...");

    const [tipos] = await pool.query("SELECT idTipoExamen FROM TipoExamen");

    const examenes = Array.from({ length: N_EXAMEN }, () => [
        faker.helpers.arrayElement(tipos).idTipoExamen,
        faker.commerce.productName(),
        faker.lorem.sentence()
    ]);

    await insertMany(`
        INSERT INTO Examen(idTipoExamen, nombre, descripcion)
        VALUES ?
    `, examenes);

    console.log("✔ Examen listo");
}

// ====================================
// POBLAR ResultadoEsperado
// ====================================
async function poblarResultadosEsperados() {
    console.log("Insertando ResultadoEsperado...");

    const [examenes] = await pool.query("SELECT idExamen FROM Examen");

    const resultados = Array.from({ length: N_RESULTADOS_ESPERADOS }, () => [
        faker.helpers.arrayElement(examenes).idExamen,
        faker.lorem.word(),
        faker.lorem.word()
    ]);

    await insertMany(`
        INSERT INTO ResultadoEsperado(idExamen, valor, formato)
        VALUES ?
    `, resultados);

    console.log("✔ ResultadoEsperado listo");
}

// ====================================
// POBLAR FichaMedicaExamen
// ====================================
async function poblarFichaExamen() {
    console.log("Insertando FichaMedicaExamen...");

    const [fichas] = await pool.query("SELECT idFichaMedica FROM FichaMedica");
    const [examenes] = await pool.query("SELECT idExamen FROM Examen");

    const registros = Array.from({ length: N_FICHA_EXAMEN }, () => [
        faker.helpers.arrayElement(fichas).idFichaMedica,
        faker.helpers.arrayElement(examenes).idExamen,
        randomDate("2010-01-01", "2025-01-01"),
        faker.lorem.sentence()
    ]);

    await insertMany(`
        INSERT INTO FichaMedicaExamen(idFichaMedica, idExamen, fecha, descripcion)
        VALUES ?
    `, registros);

    console.log("✔ FichaMedicaExamen listo");
}

// ====================================
// POBLAR ResultadoObtenido
// ====================================
async function poblarResultadosObtenidos() {
    console.log("Insertando ResultadoObtenido...");

    const [fichaExamen] = await pool.query("SELECT idFichaMedicaExamen FROM FichaMedicaExamen");

    const resultados = fichaExamen.map(fx => [
        fx.idFichaMedicaExamen,
        faker.lorem.word(),
        faker.lorem.word()
    ]);

    await insertMany(`
        INSERT INTO ResultadoObtenido(idFichaMedicaExamen, valor, formato)
        VALUES ?
    `, resultados);

    console.log("✔ ResultadoObtenido listo");
}

// ====================================
// EJECUCIÓN PRINCIPAL
// ====================================
(async () => {
    try {
        console.log("🚀 Poblando tablas de exámenes...");

        await poblarTipoExamen();
        await poblarExamen();
        await poblarResultadosEsperados();
        await poblarFichaExamen();
        await poblarResultadosObtenidos();

        console.log("🎉 Población completada con éxito");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
