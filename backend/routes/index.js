'use strict';

const router = require('express').Router();

router.use('/auth',          require('./authRoutes'));
router.use('/users',         require('./userRoutes'));
router.use('/pregnancy-profiles', require('./pregnancyRoutes'));
router.use('/providers',     require('./providerRoutes'));
router.use('/appointments',  require('./appointmentRoutes'));
router.use('/risks',         require('./riskRoutes'));
router.use('/vitals',        require('./vitalRoutes'));
router.use('/education',     require('./educationRoutes'));
router.use('/notifications', require('./notificationRoutes'));

module.exports = router;
