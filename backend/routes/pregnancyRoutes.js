'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/pregnancyController');
const authenticate = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

router.use(authenticate);

router.post('/',          authorize('patient', 'admin'), ctrl.create);
router.get('/me',         authorize('patient'),          ctrl.getMyProfile);
router.get('/',           authorize('provider', 'admin'), ctrl.getAll);
router.get('/:id',        ctrl.getById);
router.get('/:id/summary', ctrl.getSummary);
router.put('/:id',        ctrl.update);

module.exports = router;
