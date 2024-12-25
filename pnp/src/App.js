import React from 'react';
import './App.css';
import Spline from '@splinetool/react-spline';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import PriceMarkets from './pages/PriceMarkets';
import TokenMarket from './pages/TokenMarket';

function HomePage() {
  return (
    <>
      <div className="main-container">
        <div className="content">
          <div className="title-container">
            <motion.h1 className="title" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>Permissionless</motion.h1>
            <motion.h1 className="title special-head poppins-font" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>Prediction</motion.h1>
            <motion.h1 className="title poppins-font" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>Markets</motion.h1>
            <motion.h2 className="subheading" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}>Create auto-settling prediction markets without any third party approval or fees or optimistic faith in the oracle.</motion.h2>
            <div className="button-container">
              <a className="btn-primary" href="/trade">Start Trading</a>
              <a className="btn-secondary" href="/dashboard">View Dashboard</a>
            </div>
          </div>
          <div className="spline-container">
            <Spline scene="https://prod.spline.design/mLlfM-mUgJQCxt1F/scene.splinecode" />
          </div>
        </div>
      </div>

    </>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/price_markets" element={<PriceMarkets />} />
        <Route path="/price_markets/:address" element={<TokenMarket />} />
        <Route path="/token/:tokenAddress" element={<Spline scene="https://prod.spline.design/DgI5mbX9cHYbIT7F/scene.splinecode" />} />
      </Routes>
    </Router>
  );
}

export default App;