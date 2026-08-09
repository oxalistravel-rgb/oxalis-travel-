const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const pool = require('./config/database');
const routes = require('./routes');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', base: 'connectee' });
  } catch (err) {
    res.status(500).json({ status: 'erreur', message: err.message });
  }
});

app.use('/api', routes);

app.use((req, res) => res.status(404).json({ erreur: 'Route introuvable' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erreur: 'Erreur serveur', detail: err.message });
});

async function demarrer() {
  try {
    await pool.query('SELECT 1');
    console.log('Base de donnees connectee.');
  } catch (err) {
    console.error('Impossible de joindre la base :', err.message);
    console.error('Verifiez le fichier .env (PGPORT, PGPASSWORD, PGDATABASE).');
  }
  app.listen(PORT, () => {
    console.log('');
    console.log('====================================================');
    console.log(`  Logiciel Oxalis Travel ouvert : http://localhost:${PORT}`);
    console.log('  (laissez cette fenetre noire ouverte pendant le travail)');
    console.log('====================================================');
  });
}

demarrer();
