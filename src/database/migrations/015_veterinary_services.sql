INSERT INTO services (name, description, duration_minutes, price)
SELECT 'Consulta veterinária', 'Avaliação clínica', 60, 120.00 WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Consulta veterinária');
INSERT INTO services (name, description, duration_minutes, price)
SELECT 'Vacinação', 'Aplicação de vacina', 30, 80.00 WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Vacinação');
