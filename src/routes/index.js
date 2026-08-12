const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Petit utilitaire : capture les erreurs async
const a = (fn) => (req, res, next) => fn(req, res, next).catch(next);

/* ---------------- CLIENTS ---------------- */
router.get('/clients', a(async (req, res) => {
  const recherche = (req.query.q || '').trim();
  const sql = recherche
    ? `SELECT * FROM clients
       WHERE nom ILIKE $1 OR prenom ILIKE $1 OR telephone ILIKE $1 OR email ILIKE $1
       ORDER BY created_at DESC`
    : 'SELECT * FROM clients ORDER BY created_at DESC';
  const params = recherche ? [`%${recherche}%`] : [];
  const { rows } = await pool.query(sql, params);
  res.json(rows);
}));

router.get('/clients/:id', a(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM clients WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ erreur: 'Client introuvable' });
  res.json(rows[0]);
}));

router.post('/clients', a(async (req, res) => {
  const { nom, prenom, email, telephone, adresse, date_naissance, passeport_numero, passeport_expiration, notes } = req.body;
  if (!nom || !prenom) return res.status(400).json({ erreur: 'nom et prenom sont obligatoires' });
  const { rows } = await pool.query(
    `INSERT INTO clients (nom, prenom, email, telephone, adresse, date_naissance, passeport_numero, passeport_expiration, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [nom, prenom, email || null, telephone || null, adresse || null, date_naissance || null, passeport_numero || null, passeport_expiration || null, notes || null]
  );
  res.status(201).json(rows[0]);
}));

router.put('/clients/:id', a(async (req, res) => {
  const { nom, prenom, email, telephone, adresse, date_naissance, passeport_numero, passeport_expiration, notes } = req.body;
  const { rows } = await pool.query(
    `UPDATE clients SET nom=COALESCE($1,nom), prenom=COALESCE($2,prenom), email=$3, telephone=$4,
       adresse=$5, date_naissance=$6, passeport_numero=$7, passeport_expiration=$8, notes=$9
     WHERE id=$10 RETURNING *`,
    [nom, prenom, email || null, telephone || null, adresse || null, date_naissance || null, passeport_numero || null, passeport_expiration || null, notes || null, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ erreur: 'Client introuvable' });
  res.json(rows[0]);
}));

router.delete('/clients/:id', a(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM clients WHERE id = $1', [req.params.id]);
  if (!rowCount) return res.status(404).json({ erreur: 'Client introuvable' });
  res.json({ supprime: true });
}));

/* ---------------- PRODUITS ---------------- */
router.get('/produits', a(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM produits ORDER BY nom');
  res.json(rows);
}));

router.post('/produits', a(async (req, res) => {
  const { nom, description, prix, capacite } = req.body;
  if (!nom) return res.status(400).json({ erreur: 'nom obligatoire' });
  const { rows } = await pool.query(
    'INSERT INTO produits (nom, description, prix, capacite) VALUES ($1,$2,$3,$4) RETURNING *',
    [nom, description || null, Number(prix) || 0, Number(capacite) || 1]
  );
  res.status(201).json(rows[0]);
}));

router.put('/produits/:id', a(async (req, res) => {
  const { nom, description, prix, capacite } = req.body;
  const { rows } = await pool.query(
    'UPDATE produits SET nom=COALESCE($1,nom), description=$2, prix=COALESCE($3,prix), capacite=COALESCE($4,capacite) WHERE id=$5 RETURNING *',
    [nom, description || null, prix, capacite, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ erreur: 'Produit introuvable' });
  res.json(rows[0]);
}));

router.delete('/produits/:id', a(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM produits WHERE id = $1', [req.params.id]);
  if (!rowCount) return res.status(404).json({ erreur: 'Produit introuvable' });
  res.json({ supprime: true });
}));

/* ---------------- RESERVATIONS ---------------- */
router.get('/reservations', a(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT r.*, c.nom, c.prenom, c.telephone,
            COALESCE((SELECT SUM(p.montant) FROM paiements p WHERE p.reservation_id = r.id), 0) AS total_paye
     FROM reservations r
     JOIN clients c ON c.id = r.client_id
     ORDER BY r.created_at DESC`
  );
  res.json(rows.map((r) => ({ ...r, reste: Number(r.prix_total) - Number(r.total_paye) })));
}));

