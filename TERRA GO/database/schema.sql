CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  rol VARCHAR(50)
);

CREATE TABLE lotes (
  id SERIAL PRIMARY KEY,
  productor_id INT REFERENCES usuarios(id),
  certificacion VARCHAR(50),
  ubicacion TEXT,
  volumen DECIMAL
);

CREATE TABLE tokens (
  id SERIAL PRIMARY KEY,
  lote_id INT REFERENCES lotes(id),
  token_hash VARCHAR(255),
  metadata JSONB
);