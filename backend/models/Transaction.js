const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  type: {
    type: String,
    enum: ['CREDIT', 'DEBIT'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Amount must be greater than 0'],
    get: v => Math.round(v * 100) / 100
  },
  source: {
    type: String,
    enum: ['REFERRAL', 'PURCHASE', 'ADMIN_CREDIT', 'REFUND', 'BONUS'],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  referenceId: {
    type: String,
    default: null
  },
  balanceAfter: {
    type: Number,
    required: true,
    get: v => Math.round(v * 100) / 100
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED'],
    default: 'COMPLETED'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ source: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);