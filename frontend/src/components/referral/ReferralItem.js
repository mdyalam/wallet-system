import React, { useState } from 'react';
import { CheckCircle, Clock, Gift } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast'; // Import toast

const ReferralItem = ({ referral, style }) => {
  const { completeReferral } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (dateString) => {
    // Using try-catch to handle potential invalid date strings
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // This function is now updated to handle the response
  const handleComplete = async () => {
    setIsLoading(true);
    const result = await completeReferral(referral._id);
    // If the result was not successful, show an error toast
    if (!result.success) {
      toast.error(result.message || 'Failed to complete referral.');
    }
    setIsLoading(false);
  };

  const getStatusConfig = (status) => {
    const configs = {
      'COMPLETED': { color: 'text-green-600 bg-green-100', icon: <CheckCircle className="h-4 w-4" />, label: 'Completed' },
      'PENDING': { color: 'text-yellow-600 bg-yellow-100', icon: <Clock className="h-4 w-4" />, label: 'Pending' },
    };
    return configs[status] || configs['PENDING'];
  };

  const statusConfig = getStatusConfig(referral.status);

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-lg animate-slide-up" style={style}>
      <div className="flex items-center space-x-4">
        <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
          {referral.refereeId.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-gray-900">{referral.refereeId.name}</p>
          <p className="text-sm text-gray-500">{referral.refereeId.email}</p>
          <p className="text-xs text-gray-400">Referred on {formatDate(referral.createdAt)}</p>
        </div>
      </div>
      <div className="text-right">
        <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
          {statusConfig.icon}<span>{statusConfig.label}</span>
        </div>
        {referral.status === 'PENDING' && (
          <button onClick={handleComplete} disabled={isLoading} className="mt-2 text-xs text-white bg-primary-500 hover:bg-primary-600 rounded-full px-3 py-1 flex items-center justify-center disabled:opacity-50 min-w-[130px]">
            {isLoading ? <LoadingSpinner size="sm" /> : <><Gift className="h-3 w-3 mr-1" /><span>Complete & Reward</span></>}
          </button>
        )}
        {referral.status === 'COMPLETED' && (
          <div className="text-green-600 font-semibold text-sm mt-1">
            +₹{referral.rewardAmount.toLocaleString('en-IN')}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralItem;