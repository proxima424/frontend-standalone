import React from 'react';
import './MarketTile.css';

const MarketTile = ({ 
  question, 
  yesPrice, 
  noPrice, 
  yesMultiplier,
  noMultiplier
}) => {
  return (
    <div className="market-tile">
      <div className="tile-content">
        <h3 className="tile-question">{question}</h3>
        
        <div className="tile-outcomes">
          <div className="outcome yes">
            <div className="outcome-header">YES</div>
            <div className="outcome-data">
              <div className="outcome-price">${yesPrice}</div>
              <div className="outcome-multiplier">×{yesMultiplier}</div>
            </div>
          </div>
          
          <div className="outcome no">
            <div className="outcome-header">NO</div>
            <div className="outcome-data">
              <div className="outcome-price">${noPrice}</div>
              <div className="outcome-multiplier">×{noMultiplier}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketTile; 