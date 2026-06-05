import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg; 

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Confirmación de conexión en consola
pool.on('connect', () => {
  console.log('Conexión establecida con la base de datos: Proyecto_cine');
});

pool.on('error', (err) => {
  console.error('Error inesperado en PostgreSQL:', err);
  process.exit(-1);
});

export const query = (text, params) => pool.query(text, params);
export default pool;