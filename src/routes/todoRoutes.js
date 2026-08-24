const express = require('express');
const todoController = require('../controllers/todoController');
const authenticate = require('../middleware/authenticate');
const validation = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', validation.createTodo, todoController.create);
router.get('/', todoController.getAll);
router.get('/:id', todoController.getOne);
router.patch('/:id', validation.updateTodo, todoController.update);
router.delete('/:id', todoController.delete);
router.post('/:id/toggle', todoController.toggle);

module.exports = router;
