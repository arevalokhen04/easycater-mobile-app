const express = require('express');
const ctrl = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');

const router = express.Router();

router.use(authenticate);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', authenticate, requireAdmin, ctrl.updateStatus);

module.exports = router;
