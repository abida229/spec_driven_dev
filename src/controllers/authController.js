const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

const authController = {
  async register(req, res, next) {
    try {
      const { email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: {
            code: 'CONFLICT',
            message: 'Email already exists',
            statusCode: 409
          }
        });
      }

      // Create user
      const user = await User.create(email, password);

      // Generate token
      const token = jwt.sign(
        { userId: user.id },
        config.jwt.secret,
        { expiresIn: config.jwt.expiration }
      );

      res.status(201).json({
        userId: user.id,
        email: user.email,
        token
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid credentials',
            statusCode: 401
          }
        });
      }

      // Verify password
      const isValid = await User.verifyPassword(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid credentials',
            statusCode: 401
          }
        });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user.id },
        config.jwt.secret,
        { expiresIn: config.jwt.expiration }
      );

      res.status(200).json({
        userId: user.id,
        email: user.email,
        token
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
