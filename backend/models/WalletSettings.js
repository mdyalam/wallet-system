const mongoose = require('mongoose');

const walletSettingsSchema = new mongoose.Schema({
  maxSpendPercentage: {
    type: Number,
    default: 80,
    min: [0, 'Max spend percentage cannot be negative'],
    max: [100, 'Max spend percentage cannot exceed 100']
  },
  referralRewardAmount: {
    type: Number,
    default: 500,
    min: [0, 'Referral reward amount cannot be negative'],
    get: v => Math.round(v * 100) / 100
  },
  isWalletEnabled: {
    type: Boolean,
    default: true
  },
  minWalletBalance: {
    type: Number,
    default: 0,
    min: [0, 'Minimum wallet balance cannot be negative'],
    get: v => Math.round(v * 100) / 100
  },
  maxDailySpend: {
    type: Number,
    default: 10000,
    min: [0, 'Max daily spend cannot be negative'],
    get: v => Math.round(v * 100) / 100
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Ensure only one settings document exists
walletSettingsSchema.statics.getSingleton = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};


module.exports = mongoose.model('WalletSettings', walletSettingsSchema);