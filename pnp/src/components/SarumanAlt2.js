/* global BigInt */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './SarumanAlt2.css';

const CountdownTimer = ({ endTime, isMarketSettled }) => {
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
    return <span>No Deadline</span>;
  }

  const timeIsUp = Number(endTime) * 1000 < new Date().getTime();
  if (timeIsUp && !isMarketSettled) return <span className="settling">Settling Soon...</span>;
  if (timeIsUp && isMarketSettled) return <span className="settled">Settled</span>;

  const timerComponents = [];
  Object.keys(timeLeft).forEach((interval) => {
    if (timeLeft[interval] === undefined || timeLeft[interval] === null) return;
    const value = timeLeft[interval] < 10 && timeLeft[interval] >=0 ? `0${timeLeft[interval]}` : timeLeft[interval];
    timerComponents.push(
      <span key={interval} className="time-unit">
        {value}<small>{interval.charAt(0)}</small>
      </span>
    );
  });

  if (timerComponents.length === 0) return <span>Calculating...</span>;
  return <div className="countdown-display">{timerComponents}</div>;
};

const SarumanAlt2 = ({
  isLoading = false,
  marketData = {},
  resolutionData = null,
}) => {
  const navigate = useNavigate();
  const [userBalances] = useState({ yesBalance: '0', noBalance: '0' });
  const [showResolutionDetails, setShowResolutionDetails] = useState(false);
  const [showMarketDetails, setShowMarketDetails] = useState(false);

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

  if (isLoading) {
    return (
      <div className="saruman-alt2-container loading-state">
        <div className="loading-spinner"></div>
        <p>Loading Market...</p>
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
    <div className="saruman-alt2-container">
      {/* Header Card */}
      <div className="header-card">
        <div className="question-section">
          <h2 className="market-question">{String(question)}</h2>
          
          {resolutionData && (
            <div className={`resolution-status ${resolutionData.resolvable ? 'good' : 'bad'}`}>
              <div className="status-icon">
                {resolutionData.resolvable ? '✓' : '⚠'}
              </div>
              <span className="status-text">
                {resolutionData.resolvable ? 'Resolvable Market' : 'Resolution Issues'}
              </span>
              <button 
                className="details-toggle"
                onClick={() => setShowResolutionDetails(!showResolutionDetails)}
              >
                {showResolutionDetails ? 'Hide' : 'Details'}
              </button>
            </div>
          )}
        </div>

        {/* Resolution Details Expansion */}
        {showResolutionDetails && resolutionData && (
          <div className="resolution-details-card">
            <div className="detail-item">
              <h4>Reasoning</h4>
              <p>{resolutionData.reasoning}</p>
            </div>
            <div className="detail-item">
              <h4>AI Settlement Criteria</h4>
              <p>{resolutionData.settlement_criteria}</p>
            </div>
            {resolutionData.resolution_sources && resolutionData.resolution_sources.length > 0 && (
              <div className="detail-item">
                <h4>Data Sources</h4>
                <ul>
                  {resolutionData.resolution_sources.map((source, index) => (
                    <li key={index}>{source}</li>
                  ))}
                </ul>
              </div>
            )}
            {resolutionData.suggested_improvements && resolutionData.suggested_improvements !== 'None' && (
              <div className="detail-item improvement-suggestion">
                <h4>Suggested Improvements</h4>
                <p>{resolutionData.suggested_improvements}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trading Cards */}
      <div className="trading-section">
        <div className="trading-card yes-trading-card">
          <div className="card-header yes-header">
            <span className="position-label">YES</span>
            <span className="confidence-indicator"></span>
          </div>
          
          <div className="price-section">
            <div className="current-price">${Number(yesPrice).toFixed(2)}</div>
            <div className="multiplier">×{Number(yesMultiplier).toFixed(2)} return</div>
          </div>
          
          <div className="user-position">
            <span className="balance-label">Your position:</span>
            <span className="balance-amount">{userBalances.yesBalance} YES</span>
          </div>
          
          <button 
            className="trade-action-btn yes-btn"
            onClick={() => handleDepositClick(true)}
          >
            Buy YES
          </button>
        </div>

        <div className="trading-card no-trading-card">
          <div className="card-header no-header">
            <span className="position-label">NO</span>
            <span className="confidence-indicator"></span>
          </div>
          
          <div className="price-section">
            <div className="current-price">${Number(noPrice).toFixed(2)}</div>
            <div className="multiplier">×{Number(noMultiplier).toFixed(2)} return</div>
          </div>
          
          <div className="user-position">
            <span className="balance-label">Your position:</span>
            <span className="balance-amount">{userBalances.noBalance} NO</span>
          </div>
          
          <button 
            className="trade-action-btn no-btn"
            onClick={() => handleDepositClick(false)}
          >
            Buy NO
          </button>
        </div>
      </div>

      {/* Market Info Card */}
      <div className="market-info-card">
        <div className="info-header">
          <h3>Market Information</h3>
          <button 
            className="expand-btn"
            onClick={() => setShowMarketDetails(!showMarketDetails)}
          >
            {showMarketDetails ? '▼' : '▶'}
          </button>
        </div>
        
        <div className="basic-info">
          <div className="info-item">
            <span className="label">Reserve</span>
            <span className="value">${marketReserve}</span>
          </div>
          <div className="info-item">
            <span className="label">Time Left</span>
            <CountdownTimer endTime={marketEndTime} isMarketSettled={isMarketSettled} />
          </div>
          <div className="info-item">
            <span className="label">Settled by</span>
            <span className="value">{resolutionSource}</span>
          </div>
        </div>

        {showMarketDetails && (
          <div className="extended-info">
            <div className="info-row">
              <span className="label">Collateral Token</span>
              <span className="value mono">
                {collateralTokenAddress ? `${collateralTokenAddress.slice(0,8)}...${collateralTokenAddress.slice(-6)}` : "N/A"}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Market Type</span>
              <span className="value">Binary Prediction</span>
            </div>
            <div className="info-row">
              <span className="label">Resolution Method</span>
              <span className="value">Automated via {resolutionSource}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SarumanAlt2; 