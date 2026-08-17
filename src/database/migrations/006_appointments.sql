CREATE TABLE IF NOT EXISTS services (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
  id BIGSERIAL PRIMARY KEY,
  owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pet_id BIGINT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  service_id BIGINT NOT NULL REFERENCES services(id),
  starts_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'Agendado' CHECK (status IN ('Agendado','Confirmado','Em atendimento','Concluido','Cancelado')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_owner_date ON appointments(owner_id, starts_at);

INSERT INTO services (name, description, duration_minutes, price)
SELECT 'Banho', 'Banho completo com secagem', 60, 45.00
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Banho');
INSERT INTO services (name, description, duration_minutes, price)
SELECT 'Tosa', 'Tosa completa', 120, 65.00
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Tosa');
INSERT INTO services (name, description, duration_minutes, price)
SELECT 'Banho + Tosa', 'Banho completo e tosa', 150, 85.00
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Banho + Tosa');
INSERT INTO services (name, description, duration_minutes, price)
SELECT 'Tosa Higienica', 'Tosa higienica', 30, 25.00
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Tosa Higienica');
INSERT INTO services (name, description, duration_minutes, price)
SELECT 'Corte de Unhas', 'Corte e cuidado das unhas', 20, 18.00
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Corte de Unhas');
