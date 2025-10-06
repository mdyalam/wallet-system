const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Referral = require('../models/Referral');
const WalletSettings = require('../models/WalletSettings');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, password, referralCode } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = new User({ name, email, password });

    let referrer = null;
    if (referralCode) {
      referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (referrer) {
        user.referredBy = referrer._id;
      }
    }

    await user.save();

    const wallet = new Wallet({ userId: user._id });
    await wallet.save();

    if (referrer) {
        const settings = await WalletSettings.getSingleton();
        const referral = new Referral({
            referrerId: referrer._id,
            refereeId: user._id,
            referralCode: referralCode.toUpperCase(),
            rewardAmount: settings.referralRewardAmount
        });
        await referral.save();
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials or user is inactive'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);
    const userObject = user.toObject();
    delete userObject.password;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userObject
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

const getCurrentUser = async (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
};

module.exports = {
  register,
  login,
  getCurrentUser
};