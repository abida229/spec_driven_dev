const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const config = require('../config');

class Database {
  constructor() {
    this.isPostgres = config.databaseUrl.startsWith('postgresql');

    if (this.isPostgres) {
      this.pool = new Pool({
        connectionString: config.databaseUrl
      });
    } else {
      // SQLite for development
      const dbPath = config.databaseUrl.replace('sqlite:', '');
      this.db = new sqlite3.Database(dbPath);
    }
  }

  async query(sql, params = []) {
    if (this.isPostgres) {
      // PostgreSQL uses $1, $2, etc.
      const client = await this.pool.connect();
      try {
        const result = await client.query(sql, params);
        return result.rows;
      } finally {
        client.release();
      }
    } else {
      // SQLite uses ?, ?, etc.
      return new Promise((resolve, reject) => {
        this.db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    }
  }

  async run(sql, params = []) {
    if (this.isPostgres) {
      const client = await this.pool.connect();
      try {
        const result = await client.query(sql, params);
        return result;
      } finally {
        client.release();
      }
    } else {
      return new Promise((resolve, reject) => {
        this.db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    }
  }

  async get(sql, params = []) {
    if (this.isPostgres) {
      const result = await this.query(sql, params);
      return result[0] || null;
    } else {
      return new Promise((resolve, reject) => {
        this.db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        });
      });
    }
  }

  async close() {
    if (this.isPostgres) {
      await this.pool.end();
    } else {
      return new Promise((resolve, reject) => {
        this.db.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }
}

module.exports = new Database();
