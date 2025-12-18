import React, { useState, useEffect } from 'react';
import WalletBalance from '../components/WalletBalance';
import ZeroCoinsModal from '../components/ZeroCoinsModal';
import { useWallet } from '../hooks/useWallet';

function DashboardWithWallet() {
  const user = JSON.parse(localStorage.getItem('user'));
  const { coins, debitCoins, creditCoins, checkSufficientCoins, refreshWallet } = useWallet(user?.id);
  const [showZeroCoinsModal, setShowZeroCoinsModal] = useState(false);

  useEffect(() => {
    if (coins === 0) {
      setShowZeroCoinsModal(true);
    }
  }, [coins]);

  const handleBookSession = async () => {
    try {
      const hasEnough = await checkSufficientCoins(10);
      if (!hasEnough) {
        setShowZeroCoinsModal(true);
        return;
      }
      await debitCoins(10);
      alert('Session booked! 10 coins deducted.');
    } catch (error) {
      if (error.message.includes('Insufficient coins')) {
        setShowZeroCoinsModal(true);
      }
    }
  };

  const handleCompleteSession = async () => {
    try {
      await creditCoins(10);
      alert('Session completed! You earned 10 coins.');
      refreshWallet();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="dashboard">
      <header style={styles.header}>
        <h1>Dashboard</h1>
        <WalletBalance userId={user?.id} />
      </header>

      <div style={styles.content}>
        <button onClick={handleBookSession} disabled={coins < 10}>
          {coins < 10 ? 'Insufficient Coins' : 'Book Session (10 coins)'}
        </button>
        <button onClick={handleCompleteSession}>
          Complete Session (Earn 10 coins)
        </button>
      </div>

      <ZeroCoinsModal 
        isOpen={showZeroCoinsModal}
        onClose={() => setShowZeroCoinsModal(false)}
        onBecomeTeacher={() => window.location.href = '/become-teacher'}
      />
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', padding: '20px' },
  content: { padding: '20px' }
};

export default DashboardWithWallet;
