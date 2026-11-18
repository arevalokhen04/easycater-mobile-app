const express = require('express');
const ctrl = require('../controllers/menuController');
const { authenticate } = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');

const router = express.Router();

router.get('/', ctrl.list);
router.get('/categories', ctrl.categories);
router.get('/:id', ctrl.getOne);

router.post('/', authenticate, requireAdmin, ctrl.create);
router.put('/:id', authenticate, requireAdmin, ctrl.update);
router.delete('/:id', authenticate, requireAdmin, ctrl.remove);

module.exports = router;
