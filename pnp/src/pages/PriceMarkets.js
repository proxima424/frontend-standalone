import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PriceMarkets.css';

const PriceMarkets = () => {
  const [tokenAddress, setTokenAddress] = useState('');
  const navigate = useNavigate();
  
  const [tokens] = useState([
    {
      id: 1,
      name: 'cBTC',
      logo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
      price: '$43,215.23',
      marketCap: '$843.2M',
      gain24h: '+5.2%',
      gain1h: '+1.0%',
      volume: '$24.5M',
      supply: '19,500',
      tokenAddress: '0x1234567890abcdef1234567890abcdef12345678'
    },
    {
      id: 2,
      name: 'cETH',
      logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      price: '$2,243.45',
      marketCap: '$270.1M',
      gain24h: '-1.2%',
      gain1h: '-0.5%',
      volume: '$15.3M',
      supply: '120,000',
      tokenAddress: '0xabcdef1234567890abcdef1234567890abcdef12'
    },
    {
      id: 3,
      name: 'PENGU',
      logo: 'https://assets.coingecko.com/coins/images/24383/small/pengu.png',
      price: '$0.45',
      marketCap: '$50.5M',
      gain24h: '+12.3%',
      gain1h: '+2.8%',
      volume: '$5.1M',
      supply: '112.2M',
      tokenAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdef'
    },
    {
      id: 4,
      name: 'cSOL',
      logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
      price: '$75.32',
      marketCap: '$95.7M',
      gain24h: '+8.7%',
      gain1h: '+1.5%',
      volume: '$8.9M',
      supply: '1.27M',
      tokenAddress: '0x7890abcdef1234567890abcdef1234567890abcd'
    }
  ]);

  const handleCreateMarket = (tokenAddress) => {
    navigate(`/price_markets/${tokenAddress}`);
  };

  return (
    <div className="price-markets">
      <div className="main-content">
        <div className="search-container">
          <input
            type="text"
            placeholder="Enter token address"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            className="token-input"
          />
        </div>
        
        <div className="table-container">
          <table className="assets-table">
            <thead>
              <tr>
                <th className="rank-column">#</th>
                <th className="name-column">Asset</th>
                <th className="price-column">Price</th>
                <th className="market-cap-column">Market Cap</th>
                <th className="change-column">24h Change</th>
                <th className="change-column">1h Change</th>
                <th className="volume-column">Volume (24h)</th>
                <th className="supply-column">Circulating Supply</th>
                <th className="prediction-column">Prediction Markets</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <tr key={token.id} className="token-row">
                  <td className="rank-column">{token.id}</td>
                  <td className="name-column">
                    <div className="token-info">
                      <img src={token.logo} alt={token.name} className="token-logo" />
                      <span>{token.name}</span>
                    </div>
                  </td>
                  <td className="price-column">{token.price}</td>
                  <td className="market-cap-column">{token.marketCap}</td>
                  <td className={`change-column ${token.gain24h.startsWith('+') ? 'positive' : 'negative'}`}>{token.gain24h}</td>
                  <td className={`change-column ${token.gain1h.startsWith('+') ? 'positive' : 'negative'}`}>{token.gain1h}</td>
                  <td className="volume-column">{token.volume}</td>
                  <td className="supply-column">{token.supply}</td>
                  <td className="prediction-column">
                    <button className="create-market-btn" onClick={() => handleCreateMarket(token.tokenAddress)}>
                      <span className="plus-icon">+</span>
                      <span className="btn-text">Create Market</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PriceMarkets;
