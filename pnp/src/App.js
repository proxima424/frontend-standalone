import React from "react";
import "./App.css";
import Spline from "@splinetool/react-spline";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./components/Navbar";
import PriceMarkets from "./pages/PriceMarkets";
import TokenMarket from "./pages/TokenMarket";
import Testing from "./pages/Testing";
import MarketExplore from "./pages/MarketExplore";
import LiveMarkets from "./pages/LiveMarkets";
import TwitterMarket from "./pages/TwitterMarket";
import UserMarkets from "./pages/UserMarkets";
import Gandalf from "./pages/Gandalf";
import GandalfTradePage from "./pages/GandalfTradePage";
import Docs from "./pages/Docs";

import Roadmap from "./pages/Roadmap"
import MarketAIReasoning from "./pages/MarketAIReasoning";


// Removed RainbowKit and Wagmi specific imports and config from here,
// as they are now handled in index.js and wagmi.js

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
                  staggerChildren: 0.2,
                },
              },
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
                    ease: "easeOut",
                  },
                },
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
                    ease: "easeOut",
                  },
                },
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
                    ease: "easeOut",
                  },
                },
              }}
            >
              <div>No orderbook, No illiquid markets.</div>{" "}
              <div>
                {" "}
                Trade your sentiments directly against the bonding curve
                permissionlesly
              </div>
            </motion.h2>
            <motion.div
              className="button-container-land"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    duration: 0.3,
                    ease: "easeOut",
                  },
                },
              }}
            >
              <a className="btn-primary" href="/gandalf">
                Live on Testnet ETH
              </a>
              <a
                className="btn-secondary"
                href="https://t.me/pnpexchangeportal"
              >
                Join Telegram Now
              </a>
            </motion.div>
          </motion.div>
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
    // Providers are now in index.js, so App just returns the Router and its content
    <Router>
      <Navbar />
      <div className="global-bg-effects">
        <div className="blur-circle top-left"></div>
        <div className="blur-circle bottom-right"></div>
        <div className="grid-overlay"></div>
      </div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/price_markets" element={<PriceMarkets />} />
        <Route path="/price_markets/:address" element={<TokenMarket />} />
        <Route
          path="/token/:tokenAddress"
          element={
            <Spline scene="https://prod.spline.design/DgI5mbX9cHYbIT7F/scene.splinecode" />
          }
        />
        <Route path="/testing" element={<Testing />} />
        <Route
          path="/price_markets/explore/:conditionId"
          element={<MarketExplore />}
        />
        <Route
          path="/twitter_markets/:conditionId"
          element={<TwitterMarket />}
        />
        <Route path="/live_markets" element={<LiveMarkets />} />
        <Route
          path="/twitter_markets/user/:address"
          element={<UserMarkets />}
        />
        <Route path="/docs" element={<Docs />} />
        <Route path="/gandalf" element={<Gandalf />} />
        <Route path="/gandalf/user/:creatorAddress" element={<Gandalf />} />
        <Route path="/gandalf/market/:conditionId" element={<Gandalf />} />
        <Route
          path="/gandalf/:conditionId/trade"
          element={<GandalfTradePage />}
        />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/settled" element={<MarketAIReasoning />} />
      </Routes>
    </Router>
  );
}

export default App;

