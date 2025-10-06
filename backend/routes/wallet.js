const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const { body, query, validationResult } = require('express-validator');
const {
  getWallet,
  getTransactions,
  processPayment,
  getWalletSettings,
  updateWalletSettings
} = require('../controllers/walletController');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

router.get('/', auth, getWallet);

router.get('/transactions', [
  auth,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['CREDIT', 'DEBIT']),
  query('source').optional().isIn(['REFERRAL', 'PURCHASE', 'ADMIN_CREDIT', 'REFUND', 'BONUS'])
], handleValidation, getTransactions);

router.post('/pay', [
  auth,
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('orderId').notEmpty().isString().trim().withMessage('Order ID is required'),
  body('useWallet').isBoolean().withMessage('useWallet flag must be a boolean')
], handleValidation, processPayment);

router.get('/settings', auth, getWalletSettings);

router.put('/settings', auth, adminAuth, [
  body('maxSpendPercentage').optional().isFloat({ min: 0, max: 100 }),
  body('referralRewardAmount').optional().isFloat({ min: 0 }),
  body('isWalletEnabled').optional().isBoolean(),
  body('minWalletBalance').optional().isFloat({ min: 0 }),
  body('maxDailySpend').optional().isFloat({ min: 0 })
], handleValidation, updateWalletSettings);

module.exports = router;