import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg; 

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
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