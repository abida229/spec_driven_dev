const db = require('../db/database');

class Todo {
  static async create(userId, { title, description, priority = 'medium' }) {
    const now = new Date().toISOString();

    if (db.isPostgres) {
      const result = await db.query(
        `INSERT INTO todos (user_id, title, description, priority, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [userId, title, description, priority, now, now]
      );
      return result[0];
    } else {
      const result = await db.run(
        `INSERT INTO todos (user_id, title, description, priority, completed, created_at, updated_at)
         VALUES (?, ?, ?, ?, 0, ?, ?)`,
        [userId, title, description, priority, now, now]
      );
      return await Todo.findById(result.lastID);
    }
  }

  static async findById(id) {
    if (db.isPostgres) {
      return await db.get('SELECT * FROM todos WHERE id = $1', [id]);
    } else {
      return await db.get('SELECT * FROM todos WHERE id = ?', [id]);
    }
  }

  static async findByUserId(userId, filters = {}) {
    let sql = 'SELECT * FROM todos WHERE user_id = ';
    let params = [];

    if (db.isPostgres) {
      sql += '$1';
      params.push(userId);

      // Apply filters
      if (filters.completed !== undefined) {
        params.push(filters.completed);
        sql += ` AND completed = $${params.length}`;
      }

      if (filters.priority) {
        params.push(filters.priority);
        sql += ` AND priority = $${params.length}`;
      }

      // Sorting
      const sortField = filters.sort?.replace(/^-/, '') || 'created_at';
      const sortOrder = filters.sort?.startsWith('-') ? 'ASC' : 'DESC';
      sql += ` ORDER BY ${sortField} ${sortOrder}`;

      // Pagination
      const limit = Math.min(filters.limit || 50, 100);
      const offset = filters.offset || 0;
      params.push(limit, offset);
      sql += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    } else {
      sql += '?';
      params.push(userId);

      // Apply filters
      if (filters.completed !== undefined) {
        params.push(filters.completed ? 1 : 0);
        sql += ` AND completed = ?`;
      }

      if (filters.priority) {
        params.push(filters.priority);
        sql += ` AND priority = ?`;
      }

      // Sorting
      const sortField = filters.sort?.replace(/^-/, '') || 'created_at';
      const sortOrder = filters.sort?.startsWith('-') ? 'ASC' : 'DESC';
      sql += ` ORDER BY ${sortField} ${sortOrder}`;

      // Pagination
      const limit = Math.min(filters.limit || 50, 100);
      const offset = filters.offset || 0;
      sql += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

    return await db.query(sql, params);
  }

  static async countByUserId(userId, filters = {}) {
    let sql = 'SELECT COUNT(*) as total FROM todos WHERE user_id = ';
    let params = [];

    if (db.isPostgres) {
      sql += '$1';
      params.push(userId);

      if (filters.completed !== undefined) {
        params.push(filters.completed);
        sql += ` AND completed = $${params.length}`;
      }

      if (filters.priority) {
        params.push(filters.priority);
        sql += ` AND priority = $${params.length}`;
      }
    } else {
      sql += '?';
      params.push(userId);

      if (filters.completed !== undefined) {
        params.push(filters.completed ? 1 : 0);
        sql += ` AND completed = ?`;
      }

      if (filters.priority) {
        params.push(filters.priority);
        sql += ` AND priority = ?`;
      }
    }

    const result = await db.get(sql, params);
    return result.total;
  }

  static async update(id, updates) {
    const now = new Date().toISOString();
    const allowedFields = ['title', 'description', 'completed', 'priority'];
    const fields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(key);
        values.push(updates[key]);
      }
    });

    if (fields.length === 0) {
      return null;
    }

    fields.push('updated_at');
    values.push(now);

    if (db.isPostgres) {
      const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
      values.push(id);
      const result = await db.query(
        `UPDATE todos SET ${setClause} WHERE id = $${values.length} RETURNING *`,
        values
      );
      return result[0];
    } else {
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      values.push(id);
      await db.run(`UPDATE todos SET ${setClause} WHERE id = ?`, values);
      return await Todo.findById(id);
    }
  }

  static async delete(id) {
    if (db.isPostgres) {
      const result = await db.run('DELETE FROM todos WHERE id = $1', [id]);
      return result.rowCount > 0;
    } else {
      const result = await db.run('DELETE FROM todos WHERE id = ?', [id]);
      return result.changes > 0;
    }
  }

  static async toggle(id) {
    if (db.isPostgres) {
      const result = await db.query(
        `UPDATE todos SET completed = NOT completed, updated_at = $1 WHERE id = $2 RETURNING *`,
        [new Date().toISOString(), id]
      );
      return result[0];
    } else {
      const todo = await Todo.findById(id);
      if (!todo) return null;
      return await Todo.update(id, { completed: !todo.completed });
    }
  }

  static serialize(todo) {
    if (!todo) return null;

    return {
      id: todo.id,
      userId: todo.user_id,
      title: todo.title,
      description: todo.description,
      completed: db.isPostgres ? todo.completed : Boolean(todo.completed),
      priority: todo.priority,
      createdAt: todo.created_at,
      updatedAt: todo.updated_at
    };
  }
}

module.exports = Todo;
