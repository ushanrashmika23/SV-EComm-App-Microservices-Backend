const pool = require("../config/db");

exports.createProduct = async (data) => {
    const query = `
    INSERT INTO products (id, name, description, price, category_id, image_url)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *;
    `;

    const values = [
        data.id,
        data.name,
        data.description,
        data.price,
        data.category_id,
        data.image_url
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

exports.getProducts = async (limit, offset) => {
    const result = await pool.query(
        `SELECT * FROM products ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
    );

    return result.rows;
};

exports.getProductById = async (id) => {
    const result = await pool.query(
        `SELECT * FROM products WHERE id=$1`,
        [id]
    );

    return result.rows[0];
};

exports.deleteProduct = async (id) => {
    await pool.query(`DELETE FROM products WHERE id=$1`, [id]);
};

exports.updateProduct = async (id, data) => {
    const query = `
    UPDATE products
    SET name=$1, description=$2, price=$3, category=$4, image_url=$5
    WHERE id=$6
    RETURNING *;
    `;

    const values = [
        data.name,
        data.description,
        data.price,
        data.category,
        data.image_url,
        id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

exports.getProductsByCategory = async (category) => {
    const result = await pool.query(
        `SELECT * FROM products WHERE category=$1 ORDER BY created_at DESC`,
        [category]
    );

    return result.rows;
};