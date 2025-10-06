const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const WalletSettings = require('../models/WalletSettings');
const mongoose = require('mongoose');

const getWallet = async (req, res) => {
  try {
    console.log(`Fetching wallet for userId: ${req.user.id}`); // Debugging log
    let wallet = await Wallet.findOne({ userId: req.user.id });
    
    if (!wallet) {
      console.log(`No wallet found. Creating a new one for userId: ${req.user.id}`); // Debugging log
      const newWallet = new Wallet({ userId: req.user.id });
      wallet = await newWallet.save();
      console.log(`Successfully created new wallet with id: ${wallet._id}`); // Debugging log
    }

    res.json({
      success: true,
      wallet
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting wallet',
      error: error.message
    });
  }
};

const getWalletSettings = async (req, res) => {
  try {
    let settings = await WalletSettings.findOne();
    
    if (!settings) {
        console.log('No wallet settings found. Creating new settings document.'); // Debugging log
        const newSettings = new WalletSettings();
        settings = await newSettings.save();
        console.log('Successfully created new wallet settings document.'); // Debugging log
    }

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get wallet settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting wallet settings',
      error: error.message
    });
  }
};

// This function is now updated with better error logging
const getTransactions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      source 
    } = req.query;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const query = { userId: req.user.id };
    
    if (type && ['CREDIT', 'DEBIT'].includes(type)) query.type = type;
    if (source) query.source = source;
    
    console.log('Fetching transactions with query:', query);
    
    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean()
        .exec(),
      Transaction.countDocuments(query)
    ]);

    console.log(`Found ${transactions.length} transactions.`);

    if (!Array.isArray(transactions)) {
      throw new Error('Failed to retrieve transactions');
    }

    // Transform dates to ISO strings for consistent formatting
    const transformedTransactions = transactions.map(t => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString()
    }));

    res.json({
      success: true,
      transactions: transformedTransactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('--- CRASH IN getTransactions ---');
    console.error(error); 
    res.status(500).json({
      success: false,
      message: 'Server error while getting transactions',
      error: error.message
    });
  }
};

const processPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { amount, orderId, useWallet } = req.body;

    if (!useWallet) {
        await session.abortTransaction();
        session.endSession();
        return res.status(200).json({ success: true, message: 'Payment to be processed by other means.' });
    }

    if (!amount || !orderId) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: 'Amount and Order ID are required' });
    }

    const wallet = await Wallet.findOne({ userId: req.user.id }).session(session);
    if (!wallet) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    const settings = await WalletSettings.findOne().session(session) || new WalletSettings();
    const maxSpendAmount = (wallet.balance * settings.maxSpendPercentage) / 100;
    
    if (amount > wallet.balance) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }

    if (amount > maxSpendAmount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Amount exceeds spendable limit of ₹${maxSpendAmount.toFixed(2)} (${settings.maxSpendPercentage}% of balance)`,
      });
    }

    wallet.balance -= amount;
    wallet.totalSpent += amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save({ session });

    const transaction = new Transaction({
      userId: req.user.id,
      walletId: wallet._id,
      type: 'DEBIT',
      amount,
      source: 'PURCHASE',
      description: `Payment for order ${orderId}`,
      referenceId: orderId,
      balanceAfter: wallet.balance,
      metadata: { orderId, paymentMethod: 'wallet' }
    });
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: 'Payment processed successfully',
      wallet,
      transaction
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during payment processing',
      error: error.message
    });
  }
};

const updateWalletSettings = async (req, res) => {
  try {
    const allowedUpdates = ['maxSpendPercentage', 'referralRewardAmount', 'isWalletEnabled', 'minWalletBalance', 'maxDailySpend'];
    const updates = {};

    for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
            updates[key] = req.body[key];
        }
    }

    const settings = await WalletSettings.findOneAndUpdate({}, updates, { new: true, upsert: true });

    res.json({
      success: true,
      message: 'Wallet settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update wallet settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating wallet settings',
      error: error.message
    });
  }
};

module.exports = {
  getWallet,
  getTransactions,
  processPayment,
  getWalletSettings,
  updateWalletSettings
};