import React from 'react';
import './Saruman.css';

const Saruman = ({ 
  question, 
  yesHolders, 
  noHolders, 
  yesPrice, 
  noPrice, 
  yesMultiplier, 
  noMultiplier, 
  volume,
  collateral = "USDC",
  resolutionSource = "Perplexity"
}) => {
  return (
    <div className="saruman-container">
      <div className="market-question">
        {question}
      </div>
      
      <div className="market-collateral">
        <div className="usdc-icon">
          <img src="/usdc.svg" alt="USDC" width="18" height="18" />
        </div>
        Collateral: {collateral}
      </div>
      
      <div className="odds-container">
        <div className="odds-column yes-column">
          <div className="odds-header">YES</div>
          <div className="price-value">${yesPrice}</div>
          <div className="holders-value">{yesHolders} holders</div>
          <div className="multiplier">×{yesMultiplier}</div>
        </div>
        
        <div className="odds-column no-column">
          <div className="odds-header">NO</div>
          <div className="price-value">${noPrice}</div>
          <div className="holders-value">{noHolders} holders</div>
          <div className="multiplier">×{noMultiplier}</div>
        </div>
      </div>
      
      <div className="market-footer">
        <div className="market-volume">
          Market Volume: ${volume}
        </div>
        <div className="resolution-source">
          <img src="/globe.svg" alt="Globe" className="globe-icon" width="16" height="16" />
          Settled by {resolutionSource}
        </div>
      </div>
    </div>
  );
};

export default Saruman; 