router.post('/reservations', a(async (req, res) => {
  const { client_id, produit_id, destination, date_depart, date_retour, nombre_personnes, prix_total, statut, notes } = req.body;
  if (!client_id) return res.status(400).json({ erreur: 'client_id obligatoire' });
  const { rows } = await pool.query(
    `INSERT INTO reservations (client_id, produit_id, destination, date_depart, date_retour, nombre_personnes, prix_total, statut, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,COALESCE($8,'en_attente'),$9) RETURNING *`,
    [client_id, produit_id || null, destination || null, date_depart || null, date_retour || null,
     Number(nombre_personnes) || 1, Number(prix_total) || 0, statut || null, notes || null]
  );
  res.status(201).json(rows[0]);
}));

router.put('/reservations/:id', a(async (req, res) => {
  const { produit_id, destination, date_depart, date_retour, nombre_personnes, prix_total, statut, notes } = req.body;
  const { rows } = await pool.query(
    `UPDATE reservations SET produit_id=$1, destination=$2, date_depart=$3, date_retour=$4,
       nombre_personnes=COALESCE($5,nombre_personnes), prix_total=COALESCE($6,prix_total),
       statut=COALESCE($7,statut), notes=$8 WHERE id=$9 RETURNING *`,
    [produit_id || null, destination || null, date_depart || null, date_retour || null,
     nombre_personnes, prix_total, statut, notes || null, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ erreur: 'Reservation introuvable' });
  res.json(rows[0]);
}));

router.delete('/reservations/:id', a(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM reservations WHERE id = $1', [req.params.id]);
  if (!rowCount) return res.status(404).json({ erreur: 'Reservation introuvable' });
  res.json({ supprime: true });
}));

/* ---------------- PAIEMENTS ---------------- */
router.get('/paiements', a(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT p.*, c.nom, c.prenom FROM paiements p
     JOIN reservations r ON r.id = p.reservation_id
     JOIN clients c ON c.id = r.client_id
     ORDER BY p.date_paiement DESC, p.id DESC`
  );
  res.json(rows);
}));

router.post('/paiements', a(async (req, res) => {
  const { reservation_id, montant, methode, date_paiement, reference } = req.body;
  if (!reservation_id || !montant) return res.status(400).json({ erreur: 'reservation_id et montant obligatoires' });
  const { rows } = await pool.query(
    `INSERT INTO paiements (reservation_id, montant, methode, date_paiement, reference)
     VALUES ($1,$2,COALESCE($3,'especes'),COALESCE($4,CURRENT_DATE),$5) RETURNING *`,
    [reservation_id, Number(montant), methode || null, date_paiement || null, reference || null]
  );
  res.status(201).json(rows[0]);
}));

router.delete('/paiements/:id', a(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM paiements WHERE id = $1', [req.params.id]);
  if (!rowCount) return res.status(404).json({ erreur: 'Paiement introuvable' });
  res.json({ supprime: true });
}));

/* ---------------- DEPENSES ---------------- */
router.get('/depenses', a(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM depenses ORDER BY date_depense DESC, id DESC');
  res.json(rows);
}));

router.post('/depenses', a(async (req, res) => {
  const { libelle, categorie, montant, date_depense, note } = req.body;
  if (!libelle || montant === undefined) return res.status(400).json({ erreur: 'libelle et montant obligatoires' });
  const { rows } = await pool.query(
    `INSERT INTO depenses (libelle, categorie, montant, date_depense, note)
     VALUES ($1,$2,$3,COALESCE($4,CURRENT_DATE),$5) RETURNING *`,
    [libelle, categorie || null, Number(montant), date_depense || null, note || null]
  );
  res.status(201).json(rows[0]);
}));

router.delete('/depenses/:id', a(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM depenses WHERE id = $1', [req.params.id]);
  if (!rowCount) return res.status(404).json({ erreur: 'Depense introuvable' });
  res.json({ supprime: true });
}));

/* ---------------- TABLEAU DE BORD ---------------- */
router.get('/stats', a(async (req, res) => {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM clients) AS clients,
      (SELECT COUNT(*) FROM reservations) AS reservations,
      (SELECT COALESCE(SUM(prix_total),0) FROM reservations WHERE statut <> 'annulee') AS chiffre_affaires,
      (SELECT COALESCE(SUM(montant),0) FROM paiements) AS encaisse,
      (SELECT COALESCE(SUM(montant),0) FROM depenses) AS depenses
  `);
  const s = rows[0];
  res.json({
    clients: Number(s.clients),
    reservations: Number(s.reservations),
    chiffre_affaires: Number(s.chiffre_affaires),
    encaisse: Number(s.encaisse),
    depenses: Number(s.depenses),
    reste_a_encaisser: Number(s.chiffre_affaires) - Number(s.encaisse),
    caisse: Number(s.encaisse) - Number(s.depenses),
  });
}));

module.exports = router;
