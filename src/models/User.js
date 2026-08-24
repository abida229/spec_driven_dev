const bcrypt = require('bcrypt');
const db = require('../db/database');
const config = require('../config');

class User {
  static async create(email, password) {
    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

    if (db.isPostgres) {
      const result = await db.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
        [email, passwordHash]
      );
      return result[0];
    } else {
      const result = await db.run(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        [email, passwordHash]
      );
      return await User.findById(result.lastID);
    }
  }

  static async findByEmail(email) {
    if (db.isPostgres) {
      return await db.get('SELECT * FROM users WHERE email = $1', [email]);
    } else {
      return await db.get('SELECT * FROM users WHERE email = ?', [email]);
    }
  }

  static async findById(id) {
    if (db.isPostgres) {
      return await db.get('SELECT * FROM users WHERE id = $1', [id]);
    } else {
      return await db.get('SELECT * FROM users WHERE id = ?', [id]);
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static sanitize(user) {
    if (!user) return null;
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }
}

module.exports = User;
