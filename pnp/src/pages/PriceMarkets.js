import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PriceMarkets.css';
import axios from 'axios';
import PoolsTable from '../components/PoolsTable/PoolsTable';

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
      const response = await axios.get(`https://api.geckoterminal.com/api/v2/networks/base/${endpoint}`);
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

  if (loading) {
    return <div className="loading">Loading markets data...</div>;
  }

  return (
    <div className="price-markets-container">
      <div className="left-section">
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Enter an address or transaction hash"
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
        <PoolsTable
          title="🔥 Trending Pools on Base"
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
