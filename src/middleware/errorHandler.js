function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Service temporarily unavailable',
        statusCode: 503
      }
    });
  }

  // Database constraint violations
  if (err.code === '23505' || err.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'A resource with that value already exists',
        statusCode: 409
      }
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        statusCode: 400
      }
    });
  }

  // Default server error
  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500
    }
  });
}

module.exports = errorHandler;
