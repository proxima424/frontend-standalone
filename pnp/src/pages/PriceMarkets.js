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

const PredictionButton = ({ option, multiplier, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`prediction-button ${isSelected ? 'selected' : ''}`}
      option={option}
    >
      {option}
      <span>x{multiplier}</span>
    </button>
  );
};

const WhiteRectangleContainer = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [reserveAmount, setReserveAmount] = useState('');

  // Placeholder data
  const btcPrice = 30000;
  const targetPrice = 35000;
  const timeframe = 30;
  const volume = 1000000;
  const yesMultiplier = 5.6;
  const noMultiplier = 4.2;

  return (
    <div className='white-rectangle-container'>
      <h2 className='white-rectangle-title'>
        Will $BTC reach ${targetPrice} by {timeframe} days?
      </h2>
      <p className='white-rectangle-current-price'>Current BTC Price: ${btcPrice}</p>
      <div className='white-rectangle-button-container'>
        <PredictionButton
          option="YES"
          multiplier={yesMultiplier}
          isSelected={selectedOption === 'YES'}
          onClick={() => setSelectedOption('YES')}
        />
        <PredictionButton
          option="NO"
          multiplier={noMultiplier}
          isSelected={selectedOption === 'NO'}
          onClick={() => setSelectedOption('NO')}
        />
      </div>
      <div className='white-rectangle-input-container'>
        <input
          type="number"
          placeholder="Reserve amount"
          value={reserveAmount}
          onChange={(e) => setReserveAmount(e.target.value)}
          className='white-rectangle-input'
        />
        <button className='white-rectangle-add-reserve-button'>Add Reserve</button>
      </div>
      <div className='white-rectangle-footer'>
        <span>Volume: ${volume.toLocaleString()}</span>
        <button className='white-rectangle-settlement-button'>Price Settlement Module</button>
      </div>
    </div>
  );
};

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
          title="TOP POOLS ON BASE"
          pools={topPools}
          timeframe={timeframe}
          onRefresh={() => setTimeframe('h24')}
          refreshing={refreshing.top}
          variant="top"
        />
      </div>
      <div className="right-section">
        <WhiteRectangleContainer />
        <PoolsTable
          title={
            <div className="pools-table-title">
              TRENDING POOLS ON BASE

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
