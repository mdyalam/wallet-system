const mongoose = require('mongoose');

const safeRound = (value) => Math.round((Number(value) || 0) * 100) / 100;

const referralSchema = new mongoose.Schema({
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  refereeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  referralCode: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'EXPIRED'],
    default: 'PENDING'
  },
  rewardAmount: {
    type: Number,
    default: 500,
    get: safeRound
  },
  isRewarded: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

referralSchema.index({ referrerId: 1 });
referralSchema.index({ referralCode: 1 });

module.exports = mongoose.model('Referral', referralSchema);