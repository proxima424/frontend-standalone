/* global BigInt */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PriceMarkets.css';
import axios from 'axios';
import PoolsTable from '../components/PoolsTable/PoolsTable';
import { motion, AnimatePresence } from 'framer-motion';
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import PredictionMarketCard from '../components/PredictionMarketCard';

const TOKEN_ADDRESSES = [
  {
    name: "cbBTC",
    address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf"
  }
];

const BASE_API_URL = 'https://api.geckoterminal.com/api/v2';

const PRICE_CHECKER_ADDRESS = "0x0000000000cDC1F8d393415455E382c30FBc0a84";

const MINT_CONTRACT_ADDRESS = "0xeD687976873D5194b5aE6315F2c54b32AfE2456d";

const MINT_CONTRACT_ABI = [
  {
    inputs: [
      { name: "conditionId", type: "bytes32" },
      { name: "collateralAmount", type: "uint256" },
      { name: "tokenIdToMint", type: "uint256" }
    ],
    name: "mintDecisionTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];

const ERC20_ABI = [
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    name: "allowance",
    outputs: [
      { name: "", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  }
];

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

const CheckAllowance = ({ 
  tokenAddress, 
  ownerAddress, 
  spenderAddress, 
  onSuccess, 
  collateral 
}) => {
  const { data, isError, isLoading } = useReadContract({
    address: tokenAddress, // Address of the ERC20 token contract
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [ownerAddress, spenderAddress],
  });

  useEffect(() => {
    if (!isLoading && !isError && data) {
      const allowance = BigInt(data);
      if (allowance >= BigInt(parseFloat(collateral) * 1_000_000n)) {
        onSuccess();
      } else {
        console.error('Insufficient allowance');
      }
    }
  }, [data, isError, isLoading, collateral, onSuccess]);

  return null;
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
        <PredictionMarketCard 
          tokenName="BTC"
          tokenAddress="0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf"
          targetPrice={150000}
          timeframe={30}
          yesMultiplier={5.6}
          noMultiplier={4.2}
          conditionId="0x1234567890abcdef"
          collateralTokenAddress="0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf"
        />
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
