INSERT INTO
  users (name, email, password_hash, role, status)
VALUES
  (
    'Usuário',
    'user@gamil.com',
    '$2b$12$jkmkqiAO8IuZiL31IHWveub7hIz4AMOB6T2duTGIj9zl5klK.kzde',
    'cliente',
    'active'
  ),
  (
    'Administrador',
    'admin@gamil.com',
    '$2b$12$jkmkqiAO8IuZiL31IHWveub7hIz4AMOB6T2duTGIj9zl5klK.kzde',
    'admin',
    'active'
  ) ON CONFLICT (email) DO
UPDATE
SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  updated_at = CURRENT_TIMESTAMP;
