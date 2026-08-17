ALTER TABLE users
  ALTER COLUMN birth_date TYPE TEXT
  USING birth_date::TEXT;
