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
          <span>🌐 CREATE A PREDICTION MARKET ON ANY EVENT</span>
          <span>🔄 PERMISSIONLESS MARKETS</span>
          <span>📊 COMPLETELY ONCHAIN</span>
          <span>🌐 PERPLEXITY SONAR API SETTLES MARKETS</span>   
          <span>📊 NETWORK OF AVS OPERATORS</span>
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
            onClick={() => navigate('/docs')}
          >
            How it works?
          </button>
          <button 
            className="nav-button" 
            onClick={() => navigate('/')}
          >
            PERPLEXITY MARKETS
          </button>
          <button className="nav-button"
          onClick={() => window.open('https://polynews.in', '_blank')}>POLY NEWS</button>
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
