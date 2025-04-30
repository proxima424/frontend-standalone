import React from 'react';
import './Gandalf.css';
import Saruman from '../components/Saruman';

const Gandalf = () => {
  const handleCreateMarket = () => {
    console.log("Create Market button clicked!");
    // Placeholder function for now
  };

  // Sample prediction market data
  const sampleMarketData = {
    question: "Will ETH price exceed $5,000 by the end of 2024?",
    yesHolders: 243,
    noHolders: 78,
    yesPrice: 0.72,
    noPrice: 0.28,
    yesMultiplier: 1.38,
    noMultiplier: 3.57,
    volume: "328,450",
    collateral: "USDC"
  };

  return (
    <div className="gandalf-container">
      <div className="alpha-container">
        <div className="alpha-left">
          <button className="create-market-button" onClick={handleCreateMarket}>
            <div className="plus-icon">+</div>
            <div className="create-text">Create Market</div>
          </button>
        </div>
        <div className="alpha-right">
          <Saruman {...sampleMarketData} />
        </div>
      </div>
      
      <div className="gamma-container">
        Gamma Container
      </div>
    </div>
  );
};

export default Gandalf; 