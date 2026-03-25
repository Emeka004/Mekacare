'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/providerController');
const authenticate = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

// Public search
router.get('/',    ctrl.getAll);
router.get('/:id', ctrl.getById);

// Protected
router.use(authenticate);
router.post('/profile',         authorize('provider'),         ctrl.createProfile);
router.put('/profile',          authorize('provider'),         ctrl.updateProfile);
router.get('/dashboard',        authorize('provider', 'admin'), ctrl.getDashboard);
router.get('/:id/patients',     authorize('provider', 'admin'), ctrl.getPatients);

module.exports = router;
