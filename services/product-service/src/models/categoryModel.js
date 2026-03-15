const pool = require('../config/db');

exports.createCategory = async (data) => {
    const query = `
    INSERT INTO categories ( name, description)
    VALUES ($1,$2)
    RETURNING *;
    `;

    const values = [
        data.name,
        data.description
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

exports.getCategories = async () => {
    const result = await pool.query(
        `SELECT * FROM categories ORDER BY created_at DESC`
    );

    return result.rows;
};

exports.getCategoryById = async (id) => {
    const result = await pool.query(
        `SELECT * FROM categories WHERE id=$1`,
        [id]
    );

    return result.rows[0];
};

exports.deleteCategory = async (id) => {
    await pool.query(`DELETE FROM categories WHERE id=$1`, [id]);
};