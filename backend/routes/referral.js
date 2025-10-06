const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { param, validationResult } = require('express-validator');
const {
  getReferrals,
  completeReferral,
  getReferralCode
} = require('../controllers/referralController');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

router.get('/', auth, getReferrals);

router.get('/code', auth, getReferralCode);

router.put('/:referralId/complete', [
  auth,
  param('referralId').isMongoId().withMessage('Invalid referral ID format')
], handleValidation, completeReferral);

module.exports = router;