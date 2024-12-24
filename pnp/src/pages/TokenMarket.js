import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TokenMarket.css';

const TokenMarket = () => {
  const { address } = useParams();
  const navigate = useNavigate();
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [latestBlockNumber, setLatestBlockNumber] = useState('');

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
    const fetchLatestBlockNumber = async () => {
      try {
        // Simulate fetching the latest block number
        const blockNumber = await fetchLatestBlockNumberFromAPI();
        setLatestBlockNumber(blockNumber);
      } catch (err) {
        console.error('Error fetching latest block number:', err);
      }
    };

    const intervalId = setInterval(fetchLatestBlockNumber, 5000); // Update every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search functionality
  };

  const handleCreatePredictionMarket = (e) => {
    e.preventDefault();
    // TODO: Implement prediction market creation logic
    console.log('Prediction Market Form Data:');
    setShowModal(false);
  };

  // Simulate fetching the latest block number
  const fetchLatestBlockNumberFromAPI = async () => {
    // This is a placeholder function. Replace with actual API call.
    return '1234567';
  };

  if (loading) return <div className="loading">Loading token data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          placeholder="Enter an address or transaction hash"
        />
      </form>
      <div className="chart-container">
        <iframe
          id="geckoterminal-embed"
          title="GeckoTerminal Embed"
          src={`https://www.geckoterminal.com/base/pools/${address}?embed=1&info=1&swaps=0&grayscale=0&light_chart=0`}
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
          View Token Details
        </button>
        <button 
          className="view-markets-btn"
        >
          View Existing Markets
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Token Details</h2>
              <button 
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="token-info">
              <h3>Token Address: {tokenData?.attributes?.address || 'N/A'}</h3>
              <h3>Token Name: {tokenData?.attributes?.name || 'N/A'}</h3>
              <h3>Current Price: ${tokenData?.attributes?.price_usd || 'N/A'}</h3>
            </div>
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
