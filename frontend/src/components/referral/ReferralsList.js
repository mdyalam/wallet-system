import React from 'react';
import { Users } from 'lucide-react';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import ReferralItem from './ReferralItem';
import { useWallet } from '../../context/WalletContext';

const ReferralsList = () => {
  const { referrals, loading } = useWallet();

  if (loading) {
    return (
      <Card>
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  return (
    <Card padding={false}>
      {/* Enhanced Header Section - Styled like the Transaction History header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-teal-500 to-emerald-500 opacity-60
 rounded-t-lg"></div>
        <div className="relative flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/40">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Your Referrals</h3>
              <p className="text-sm text-gray-500">Invite friends and earn rewards</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-6">
        {referrals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-gray-400" />
            </div>
            <h4 className="text-gray-700 text-xl font-semibold mb-2">No referrals yet</h4>
            <p className="text-gray-500 text-sm">Share your code to start earning rewards!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((referral, index) => (
              <div
                key={referral._id}
                className="transform transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-indigo-300/50"
                style={{
                  animation: `slideInUp 0.4s ease-out ${index * 50}ms both`,
                  animationDelay: `${index * 50}ms`
                }}
              >
                <ReferralItem referral={referral} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Card>
  );
};

export default ReferralsList;