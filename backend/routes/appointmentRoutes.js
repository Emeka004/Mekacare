'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/appointmentController');
const authenticate = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');

router.use(authenticate);

const createRules = [
  body('providerId').isUUID(),
  body('scheduledAt').isISO8601(),
  body('type').isIn(['prenatal_checkup', 'ultrasound', 'blood_test', 'consultation', 'emergency', 'postpartum', 'virtual']),
];

router.post('/',                   createRules, validate, ctrl.create);
router.get('/',                    ctrl.getAll);
router.get('/:id',                 ctrl.getById);
router.put('/:id',                 ctrl.update);
router.patch('/:id/status',
  body('status').isIn(['confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
  validate,
  ctrl.updateStatus,
);
router.delete('/:id',              authorize('admin'), ctrl.delete);

module.exports = router;
