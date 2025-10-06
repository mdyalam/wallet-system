import { useState } from 'react';
import toast from 'react-hot-toast';

export const useApiCall = (apiFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      toast.error(err.response?.data?.message || 'An error occurred');
      return { success: false, message: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    execute,
    loading,
    error
  };
};