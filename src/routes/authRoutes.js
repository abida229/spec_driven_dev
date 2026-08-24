const express = require('express');
const authController = require('../controllers/authController');
const validation = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for auth endpoints - stricter limits
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many attempts, please try again later',
      statusCode: 429
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/register', authLimiter, validation.register, authController.register);
router.post('/login', authLimiter, validation.login, authController.login);

module.exports = router;
