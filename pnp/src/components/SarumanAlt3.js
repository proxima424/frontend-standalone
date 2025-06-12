/* global BigInt */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './SarumanAlt3.css';

const CountdownTimer = ({ endTime, isMarketSettled, compact = false }) => {
  const calculateTimeLeft = useCallback(() => {
    if (!endTime || Number(endTime) === 0) return {};
    const endTimeMs = Number(endTime) * 1000;
    const difference = endTimeMs - new Date().getTime();
    let newTimeLeft = {};

    if (difference > 0) {
      newTimeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return newTimeLeft;
  }, [endTime]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    if (!endTime || Number(endTime) === 0) return;
    const timerId = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timerId);
  }, [endTime, calculateTimeLeft]);

  if (!endTime || Number(endTime) === 0) {
    return <span className="time-status">No deadline</span>;
  }

  const timeIsUp = Number(endTime) * 1000 < new Date().getTime();
  if (timeIsUp && !isMarketSettled) return <span className="time-status settling">Settling...</span>;
  if (timeIsUp && isMarketSettled) return <span className="time-status settled">Settled</span>;

  if (!compact) {
    const timerComponents = [];
    Object.keys(timeLeft).forEach((interval) => {
      if (timeLeft[interval] === undefined || timeLeft[interval] === null) return;
      const value = timeLeft[interval] < 10 && timeLeft[interval] >=0 ? `0${timeLeft[interval]}` : timeLeft[interval];
      timerComponents.push(
        <div key={interval} className="time-block">
          <span className="time-value">{value}</span>
          <span className="time-label">{interval.substring(0, 3)}</span>
        </div>
      );
    });
    return <div className="countdown-blocks">{timerComponents}</div>;
  }

  // Compact version for header
  const totalHours = (timeLeft.days || 0) * 24 + (timeLeft.hours || 0);
  if (totalHours > 0) return <span className="time-status">{totalHours}h {timeLeft.minutes || 0}m</span>;
  return <span className="time-status">{timeLeft.minutes || 0}m {timeLeft.seconds || 0}s</span>;
};

