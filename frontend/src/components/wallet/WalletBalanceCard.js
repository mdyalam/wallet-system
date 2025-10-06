import React, { useState } from 'react';
import { CreditCard, Eye, EyeOff } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';

const WalletBalanceCard = () => {
  const { wallet, settings, loading } = useWallet();
  const [showBalance, setShowBalance] = useState(true);

  if (loading || !wallet) return <LoadingSpinner />;

  const maxSpendAmount = settings ? (wallet.balance * settings.maxSpendPercentage) / 100 : wallet.balance;

  return (
    <Card gradient className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/20 rounded-xl">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Wallet Balance</h2>
            <p className="text-blue-100 text-sm">Available for spending</p>
          </div>
        </div>
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
        >
          {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      
      <div className="mb-4">
        <div className="text-3xl font-bold mb-2">
          {showBalance ? `₹${wallet.balance.toLocaleString()}` : '₹••••'}
        </div>
        <div className="text-blue-100 text-sm">
          Max spendable: {showBalance ? `₹${maxSpendAmount.toLocaleString()}` : '₹••••'}
          {settings && ` (${settings.maxSpendPercentage}% limit)`}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-blue-100 text-xs mb-1">Total Earned</div>
          <div className="text-lg font-semibold">
            {showBalance ? `₹${wallet.totalEarned?.toLocaleString() || '0'}` : '₹••••'}
          </div>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-blue-100 text-xs mb-1">Total Spent</div>
          <div className="text-lg font-semibold">
            {showBalance ? `₹${wallet.totalSpent?.toLocaleString() || '0'}` : '₹••••'}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WalletBalanceCard;