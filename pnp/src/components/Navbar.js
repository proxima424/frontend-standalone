import React from 'react';
import './Navbar.css';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { login, ready, authenticated } = usePrivy();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="moving-strip">
        <div className="scroll-text">
          <span>🌐 PRICE MARKETS LIVE ON BASE</span>
          <span>🔄 PERMISSIONLESS MARKETS</span>
          <span>📊 LAUNCH MARKET ON ANY TOKEN</span>
          <span>🌐 ETHEREUM ALIGNED</span>   
          <span>📊 PNP PROTOCOL</span>
        </div>
      </div>
      <div className="navbar-content">
        <div className="navbar-brand">pnp protocol</div>
        <div className="nav-links">
          <button 
            className="nav-button"
            onClick={() => window.open('https://sapphire-nickel-23f.notion.site/How-it-works-16c7febcab0f80d79d99d48362f0c0e7?pvs=4', '_blank')}
          >
            How it works?
          </button>
          <button 
            className="nav-button" 
            onClick={() => navigate('/price_markets')}
          >
            Price Markets
          </button>
          <button className="nav-button">Twitter Markets</button>
        </div>
        <div className="navbar-right">
          {ready && !authenticated && (
            <button onClick={login} className="login-button">
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
