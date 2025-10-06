import React, { useState } from 'react';
import { Copy, Share2, Gift } from 'lucide-react';
import Card from '../common/Card';
import { useWallet } from '../../context/WalletContext';
import toast from 'react-hot-toast';

const ReferralCard = () => {
  const { referralCode, referralStats } = useWallet();
  const [copied, setCopied] = useState(false);

  const copyReferralCode = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  const shareReferral = async () => {
    if (!referralCode) return;
    const referralUrl = `${window.location.origin}/register?ref=${referralCode}`;
    const shareData = {
      title: 'Join me on MyWallet App!',
      text: `Use my referral code ${referralCode} to get amazing rewards!`,
      url: referralUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(referralUrl);
        toast.success('Referral link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <Card className="animate-fade-in" padding={false}>
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-teal-500 to-emerald-500 opacity-60 rounded-t-lg"></div>
        <div className="relative flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/40">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Refer & Earn</h3>
              <p className="text-sm text-gray-500">Earn rewards for each successful referral</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Your Referral Code</span>
            <div className="flex space-x-3">
              <button onClick={copyReferralCode} className="flex items-center space-x-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
                <Copy className="h-4 w-4" /><span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button onClick={shareReferral} className="flex items-center space-x-1.5 text-sm text-green-600 hover:text-green-700 font-medium transition-colors">
                <Share2 className="h-4 w-4" /><span>Share</span>
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border-2 border-dashed border-gray-300 text-center">
            <code className="text-2xl font-bold text-gray-900 tracking-wider">{referralCode || '...'}</code>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-100 rounded-lg border border-gray-200"><div className="text-2xl font-bold text-gray-900">{referralStats?.total || 0}</div><div className="text-xs text-gray-500 uppercase tracking-wider">Total</div></div>
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200"><div className="text-2xl font-bold text-green-600">{referralStats?.completed || 0}</div><div className="text-xs text-green-800/70 uppercase tracking-wider">Successful</div></div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200"><div className="text-2xl font-bold text-blue-600">₹{(referralStats?.totalEarnings || 0).toLocaleString('en-IN')}</div><div className="text-xs text-blue-800/70 uppercase tracking-wider">Earned</div></div>
        </div>
      </div>
    </Card>
  );
};

export default ReferralCard;