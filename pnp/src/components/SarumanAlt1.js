/* global BigInt */
import React, { useState, useEffect, useCallback } from 'react';
import { useContractWrite, useWaitForTransactionReceipt, usePublicClient, useAccount, useContractRead } from 'wagmi';
import { parseEther, keccak256, encodePacked, formatEther } from 'viem';
import { PNP_FACTORY_ADDRESS } from '../contracts/contractConfig';
import { useNavigate } from 'react-router-dom';
import './SarumanAlt1.css';

const USDPNP_ADDRESS = '0xf506826e42047EB538F567539fFb8db74a093FD8';

// Reuse the same ABI and other constants from original Saruman.js
const PNP_ABI = [
  {
    inputs: [
      { internalType: "bytes32", name: "conditionId", type: "bytes32" },
      { internalType: "uint256", name: "collateralAmount", type: "uint256" },
      { internalType: "uint256", name: "tokenIdToMint", type: "uint256" }
    ],
    name: "mintDecisionTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "bytes32", name: "conditionId", type: "bytes32" }
    ],
    name: "getYesTokenId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "pure",
    type: "function"
  },
  {
    inputs: [
      { internalType: "bytes32", name: "conditionId", type: "bytes32" }
    ],
    name: "getNoTokenId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "pure",
    type: "function"
  },
  {
    inputs: [
      { internalType: "bytes32", name: "conditionId", type: "bytes32" }
    ],
    name: "getMarketEndTime",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "name": "marketSettled",
    "outputs": [{ "internalType": "bool", name: "", type: "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", name: "", "type": "bytes32" }],
    "name": "winningTokenId",
    "outputs": [{ "internalType": "uint256", name: "", type: "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const ERC1155_SUPPLY_ABI = [
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "uint256", name: "id", type: "uint256" }
    ],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
];

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

    const timerId = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timerId);
  }, [endTime, calculateTimeLeft]);

  if (!endTime || Number(endTime) === 0) {
    return <div className="countdown-timer"><span>No Deadline Set</span></div>;
  }

  const timeIsUp = Number(endTime) * 1000 < new Date().getTime();

  if (timeIsUp && !isMarketSettled) {
    return <div className="countdown-timer"><span className="settling-soon-message">Settling Soon...</span></div>;
  } 
  
  if (timeIsUp && isMarketSettled) {
    return <div className="countdown-timer"><span className="settled-message">Market Settled</span></div>;
  }

  const timerComponents = [];
  Object.keys(timeLeft).forEach((interval) => {
    if (timeLeft[interval] === undefined || timeLeft[interval] === null) return;
    const value = timeLeft[interval] < 10 && timeLeft[interval] >=0 ? `0${timeLeft[interval]}` : timeLeft[interval];
    timerComponents.push(
      <span key={interval} className="timer-segment">
        {value} <span className="timer-label">{interval.charAt(0).toUpperCase()}</span>
      </span>
    );
  });

  if (timerComponents.length === 0 && timeIsUp) {
    return <div className="countdown-timer"><span className="settled-message">Market Ended</span></div>;
  }
  if (timerComponents.length === 0) {
      return <div className="countdown-timer"><span>Calculating...</span></div>;
  }

  return (
    <div className="countdown-timer">
      {timerComponents.reduce((prev, curr) => [prev, ' : ', curr])}
    </div>
  );
};

