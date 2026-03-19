const categoryController = require('../controllers/categoryController');
const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middlewares/authMiddleware');

router.post('/', authorizeRoles(['admin']), categoryController.createCategory);
router.get('/', authorizeRoles([], { allowVisitor: true }), categoryController.getCategories);
router.get('/:id', authorizeRoles([], { allowVisitor: true }), categoryController.getCategoryById);
router.delete('/:id', authorizeRoles(['admin']), categoryController.deleteCategory);

module.exports = router;