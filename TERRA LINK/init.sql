-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create plots table with geospatial data
CREATE TABLE plots (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  owner_id INTEGER NOT NULL,
  certification VARCHAR(50),
  geom GEOMETRY(POLYGON, 4326) NOT NULL,
  valuation NUMERIC(15,2),
  nft_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index for faster geospatial queries
CREATE INDEX idx_plots_geom ON plots USING GIST (geom);

-- Create certifications table
CREATE TABLE certifications (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  standard VARCHAR(50) NOT NULL, -- EUDR, organic, fair_trade, etc.
  issuer VARCHAR(100),
  valid_from DATE,
  valid_until DATE,
  plot_id INTEGER REFERENCES plots(id)
);

-- Create production_history table
CREATE TABLE production_history (
  id SERIAL PRIMARY KEY,
  plot_id INTEGER REFERENCES plots(id),
  year INTEGER NOT NULL,
  crop_type VARCHAR(100),
  yield_kg NUMERIC(10,2),
  quality_score INTEGER,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create nft_metadata table for off-chain data
CREATE TABLE nft_metadata (
  token_id VARCHAR(255) PRIMARY KEY,
  plot_id INTEGER REFERENCES plots(id),
  geolocation TEXT,
  certifications TEXT[], -- JSON array of certifications
  production_history_uri TEXT,
  valuation NUMERIC(15,2),
  risk_score INTEGER,
  fraction_count INTEGER DEFAULT 1,
  collateralized BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create credit_proposals table
CREATE TABLE credit_proposals (
  id SERIAL PRIMARY KEY,
  token_id VARCHAR(255) REFERENCES nft_metadata(token_id),
  borrower_id INTEGER NOT NULL,
  requested_amount NUMERIC(15,2),
  duration_months INTEGER,
  interest_rate NUMERIC(5,2),
  status VARCHAR(20) DEFAULT 'draft', -- draft, under_review, approved, rejected
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO plots (name, owner_id, certification, geom, valuation) VALUES
('Lote Café Orgánico', 1, 'orgánico', ST_GeomFromText('POLYGON((-79.4 -2.1, -79.3 -2.1, -79.3 -2.0, -79.4 -2.0, -79.4 -2.1))', 4326), 450000.00);

INSERT INTO certifications (name, standard, issuer, valid_from, valid_until, plot_id) VALUES
('Certificación Orgánica', 'orgánico', 'Certificadora Nacional', '2024-01-01', '2026-12-31', 1),
('Cumplimiento EUDR', 'EUDR', 'UE Compliance', '2024-01-01', '2026-12-31', 1);

INSERT INTO production_history (plot_id, year, crop_type, yield_kg, quality_score) VALUES
(1, 2024, 'Café', 2500.50, 85),
(1, 2023, 'Café', 2400.00, 82);
