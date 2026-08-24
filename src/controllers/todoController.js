const Todo = require('../models/Todo');

const todoController = {
  async create(req, res, next) {
    try {
      const { title, description, priority } = req.body;
      const userId = req.user.id;

      const todo = await Todo.create(userId, { title, description, priority });

      res.status(201).json(Todo.serialize(todo));
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const userId = req.user.id;
      const { completed, priority, sort, limit, offset } = req.query;

      const filters = {};

      if (completed !== undefined) {
        filters.completed = completed === 'true';
      }

      if (priority) {
        filters.priority = priority;
      }

      if (sort) {
        filters.sort = sort;
      }

      if (limit) {
        filters.limit = parseInt(limit);
      }

      if (offset) {
        filters.offset = parseInt(offset);
      }

      const todos = await Todo.findByUserId(userId, filters);
      const total = await Todo.countByUserId(userId, { completed: filters.completed, priority: filters.priority });

      res.status(200).json({
        todos: todos.map(Todo.serialize),
        total,
        limit: filters.limit || 50,
        offset: filters.offset || 0
      });
    } catch (error) {
      next(error);
    }
  },

  async getOne(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const todo = await Todo.findById(id);

      if (!todo) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Todo not found',
            statusCode: 404
          }
        });
      }

      if (todo.user_id !== userId) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to access this todo',
            statusCode: 403
          }
        });
      }

      res.status(200).json(Todo.serialize(todo));
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updates = req.body;

      const todo = await Todo.findById(id);

      if (!todo) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Todo not found',
            statusCode: 404
          }
        });
      }

      if (todo.user_id !== userId) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to update this todo',
            statusCode: 403
          }
        });
      }

      const updatedTodo = await Todo.update(id, updates);

      res.status(200).json(Todo.serialize(updatedTodo));
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const todo = await Todo.findById(id);

      if (!todo) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Todo not found',
            statusCode: 404
          }
        });
      }

      if (todo.user_id !== userId) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to delete this todo',
            statusCode: 403
          }
        });
      }

      await Todo.delete(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async toggle(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const todo = await Todo.findById(id);

      if (!todo) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Todo not found',
            statusCode: 404
          }
        });
      }

      if (todo.user_id !== userId) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to update this todo',
            statusCode: 403
          }
        });
      }

      const updatedTodo = await Todo.toggle(id);

      res.status(200).json({
        id: updatedTodo.id,
        completed: Todo.serialize(updatedTodo).completed,
        updatedAt: updatedTodo.updated_at
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = todoController;
