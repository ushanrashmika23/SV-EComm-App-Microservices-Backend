const pool = require("../config/db");

const createInventory = async ({ id, productId, sku, quantity, reorderLevel }) => {
  const query = `
    INSERT INTO inventories (id, product_id, sku, quantity, reorder_level)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [id, productId, sku || null, quantity, reorderLevel];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getInventoryByProductId = async (productId) => {
  const result = await pool.query(
    `SELECT * FROM inventories WHERE product_id = $1`,
    [productId]
  );
  return result.rows[0];
};

const getAllInventory = async () => {
  const result = await pool.query(
    `SELECT * FROM inventories ORDER BY created_at DESC`
  );
  return result.rows;
};

const updateInventory = async ({ productId, quantity, reorderLevel, sku }) => {
  const result = await pool.query(
    `
      UPDATE inventories
      SET quantity = $1, reorder_level = $2, sku = $3
      WHERE product_id = $4
      RETURNING *;
    `,
    [quantity, reorderLevel, sku || null, productId]
  );

  return result.rows[0];
};

const adjustInventory = async ({ productId, delta }) => {
  const result = await pool.query(
    `
      UPDATE inventories
      SET quantity = quantity + $1
      WHERE product_id = $2
      AND quantity + $1 >= reserved_quantity
      RETURNING *;
    `,
    [delta, productId]
  );

  return result.rows[0];
};

const reserveStock = async ({ productId, quantity }) => {
  const result = await pool.query(
    `
      UPDATE inventories
      SET reserved_quantity = reserved_quantity + $1
      WHERE product_id = $2
      AND quantity - reserved_quantity >= $1
      RETURNING *;
    `,
    [quantity, productId]
  );

  return result.rows[0];
};

const releaseStock = async ({ productId, quantity }) => {
  const result = await pool.query(
    `
      UPDATE inventories
      SET reserved_quantity = reserved_quantity - $1
      WHERE product_id = $2
      AND reserved_quantity >= $1
      RETURNING *;
    `,
    [quantity, productId]
  );

  return result.rows[0];
};

const deductStock = async ({ productId, quantity }) => {
  const result = await pool.query(
    `
      UPDATE inventories
      SET quantity = quantity - $1,
          reserved_quantity = reserved_quantity - $1
      WHERE product_id = $2
      AND reserved_quantity >= $1
      AND quantity >= $1
      RETURNING *;
    `,
    [quantity, productId]
  );

  return result.rows[0];
};

module.exports = {
  createInventory,
  getInventoryByProductId,
  getAllInventory,
  updateInventory,
  adjustInventory,
  reserveStock,
  releaseStock,
  deductStock,
};
