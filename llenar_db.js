import mysql from 'mysql2/promise';
import { faker } from '@faker-js/faker';

// CONFIGURACIÓN
const DB = {
    host: 'bbdd-web.c1m4yqkk8xfv.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Admin123!',
    database: 'bbdd_web'
};

const NUM_USUARIOS = 10000;
const NUM_CONSULTAS = 15000;

async function main() {
  const conn = await mysql.createConnection(DB);
  console.log("✅ Conectado a MySQL");

  const insertBulk = async (sql, values, block = 1000) => {
    for (let i = 0; i < values.length; i += block) {
      const chunk = values.slice(i, i + block);
      await conn.query(sql, [chunk]);
    }
  };

  const uniquePairs = (count, maxA, maxB) => {
    const set = new Set();
    const arr = [];
    while (arr.length < count) {
      const a = faker.number.int({ min: 1, max: maxA });
      const b = faker.number.int({ min: 1, max: maxB });
      const key = `${a}-${b}`;
      if (!set.has(key)) {
        set.add(key);
        arr.push([a, b]);
      }
    }
    return arr;
  };

  // --------------------------------
  // USUARIOS Y FICHAS MÉDICAS
  // --------------------------------
  console.log("👤 Insertando Usuarios y Fichas Médicas...");
  const usuarios = [];
  const fichas = [];

  for (let i = 0; i < NUM_USUARIOS; i++) {
    const rut = faker.number.int({ min: 1000000, max: 29999999 });
    const contraseña = "1234";
    const nombre = faker.person.fullName();
    const fechaNacimiento = faker.date.birthdate({ min: 1940, max: 2010, mode: "year" });
    const sexo = faker.helpers.arrayElement(["Masculino", "Femenino", "Otro"]);
    const tipoSangre = faker.helpers.arrayElement(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);
    usuarios.push([rut, contraseña, nombre, fechaNacimiento, sexo, tipoSangre]);
  }

  await insertBulk(
    `INSERT INTO Usuario (Rut, contraseña, nombre, fechaNacimiento, sexo, tipoSangre) VALUES ?`,
    usuarios
  );

  for (let i = 1; i <= NUM_USUARIOS; i++) {
    const altura = faker.number.float({ min: 1.5, max: 2.0, precision: 0.01 });
    const peso = faker.number.float({ min: 50, max: 120, precision: 0.1 });
    const genero = faker.helpers.arrayElement(["Hombre", "Mujer", "Otro"]);
    fichas.push([i, altura, peso, genero]);
  }

  await insertBulk(`INSERT INTO FichaMedica (idUsuario, altura, peso, genero) VALUES ?`, fichas);

  // --------------------------------
  // TABLAS DE TIPOS
  // --------------------------------
  console.log("🧩 Insertando Tipos...");
  const tipoAlergia = ["Alimentos", "Medicamentos", "Ambientales", "Picaduras"];
  for (const t of tipoAlergia)
    await conn.query("INSERT INTO TipoAlergia (tipoAlergia) VALUES (?)", [t]);

  const tipoCirujia = ["Cardiaca", "Ortopédica", "Neurológica", "Digestiva"];
  for (const t of tipoCirujia)
    await conn.query("INSERT INTO TipoCirujia (tipoCirujia) VALUES (?)", [t]);

  const tipoEnfermedad = ["Crónica", "Infecciosa", "Autoinmune", "Metabólica"];
  for (const t of tipoEnfermedad)
    await conn.query("INSERT INTO TipoEnfermedad (tipoEnfermedad) VALUES (?)", [t]);

  const tipoExamen = ["Sangre", "Orina", "Imagenología", "Cardiología"];
  for (const t of tipoExamen)
    await conn.query("INSERT INTO TipoExamen (tipoExamen) VALUES (?)", [t]);

  const tipoMedicamento = ["Analgésico", "Antibiótico", "Antiinflamatorio", "Antihipertensivo"];
  for (const t of tipoMedicamento)
    await conn.query("INSERT INTO TipoMedicamento (tipoMedicamento) VALUES (?)", [t]);

  const tipoMedico = ["General", "Cardiólogo", "Pediatra", "Ginecólogo", "Dermatólogo"];
  for (const t of tipoMedico)
    await conn.query("INSERT INTO TipoMedico (tipoMedico) VALUES (?)", [t]);

  // --------------------------------
  // ALERGIAS, CIRUGÍAS, ENFERMEDADES, EXÁMENES, MEDICAMENTOS
  // --------------------------------
  console.log("⚕️ Insertando entidades principales...");

  const alergias = [];
  for (let i = 0; i < 20; i++) {
    const idTipo = faker.number.int({ min: 1, max: tipoAlergia.length });
    alergias.push([idTipo, faker.commerce.productName(), faker.lorem.words(3)]);
  }
  await insertBulk("INSERT INTO Alergia (idTipoAlergia, nombre, descripcion) VALUES ?", alergias);

  const cirugias = [];
  for (let i = 0; i < 15; i++) {
    const idTipo = faker.number.int({ min: 1, max: tipoCirujia.length });
    cirugias.push([idTipo, faker.lorem.words(2), faker.lorem.words(4)]);
  }
  await insertBulk("INSERT INTO Cirujia (idTipoCirujia, nombre, descripcion) VALUES ?", cirugias);

  const enfermedades = [];
  for (let i = 0; i < 25; i++) {
    const idTipo = faker.number.int({ min: 1, max: tipoEnfermedad.length });
    enfermedades.push([idTipo, faker.lorem.words(2), faker.lorem.words(5)]);
  }
  await insertBulk("INSERT INTO Enfermedad (idTipoEnfermedad, nombre, descripcion) VALUES ?", enfermedades);

  const examenes = [];
  for (let i = 0; i < 30; i++) {
    const idTipo = faker.number.int({ min: 1, max: tipoExamen.length });
    examenes.push([idTipo, faker.lorem.word(), faker.lorem.words(5)]);
  }
  await insertBulk("INSERT INTO Examen (idTipoExamen, nombre, descripcion) VALUES ?", examenes);

  const medicamentos = [];
  for (let i = 0; i < 30; i++) {
    const idTipo = faker.number.int({ min: 1, max: tipoMedicamento.length });
    medicamentos.push([idTipo, faker.commerce.productName(), faker.lorem.words(5)]);
  }
  await insertBulk("INSERT INTO Medicamento (idTipoMedicamento, nombre, descripcion) VALUES ?", medicamentos);

  // --------------------------------
  // RESULTADOS ESPERADOS / OBTENIDOS
  // --------------------------------
  console.log("🧪 Insertando Resultados Esperados y Obtenidos...");
  const resultadosEsperados = [];
  const nombresRes = ["Glucosa", "Hemoglobina", "Colesterol", "Triglicéridos", "Hierro"];
  const formatos = ["mg/dL", "g/L", "mmol/L", "gramos"];
  for (let i = 1; i <= examenes.length; i++) {
    for (let j = 0; j < 3; j++) {
      resultadosEsperados.push([
        i,
        faker.helpers.arrayElement(nombresRes),
        faker.number.int({ min: 10, max: 500 }),
        faker.helpers.arrayElement(formatos),
      ]);
    }
  }
  await insertBulk(
    "INSERT INTO ResultadoEsperado (idExamen, nombre, valor, formato) VALUES ?",
    resultadosEsperados
  );

  // --------------------------------
  // FICHA RELACIONES SIN DUPLICADOS
  // --------------------------------
  console.log("🧬 Insertando relaciones de ficha sin duplicados...");

  const fma = uniquePairs(2000, NUM_USUARIOS, alergias.length).map(([f, a]) => [
    f,
    a,
    faker.date.between({ from: "2018-01-01", to: "2025-01-01" }),
  ]);
  await insertBulk("INSERT INTO FichaMedicaAlergia (idFichaMedica, idAlergia, fecha) VALUES ?", fma);

  const fmc = uniquePairs(1500, NUM_USUARIOS, cirugias.length).map(([f, c]) => [
    f,
    c,
    faker.date.between({ from: "2015-01-01", to: "2025-01-01" }),
  ]);
  await insertBulk("INSERT INTO FichaMedicaCirujia (idFichaMedica, idCirujia, fecha) VALUES ?", fmc);

  const fme = uniquePairs(2500, NUM_USUARIOS, examenes.length).map(([f, e]) => [
    f,
    e,
    faker.date.between({ from: "2020-01-01", to: "2025-01-01" }),
    faker.lorem.sentence(),
  ]);
  await insertBulk(
    "INSERT INTO FichaMedicaExamen (idFichaMedica, idExamen, fecha, descripccion) VALUES ?",
    fme
  );

  const resultadosObtenidos = fme.map((_, i) => [
    i + 1,
    faker.helpers.arrayElement(nombresRes),
    faker.number.int({ min: 10, max: 500 }),
    faker.helpers.arrayElement(formatos),
  ]);
  await insertBulk(
    "INSERT INTO ResultadoObtenido (idFichaMedicaExamen, nombre, valor, formato) VALUES ?",
    resultadosObtenidos
  );

  // --------------------------------
  // MÉDICOS Y CONSULTAS
  // --------------------------------
  console.log("👨‍⚕️ Insertando Médicos y Consultas...");
  const medicos = [];
  for (let i = 0; i < 200; i++) {
    const idTipo = faker.number.int({ min: 1, max: tipoMedico.length });
    medicos.push([
      idTipo,
      faker.person.fullName(),
      faker.string.numeric(8),
      faker.date.birthdate({ min: 1960, max: 1995, mode: "year" }),
      faker.helpers.arrayElement(["Masculino", "Femenino"]),
    ]);
  }
  await insertBulk(
    "INSERT INTO Medico (idTipoMedico, nombre, rut, fechaNacimiento, sexo) VALUES ?",
    medicos
  );

  const consultas = [];
  for (let i = 0; i < NUM_CONSULTAS; i++) {
    const fecha = faker.date.between({ from: "2020-01-01", to: "2025-01-01" });
    const idMedico = faker.number.int({ min: 1, max: medicos.length });
    const idFicha = faker.number.int({ min: 1, max: NUM_USUARIOS });
    const institucion = faker.company.name();
    const descripcion = faker.lorem.sentence();
    consultas.push([fecha, idMedico, idFicha, institucion, descripcion]);
  }
  await insertBulk(
    "INSERT INTO Consulta (fecha, idMedico, idFichaMedica, institucionMedica, descripcion) VALUES ?",
    consultas
  );

  // --------------------------------
  // CONSULTA MEDICAMENTO (sin duplicados)
  // --------------------------------
  const cm = uniquePairs(3000, consultas.length, medicamentos.length).map(([c, m]) => [
    m,
    c,
    faker.number.int({ min: 1, max: 3 }),
    faker.helpers.arrayElement(["tabletas", "cápsulas", "ml"]),
    faker.number.int({ min: 5, max: 30 }),
    faker.helpers.arrayElement(["diario", "semanal", "mensual"]),
  ]);

  await insertBulk(
    "INSERT INTO ConsultaMedicamento (idMedicamento, idConsulta, cantidad, formato, tiempoConsumo, frecuenciaConsumo) VALUES ?",
    cm
  );

  // --------------------------------
  // DIAGNÓSTICO Y HOSPITALIZACIÓN
  // --------------------------------
  console.log("🏥 Insertando Diagnósticos y Hospitalizaciones...");
  const diagnosticos = [];
  for (let i = 0; i < 5000; i++) {
    diagnosticos.push([
      faker.number.int({ min: 1, max: NUM_USUARIOS }),
      faker.date.between({ from: "2020-01-01", to: "2025-01-01" }),
      faker.lorem.sentence(),
    ]);
  }
  await insertBulk("INSERT INTO Diagnostico (idFichaMedica, fecha, descripcion) VALUES ?", diagnosticos);

  const hospitalizaciones = [];
  for (let i = 0; i < 2000; i++) {
    hospitalizaciones.push([
      faker.number.int({ min: 1, max: NUM_USUARIOS }),
      faker.date.between({ from: "2018-01-01", to: "2025-01-01" }),
      faker.number.int({ min: 1, max: 30 }),
      faker.company.name(),
    ]);
  }
  await insertBulk(
    "INSERT INTO Hospitalizacion (idFichaMedica, fecha, duracion, institucionMedica) VALUES ?",
    hospitalizaciones
  );

  console.log("🌱 Poblamiento COMPLETO sin duplicados ✅");
  await conn.end();
}

main().catch((err) => console.error("❌ Error:", err));
