import { useState, useEffect, useCallback } from 'react';
import ApiService from '../services/api';

export const useWallet = (userId) => {
  const [coins, setCoins] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWallet = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await ApiService.getWallet(userId);
      setCoins(response.coins);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load wallet');
      console.error('Wallet fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const debitCoins = async (amount) => {
    try {
      const response = await ApiService.debitCoins(userId, amount);
      setCoins(response.coins);
      return { success: true, coins: response.coins };
    } catch (err) {
      setError(err.message || 'Failed to debit coins');
      throw err;
    }
  };

  const creditCoins = async (amount) => {
    try {
      const response = await ApiService.creditCoins(userId, amount);
      setCoins(response.coins);
      return { success: true, coins: response.coins };
    } catch (err) {
      setError(err.message || 'Failed to credit coins');
      throw err;
    }
  };

  const checkSufficientCoins = async (requiredCoins) => {
    try {
      const hasEnough = await ApiService.checkCoins(userId, requiredCoins);
      return hasEnough;
    } catch (err) {
      console.error('Check coins error:', err);
      return false;
    }
  };

  const refreshWallet = () => {
    fetchWallet();
  };

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return {
    coins,
    loading,
    error,
    debitCoins,
    creditCoins,
    checkSufficientCoins,
    refreshWallet,
  };
};
