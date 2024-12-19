import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import './TokenMarket.css';

const TokenMarket = () => {
  const { address } = useParams();
  const [tokenData, setTokenData] = useState({
    name: 'Bitcoin',
    ticker: 'BTC',
    logo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
    marketCap: '$843.2B',
    volume24h: '$24.5B',
    price: '$43,215.23'
  });

  const [priceChange, setPriceChange] = useState('neutral'); // 'up', 'down', or 'neutral'
  const prevPrice = useRef(tokenData.price);
  const ws = useRef(null);

  useEffect(() => {
    // Initialize WebSocket connection
    ws.current = new WebSocket('wss://websocket-server-url');

    ws.current.onopen = () => {
      console.log('WebSocket Connected');
      // Subscribe to token updates
      ws.current.send(JSON.stringify({
        type: 'subscribe',
        token: address
      }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Update token data
      setTokenData(prevData => {
        const newData = { ...prevData, ...data };
        
        // Compare prices and set animation
        const oldPrice = parseFloat(prevData.price.replace(/[$,]/g, ''));
        const newPrice = parseFloat(data.price.replace(/[$,]/g, ''));
        
        if (newPrice > oldPrice) {
          setPriceChange('up');
        } else if (newPrice < oldPrice) {
          setPriceChange('down');
        }
        
        // Reset animation after a delay
        setTimeout(() => setPriceChange('neutral'), 1000);
        
        prevPrice.current = data.price;
        return newData;
      });
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket Disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        setTokenData(prevData => ({ ...prevData })); // Trigger useEffect to reconnect
      }, 5000);
    };

    // Cleanup function
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [address]); // Reconnect if address changes

  // Format numbers with commas
  const formatNumber = (str) => {
    const num = parseFloat(str.replace(/[$,]/g, ''));
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  return (
    <div className="token-market-container">
      <div className="token-header">
        <div className="token-basic-info">
          <img src={tokenData.logo} alt={tokenData.name} className="token-logo" />
          <div className="token-name-container">
            <h1>{tokenData.name}</h1>
            <span className="token-ticker">{tokenData.ticker}</span>
          </div>
        </div>
        <div className="token-price-container">
          <div className="current-price">
            <span className="label">Price</span>
            <span className={`value price ${priceChange}`}>
              {formatNumber(tokenData.price)}
            </span>
          </div>
          <div className="market-stats">
            <div className="stat-item">
              <span className="label">Market Cap</span>
              <span className="value">{formatNumber(tokenData.marketCap)}</span>
            </div>
            <div className="stat-item">
              <span className="label">24h Volume</span>
              <span className="value">{formatNumber(tokenData.volume24h)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="token-content">
        <div className="chart-section">
          <div className="price-chart">
            {/* Price chart will be implemented later */}
            <div className="chart-placeholder">Price Chart Coming Soon</div>
          </div>
        </div>

        <div className="markets-section">
          <div className="section-header">
            <h2>Prediction Markets</h2>
            <button className="create-market-btn">
              <span className="plus-icon">+</span>
              Create Market
            </button>
          </div>
          <div className="markets-list">
            {/* Markets list will be populated later */}
            <div className="empty-markets">
              No prediction markets yet. Create one!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenMarket;
