CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  minimum_stock INTEGER NOT NULL DEFAULT 0,
  cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  sale_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  icon TEXT,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO products (name, sku, category, stock, minimum_stock, cost, sale_price, icon)
VALUES
('Racao Premium Golden 15kg', 'RAC-001', 'Alimentacao', 42, 10, 89.90, 149.90, 'food'),
('Shampoo Neutro para Caes 500ml', 'SHP-002', 'Higiene', 8, 15, 12.50, 24.90, 'hygiene'),
('Coleira Antipulgas Seresto', 'COL-003', 'Saude', 5, 10, 45.00, 89.90, 'health'),
('Brinquedo Kong Classic M', 'BRI-004', 'Brinquedos', 22, 5, 18.00, 39.90, 'toy'),
('Racao Gatos Whiskas 3kg', 'RAC-005', 'Alimentacao', 3, 10, 28.00, 49.90, 'food'),
('Tapete Higienico c/30 unid.', 'TAP-006', 'Higiene', 0, 5, 22.00, 44.90, 'hygiene'),
('Vermifugo Drontal Plus', 'VER-007', 'Saude', 19, 8, 14.00, 29.90, 'health'),
('Arranhador Cat Tree', 'ARR-008', 'Acessorios', 7, 3, 65.00, 129.90, 'accessories')
ON CONFLICT (sku) DO NOTHING;
