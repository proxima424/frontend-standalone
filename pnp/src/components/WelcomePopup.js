import React from 'react';
import './WelcomePopup.css';

const steps = [
  "Think of any question you want a market on",
  "Frame it to a YES/NO question",
  "Enter liquidity to init the bonding curve",
  "Keep liq. as low as possible (2 for now)",
  "Enter market deadline (Min. 2 Days)"
];

const WelcomePopup = ({ onClose }) => {
  return (
    <div className="welcome-popup-overlay">
      <div className="welcome-popup-content">
        <button className="welcome-popup-close" onClick={onClose} aria-label="Close">×</button>
        
        <div className="welcome-header">
          <h1>Create Your Market</h1>
          <p className="welcome-subtitle">Follow these quick steps to get started</p>
        </div>

        <div className="welcome-steps">
          {steps.map((text, index) => (
            <div className="welcome-step" key={index}>
              <div className="step-number">{index + 1}</div>
              <p className="step-detail">{text}</p>
            </div>
          ))}
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
