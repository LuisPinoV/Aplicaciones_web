import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || '172.31.29.209',
  user: process.env.DB_USER || 'IonicUser',
  password: process.env.DB_PASS || '123456',
  database: process.env.DB_NAME || 'IonicDB',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;