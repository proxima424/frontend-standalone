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
  const [targetPrice, setTargetPrice] = useState("");
  const [deadlineValue, setDeadlineValue] = useState("");
  const [deadlineUnit, setDeadlineUnit] = useState("days"); // 'days' or 'hours'
  const [selectedToken, setSelectedToken] = useState("USDT");
  const [lastClickedPercentage, setLastClickedPercentage] = useState(null);

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

  const calculatePercentagePrice = (percentage) => {
    const currentPrice = parseFloat(tokenData?.attributes?.price_usd || 0);
    const newPrice = currentPrice * (1 + percentage / 100);
    setTargetPrice(newPrice.toFixed(8));
    setLastClickedPercentage(percentage);
  };

  const handleQuickAdd = (value) => {
    setDeadlineValue((prev) => {
      const currentValue = prev === "" ? 0 : parseFloat(prev);
      return (currentValue + value).toString();
    });
  };

  if (loading) return <div className="loading">Loading token data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
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
            <div className="modal-inner">
              {/* Header */}
              <div className="modal-header">
                <h2 className="modal-title">Token Details</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="modal-close-button"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* Token Info */}
              <div className="token-grid">
                <p className="font-medium">{tokenData?.attributes?.name || 'Loading...'}</p>
                <p className="font-medium text-right">${tokenData?.attributes?.price_usd || '0.00'}</p>
              </div>

              {/* Target Price */}
              <div className="input-group">
                <label className="input-label">Target Price</label>
                <div className="input-container">
                  <input 
                    type="number"
                    placeholder="Enter target price"
                    className="modal-input"
                    value={targetPrice}
                    onChange={(e) => {
                      setTargetPrice(e.target.value);
                      setLastClickedPercentage(null);
                    }}
                  />
                  <div className="percentage-buttons">
                    <button 
                      className={`percentage-button ${lastClickedPercentage === 5 ? 'active' : ''}`}
                      onClick={() => calculatePercentagePrice(5)}
                    >
                      +5%
                    </button>
                    <button 
                      className={`percentage-button ${lastClickedPercentage === -5 ? 'active' : ''}`}
                      onClick={() => calculatePercentagePrice(-5)}
                    >
                      -5%
                    </button>
                  </div>
                </div>
              </div>

              {/* Deadline */}
              <div className="input-group">
                <label className="input-label">Deadline</label>
                <div className="deadline-container">
                  <div className="deadline-input-group">
                    <input 
                      type="number"
                      placeholder="Enter duration"
                      className="deadline-input"
                      value={deadlineValue}
                      onChange={(e) => setDeadlineValue(e.target.value)}
                    />
                    <div className="denomination-toggle">
                      <button 
                        className={`denomination-button ${deadlineUnit === 'days' ? 'active' : ''}`}
                        onClick={() => setDeadlineUnit('days')}
                      >
                        days
                      </button>
                      <button 
                        className={`denomination-button ${deadlineUnit === 'hours' ? 'active' : ''}`}
                        onClick={() => setDeadlineUnit('hours')}
                      >
                        hours
                      </button>
                    </div>
                  </div>
                  <div className="quick-add-container">
                    <button className="quick-add-button" onClick={() => handleQuickAdd(1)}>+1</button>
                    <button className="quick-add-button" onClick={() => handleQuickAdd(2)}>+2</button>
                    <button className="quick-add-button" onClick={() => handleQuickAdd(3)}>+3</button>
                    <button className="quick-add-button" onClick={() => handleQuickAdd(5)}>+5</button>
                    <button className="quick-add-button" onClick={() => handleQuickAdd(7)}>+7</button>
                    <button className="quick-add-button" onClick={() => handleQuickAdd(12)}>+12</button>
                  </div>
                </div>
              </div>

              {/* Collateral */}
              <div className="input-group">
                <label className="input-label">Collateral Amount</label>
                <div className="input-container">
                  <input 
                    type="number"
                    placeholder="Enter amount"
                    className="modal-input"
                  />
                  <div className="denomination-toggle">
                    <button 
                      className={`denomination-button ${selectedToken === 'USDT' ? 'active' : ''}`}
                      onClick={() => setSelectedToken('USDT')}
                    >
                      USDT
                    </button>
                    <button 
                      className={`denomination-button ${selectedToken === 'USDC' ? 'active' : ''}`}
                      onClick={() => setSelectedToken('USDC')}
                    >
                      USDC
                    </button>
                  </div>
                </div>
              </div>

              {/* Create Market Button */}
              <button className="create-market-button">
                Create Market
              </button>
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
