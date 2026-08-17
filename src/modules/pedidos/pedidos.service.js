import { pool } from "../../database/pool.js";
import { createNotification } from "../notificacoes/notificacoes.service.js";

function validationError(message, statusCode = 400) { const error = new Error(message); error.statusCode = statusCode; return error; }

export async function createOrder(ownerId, data) {
  const items = Array.isArray(data?.itens) ? data.itens : [];
  if (!items.length) throw validationError("Adicione pelo menos um produto ao pedido.");
  if (!data.enderecoId) throw validationError("Selecione um endereço de entrega.");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const address = await client.query("SELECT id FROM user_addresses WHERE id = $1 AND user_id = $2", [data.enderecoId, ownerId]);
    if (!address.rows[0]) throw validationError("Endereço de entrega não encontrado.", 404);
    const normalized = new Map();
    for (const item of items) { const id = Number(item.produtoId); const quantity = Number(item.quantidade); if (!Number.isInteger(id) || !Number.isInteger(quantity) || quantity <= 0) throw validationError("Itens do pedido inválidos."); normalized.set(id, (normalized.get(id) ?? 0) + quantity); }
    const orderItems = []; let total = 0;
    for (const [id, quantity] of normalized) {
      const result = await client.query("SELECT id, name, stock, sale_price FROM products WHERE id = $1 AND active = TRUE FOR UPDATE", [id]);
      const product = result.rows[0]; if (!product) throw validationError("Produto não encontrado.", 404); if (product.stock < quantity) throw validationError(`Estoque insuficiente para ${product.name}.`, 409);
      const unitPrice = Number(product.sale_price); const subtotal = unitPrice * quantity; total += subtotal; orderItems.push({ product, quantity, unitPrice, subtotal });
    }
    const orderResult = await client.query("INSERT INTO orders (owner_id, status, total, address_id, payment_method, notes) VALUES ($1, 'Em preparacao', $2, $3, $4, $5) RETURNING id, status, total, created_at", [ownerId, total, data.enderecoId, data.formaPagamento ?? null, data.observacoes ?? null]);
    const order = orderResult.rows[0];
    for (const item of orderItems) { await client.query("INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5, $6)", [order.id, item.product.id, item.product.name, item.quantity, item.unitPrice, item.subtotal]); await client.query("UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2", [item.quantity, item.product.id]); await client.query("INSERT INTO stock_movements (product_id, order_id, type, quantity, reason) VALUES ($1, $2, 'SAIDA', $3, 'Venda')", [item.product.id, order.id, item.quantity]); }
    await client.query("COMMIT");
    await createNotification(ownerId, "pedido", "Pedido recebido", `Seu pedido #${order.id} está em preparação.`);
    return { ...order, items: orderItems.map((item) => ({ product_id: item.product.id, product_name: item.product.name, quantity: item.quantity, unit_price: item.unitPrice, subtotal: item.subtotal })) };
  } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
}

export async function listOrders(ownerId) {
  const result = await pool.query(`SELECT o.id, o.status, o.total, o.created_at, COALESCE(string_agg(i.product_name, ', ' ORDER BY i.id), '') AS products FROM orders o LEFT JOIN order_items i ON i.order_id = o.id WHERE o.owner_id = $1 GROUP BY o.id ORDER BY o.created_at DESC`, [ownerId]);
  return result.rows;
}

export async function getOrder(ownerId, orderId) {
  const order = await pool.query("SELECT id, status, total, created_at, payment_method, notes FROM orders WHERE id = $1 AND owner_id = $2", [orderId, ownerId]);
  if (!order.rows[0]) return null;
  const items = await pool.query("SELECT product_id, product_name, quantity, unit_price, subtotal FROM order_items WHERE order_id = $1 ORDER BY id", [orderId]);
  return { ...order.rows[0], items: items.rows };
}

export async function cancelOrder(ownerId, orderId) {
  await pool.query("UPDATE orders SET status = 'Cancelado', updated_at = NOW() WHERE id = $1 AND owner_id = $2 AND status IN ('Recebido','Em preparacao')", [orderId, ownerId]);
  await createNotification(ownerId, "pedido", "Pedido cancelado", `O pedido #${orderId} foi cancelado.`);
}
