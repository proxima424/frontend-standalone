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

  // Comment out or remove the TokenCarousel component
  // const TokenCarousel = () => {
  //   const [token, setToken] = useState(null);
  //   const [prevToken, setPrevToken] = useState(null);
  //   const [valueChanges, setValueChanges] = useState({
  //     price: null,
  //     marketCap: null,
  //     fdv: null,
  //     totalReserve: null
  //   });
  //   const [isInitialLoading, setIsInitialLoading] = useState(true);

  //   const getNumericValue = (str) => {
  //     if (!str) return null;
  //     return parseFloat(str.replace(/[^0-9.-]+/g, ''));
  //   };

  //   const fetchTokenData = async () => {
  //     try {
  //       const response = await axios.get(`${BASE_API_URL}/networks/base/tokens/${TOKEN_ADDRESSES[0].address}`);
  //       const { data } = response.data;
  //       const { attributes } = data;
        
  //       if (attributes) {
  //         setPrevToken(token);
  //         const newTokenData = {
  //           name: TOKEN_ADDRESSES[0].name,
  //           symbol: attributes.symbol || token?.symbol,
  //           price: attributes.price_usd ? 
  //             `$${parseFloat(attributes.price_usd).toFixed(4)}` : 
  //             token?.price,
  //           marketCap: attributes.market_cap_usd ? 
  //             `$${parseFloat(attributes.market_cap_usd).toLocaleString()}` : 
  //             token?.marketCap,
  //           fdv: attributes.fdv_usd ? 
  //             `$${parseFloat(attributes.fdv_usd).toLocaleString()}` : 
  //             token?.fdv,
  //           totalReserve: attributes.total_reserve_in_usd ? 
  //             `$${parseFloat(attributes.total_reserve_in_usd).toLocaleString()}` : 
  //             token?.totalReserve
  //         };

  //         if (newTokenData.marketCap || newTokenData.fdv || newTokenData.totalReserve) {
  //           const changes = {
  //           };
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Error fetching token data:', error);
  //     }
  //   };

  //   useEffect(() => {
  //     fetchTokenData();
  //   }, []);

  //   return (
  //     <div className="token-carousel">
  //       {/* Render token data here */}
  //     </div>
  //   );
  // };

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
        <div className="white-rectangle-container">
          {/* Remove the TokenCarousel component from the render */}
          {/* <TokenCarousel /> */}
        </div>
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
