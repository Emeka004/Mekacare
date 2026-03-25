'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const { authorize, authorizeOrOwn } = require('../middleware/authorize');
const validate = require('../middleware/validate');

router.use(authenticate);

router.get('/',        authorize('admin'), ctrl.getAll);
router.get('/stats',   authorize('admin', 'provider'), ctrl.getStats);
router.get('/:id',     authorizeOrOwn('admin'), ctrl.getById);
router.put('/:id',     authorizeOrOwn('admin'), ctrl.update);
router.put('/:id/password',
  authorizeOrOwn('admin'),
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
  validate,
  ctrl.changePassword,
);
router.delete('/:id',  authorize('admin'), ctrl.deactivate);

module.exports = router;
