import React from 'react';

const Card = ({ children, className = '', gradient = false, padding = true }) => {
  const baseClasses = 'rounded-2xl shadow-lg transition-all duration-200';
  const paddingClasses = padding ? 'p-6' : '';
  const backgroundClasses = gradient 
    ? 'bg-gradient-to-br from-primary-600 to-purple-700 text-white' 
    : 'bg-white border border-gray-100';

  return (
    <div className={`${baseClasses} ${backgroundClasses} ${paddingClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;