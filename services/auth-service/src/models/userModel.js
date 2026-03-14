const db = require("../config/db");

const createUser = async (email, password, name) => {
    const query = `
    INSERT INTO users (email, password, name)
    VALUES ($1, $2, $3)
    RETURNING id, email, role, name
    `;

    const result = await db.query(query, [email, password, name]);
    return result.rows[0];
};

const findUserByEmail = async (email) => {
    const query = `SELECT * FROM users WHERE email = $1`;

    const result = await db.query(query, [email]);
    return result.rows[0];
};

const updateUserToken = async (userId, token) => {
    const query = `
    UPDATE users
    SET token = $1
    WHERE id = $2
    `;

    await db.query(query, [token, userId]);
};

module.exports = {
    createUser,
    findUserByEmail,
    updateUserToken,
};