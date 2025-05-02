import React, { useState } from 'react';
import './Gandalf.css';
import Saruman from '../components/Saruman';
import MarketTile from '../components/MarketTile';
import CreateMarketForm from '../components/CreateMarketForm';

const Gandalf = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Initial data for Saruman
  const initialMarketData = {
    id: 'initial', // Add an ID for key prop
    question: "Will Aliens start visit Pakistan by end of May 2025?",
    yesHolders: 188,
    noHolders: 412,
    yesPrice: 0.15, 
    noPrice: 0.85,
    yesMultiplier: 6.67,
    noMultiplier: 1.18,
    volume: "188,450",
    marketReserve: "95,000",
    marketVolume: "188,450",
    collateral: "USDC",
    resolutionSource: "Community"
  };
  
  // State for the market displayed in alpha-right
  const [selectedMarketData, setSelectedMarketData] = useState(initialMarketData);

  const handleShowForm = () => {
    setShowCreateForm(true);
  };

  const handleHideForm = () => {
    setShowCreateForm(false);
  };

  // Sample markets for horizontal MarketTile list
  const sampleMarkets = [
    {
      id: 1,
      question: "Will Trump say Kanye is his friend by September 2025?",
      yesPrice: 0.42,
      noPrice: 0.58,
      yesMultiplier: 2.38,
      noMultiplier: 1.72
    },
    {
      id: 2,
      question: "Will a new fish species be named after a memecoin by July 2026?",
      yesPrice: 0.28,
      noPrice: 0.72,
      yesMultiplier: 3.57,
      noMultiplier: 1.39
    },
    {
      id: 3,
      question: "Will Five guys launch a hawk-tuak hot-dog by September 2025?",
      yesPrice: 0.66, 
      noPrice: 0.34,
      yesMultiplier: 1.52,
      noMultiplier: 2.94
    },
    {
      id: 4,
      question: "Will a Fortune 500 Company Adopt a Shiba Inu as an Official Mascot by June 30, 2026?",
      yesPrice: 0.19,
      noPrice: 0.81,
      yesMultiplier: 5.26,
      noMultiplier: 1.23
    },
    {
      id: 5, 
      question: "Will ETH price exceed $5,000 by the end of 2024?",
      yesPrice: 0.72,
      noPrice: 0.28,
      yesMultiplier: 1.38,
      noMultiplier: 3.57
    },
    {
      id: 6, 
      question: "Will AI achieve general intelligence by 2030?",
      yesPrice: 0.31,
      noPrice: 0.69,
      yesMultiplier: 3.23,
      noMultiplier: 1.45
    }
  ];

  // Function to handle market selection from tiles
  const handleMarketSelect = (market) => {
    // Map data from MarketTile format to Saruman format
    // Add placeholders for missing data
    setSelectedMarketData({
      ...market, // Spread existing data (id, question, prices, multipliers)
      yesHolders: Math.floor(Math.random() * 500) + 50, // Placeholder
      noHolders: Math.floor(Math.random() * 500) + 50, // Placeholder
      volume: `${(Math.random() * 500000 + 50000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, // Placeholder
      marketReserve: `${(Math.random() * 200000 + 20000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, // Placeholder
      marketVolume: `${(Math.random() * 500000 + 50000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`, // Placeholder
      collateral: "USDC", // Default
      resolutionSource: "Perplexity" // Default for selected markets
    });
  };

  return (
    <div className="gandalf-container">
      <div className="alpha-container">
        <div className="alpha-left">
          {showCreateForm ? (
            <CreateMarketForm onClose={handleHideForm} />
          ) : (
            <button className="create-market-button" onClick={handleShowForm}>
              <div className="plus-icon">+</div>
              <div className="create-text">Create Market</div>
            </button>
          )}
        </div>
        <div className="alpha-right">
          {/* Use selectedMarketData and add a key for animation trigger */}
          <Saruman key={selectedMarketData.id} {...selectedMarketData} />
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
            <MarketTile 
              key={market.id} 
              {...market} 
              onClick={() => handleMarketSelect(market)} // Pass handler
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gandalf; 