import React, { useState } from 'react';
import { FiRefreshCw, FiChevronDown, FiChevronUp, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './PoolsTable.css';

const ITEMS_PER_PAGE = 6;

const PoolsTable = ({ title, pools, timeframe, onRefresh, refreshing, variant = 'default' }) => {
  const navigate = useNavigate();
  const [expandedPool, setExpandedPool] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(pools.length / ITEMS_PER_PAGE);
  const currentPools = pools.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handlePoolClick = (pool) => {
    const baseTokenId = pool.relationships.base_token.data.id;
    const baseTokenAddress = baseTokenId.replace('base_', '');
    navigate(`/price_markets/${baseTokenAddress}`);
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '$0.00';
    const value = Number(num);
    if (isNaN(value)) return '$0.00';
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(5)}`;
  };

  const formatPercentage = (value) => {
    if (!value) return '0.00%';
    const num = parseFloat(value);
    return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  const NavigationControls = () => (
    <div className="navigation-controls">
      <button 
        className="nav-btn"
        onClick={handlePrevPage}
        disabled={currentPage === 0}
      >
        <FiChevronsLeft />
      </button>
      <span className="page-indicator">
        Page {currentPage + 1} of {totalPages}
      </span>
      <button 
        className="nav-btn"
        onClick={handleNextPage}
        disabled={currentPage === totalPages - 1}
      >
        <FiChevronsRight />
      </button>
    </div>
  );

  if (variant === 'plate') {
    return (
      <div className="pools-plate-container">
        <div className="table-header">
          <h2>{title}</h2>
          <div className="header-controls">
            <NavigationControls />
            <button 
              className="refresh-btn"
              onClick={onRefresh}
              disabled={refreshing}
            >
              <FiRefreshCw className={refreshing ? 'spin' : ''} />
            </button>
          </div>
        </div>
        <div className="pools-plate-grid">
          {currentPools.map((pool, index) => (
            <div 
              key={pool.id} 
              className={`pool-plate ${expandedPool === pool.id ? 'expanded' : ''}`}
              onClick={() => setExpandedPool(expandedPool === pool.id ? null : pool.id)}
            >
              <div className="pool-plate-header">
                <div className="pool-main-info">
                  <span className="pool-rank">#{index + 1 + currentPage * ITEMS_PER_PAGE}</span>
                  <span className="pool-name">{pool.attributes.name}</span>
                </div>
                <div className="pool-quick-stats">
                  <span className="quick-price">{formatNumber(pool.attributes.base_token_price_usd)}</span>
                  <span className={`quick-change ${parseFloat(pool.attributes.price_change_percentage.h24) >= 0 ? 'positive' : 'negative'}`}>
                    {formatPercentage(pool.attributes.price_change_percentage.h24)}
                  </span>
                  {expandedPool === pool.id ? <FiChevronUp /> : <FiChevronDown />}
                </div>
              </div>
              {expandedPool === pool.id && (
                <div className="pool-plate-stats">
                  <div className="stat-row">
                    <span className="stat-label">Change ({timeframe}):</span>
                    <span className={`stat-value ${parseFloat(pool.attributes.price_change_percentage[timeframe]) >= 0 ? 'positive' : 'negative'}`}>
                      {formatPercentage(pool.attributes.price_change_percentage[timeframe])}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Volume ({timeframe}):</span>
                    <span className="stat-value">{formatNumber(pool.attributes.volume_usd[timeframe])}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Liquidity:</span>
                    <span className="stat-value">{formatNumber(pool.attributes.reserve_in_usd)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pools-table-container">
      <div className="table-header">
        <h2>{title}</h2>
        <div className="header-controls">
          <NavigationControls />
          <button 
            className="refresh-btn"
            onClick={onRefresh}
            disabled={refreshing}
          >
            <FiRefreshCw className={refreshing ? 'spin' : ''} />
          </button>
        </div>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Pool</th>
              <th>Price</th>
              <th>
                Change
                <select 
                  value={timeframe} 
                  onChange={(e) => onRefresh(e.target.value)}
                  className="timeframe-select"
                >
                  <option value="m5">5m</option>
                  <option value="h1">1h</option>
                  <option value="h6">6h</option>
                  <option value="h24">24h</option>
                </select>
              </th>
              <th>Volume</th>
              <th>Liquidity</th>
            </tr>
          </thead>
          <tbody>
            {currentPools.map((pool, index) => (
              <tr key={pool.id} onClick={() => handlePoolClick(pool)}>
                <td className="pool-name-cell">{pool.attributes.name}</td>
                <td>{formatNumber(pool.attributes.base_token_price_usd)}</td>
                <td className={parseFloat(pool.attributes.price_change_percentage[timeframe]) >= 0 ? 'positive' : 'negative'}>
                  {formatPercentage(pool.attributes.price_change_percentage[timeframe])}
                </td>
                <td>{formatNumber(pool.attributes.volume_usd[timeframe])}</td>
                <td>{formatNumber(pool.attributes.reserve_in_usd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PoolsTable;
