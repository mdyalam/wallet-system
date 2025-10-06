import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [referralStats, setReferralStats] = useState({});
  const [settings, setSettings] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [transactionLoading, setTransactionLoading] = useState(false);

  const fetchAllData = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [walletRes, transactionsRes, referralsRes, settingsRes, codeRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/transactions'),
        api.get('/referral'),
        api.get('/wallet/settings'),
        api.get('/referral/code')
      ]);
      
      if (walletRes.data.success) setWallet(walletRes.data.wallet);
      if (transactionsRes.data.success) setTransactions(transactionsRes.data.transactions || []);
      if (referralsRes.data.success) {
        setReferrals(referralsRes.data.referrals);
        setReferralStats(referralsRes.data.stats);
      }
      if (settingsRes.data.success) setSettings(settingsRes.data.settings);
      if (codeRes.data.success) setReferralCode(codeRes.data.referralCode);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error(error.response?.data?.message || 'Failed to load wallet data');
      setWallet(null);
      setTransactions([]);
      setReferrals([]);
      setReferralStats({});
      setSettings(null);
      setReferralCode('');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchTransactions = useCallback(async (params = {}) => {
    if (!isAuthenticated) return;
    setTransactionLoading(true);
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/wallet/transactions${queryParams ? `?${queryParams}` : ''}`);
      if (response.data.success) {
        setTransactions(response.data.transactions || []);
      } else {
        toast.error(response.data.message || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch transactions');
      setTransactions([]);
    } finally {
      setTransactionLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);



  const processPayment = async (paymentData) => {
    if (!isAuthenticated) return { success: false, message: 'Not authenticated' };
    if (!wallet || !settings) return { success: false, message: 'Wallet data not loaded' };
    try {
      const response = await api.post('/wallet/pay', paymentData);
      if (response.data.success) {
        setWallet(response.data.wallet);
        fetchTransactions();
        toast.success('Payment successful!');
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Payment failed'
      };
    }
  };

  // This function has been corrected
  const completeReferral = async (referralId) => {
    if (!isAuthenticated) return { success: false, message: 'Not authenticated' };
    try {
      const response = await api.put(`/referral/${referralId}/complete`);
      if (response.data.success) {
        toast.success('Referral completed and reward credited!');
        fetchAllData(); // Re-fetch all data on success
        return { success: true };
      }
      // This case handles non-crashing backend errors (e.g., referral already completed)
      return { success: false, message: response.data.message };
    } catch (error) {
      // This catch block now correctly returns an error object
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to complete referral'
      };
    }
  };

  const value = {
    wallet,
    transactions,
    referrals,
    referralStats,
    settings,
    referralCode,
    loading,
    transactionLoading,
    fetchTransactions,
    processPayment,
    completeReferral,
    fetchAllData
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};