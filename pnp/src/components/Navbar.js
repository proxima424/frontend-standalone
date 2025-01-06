import React, { useState } from 'react';
import './Navbar.css';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { login, ready, authenticated, logout } = usePrivy();
  const { wallets } = useWallets();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getWalletAddress = () => {
    if (wallets && wallets.length > 0) {
      return truncateAddress(wallets[0].address);
    }
    return '';
  };

  const handleLogout = async () => {
    await logout();
    setShowLogout(false);
  };

  const handleProtocolTitleClick = () => {
    navigate('/');
  };

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
        <div 
          className="navbar-brand" 
          onClick={handleProtocolTitleClick}
          style={{ cursor: 'pointer' }}
        >
          pnp protocol
        </div>
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
          {ready && !authenticated ? (
            <button onClick={login} className="login-button">
              Login
            </button>
          ) : (
            <div className="wallet-container">
              <button 
                className="login-button address-button"
                onClick={() => setShowLogout(!showLogout)}
              >
                {getWalletAddress()}
              </button>
              {showLogout && (
                <button 
                  className="logout-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
