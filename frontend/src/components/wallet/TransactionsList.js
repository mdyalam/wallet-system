import React, { useState, useEffect } from 'react';
import { BarChart3, XCircle, Filter, TrendingUp } from 'lucide-react';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import TransactionItem from './TransactionItem';
import { useWallet } from '../../context/WalletContext';

const TransactionsList = () => {
  const { transactions, transactionLoading, fetchTransactions } = useWallet();
  const [filter, setFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');

  useEffect(() => {
    const params = {};
    if (filter !== 'ALL') params.type = filter;
    if (sourceFilter !== 'ALL') params.source = sourceFilter;
    fetchTransactions(params);
  }, [filter, sourceFilter, fetchTransactions]);

  const filterOptions = [
    { value: 'ALL', label: 'All Transactions' },
    { value: 'CREDIT', label: 'Credits' },
    { value: 'DEBIT', label: 'Debits' }
  ];

  const sourceOptions = [
    { value: 'ALL', label: 'All Sources' },
    { value: 'REFERRAL', label: 'Referrals' },
    { value: 'PURCHASE', label: 'Purchases' }
  ];

  return (
    <Card padding={false}>
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-purple-600 opacity-50 rounded-t-lg"></div>
        <div className="relative flex flex-wrap items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            {/* UPDATED: Added colored shadow to the icon container */}
            <div className="p-3 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/40">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Transaction History</h3>
              <p className="text-sm text-gray-700">Track your financial activities</p>
            </div>
          </div>
          
          {/* Enhanced Filter Section */}
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filters:</span>
            </div>
            <div className="relative">
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)} 
                className="appearance-none bg-white text-sm border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer hover:border-gray-300 shadow-sm"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            <div className="relative">
              <select 
                value={sourceFilter} 
                onChange={(e) => setSourceFilter(e.target.value)} 
                className="appearance-none bg-white text-sm border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer hover:border-gray-300 shadow-sm"
              >
                {sourceOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-3 max-h-96 overflow-y-auto pr-2">
        {transactionLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                <LoadingSpinner />
              </div>
            </div>
            <p className="text-gray-500 font-medium">Loading your transactions...</p>
            <p className="text-gray-400 text-sm mt-1">Please wait a moment</p>
          </div>
        ) : !Array.isArray(transactions) ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <h4 className="text-red-600 text-xl font-semibold mb-2">Error loading transactions</h4>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              We encountered an issue while fetching your transaction history. This might be a temporary problem.
            </p>
            <button 
              onClick={() => fetchTransactions()}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium"
            >
              Try Again
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="h-10 w-10 text-gray-400" />
            </div>
            <h4 className="text-gray-700 text-xl font-semibold mb-2">No transactions found</h4>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              Your transaction history is empty. Once you start making transactions, they will appear here.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                💡 Tip: Try adjusting your filters above
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-between mb-4 px-2">
              <p className="text-sm font-medium text-gray-600">
                Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              </p>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent flex-1 ml-4"></div>
            </div>
            
            {/* Enhanced Transaction List */}
            <div className="space-y-3">
              {transactions.map((transaction, index) => (
                transaction && transaction._id ? (
                  // UPDATED: Added colored hover shadow and refined scaling
                  <div 
                    key={transaction._id}
                    className="transform transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-indigo-300/50"
                    style={{ 
                      animation: `slideInUp 0.4s ease-out ${index * 50}ms both`,
                      animationDelay: `${index * 50}ms` 
                    }}
                  >
                    <TransactionItem 
                      transaction={transaction} 
                    />
                  </div>
                ) : null
              ))}
            </div>
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

export default TransactionsList;