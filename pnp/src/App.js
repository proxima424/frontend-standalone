import React from 'react';
import './App.css';
import Spline from '@splinetool/react-spline';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import PriceMarkets from './pages/PriceMarkets';
import TokenMarket from './pages/TokenMarket';
import Footer from './components/Footer';

function HomePage() {
  return (
    <>
      <div className="main-container">
        <div className="content">
          <motion.div 
            className="title-container"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
          >
            <motion.h1 
              className="title"
              variants={{
                hidden: { opacity: 0, y: -20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    duration: 0.5,
                    ease: "easeOut"
                  }
                }
              }}
            >
              Permissionless
            </motion.h1>
            <motion.h1 
              className="title special-head poppins-font"
              variants={{
                hidden: { opacity: 0, y: -20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    duration: 0.5,
                    ease: "easeOut"
                  }
                }
              }}
            >
              Prediction Markets
            </motion.h1>
            <motion.h2 
              className="subheading"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    duration: 0.5,
                    ease: "easeOut"
                  }
                }
              }}
            >
              <div>No orderbook, No illiquid markets.</div> <div> Trade your sentiments directly against the bonding curve permissionlesly</div>
            </motion.h2>
            <motion.div 
              className="button-container-land"
              variants={{
                hidden: { opacity: 0 },
                visible: { 
                  opacity: 1,
                  transition: {
                    duration: 0.3,
                    ease: "easeOut"
                  }
                }
              }}
            >
              <a className="btn-primary" href="/trade">Start Trading</a>
              <a className="btn-secondary" href="/dashboard">View Dashboard</a>
            </motion.div>
          </motion.div>
          <div className="spline-container">
            <Spline scene="https://prod.spline.design/mLlfM-mUgJQCxt1F/scene.splinecode" />
          </div>
        </div>
      </div>
      <Footer /> {/* Footer placed only once here */}
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
