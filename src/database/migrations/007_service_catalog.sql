INSERT INTO services (name, description, duration_minutes, price)
SELECT 'Banho', 'Banho completo com secagem', 60, 45.00 WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Banho');
INSERT INTO services (name, description, duration_minutes, price)
SELECT 'Tosa', 'Tosa completa', 120, 65.00 WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Tosa');
INSERT INTO services (name, description, duration_minutes, price)
SELECT 'Banho + Tosa', 'Banho completo e tosa', 150, 85.00 WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Banho + Tosa');
INSERT INTO services (name, description, duration_minutes, price)
SELECT 'Tosa Higienica', 'Tosa higienica', 30, 25.00 WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Tosa Higienica');
INSERT INTO services (name, description, duration_minutes, price)
SELECT 'Corte de Unhas', 'Corte e cuidado das unhas', 20, 18.00 WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Corte de Unhas');
