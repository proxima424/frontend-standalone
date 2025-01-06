import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReadContract } from 'wagmi';

const PredictionMarketCard = ({ 
  tokenName, 
  tokenAddress, 
  targetPrice, 
  timeframe, 
  yesMultiplier, 
  noMultiplier,
  conditionId,
  collateralTokenAddress
}) => {
  const navigate = useNavigate();

  const [selectedOption, setSelectedOption] = useState(null);
  const [collateral, setCollateral] = useState('');
  const [volume, setVolume] = useState(0);

  const handleTokenClick = () => {
    navigate(`/price_markets/${conditionId}`);
  };

  return (
    <div className='white-rectangle-container'>
      <div className='question-section'>
        <h2 
          className='white-rectangle-title'
          onClick={handleTokenClick}
          style={{ cursor: 'pointer' }}
        >
          Will <span style={{ textDecoration: 'underline' }}>${tokenName}</span> reach ${targetPrice.toLocaleString()} by {timeframe} days?
        </h2>
        <div className='info-icon' title="This prediction market settles onchain by fetching price from corresponding UniV3 Pool. Truly permissionless for any asset.">
          ℹ️
        </div>
      </div>

      <div className='price-highlight'>
        Current Price: 
        <span className='price-color'>
          {/* Add logic to fetch and display current price */}
        </span>
      </div>
      
      <div className='prediction-section'>
        <div className='prediction-controls'>
          <div className='options-section'>
            <button
              className={`prediction-button ${selectedOption === 'YES' ? 'selected' : ''}`}
              onClick={() => setSelectedOption('YES')}
            >
              YES x{yesMultiplier}
            </button>
            <button
              className={`prediction-button ${selectedOption === 'NO' ? 'selected' : ''}`}
              onClick={() => setSelectedOption('NO')}
            >
              NO x{noMultiplier}
            </button>
          </div>

          <div className='mint-controls'>
            <input
              type="number"
              placeholder="Collateral Amount"
              value={collateral}
              onChange={(e) => setCollateral(e.target.value)}
              className={`collateral-input ${!selectedOption ? 'disabled' : ''}`}
              disabled={!selectedOption}
            />
            <button 
              className={`mint-button ${!selectedOption ? 'disabled' : ''}`}
              disabled={!selectedOption}
            >
              Mint Position
            </button>
          </div>
        </div>
      </div>

      <div className='footer-info'>
        <div className='market-stats'>
          <div className='volume-info'>Total Market Reserve: ${volume.toLocaleString()}</div>
        </div>
        <div className='pool-info'>
          <span className='pool-label'>Pool tracked:</span>
          <a 
            href={`https://basescan.org/address/${tokenAddress}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className='pool-address'
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {tokenAddress}
          </a>
        </div>
      </div>
    </div>
  );
};

export default PredictionMarketCard;
