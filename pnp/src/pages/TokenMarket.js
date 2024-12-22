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
  const [searchInput, setSearchInput] = useState('');
  const [predictionForm, setPredictionForm] = useState({
    tokenName: '',
    currentPrice: '',
    targetPrice: '',
    currentBaseBlockTimestamp: '',
    endTimestamp: '',
    collateralAmount: ''
  });

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/price_markets/${searchInput.trim()}`);
    }
  };

  const handlePredictionFormChange = (e) => {
    const { name, value } = e.target;
    setPredictionForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreatePredictionMarket = (e) => {
    e.preventDefault();
    // TODO: Implement prediction market creation logic
    console.log('Prediction Market Form Data:', predictionForm);
    setShowModal(false);
  };

  if (loading) return <div className="loading">Loading token data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          placeholder="Enter an address or transaction hash"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </form>
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
            <div className="modal-header">
              <h2>Create New Prediction Market</h2>
              <button 
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <form 
              className="prediction-market-form"
              onSubmit={handleCreatePredictionMarket}
            >
              <div className="form-group">
                <label>Token Name</label>
                <input
                  type="text"
                  name="tokenName"
                  value={predictionForm.tokenName}
                  onChange={handlePredictionFormChange}
                  placeholder="Enter token name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Current Price</label>
                <input
                  type="text"
                  name="currentPrice"
                  value={predictionForm.currentPrice}
                  onChange={handlePredictionFormChange}
                  placeholder="Current token price"
                  required
                />
              </div>
              <div className="form-group">
                <label>Target Price</label>
                <input
                  type="text"
                  name="targetPrice"
                  value={predictionForm.targetPrice}
                  onChange={handlePredictionFormChange}
                  placeholder="Enter target price"
                  required
                />
              </div>
              <div className="form-group">
                <label>Current Base Block Timestamp</label>
                <input
                  type="text"
                  name="currentBaseBlockTimestamp"
                  value={predictionForm.currentBaseBlockTimestamp}
                  onChange={handlePredictionFormChange}
                  placeholder="Current base block timestamp"
                  required
                />
              </div>
              <div className="form-group">
                <label>End Timestamp</label>
                <input
                  type="text"
                  name="endTimestamp"
                  value={predictionForm.endTimestamp}
                  onChange={handlePredictionFormChange}
                  placeholder="Enter end timestamp"
                  required
                />
              </div>
              <div className="form-group">
                <label>Collateral Amount (USDC/USDT)</label>
                <input
                  type="text"
                  name="collateralAmount"
                  value={predictionForm.collateralAmount}
                  onChange={handlePredictionFormChange}
                  placeholder="Enter collateral amount"
                  required
                />
              </div>
              <button 
                type="submit"
                className="create-market-btn"
              >
                Create Prediction Market
              </button>
            </form>
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
