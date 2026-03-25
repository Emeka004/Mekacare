'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/educationController');
const authenticate = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');

const createRules = [
  body('title').trim().notEmpty(),
  body('content').notEmpty(),
  body('category').isIn(['nutrition','exercise','mental_health','labor_delivery','postpartum','fetal_development','medication_safety','warning_signs','general']),
  body('type').optional().isIn(['article','video','infographic','checklist','faq']),
];

// Public listing and reading
router.get('/',                ctrl.getAll);
router.get('/:idOrSlug',       ctrl.getOne);

// Protected write endpoints
router.use(authenticate);
router.post('/',               authorize('provider', 'admin'), createRules, validate, ctrl.create);
router.post('/:id/like',       ctrl.like);
router.put('/:id',             authorize('provider', 'admin'), ctrl.update);
router.delete('/:id',          authorize('admin'), ctrl.delete);

module.exports = router;
