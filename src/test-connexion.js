const pool = require('./config/database');
require('dotenv').config();

async function testConnexion() {
  console.log('Test de connexion PostgreSQL ...');
  console.log(`  Host : ${process.env.PGHOST || 'localhost'}`);
  console.log(`  Port : ${process.env.PGPORT || 5432}`);
  console.log(`  Base : ${process.env.PGDATABASE || 'oxalis_db'}`);
  try {
    const { rows } = await pool.query('SELECT NOW() AS heure');
    console.log('Connexion reussie. Heure serveur :', rows[0].heure);
  } catch (err) {
    console.log('Echec de la connexion :', err.message);
    if (err.code === 'ECONNREFUSED') console.log('-> PostgreSQL est arrete ou le port est faux : lancez "node src/preparer.js".');
    if (err.code === '28P01') console.log('-> Mot de passe PGPASSWORD incorrect dans le fichier .env.');
    if (err.code === '3D000') console.log('-> La base n existe pas : lancez "node src/preparer.js".');
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

testConnexion();