const SarumanAlt1 = ({
  isLoading = false,
  marketData = {},
  resolutionData = null,
}) => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const [depositAmount, setDepositAmount] = useState('');
  const [showDepositField, setShowDepositField] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [tokenIds, setTokenIds] = useState({ yesTokenId: null, noTokenId: null });
  const [userBalances, setUserBalances] = useState({ yesBalance: '0', noBalance: '0' });
  const [winningOutcome, setWinningOutcome] = useState(null);
  const [activeTab, setActiveTab] = useState('trade'); // 'trade' or 'details'
  const [expandedSection, setExpandedSection] = useState(null);

  const publicClient = usePublicClient();
  const conditionId = marketData?.id && marketData.id !== 'default-market' ? marketData.id : null;

  const { data: isMarketSettled, isLoading: isLoadingMarketSettled } = useContractRead({
    address: PNP_FACTORY_ADDRESS,
    abi: PNP_ABI,
    functionName: 'marketSettled',
    args: conditionId ? [conditionId] : undefined,
    enabled: !!conditionId,
  });

  const { data: winningTokenIdRaw, isLoading: isLoadingWinningTokenId } = useContractRead({
    address: PNP_FACTORY_ADDRESS,
    abi: PNP_ABI,
    functionName: 'winningTokenId',
    args: conditionId ? [conditionId] : undefined,
    enabled: !!conditionId && !!isMarketSettled,
  });

  const calculateMultipliers = (yesPrice, noPrice) => {
    const yesMultiplier = yesPrice > 0 ? (1 / yesPrice) : 0;
    const noMultiplier = noPrice > 0 ? (1 / noPrice) : 0;

    return {
      yesMultiplier: Number(yesMultiplier.toFixed(2)),
      noMultiplier: Number(noMultiplier.toFixed(2))
    };
  };

  // Simplified handlers for demo
  const handleDepositClick = (isYes) => {
    if (marketData?.id) {
      navigate(`/gandalf/${marketData.id}/trade`);
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (isLoading || isLoadingMarketSettled || (isMarketSettled && isLoadingWinningTokenId)) {
    return (
      <div className="saruman-alt1-container saruman-loading-container">
        <div className="saruman-spinner"></div>
        <p className="saruman-loading-text">Fetching Latest Market...</p>
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
  const isTimeUp = marketEndTime && Number(marketEndTime) * 1000 < new Date().getTime();

  let containerClass = "saruman-alt1-container";
  if (isMarketSettled && winningOutcome) {
    containerClass += " market-is-settled";
  } else if (isTimeUp && !isMarketSettled) {
    containerClass += " market-is-settling";
  }

  return (
    <div className={containerClass}>
      {/* Market Header with Question and Resolution Status */}
      <div className="market-header-alt1">
        <div className="market-question-alt1">
          {String(question)}
        </div>
        
        {resolutionData && (
          <div className={`resolution-badge ${resolutionData.resolvable ? 'resolvable' : 'not-resolvable'}`}>
            <div className="badge-icon">
              {resolutionData.resolvable ? '✓' : '✕'}
            </div>
            <span>{resolutionData.resolvable ? 'Resolvable' : 'Not Resolvable'}</span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'trade' ? 'active' : ''}`}
          onClick={() => setActiveTab('trade')}
        >
          Trade
        </button>
        <button 
          className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'trade' ? (
        <div className="trade-tab-content">
          {isMarketSettled && winningOutcome ? (
            <div className="market-settled-container">
              <div className="settled-header">Market Settled</div>
              <div className={`winning-outcome ${winningOutcome.toLowerCase()}`}>
                {winningOutcome} WON
              </div>
            </div>
          ) : isTimeUp && !isMarketSettled ? (
            <div className="market-settled-container">
              <div className="settling-soon-header">Time's Up!</div>
              <div className="settling-soon-text">Settling Soon...</div>
            </div>
          ) : (
            <>
              <div className="odds-container-alt1">
                <div className="odds-card yes-card">
                  <div className="card-header">YES</div>
                  <div className="price-display">${Number(yesPrice).toFixed(2)}</div>
                  <div className="multiplier-display">×{Number(yesMultiplier).toFixed(2)}</div>
                  <div className="balance-display">
                    Balance: {userBalances.yesBalance} YES
                  </div>
                  <button 
                    onClick={() => handleDepositClick(true)}
                    className="trade-button yes-button"
                  >
                    Trade YES
                  </button>
                </div>
                
                <div className="odds-card no-card">
                  <div className="card-header">NO</div>
                  <div className="price-display">${Number(noPrice).toFixed(2)}</div>
                  <div className="multiplier-display">×{Number(noMultiplier).toFixed(2)}</div>
                  <div className="balance-display">
                    Balance: {userBalances.noBalance} NO
                  </div>
                  <button 
                    onClick={() => handleDepositClick(false)}
                    className="trade-button no-button"
                  >
                    Trade NO
                  </button>
                </div>
              </div>

              {/* Quick Market Info */}
              <div className="quick-info">
                <div className="info-item">
                  <span className="info-label">Reserve</span>
                  <span className="info-value">${marketReserve}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Time Left</span>
                  <CountdownTimer endTime={marketEndTime} isMarketSettled={isMarketSettled} />
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="details-tab-content">
          {resolutionData && (
            <>
              {/* Collapsible Sections */}
              <div className="details-section">
                <button 
                  className={`section-header ${expandedSection === 'reasoning' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('reasoning')}
                >
                  <span>Reasoning</span>
                  <span className="expand-icon">{expandedSection === 'reasoning' ? '−' : '+'}</span>
                </button>
                {expandedSection === 'reasoning' && (
                  <div className="section-content">
                    {resolutionData.reasoning}
                  </div>
                )}
              </div>

              <div className="details-section">
                <button 
                  className={`section-header ${expandedSection === 'criteria' ? 'expanded' : ''}`}
                  onClick={() => toggleSection('criteria')}
                >
                  <span>AI Settlement Criteria</span>
                  <span className="expand-icon">{expandedSection === 'criteria' ? '−' : '+'}</span>
                </button>
                {expandedSection === 'criteria' && (
                  <div className="section-content">
                    {resolutionData.settlement_criteria}
                  </div>
                )}
              </div>

              {resolutionData.resolution_sources && resolutionData.resolution_sources.length > 0 && (
                <div className="details-section">
                  <button 
                    className={`section-header ${expandedSection === 'sources' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('sources')}
                  >
                    <span>Resolution Sources</span>
                    <span className="expand-icon">{expandedSection === 'sources' ? '−' : '+'}</span>
                  </button>
                  {expandedSection === 'sources' && (
                    <div className="section-content">
                      <ul className="sources-list">
                        {resolutionData.resolution_sources.map((source, index) => (
                          <li key={index}>{source}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {resolutionData.suggested_improvements && resolutionData.suggested_improvements !== 'None' && (
                <div className="details-section">
                  <button 
                    className={`section-header ${expandedSection === 'improvements' ? 'expanded' : ''}`}
                    onClick={() => toggleSection('improvements')}
                  >
                    <span>Suggested Improvements</span>
                    <span className="expand-icon">{expandedSection === 'improvements' ? '−' : '+'}</span>
                  </button>
                  {expandedSection === 'improvements' && (
                    <div className="section-content suggestions">
                      {resolutionData.suggested_improvements}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Market Metadata */}
          <div className="market-metadata">
            <div className="metadata-item">
              <span className="metadata-label">Collateral</span>
              <span className="metadata-value">
                {collateralTokenAddress ? `${collateralTokenAddress.slice(0,6)}...` : "N/A"}
              </span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Settled by</span>
              <span className="metadata-value">{resolutionSource}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SarumanAlt1; 