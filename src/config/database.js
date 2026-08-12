const { Pool } = require('pg');
require('dotenv').config();

const config = {
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || 'postgres',
  password: String(process.env.PGPASSWORD || ''),
  database: process.env.PGDATABASE || 'oxalis_db',
  max: Number(process.env.DATABASE_POOL_MAX) || 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

const pool = new Pool(config);

pool.on('error', (err) => {
  console.error('Erreur PostgreSQL :', err.message);
});

module.exports = pool;
module.exports.config = config;
