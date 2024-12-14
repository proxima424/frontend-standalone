import React from 'react';
import { useParams } from 'react-router-dom';
import './TokenMarket.css';

const TokenMarket = () => {
  const { address } = useParams();

  return (
    <div className="token-market">
      <div className="token-header">
        <div className="token-info">
          <h1>Token Markets</h1>
          <div className="token-address">
            Address: {address}
          </div>
        </div>
      </div>
      <div className="market-content">
        {/* Market content will go here */}
      </div>
    </div>
  );
};

export default TokenMarket;
