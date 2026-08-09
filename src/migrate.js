const fs = require('fs');
const path = require('path');
const pool = require('./config/database');

async function migrer() {
  const dossier = path.join(__dirname, '..', 'migrations');
  const fichiers = fs.readdirSync(dossier).filter((f) => f.endsWith('.sql')).sort();
  if (fichiers.length === 0) {
    console.log('Aucune migration a appliquer.');
    return;
  }
  for (const fichier of fichiers) {
    const sql = fs.readFileSync(path.join(dossier, fichier), 'utf8');
    console.log(`Application de ${fichier} ...`);
    await pool.query(sql);
    console.log(`  OK`);
  }
  console.log('Base de donnees prete.');
}

migrer()
  .catch((err) => {
    console.error('Echec de la migration :', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
