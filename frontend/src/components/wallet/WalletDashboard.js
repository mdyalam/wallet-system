import React, { useState } from 'react';
import { CreditCard, Gift, Settings } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import WalletBalanceCard from './WalletBalanceCard';
import TransactionsList from './TransactionsList';
import ReferralCard from '../referral/ReferralCard';
import ReferralsList from '../referral/ReferralsList';
import PaymentComponent from '../payment/PaymentComponent';

const WalletDashboard = () => {
  const [activeTab, setActiveTab] = useState('wallet');

  const tabs = [
    { id: 'wallet', name: 'Wallet', icon: CreditCard },
    { id: 'referrals', name: 'Referrals', icon: Gift },
    { id: 'payment', name: 'Payment', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-300 to-purple-400 rounded-2xl py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Wallet & Referrals</h1>
          <p className="text-gray-600 mt-2">
            Manage your wallet balance and referral earnings
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white rounded-lg p-1 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            <WalletBalanceCard />
            <TransactionsList />
          </div>
        )}

        {activeTab === 'referrals' && (
          <div className="space-y-6">
            <ReferralCard />
            <ReferralsList />
          </div>
        )}

        {activeTab === 'payment' && (
          <div>
            <PaymentComponent />
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletDashboard;
