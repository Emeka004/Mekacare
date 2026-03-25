'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/riskController');
const authenticate = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');

router.use(authenticate);

const createRules = [
  body('category').isIn(['bleeding','hypertension','gestational_diabetes','preeclampsia','preterm_labor','infection','fetal_movement','other']),
  body('severity').isIn(['low','moderate','high','critical']),
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
];

router.post('/',               createRules, validate, ctrl.create);
router.get('/',                ctrl.getAll);
router.get('/:id',             ctrl.getById);
router.put('/:id',             ctrl.update);
router.patch('/:id/review',
  authorize('provider', 'admin'),
  body('status').isIn(['under_review','resolved','escalated']),
  validate,
  ctrl.review,
);
router.delete('/:id',          authorize('admin'), ctrl.delete);

module.exports = router;
