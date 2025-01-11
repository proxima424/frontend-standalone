import React, { useState, useEffect } from 'react';
import './TwitterMarketCard.css';

const TwitterMarketCard = ({ 
  marketQuestion,
  yesMultiplier,
  noMultiplier,
  marketReserve,
  twitterUsername,
  endTime,
  onMint,
  onProvideLiquidity
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [collateralAmount, setCollateralAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    if (!endTime) return;

    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const difference = endTime - now;
      
      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        };
      }

      return {
        days: Math.floor(difference / (60 * 60 * 24)),
        hours: Math.floor((difference % (60 * 60 * 24)) / (60 * 60)),
        minutes: Math.floor((difference % (60 * 60)) / 60),
        seconds: difference % 60
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const handleMint = (e) => {
    e.stopPropagation();
    if (onMint) onMint(collateralAmount);
  };

  const twitterLink = twitterUsername ? `https://x.com/${twitterUsername.replace('@', '')}` : '#';

  return (
    <div className='white-rectangle-container' style={{ cursor: 'pointer' }}>
      <div className='question-section'>
        <h2 className='white-rectangle-title'>{marketQuestion}</h2>
        <div className='info-icon' title="This prediction market settles based on tweets from the specified Twitter account.">
          ℹ️
        </div>
      </div>
      
      <div className='prediction-section'>
        <div className='prediction-controls'>
          <div className='options-section'>
            <button
              className={`prediction-button yes-button ${selectedOption === 'YES' ? 'selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedOption('YES');
              }}
            >
              YES x{yesMultiplier}
            </button>
            <button
              className={`prediction-button no-button ${selectedOption === 'NO' ? 'selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedOption('NO');
              }}
            >
              NO x{noMultiplier}
            </button>
          </div>

          <div className='mint-controls'>
            <input
              type="number"
              placeholder="Collateral Amount"
              value={collateralAmount}
              onChange={(e) => {
                e.stopPropagation();
                setCollateralAmount(e.target.value);
              }}
              className={`collateral-input ${!selectedOption ? 'disabled' : ''}`}
              disabled={!selectedOption}
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              className={`mint-button ${!selectedOption ? 'disabled' : ''}`}
              disabled={!selectedOption}
              onClick={handleMint}
            >
              Mint Position
            </button>
          </div>
        </div>
      </div>

      <div className='countdown-container'>
        <div className='countdown-title'>Market Ends In</div>
        <div className='countdown-section'>
          <span className='countdown-number'>{timeLeft.days}</span>
          <span className='countdown-label'>d</span>
          <span className='countdown-separator'>:</span>
          <span className='countdown-number'>{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className='countdown-label'>h</span>
          <span className='countdown-separator'>:</span>
          <span className='countdown-number'>{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className='countdown-label'>m</span>
          <span className='countdown-separator'>:</span>
          <span className='countdown-number'>{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className='countdown-label'>s</span>
        </div>
      </div>

      <div className='footer-info'>
        <div className='footer-section'>
          <div className='footer-item'>
            <div className='footer-label'>Market Reserve</div>
            <div className='footer-value reserve-value'>
              ${parseFloat(marketReserve).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
          </div>
          <div className='footer-divider'></div>
          <div className='footer-item'>
            <div className='footer-label'>Tweets tracked as truth source</div>
            <a 
              href={twitterLink}
              target="_blank" 
              rel="noopener noreferrer"
              className='footer-value address-value'
              onClick={(e) => e.stopPropagation()}
            >
              @{twitterUsername || 'N/A'}
              <span className='external-link'>↗</span>
            </a>
          </div>
          <div className='footer-divider'></div>
          <div className='footer-item'>
            <div className='footer-label'>Want to earn fees?</div>
            <button 
              className='provide-liquidity-btn'
              onClick={(e) => {
                e.stopPropagation();
                if (onProvideLiquidity) onProvideLiquidity();
              }}
            >
              Provide Liquidity <span className='btn-icon'>+</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwitterMarketCard;
