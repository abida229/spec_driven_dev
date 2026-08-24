function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return password && password.length >= 8;
}

function validateTodoTitle(title) {
  return title && title.trim().length > 0 && title.length <= 255;
}

function validatePriority(priority) {
  return ['low', 'medium', 'high'].includes(priority);
}

const validation = {
  register(req, res, next) {
    const { email, password } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid email format',
          statusCode: 400
        }
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password must be at least 8 characters',
          statusCode: 400
        }
      });
    }

    next();
  },

  login(req, res, next) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required',
          statusCode: 400
        }
      });
    }

    next();
  },

  createTodo(req, res, next) {
    const { title, priority } = req.body;

    if (!validateTodoTitle(title)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title is required and must be between 1 and 255 characters',
          statusCode: 400
        }
      });
    }

    if (priority && !validatePriority(priority)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Priority must be low, medium, or high',
          statusCode: 400
        }
      });
    }

    next();
  },

  updateTodo(req, res, next) {
    const { title, priority } = req.body;

    if (title !== undefined && !validateTodoTitle(title)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title must be between 1 and 255 characters',
          statusCode: 400
        }
      });
    }

    if (priority !== undefined && !validatePriority(priority)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Priority must be low, medium, or high',
          statusCode: 400
        }
      });
    }

    next();
  }
};

module.exports = validation;
