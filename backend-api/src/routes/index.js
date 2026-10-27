const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      service: 'easycater-api',
      db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      uptime: process.uptime(),
    },
  });
});

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/packages', require('./packageRoutes'));
router.use('/menu', require('./menuRoutes'));
router.use('/bookings', require('./bookingRoutes'));
router.use('/payments', require('./paymentRoutes'));
router.use('/notifications', require('./notificationRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.use('/reports', require('./reportRoutes'));

module.exports = router;
