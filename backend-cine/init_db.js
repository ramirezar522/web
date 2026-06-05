import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function run() {
  console.log('--- Database Initialization Script ---');
  
  const pgUser = process.env.DB_USER || 'postgres';
  const pgPassword = process.env.DB_PASSWORD || 'cuaderno';
  const pgHost = process.env.DB_HOST || 'localhost';
  const pgPort = parseInt(process.env.DB_PORT || '5432', 10);
  const dbName = process.env.DB_DATABASE || 'cine_db';

  // Step 1: Connect to the default 'postgres' database to check/create the target database
  console.log(`Connecting to default 'postgres' database on ${pgHost}:${pgPort}...`);
  const adminClient = new Client({
    user: pgUser,
    password: pgPassword,
    host: pgHost,
    port: pgPort,
    database: 'postgres'
  });

  try {
    await adminClient.connect();
    console.log('Connected to admin client successfully.');

    // Check if the database already exists
    const res = await adminClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    if (res.rowCount === 0) {
      console.log(`Database "${dbName}" does not exist. Creating...`);
      // CREATE DATABASE cannot be executed inside a transaction block or with parameterized query for DB name in some contexts
      await adminClient.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database "${dbName}" created successfully.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
    await adminClient.end();
  } catch (err) {
    console.error('Error checking or creating database:', err.message);
    try {
      await adminClient.end();
    } catch (_) {}
    process.exit(1);
  }

  // Step 2: Connect directly to the 'cine_db' database and run schema.sql
  console.log(`Connecting to database "${dbName}" on ${pgHost}:${pgPort}...`);
  const dbClient = new Client({
    user: pgUser,
    password: pgPassword,
    host: pgHost,
    port: pgPort,
    database: dbName
  });

  try {
    await dbClient.connect();
    console.log(`Connected to "${dbName}" database. Reading schema.sql...`);

    const schemaPath = path.resolve('schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema.sql queries...');
    await dbClient.query(schemaSql);
    console.log('Schema and seeds loaded successfully.');

    await dbClient.end();
    console.log('Database setup completed successfully!');
  } catch (err) {
    console.error('Error running schema.sql:', err);
    try {
      await dbClient.end();
    } catch (_) {}
    process.exit(1);
  }
}

run();
