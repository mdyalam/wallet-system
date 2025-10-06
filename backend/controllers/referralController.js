const Referral = require('../models/Referral');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const WalletSettings = require('../models/WalletSettings');
const mongoose = require('mongoose');

const getReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find({ referrerId: req.user.id })
      .populate('refereeId', 'name email createdAt')
      .sort({ createdAt: -1 });

    const stats = await Referral.aggregate([
      // This line has been fixed by adding the 'new' keyword
      { $match: { referrerId: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
          },
          totalEarnings: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, '$rewardAmount', 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      referrals,
      stats: stats[0] || { total: 0, completed: 0, totalEarnings: 0 }
    });
  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// --- The rest of the functions remain the same ---

const completeReferral = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { referralId } = req.params;

    const referral = await Referral.findById(referralId).session(session);
    if (!referral) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Referral not found' });
    }

    if (referral.referrerId.toString() !== req.user.id.toString()) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ success: false, message: 'You are not authorized to complete this referral' });
    }

    if (referral.status === 'COMPLETED') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Referral already completed' });
    }

    const settings = await WalletSettings.findOne().session(session) || new WalletSettings();
    const rewardAmount = settings.referralRewardAmount;

    const wallet = await Wallet.findOne({ userId: referral.referrerId }).session(session);
    if (!wallet) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: "Referrer's wallet not found" });
    }

    wallet.balance += rewardAmount;
    wallet.totalEarned += rewardAmount;
    wallet.lastTransactionAt = new Date();
    await wallet.save({ session });

    const transaction = new Transaction({
      userId: referral.referrerId,
      walletId: wallet._id,
      type: 'CREDIT',
      amount: rewardAmount,
      source: 'REFERRAL',
      description: `Referral reward for inviting user`,
      referenceId: referral.refereeId.toString(),
      balanceAfter: wallet.balance,
      metadata: { referralId: referral._id, refereeId: referral.refereeId }
    });
    await transaction.save({ session });

    referral.status = 'COMPLETED';
    referral.isRewarded = true;
    referral.completedAt = new Date();
    referral.rewardAmount = rewardAmount;
    await referral.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: 'Referral completed and reward credited',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Complete referral error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const getReferralCode = async (req, res) => {
  try {
    res.json({
      success: true,
      referralCode: req.user.referralCode,
    });
  } catch (error) {
    console.error('Get referral code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getReferrals,
  completeReferral,
  getReferralCode
};