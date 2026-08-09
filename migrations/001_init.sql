-- Oxalis Travel - schema initial

CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telephone VARCHAR(50),
  adresse TEXT,
  date_naissance DATE,
  passeport_numero VARCHAR(50),
  passeport_expiration DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS clients_email_unique
  ON clients (lower(email)) WHERE email IS NOT NULL AND email <> '';

CREATE TABLE IF NOT EXISTS produits (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  description TEXT,
  prix NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (prix >= 0),
  capacite INTEGER NOT NULL DEFAULT 1 CHECK (capacite > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  produit_id INTEGER REFERENCES produits(id) ON DELETE SET NULL,
  destination VARCHAR(255),
  date_depart DATE,
  date_retour DATE,
  nombre_personnes INTEGER NOT NULL DEFAULT 1 CHECK (nombre_personnes > 0),
  prix_total NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (prix_total >= 0),
  statut VARCHAR(30) NOT NULL DEFAULT 'en_attente'
    CHECK (statut IN ('en_attente','confirmee','payee','terminee','annulee')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT dates_coherentes CHECK (date_retour IS NULL OR date_depart IS NULL OR date_retour >= date_depart)
);
CREATE INDEX IF NOT EXISTS reservations_client_idx ON reservations(client_id);

CREATE TABLE IF NOT EXISTS paiements (
  id SERIAL PRIMARY KEY,
  reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  montant NUMERIC(12,2) NOT NULL CHECK (montant > 0),
  methode VARCHAR(30) NOT NULL DEFAULT 'especes'
    CHECK (methode IN ('especes','virement','cheque','carte','autre')),
  date_paiement DATE NOT NULL DEFAULT CURRENT_DATE,
  reference VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS paiements_reservation_idx ON paiements(reservation_id);

CREATE TABLE IF NOT EXISTS depenses (
  id SERIAL PRIMARY KEY,
  libelle VARCHAR(255) NOT NULL,
  categorie VARCHAR(100),
  montant NUMERIC(12,2) NOT NULL CHECK (montant >= 0),
  date_depense DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['clients','produits','reservations','paiements','depenses'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I_updated ON %I', t, t);
    EXECUTE format('CREATE TRIGGER %I_updated BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t);
  END LOOP;
END $$;
