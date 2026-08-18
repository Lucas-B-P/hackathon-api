INSERT INTO products (name, sku, category, sale_price, icon)
VALUES
  ('Ração Premium Golden 15kg', 'RAC-001', 'Alimentação', 149.90, 'food'),
  ('Shampoo Neutro para Cães 500ml', 'SHP-002', 'Higiene', 24.90, 'hygiene'),
  ('Coleira Antipulgas Seresto', 'COL-003', 'Saúde', 89.90, 'health'),
  ('Brinquedo Kong Classic M', 'BRI-004', 'Brinquedos', 39.90, 'toy'),
  ('Ração Gatos Whiskas 3kg', 'RAC-005', 'Alimentação', 49.90, 'food'),
  ('Vermífugo Drontal Plus', 'VER-007', 'Saúde', 29.90, 'health'),
  ('Arranhador Cat Tree', 'ARR-008', 'Acessórios', 129.90, 'accessories')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  sale_price = EXCLUDED.sale_price,
  icon = EXCLUDED.icon,
  updated_at = NOW();
