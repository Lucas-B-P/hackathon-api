UPDATE users
SET password_hash = '$2b$12$jkmkqiAO8IuZiL31IHWveub7hIz4AMOB6T2duTGIj9zl5klK.kzde', updated_at = CURRENT_TIMESTAMP
WHERE email IN ('user@gamil.com', 'admin@gamil.com');
