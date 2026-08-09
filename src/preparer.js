/**
 * Preparation automatique :
 *  1. cherche le bon port PostgreSQL (5432, 5433, 5434, 1234)
 *  2. cree la base si elle n existe pas
 *  3. ecrit le bon port dans le fichier .env
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const RACINE = path.join(__dirname, '..');
const FICHIER_ENV = path.join(RACINE, '.env');

const host = process.env.PGHOST || 'localhost';
const user = process.env.PGUSER || 'postgres';
const password = String(process.env.PGPASSWORD || '');
const base = process.env.PGDATABASE || 'oxalis_db';

const portsTestes = [Number(process.env.PGPORT) || 5432, 5432, 5433, 5434, 1234]
  .filter((p, i, t) => t.indexOf(p) === i);

async function essayerPort(port) {
  const client = new Client({ host, port, user, password, database: 'postgres', connectionTimeoutMillis: 3000 });
  try {
    await client.connect();
    return client;
  } catch (err) {
    try { await client.end(); } catch (_) {}
    if (err.code === '28P01') {
      console.log(`Port ${port} : PostgreSQL repond mais le mot de passe est faux.`);
      throw err;
    }
    return null;
  }
}

async function preparer() {
  let client = null;
  let portTrouve = null;

  for (const port of portsTestes) {
    console.log(`Test du port ${port} ...`);
    client = await essayerPort(port);
    if (client) { portTrouve = port; break; }
  }

  if (!client) {
    console.log('');
    console.log('Aucun serveur PostgreSQL trouve.');
    console.log('-> Verifiez que PostgreSQL est demarre (Services Windows).');
    process.exitCode = 1;
    return;
  }

  console.log(`PostgreSQL trouve sur le port ${portTrouve}.`);

  const { rows } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [base]);
  if (rows.length === 0) {
    await client.query(`CREATE DATABASE "${base}"`);
    console.log(`Base "${base}" creee.`);
  } else {
    console.log(`Base "${base}" deja presente.`);
  }
  await client.end();

  if (fs.existsSync(FICHIER_ENV)) {
    let contenu = fs.readFileSync(FICHIER_ENV, 'utf8');
    contenu = /^PGPORT=.*$/m.test(contenu)
      ? contenu.replace(/^PGPORT=.*$/m, `PGPORT=${portTrouve}`)
      : `${contenu.trimEnd()}\nPGPORT=${portTrouve}\n`;
    fs.writeFileSync(FICHIER_ENV, contenu);
    console.log('Fichier .env mis a jour avec le bon port.');
  }
  process.env.PGPORT = String(portTrouve);
}

preparer().catch((err) => {
  console.log('Echec de la preparation :', err.message);
  if (err.code === '28P01') console.log('-> Corrigez PGPASSWORD dans le fichier .env.');
  process.exitCode = 1;
});
