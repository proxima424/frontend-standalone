import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './TokenMarket.css';

const TokenMarket = () => {
  const { address } = useParams();
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/base/tokens/${address}`);
        const data = await response.json();
        console.log('Token Data:', data.data); // Log the response data
        setTokenData(data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching token data:', err);
        setError('Failed to fetch token data');
        setLoading(false);
      }
    };

    fetchTokenData(); // Initial fetch
    const intervalId = setInterval(fetchTokenData, 5000); // Fetch every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [address]);

  useEffect(() => {
    const updatePrice = async () => {
      try {
        const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/base/tokens/${address}`);
        const data = await response.json();
        console.log('Token Data:', data.data); // Log the response data
        setTokenData(data.data);
      } catch (err) {
        console.error('Error updating price:', err);
      }
    };

    const intervalId = setInterval(updatePrice, 10000); // Update price every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [address]);

  if (loading) return <div className="loading">Loading token data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div className="enter-token-container">
        <input type="text" placeholder="Enter Token Address" className="enter-token-input" />
      </div>
      <div className="chart-container">
        <iframe
          id="geckoterminal-embed"
          title="GeckoTerminal Embed"
          src={`https://www.geckoterminal.com/base/pools/${address}?embed=1&info=1&swaps=1&grayscale=0&light_chart=0`}
          frameBorder="0"
          allow="clipboard-write"
          allowFullScreen
          className="chart-iframe"
        ></iframe>
      </div>
      <div className="button-container">
        <button 
          className="create-prediction-market-btn"
          onClick={() => setShowModal(true)}
        >
          Create New Prediction Market
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              className="modal-close-btn"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <h2>Create New Prediction Market</h2>
            {/* Add your form content here */}
          </div>
        </div>
      )}
    </div>
  );
};

// Utility function to format large numbers
const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
};

export default TokenMarket;
