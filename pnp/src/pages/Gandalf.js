import React from 'react';
import './Gandalf.css';
import Saruman from '../components/Saruman';
import MarketTile from '../components/MarketTile';

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
    marketReserve: "125,000",
    marketVolume: "328,450",
    collateral: "USDC"
  };

  // Sample markets for horizontal list
  const sampleMarkets = [
    {
      id: 1,
      question: "Will Bitcoin reach $100,000 by Q2 2024?",
      yesPrice: 0.65,
      noPrice: 0.35,
      yesMultiplier: 1.54,
      noMultiplier: 2.86
    },
    {
      id: 2,
      question: "Will Solana surpass Ethereum in daily transactions by end of 2024?",
      yesPrice: 0.21,
      noPrice: 0.79,
      yesMultiplier: 4.76,
      noMultiplier: 1.27
    },
    {
      id: 3,
      question: "Will any country adopt Bitcoin as legal tender in 2024?",
      yesPrice: 0.33,
      noPrice: 0.67,
      yesMultiplier: 3.03,
      noMultiplier: 1.49
    },
    {
      id: 4,
      question: "Will the Ethereum ETF be approved in the USA by end of 2024?",
      yesPrice: 0.44,
      noPrice: 0.56,
      yesMultiplier: 2.27,
      noMultiplier: 1.79
    },
    {
      id: 5,
      question: "Will the total crypto market cap exceed $3 trillion in 2024?",
      yesPrice: 0.58,
      noPrice: 0.42,
      yesMultiplier: 1.72,
      noMultiplier: 2.38
    },
    {
      id: 6,
      question: "Will NFT trading volume increase by at least 50% in 2024?",
      yesPrice: 0.37,
      noPrice: 0.63,
      yesMultiplier: 2.70,
      noMultiplier: 1.59
    }
  ];

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
        <div className="search-container">
          <input 
            type="text" 
            className="market-search" 
            placeholder="Search for markets"
          />
        </div>
        
        <div className="market-tiles-container">
          {sampleMarkets.map(market => (
            <MarketTile key={market.id} {...market} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gandalf; 