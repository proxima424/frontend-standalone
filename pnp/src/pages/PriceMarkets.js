import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PriceMarkets.css';
import axios from 'axios';
import PoolsTable from '../components/PoolsTable/PoolsTable';
import { motion, AnimatePresence } from 'framer-motion';

const TOKEN_ADDRESSES = [
  {
    name: "cbBTC",
    address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf"
  }
];

const BASE_API_URL = 'https://api.geckoterminal.com/api/v2';

const PriceMarkets = () => {
  const [trendingPools, setTrendingPools] = useState([]);
  const [topPools, setTopPools] = useState([]);
  const [newPools, setNewPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState({
    trending: false,
    top: false,
    new: false
  });
  const [timeframe, setTimeframe] = useState('h24');
  const [searchInput, setSearchInput] = useState('');
  const [tokens, setTokens] = useState([]);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/price_markets/${searchInput.trim()}`);
    }
  };

  const fetchPools = async (endpoint, setter, type) => {
    try {
      setRefreshing(prev => ({ ...prev, [type]: true }));
      const response = await axios.get(`${BASE_API_URL}/networks/base/${endpoint}`);
      if (type === 'trending') {
        console.log('Trending Pools Response:', JSON.stringify(response.data, null, 2));
      }
      setter(response.data.data);
    } catch (error) {
      console.error(`Error fetching ${type} pools:`, error);
    } finally {
      setRefreshing(prev => ({ ...prev, [type]: false }));
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAllPools = async () => {
      await Promise.all([
        fetchPools('trending_pools', setTrendingPools, 'trending'),
        fetchPools('pools', setTopPools, 'top'),
        fetchPools('new_pools', setNewPools, 'new')
      ]);
    };

    fetchAllPools();
    const interval = setInterval(fetchAllPools, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch token data from the server
    const fetchTokens = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/tokens');
        const data = await response.json();
        setTokens(data.tokens);
      } catch (error) {
        console.error('Error fetching tokens:', error);
      }
    };

    fetchTokens();
  }, []);

  // Navigate to token details page
  const handleTokenClick = (tokenAddress) => {
    navigate(`/price_markets/${tokenAddress}`);
  };

  const TokenCarousel = () => {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchTokenData = async () => {
      try {
        const response = await axios.get(`${BASE_API_URL}/networks/base/tokens/${TOKEN_ADDRESSES[0].address}`);
        const { data } = response.data;
        const { attributes } = data;
        
        const tokenData = {
          name: TOKEN_ADDRESSES[0].name,
          address: attributes.address,
          symbol: attributes.symbol || 'N/A',
          currentPrice: attributes.price_usd ? `$${parseFloat(attributes.price_usd).toFixed(4)}` : 'N/A',
          marketCap: attributes.market_cap_usd ? `$${parseFloat(attributes.market_cap_usd).toLocaleString()}` : 'N/A',
          volume24h: attributes.volume_usd?.["24h"] ? `$${parseFloat(attributes.volume_usd["24h"]).toLocaleString()}` : 'N/A',
          totalSupply: attributes.total_supply ? parseFloat(attributes.total_supply).toLocaleString() : 'N/A',
          fdv: attributes.fdv_usd ? `$${parseFloat(attributes.fdv_usd).toLocaleString()}` : 'N/A',
          totalReserve: attributes.total_reserve_in_usd ? `$${parseFloat(attributes.total_reserve_in_usd).toLocaleString()}` : 'N/A'
        };
        
        console.log('Processed Token Data:', tokenData);
        setToken(tokenData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching token data:', error);
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchTokenData();
    }, []);

    if (loading || !token) {
      return <div className="loading-container">Loading token data...</div>;
    }

    return (
      <div className="carousel-container">
        <div className="token-slide">
          <div className="token-content">
            <div className="token-header">
              <div>
                <h2>{token.name}</h2>
                <span className="token-symbol">{token.symbol}</span>
              </div>
              <div className="current-price">
                {token.currentPrice}
              </div>
            </div>
            
            <div className="token-stats">
              <div className="stat-row">
                <span className="stat-label">Market Cap</span>
                <span className="stat-value">{token.marketCap}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">24h Volume</span>
                <span className="stat-value">{token.volume24h}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Total Supply</span>
                <span className="stat-value">{token.totalSupply}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">FDV</span>
                <span className="stat-value">{token.fdv}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Total Reserve</span>
                <span className="stat-value">{token.totalReserve}</span>
              </div>
            </div>
            
            <div className="chart-placeholder">
              <span>Price chart coming soon</span>
            </div>
            
            <button className="make-bet-btn">make bet</button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading markets data...</div>;
  }

  return (
    <div className="price-markets-container">
      <div className="left-section">
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Enter token address to bet on....."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>
        <div className="stats-card">
          {/* Stats content */}
        </div>
        <PoolsTable
          title="💎 Top Pools on Base"
          pools={topPools}
          timeframe={timeframe}
          onRefresh={() => setTimeframe('h24')}
          refreshing={refreshing.top}
          variant="top"
        />
      </div>
      <div className="right-section">
        <div className="white-rectangle-container">
          <TokenCarousel />
        </div>
        <PoolsTable
          title={
            <div className="pools-table-title">
              🔥 Trending Pools on Base
              <span className="flame-icon">🔥</span>
            </div>
          }
          pools={trendingPools}
          timeframe={timeframe}
          onRefresh={() => setTimeframe('h24')}
          refreshing={refreshing.trending}
          variant="trending"
        />
      </div>
    </div>
  );
};

export default PriceMarkets;
