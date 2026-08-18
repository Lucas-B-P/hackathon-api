DO $$
DECLARE
  client_id BIGINT;
  order_id BIGINT;
  product_a RECORD;
  product_b RECORD;
BEGIN
  SELECT id INTO client_id FROM users WHERE role = 'cliente' ORDER BY id LIMIT 1;
  SELECT id, name, sale_price INTO product_a FROM products ORDER BY id LIMIT 1;
  SELECT id, name, sale_price INTO product_b FROM products ORDER BY id OFFSET 1 LIMIT 1;
  IF client_id IS NOT NULL AND product_a.id IS NOT NULL AND product_b.id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM orders WHERE notes = 'Dados de demonstração') THEN
    INSERT INTO orders (owner_id, status, total, payment_method, notes, created_at) VALUES (client_id, 'Em preparacao', product_a.sale_price, 'PIX', 'Dados de demonstração', NOW() - INTERVAL '1 day') RETURNING id INTO order_id;
    INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES (order_id, product_a.id, product_a.name, 1, product_a.sale_price, product_a.sale_price);
    INSERT INTO orders (owner_id, status, total, payment_method, notes, created_at) VALUES (client_id, 'Pronto', product_b.sale_price, 'Cartão de crédito', 'Dados de demonstração', NOW() - INTERVAL '3 days') RETURNING id INTO order_id;
    INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES (order_id, product_b.id, product_b.name, 1, product_b.sale_price, product_b.sale_price);
    INSERT INTO orders (owner_id, status, total, payment_method, notes, created_at) VALUES (client_id, 'Entregue', product_a.sale_price + product_b.sale_price, 'PIX', 'Dados de demonstração', NOW() - INTERVAL '10 days') RETURNING id INTO order_id;
    INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES (order_id, product_a.id, product_a.name, 1, product_a.sale_price, product_a.sale_price), (order_id, product_b.id, product_b.name, 1, product_b.sale_price, product_b.sale_price);
  END IF;
END $$;
