import React from 'react';
import './WelcomePopup.css';

const WelcomePopup = ({ onClose }) => {
  return (
    <div className="welcome-popup-overlay">
      <div className="welcome-popup-content">
        <button className="welcome-popup-close" onClick={onClose}>×</button>
        
        <div className="welcome-header">
          <h1>Create Your Market</h1>
        </div>

        <div className="welcome-steps">
          <div className="welcome-step">
            <div className="step-bullet">•</div>
            <p>Think of any question you want a market on</p>
          </div>

          <div className="welcome-step">
            <div className="step-bullet">•</div>
            <p>Frame it to a YES/NO question</p>
          </div>

          <div className="welcome-step">
            <div className="step-bullet">•</div>
            <p>Enter liquidity to init the bonding curve</p>
          </div>

          <div className="welcome-step">
            <div className="step-bullet">•</div>
            <p>Keep liq. as low as possible (2 for now)</p>
          </div>

          <div className="welcome-step">
            <div className="step-bullet">•</div>
            <p>Enter market deadline (Min. 2 Days)</p>
          </div>
        </div>

        <div className="welcome-footer">
          <button className="welcome-close-button" onClick={onClose}>
            Got it! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup; 