const SarumanAlt3 = ({
  isLoading = false,
  marketData = {},
  resolutionData = null,
}) => {
  const navigate = useNavigate();
  const [userBalances] = useState({ yesBalance: '0', noBalance: '0' });
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [bottomSheetContent, setBottomSheetContent] = useState('');

  const calculateMultipliers = (yesPrice, noPrice) => {
    const yesMultiplier = yesPrice > 0 ? (1 / yesPrice) : 0;
    const noMultiplier = noPrice > 0 ? (1 / noPrice) : 0;
    return {
      yesMultiplier: Number(yesMultiplier.toFixed(2)),
      noMultiplier: Number(noMultiplier.toFixed(2))
    };
  };

  const handleDepositClick = (isYes) => {
    if (marketData?.id) {
      navigate(`/gandalf/${marketData.id}/trade`);
    }
  };

  const openBottomSheet = (content) => {
    setBottomSheetContent(content);
    setShowBottomSheet(true);
  };

  const closeBottomSheet = () => {
    setShowBottomSheet(false);
    setTimeout(() => setBottomSheetContent(''), 300);
  };

  if (isLoading) {
    return (
      <div className="saruman-alt3-container loading">
        <div className="pulse-loader"></div>
        <span className="loading-text">Loading market data...</span>
      </div>
    );
  }

  const {
    question = 'Market details not available',
    yesPrice = 0,
    noPrice = 0,
    marketReserve = '0',
    collateralTokenAddress,
    resolutionSource = "Perplexity",
    marketEndTime = null,
  } = marketData || {};

  const { yesMultiplier, noMultiplier } = calculateMultipliers(yesPrice, noPrice);
  const isMarketSettled = false; // Simplified for demo

  return (
    <>
      <div className="saruman-alt3-container">
        {/* Compact Header */}
        <div className="compact-header">
          <div className="market-title">
            <h2>{String(question)}</h2>
            {resolutionData && (
              <div className={`resolution-indicator ${resolutionData.resolvable ? 'good' : 'warning'}`}>
                {resolutionData.resolvable ? '✓' : '⚠'}
              </div>
            )}
          </div>
          
          <div className="market-stats">
            <div className="stat">
              <span className="stat-label">Reserve</span>
              <span className="stat-value">${marketReserve}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Ends</span>
              <CountdownTimer endTime={marketEndTime} isMarketSettled={isMarketSettled} compact={true} />
            </div>
          </div>
        </div>

        {/* Main Trading Area */}
        <div className="trading-area">
          <div className="position-card yes-position">
            <div className="position-header">
              <span className="position-name">YES</span>
              <span className="position-balance">{userBalances.yesBalance}</span>
            </div>
            <div className="position-price">
              <span className="price">${Number(yesPrice).toFixed(2)}</span>
              <span className="multiplier">×{Number(yesMultiplier).toFixed(1)}</span>
            </div>
            <button 
              className="position-btn yes-btn"
              onClick={() => handleDepositClick(true)}
            >
              Buy YES
            </button>
          </div>

          <div className="vs-divider">
            <span>VS</span>
          </div>

          <div className="position-card no-position">
            <div className="position-header">
              <span className="position-name">NO</span>
              <span className="position-balance">{userBalances.noBalance}</span>
            </div>
            <div className="position-price">
              <span className="price">${Number(noPrice).toFixed(2)}</span>
              <span className="multiplier">×{Number(noMultiplier).toFixed(1)}</span>
            </div>
            <button 
              className="position-btn no-btn"
              onClick={() => handleDepositClick(false)}
            >
              Buy NO
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-row">
          <button 
            className="action-btn secondary"
            onClick={() => openBottomSheet('details')}
          >
            <span className="btn-icon">📊</span>
            Market Details
          </button>
          
          {resolutionData && (
            <button 
              className="action-btn secondary"
              onClick={() => openBottomSheet('resolution')}
            >
              <span className="btn-icon">🔍</span>
              Resolution Info
            </button>
          )}
          
          <button 
            className="action-btn secondary"
            onClick={() => openBottomSheet('timer')}
          >
            <span className="btn-icon">⏰</span>
            Time Details
          </button>
        </div>
      </div>

      {/* Bottom Sheet Overlay */}
      {showBottomSheet && (
        <div className="bottom-sheet-overlay" onClick={closeBottomSheet}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle"></div>
            
            <div className="sheet-header">
              <h3>
                {bottomSheetContent === 'details' && 'Market Details'}
                {bottomSheetContent === 'resolution' && 'Resolution Information'}
                {bottomSheetContent === 'timer' && 'Time Information'}
              </h3>
              <button className="sheet-close" onClick={closeBottomSheet}>✕</button>
            </div>

            <div className="sheet-content">
              {bottomSheetContent === 'details' && (
                <div className="details-content">
                  <div className="detail-row">
                    <span className="detail-label">Market Reserve</span>
                    <span className="detail-value">${marketReserve}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Collateral Token</span>
                    <span className="detail-value mono">
                      {collateralTokenAddress ? 
                        `${collateralTokenAddress.slice(0,6)}...${collateralTokenAddress.slice(-4)}` : 
                        "N/A"
                      }
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Settlement Source</span>
                    <span className="detail-value">{resolutionSource}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Market Type</span>
                    <span className="detail-value">Binary Prediction</span>
                  </div>
                </div>
              )}

              {bottomSheetContent === 'resolution' && resolutionData && (
                <div className="resolution-content">
                  <div className="resolution-status-full">
                    <div className={`status-badge ${resolutionData.resolvable ? 'good' : 'warning'}`}>
                      <span className="status-icon">{resolutionData.resolvable ? '✓' : '⚠'}</span>
                      <span className="status-text">
                        {resolutionData.resolvable ? 'Market is resolvable' : 'Resolution issues detected'}
                      </span>
                    </div>
                  </div>

                  <div className="resolution-section">
                    <h4>Reasoning</h4>
                    <p>{resolutionData.reasoning}</p>
                  </div>

                  <div className="resolution-section">
                    <h4>AI Settlement Criteria</h4>
                    <p>{resolutionData.settlement_criteria}</p>
                  </div>

                  {resolutionData.resolution_sources && resolutionData.resolution_sources.length > 0 && (
                    <div className="resolution-section">
                      <h4>Data Sources</h4>
                      <ul className="sources-list">
                        {resolutionData.resolution_sources.map((source, index) => (
                          <li key={index}>{source}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {resolutionData.suggested_improvements && resolutionData.suggested_improvements !== 'None' && (
                    <div className="resolution-section improvement-note">
                      <h4>Suggested Improvements</h4>
                      <p>{resolutionData.suggested_improvements}</p>
                    </div>
                  )}
                </div>
              )}

              {bottomSheetContent === 'timer' && (
                <div className="timer-content">
                  <div className="timer-display">
                    <CountdownTimer endTime={marketEndTime} isMarketSettled={isMarketSettled} />
                  </div>
                  <div className="timer-info">
                    <p>Market ends at: {marketEndTime ? new Date(Number(marketEndTime) * 1000).toLocaleString() : 'No deadline set'}</p>
                    <p>After the market ends, it will be settled automatically using {resolutionSource}.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SarumanAlt3; 