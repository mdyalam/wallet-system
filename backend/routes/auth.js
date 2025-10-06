const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getCurrentUser } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  body('referralCode')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 6, max: 8 })
    .withMessage('Invalid referral code format')
], register);

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], login);

router.get('/me', auth, getCurrentUser);

module.exports = router;