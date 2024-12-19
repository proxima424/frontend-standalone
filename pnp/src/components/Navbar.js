import React from 'react';
import './Navbar.css';
import { usePrivy } from '@privy-io/react-auth';

const Navbar = () => {
  const { login, ready, authenticated } = usePrivy();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">pnp protocol</div>
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
