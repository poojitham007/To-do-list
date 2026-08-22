// All raw SQL for the users table lives here.
// Every query is parameterized to prevent SQL injection.

const pool = require('../config/database');

const UserModel = {
    // Create a new user
    async create(name, email, hashedPassword) {
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        return result.insertId;
    },

    // Find a user by email
    async findByEmail(email) {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        return rows[0] || null;
    },

    // Find a user by ID
    async findById(id) {
        const [rows] = await pool.query(
            'SELECT id, name, email, created_at FROM users WHERE id = ?',
            [id]
        );

        return rows[0] || null;
    }
};

module.exports = UserModel;