import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import { useWallet } from '../../context/WalletContext';
import { useApiCall } from '../../hooks/useApiCall';
import toast from 'react-hot-toast';

const PaymentComponent = () => {
  const { wallet, settings, processPayment, loading } = useWallet();
  const [amount, setAmount] = useState('');
  const [orderId, setOrderId] = useState('');
  const [useWalletBalance, setUseWalletBalance] = useState(true);
  const [applyCoupon, setApplyCoupon] = useState(false);
  const [processing, setProcessing] = useState(false);

  const maxSpendAmount =
    wallet && settings ? (wallet.balance * settings.maxSpendPercentage) / 100 : 0;

  const canUseWallet =
    wallet && settings && wallet.balance > 0 && parseFloat(amount || 0) <= maxSpendAmount;

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0 || !orderId) {
      toast.error('Please enter valid amount and order ID');
      return;
    }
    if (!wallet || !settings) {
      toast.error('Wallet data not available');
      return;
    }

    setProcessing(true);
    try {
      const result = await processPayment({
        amount: parseFloat(amount),
        orderId,
        useWallet: useWalletBalance
      });

      if (result.success) {
        toast.success('Payment processed successfully!');
        setAmount('');
        setOrderId('');
        setUseWalletBalance(true);
        setApplyCoupon(false);
      } else {
        toast.error(result.message || 'Payment failed');
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !wallet || !settings) {
    return <Card><div className="flex justify-center py-12"><LoadingSpinner /></div></Card>;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Make Payment</h3>
      
      <form onSubmit={handlePayment} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter amount"
              min="0.01"
              step="0.01"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order ID
          </label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter order ID"
            required
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center">
            <input
              id="useWallet"
              type="checkbox"
              checked={useWalletBalance}
              onChange={(e) => {
                setUseWalletBalance(e.target.checked);
                if (e.target.checked) setApplyCoupon(false);
              }}
              disabled={!canUseWallet}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="useWallet" className="ml-3 text-sm text-gray-700">
              Pay with Wallet Balance
              {wallet && (
                <span className="text-gray-500 ml-1">
                  (Available: ₹{maxSpendAmount.toLocaleString()})
                </span>
              )}
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="applyCoupon"
              type="checkbox"
              checked={applyCoupon}
              onChange={(e) => {
                setApplyCoupon(e.target.checked);
                if (e.target.checked) setUseWalletBalance(false);
              }}
              disabled={useWalletBalance}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
            />
            <label htmlFor="applyCoupon" className="ml-3 text-sm text-gray-700">
              Apply Coupon
              {useWalletBalance && (
                <span className="text-red-500 ml-1 text-xs">
                  (Not available with wallet payment)
                </span>
              )}
            </label>
          </div>
        </div>

        {useWalletBalance && amount && parseFloat(amount) > maxSpendAmount && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">
                Amount exceeds wallet spending limit of ₹{maxSpendAmount.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={
            !amount || 
            parseFloat(amount) <= 0 || 
            !orderId || 
            processing || 
            (useWalletBalance && parseFloat(amount) > maxSpendAmount)
          }
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Pay ₹{parseFloat(amount || 0).toLocaleString()}</span>
            </div>
          )}
        </button>
      </form>
    </Card>
  );
};

export default PaymentComponent;