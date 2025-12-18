import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import { useUser } from '../context/UserContext';
import './WalletBalance.css';

const WalletBalance = ({ userId, onCoinsUpdate, onZeroCoins }) => {
  const { walletUpdateSignal } = useUser();
  const [coins, setCoins] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getWallet(userId);
      setCoins(response.coins);
      if (onCoinsUpdate) {
        onCoinsUpdate(response.coins);
      }
      if (response.coins === 0 && onZeroCoins) {
        onZeroCoins();
      }
      setError(null);
    } catch (err) {
      setError('Failed to load wallet');
      console.error('Wallet fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchWallet();
    }
  }, [userId, walletUpdateSignal]);

  const refreshBalance = () => {
    fetchWallet();
  };

  if (loading) {
    return (
      <div className="wallet-balance loading">
        <span className="coin-icon">🪙</span>
        <span className="coin-amount">...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wallet-balance error" onClick={refreshBalance} title="Click to retry">
        <span className="coin-icon">🪙</span>
        <span className="coin-amount">-</span>
      </div>
    );
  }

  return (
    <div className={`wallet-balance ${coins === 0 ? 'zero-coins' : ''}`} onClick={refreshBalance} title="Click to refresh">
      <span className="coin-icon">🪙</span>
      <span className="coin-amount">{coins}</span>
    </div>
  );
};

export default WalletBalance;
