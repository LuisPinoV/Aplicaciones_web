const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');
const sqlFilePath = path.resolve(__dirname, '..', 'BBDD_web.sql');

// Eliminar la base de datos anterior si existe
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Base de datos anterior eliminada.');
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    return console.error('Error al crear la base de datos', err.message);
  }
  console.log('Base de datos SQLite creada en', dbPath);
  
  fs.readFile(sqlFilePath, 'utf8', (err, sql) => {
    if (err) {
      return console.error('Error al leer el archivo BBDD_web.sql', err);
    }

    console.log('Archivo BBDD_web.sql leído. Procesando para SQLite...');

    // Limpiar y adaptar el SQL de MySQL a SQLite
    let processedSql = sql
      .replace(/-- .*/g, '') // Eliminar comentarios de línea
      .replace(/\/\*![\s\S]*?\*\//g, '') // Eliminar bloques de comentarios de MySQL
      .replace(/CREATE DATABASE[\s\S]*?;/g, '') // Eliminar CREATE DATABASE
      .replace(/USE[\s\S]*?;/g, '') // Eliminar USE
      .replace(/LOCK TABLES .*;/g, '') // Eliminar LOCK TABLES
      .replace(/UNLOCK TABLES;/g, '') // Eliminar UNLOCK TABLES
      .replace(/`bbdd_web`\./g, '') // Eliminar prefijo de base de datos
      .replace(/ENGINE=InnoDB[^;]*/g, '') // Eliminar ENGINE
      .replace(/DEFAULT CHARSET=[^;]*/g, '') // Eliminar CHARSET
      .replace(/COLLATE=[^;]*/g, '') // Eliminar COLLATE
      .replace(/int NOT NULL AUTO_INCREMENT/g, 'INTEGER PRIMARY KEY AUTOINCREMENT') // Adaptar AUTO_INCREMENT
      .replace(/KEY `.*?` \(`.*?`\),?/g, '') // Eliminar KEY
      .replace(/UNIQUE KEY `.*?` \(`.*?`\),?/g, '') // Eliminar UNIQUE KEY
      .replace(/CONSTRAINT `.*?` FOREIGN KEY \(`.*?`\) REFERENCES `.*?` \(`.*?`\),?/g, '') // Eliminar FOREIGN KEY constraints
      .replace(/,\s*PRIMARY KEY/g, ', PRIMARY KEY') // Corregir comas antes de PRIMARY KEY
      .replace(/,?\s*CONSTRAINT.*REFERENCES.*(\r\n|\n|\r)/g, '\n') // Eliminar líneas de constraint restantes
      .replace(/(\r\n|\n|\r){2,}/g, '\n'); // Eliminar líneas vacías múltiples

    // Separar en comandos individuales
    const statements = processedSql.split(';').filter(s => s.trim() !== '');

    db.serialize(() => {
      db.run("PRAGMA foreign_keys=OFF;");
      db.run("BEGIN TRANSACTION;");

      statements.forEach((statement, index) => {
        let cleanedStatement = statement.trim();
        // Limpieza final de comas residuales al final de la definición de columnas
        cleanedStatement = cleanedStatement.replace(/,\s*\)/g, ')');
        
        if (cleanedStatement) {
          db.run(cleanedStatement, (err) => {
            if (err) {
              console.error(`Error al ejecutar el comando #${index + 1}: ${cleanedStatement.substring(0, 80)}...`, err.message);
            }
          });
        }
      });

      db.run("COMMIT;", (err) => {
        if (err) {
          console.error('Error al hacer COMMIT', err.message);
        } else {
          console.log('Transacción completada.');
        }
        db.run("PRAGMA foreign_keys=ON;");
        
        db.close((err) => {
          if (err) {
            return console.error(err.message);
          }
          console.log('Base de datos inicializada y conexión cerrada.');
        });
      });
    });
  });
});
