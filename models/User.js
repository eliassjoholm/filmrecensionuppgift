const bcrypt = require('bcrypt');
const db = require('../db');

const SALT_ROUNDS = 10; // how much work bcrypt does: higher = slower to crack

class User {
  constructor({ id, email, created_at }) {
    this.id = id;
    this.email = email;
    this.createdAt = created_at;
    // password_hash is deliberately NOT put on the object,
    // so it can never end up in a JSON response by mistake
  }

  static async create(email, password) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await db.query(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, passwordHash]
    );
    return new User({ id: result.insertId, email });
  }

  // Returns the user if email + password are correct, otherwise null
  static async verifyLogin(email, password) {
    const [rows] = await db.query(
      'SELECT id, email, password_hash, created_at FROM users WHERE email = ?',
      [email]
    );
    if (rows.length === 0) return null;
    const match = await bcrypt.compare(password, rows[0].password_hash);
    return match ? new User(rows[0]) : null;
  }
}

module.exports = User;