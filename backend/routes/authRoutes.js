'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

const registerRules = [
  body('firstName').trim().notEmpty().withMessage('First name required'),
  body('lastName').trim().notEmpty().withMessage('Last name required'),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['patient', 'provider']),
];

router.post('/register',         registerRules, validate, authLimiter, ctrl.register);
router.post('/login',            loginRules,    validate, authLimiter, ctrl.login);
router.post('/refresh',          ctrl.refresh);
router.post('/logout',           authenticate,  ctrl.logout);
router.post('/forgot-password',  authLimiter,   body('email').isEmail(), validate, ctrl.forgotPassword);
router.post('/reset-password',
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
  validate,
  ctrl.resetPassword,
);
router.get('/me', authenticate, ctrl.getMe);

module.exports = router;
