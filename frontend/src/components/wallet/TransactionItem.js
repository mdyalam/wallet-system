import React from 'react';
import { ArrowUp, ArrowDown, CheckCircle, Clock, XCircle } from 'lucide-react';

const TransactionItem = ({ transaction, style }) => {
  const isCredit = transaction.type === 'CREDIT';
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSourceConfig = (source) => {
    const configs = {
      'REFERRAL': { color: 'text-green-600 bg-green-50', label: 'Referral' },
      'PURCHASE': { color: 'text-blue-600 bg-blue-50', label: 'Purchase' },
      'REFUND': { color: 'text-purple-600 bg-purple-50', label: 'Refund' },
      'ADMIN_CREDIT': { color: 'text-orange-600 bg-orange-50', label: 'Admin Credit' },
      'BONUS': { color: 'text-yellow-600 bg-yellow-50', label: 'Bonus' }
    };
    return configs[source] || { color: 'text-gray-600 bg-gray-50', label: source };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'PENDING': return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'FAILED': return <XCircle className="h-3 w-3 text-red-500" />;
      default: return <CheckCircle className="h-3 w-3 text-green-500" />;
    }
  };

  const sourceConfig = getSourceConfig(transaction.source);

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-lg animate-slide-up" style={style}>
      <div className="flex items-center space-x-4">
        <div className={`p-2 rounded-lg ${isCredit ? 'bg-green-100' : 'bg-red-100'}`}>
          {isCredit ? <ArrowDown className="h-5 w-5 text-green-600" /> : <ArrowUp className="h-5 w-5 text-red-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap space-x-2 mb-1">
            <p className="font-medium text-gray-900 truncate">{transaction.description}</p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sourceConfig.color}`}>
              {sourceConfig.label}
            </span>
          </div>
          <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-4">
        <div className={`font-semibold text-lg ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
          {isCredit ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
        </div>
        <div className="flex items-center justify-end space-x-1 text-xs text-gray-500">
          {getStatusIcon(transaction.status)}
          <span className="capitalize">{transaction.status.toLowerCase()}</span>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;