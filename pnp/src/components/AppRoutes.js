import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Spline from '@splinetool/react-spline';
import PriceMarkets from '../pages/PriceMarkets';
import TokenMarket from '../pages/TokenMarket';
import MarketExplore from '../pages/MarketExplore';
import LiveMarkets from '../pages/LiveMarkets';

function HomePage() {
  return (
    <div className="main-container">
      <div className="content">
        <div className="title-container">
          <h1 className="title">Permissionless</h1>
          <h1 className="title poppins-font">Prediction</h1>
          <h1 className="title poppins-font">Markets</h1>
        </div>
        <Spline scene="https://prod.spline.design/6ldcqpsBFd-EJkRh/scene.splinecode" />
      </div>
    </div>
  );
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/price_markets" element={<PriceMarkets />} />
      <Route path="/price_markets/:tokenAddress" element={<TokenMarket />} />
      <Route path="/explore/:conditionId" element={<MarketExplore />} />
      <Route path="/live_markets" element={<LiveMarkets />} />
      <Route 
        path="/token/:tokenAddress" 
        element={<Spline scene="https://prod.spline.design/DgI5mbX9cHYbIT7F/scene.splinecode" />} 
      />
    </Routes>
  );
};

export default AppRoutes;
