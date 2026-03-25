'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/vitalController');
const authenticate = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

router.use(authenticate);

router.post('/',          ctrl.create);
router.get('/',           ctrl.getAll);
router.get('/latest',     ctrl.getLatest);
router.get('/trends',     ctrl.getTrends);
router.get('/:id',        ctrl.getById);
router.put('/:id',        authorize('provider', 'admin'), ctrl.update);
router.delete('/:id',     authorize('admin'), ctrl.delete);

module.exports = router;
