/* global BigInt */
import React, { useState, useEffect, useCallback } from 'react';
import { useContractWrite, useWaitForTransactionReceipt, usePublicClient, useAccount, useContractRead } from 'wagmi';
import { parseEther, keccak256, encodePacked, formatEther } from 'viem';
import { PNP_FACTORY_ADDRESS } from '../contracts/contractConfig';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import './Saruman.css';

const USDPNP_ADDRESS = '0xf506826e42047EB538F567539fFb8db74a093FD8'; // For checking collateral

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ABI for mintDecisionTokens and getTokenIds
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
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "name": "winningTokenId",
    "outputs": [{ "internalType": "uint256", name: "", type: "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// Add ERC1155Supply ABI for balanceOf
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
  // useCallback to memoize calculateTimeLeft unless endTime changes
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
  }, [endTime]); // Recalculate only if endTime changes

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    // Initialize timeLeft when endTime is first available or changes
    setTimeLeft(calculateTimeLeft());

    if (!endTime || Number(endTime) === 0) {
      return; // No timer if no valid endTime
    }

    // Set up the interval timer
    const timerId = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Clear interval on cleanup or when endTime changes
    return () => clearInterval(timerId);
  }, [endTime, calculateTimeLeft]); // Depend on endTime and the memoized calculateTimeLeft


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
    if (timeLeft[interval] === undefined || timeLeft[interval] === null) {
      return;
    }
    const value = timeLeft[interval] < 10 && timeLeft[interval] >=0 ? `0${timeLeft[interval]}` : timeLeft[interval];
    timerComponents.push(
      <span key={interval} className="timer-segment">
        {value} <span className="timer-label">{interval.charAt(0).toUpperCase()}</span>
      </span>
    );
  });

  if (timerComponents.length === 0 && timeIsUp) { // Already handled above, but as a fallback
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

const Saruman = ({
  isLoading = false,
  marketData = {},
  resolutionData = null, // Prop for resolution metadata
  openMarkets = [], // Add prop for open markets
  onNextMarket = () => {}, // Add prop for handling next market navigation
}) => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const [depositAmount, setDepositAmount] = useState('');
  const [showDepositField, setShowDepositField] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [tokenIds, setTokenIds] = useState({ yesTokenId: null, noTokenId: null });
  const [showYesModal, setShowYesModal] = useState(false);
  const [modalAmount, setModalAmount] = useState('');
  const [userBalances, setUserBalances] = useState({ yesBalance: '0', noBalance: '0' });
  const [winningOutcome, setWinningOutcome] = useState(null); // YES, NO, or null
  const [settlementData, setSettlementData] = useState(null); // For market_ai_reasoning data
  const [isLoadingSettlementData, setIsLoadingSettlementData] = useState(false);
  const [resolutionDetails, setResolutionDetails] = useState(null); // For market_ai_resolution data
  const [isLoadingResolutionDetails, setIsLoadingResolutionDetails] = useState(false);
  const [resolutionFetchAttempted, setResolutionFetchAttempted] = useState(false);

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

  // Calculate multipliers based on prices
  const calculateMultipliers = (yesPrice, noPrice) => {
    console.log("=== Calculating Multipliers ===");
    console.log("YES Price:", yesPrice);
    console.log("NO Price:", noPrice);

    // Multiplier is the inverse of the price
    // If price is 0.4, multiplier is 1/0.4 = 2.5
    const yesMultiplier = yesPrice > 0 ? (1 / yesPrice) : 0;
    const noMultiplier = noPrice > 0 ? (1 / noPrice) : 0;

    console.log("Calculated Multipliers:", {
      yesMultiplier,
      noMultiplier
    });

    return {
      yesMultiplier: Number(yesMultiplier.toFixed(2)),
      noMultiplier: Number(noMultiplier.toFixed(2))
    };
  };

  // Debug useEffect to log market data when component mounts or updates
  useEffect(() => {
    console.log("=== Saruman Component Debug ===");
    console.log("Market Data:", marketData);
    console.log("Is Loading:", isLoading);
    console.log("Show Deposit Field:", showDepositField);
    console.log("Deposit Amount:", depositAmount);

    // Calculate and log multipliers whenever prices change
    if (marketData.yesPrice && marketData.noPrice) {
      const { yesMultiplier, noMultiplier } = calculateMultipliers(
        marketData.yesPrice,
        marketData.noPrice
      );
      console.log("Updated Multipliers:", { yesMultiplier, noMultiplier });
    }
  }, [marketData, isLoading, showDepositField, depositAmount]);

  // Fetch token IDs when market data changes
  useEffect(() => {
    const fetchTokenIdsAndOutcome = async () => {
      if (conditionId && publicClient) {
        try {
          console.log("=== Fetching Token IDs for Market ===");
          console.log("Market ID:", conditionId);
          
          const yesTokenIdResult = await publicClient.readContract({
            address: PNP_FACTORY_ADDRESS,
            abi: PNP_ABI,
            functionName: 'getYesTokenId',
            args: [conditionId],
          });

          const noTokenIdResult = await publicClient.readContract({
            address: PNP_FACTORY_ADDRESS,
            abi: PNP_ABI,
            functionName: 'getNoTokenId',
            args: [conditionId],
          });

          console.log("YES Token ID:", yesTokenIdResult.toString());
          console.log("NO Token ID:", noTokenIdResult.toString());
          
          setTokenIds({ yesTokenId: yesTokenIdResult, noTokenId: noTokenIdResult });

          if (isMarketSettled && winningTokenIdRaw !== undefined && winningTokenIdRaw !== null) {
            if (winningTokenIdRaw.toString() === yesTokenIdResult.toString()) {
              setWinningOutcome('YES');
            } else if (winningTokenIdRaw.toString() === noTokenIdResult.toString()) {
              setWinningOutcome('NO');
            } else {
              setWinningOutcome(null); // Should not happen if settled correctly
            }
          } else {
            setWinningOutcome(null);
          }

        } catch (error) {
          console.error("Error fetching token IDs or determining outcome:", error);
          setWinningOutcome(null);
        }
      } else {
        setTokenIds({ yesTokenId: null, noTokenId: null });
        setWinningOutcome(null);
      }
    };

    fetchTokenIdsAndOutcome();
  }, [conditionId, publicClient, isMarketSettled, winningTokenIdRaw]);

  // Get token IDs from contract
  const getTokenIds = async (conditionId) => {
    try {
      console.log("=== getTokenIds Debug ===");
      console.log("Fetching token IDs for conditionId:", conditionId);

      const yesTokenId = await publicClient.readContract({
        address: PNP_FACTORY_ADDRESS,
        abi: PNP_ABI,
        functionName: 'getYesTokenId',
        args: [conditionId],
      });

      const noTokenId = await publicClient.readContract({
        address: PNP_FACTORY_ADDRESS,
        abi: PNP_ABI,
        functionName: 'getNoTokenId',
        args: [conditionId],
      });

      console.log("Contract returned YES tokenId:", yesTokenId.toString());
      console.log("Contract returned NO tokenId:", noTokenId.toString());
      
      return { yesTokenId, noTokenId };
    } catch (error) {
      console.error("Error getting token IDs from contract:", error);
      throw error;
    }
  };

  // Update this function to navigate to the trade page
  const handleDepositClick = (isYes) => {
    console.log("=== Deposit Button Click Debug ===");
    console.log("Button clicked for:", isYes ? "YES" : "NO");
    console.log("Market ID:", marketData.id);
    
    if (marketData?.id) {
      // Navigate to the trade page with the condition ID
      navigate(`/gandalf/${marketData.id}/trade`);
    } else {
      console.error("Cannot navigate: Market ID is missing", marketData);
    }
  };

  const handleDeposit = async (isYes) => {
    console.log("=== handleDeposit Debug ===");
    console.log("Deposit button clicked for:", isYes ? "YES" : "NO");
    console.log("Deposit amount:", depositAmount);
    console.log("Market data:", marketData);
    
    if (!depositAmount || isNaN(depositAmount) || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid deposit amount');
      return;
    }

    if (!marketData || !marketData.id) {
      alert('Market data is not available. Cannot proceed with deposit.');
      console.error('Market data or condition ID is missing:', marketData);
      setShowDepositField(null);
      return;
    }

    try {
      setIsMinting(true);
      
      // Get token IDs from contract
      const { yesTokenId, noTokenId } = await getTokenIds(marketData.id);
      const tokenIdToMint = isYes ? yesTokenId : noTokenId;
      const collateralAmount = parseEther(depositAmount);
      
      console.log("Mint parameters:", {
        conditionId: marketData.id,
        collateralAmount: collateralAmount.toString(),
        tokenIdToMint: tokenIdToMint.toString()
      });

      if (!mintTokens) {
        throw new Error('Minting function is not available');
      }

      await mintTokens({
        args: [marketData.id, collateralAmount, tokenIdToMint],
      });
      
      console.log('Mint transaction submitted successfully');
    } catch (error) {
      console.error('Error minting tokens:', error);
      alert(`Error minting tokens: ${error.message || 'Unknown error'}`);
    } finally {
      setIsMinting(false);
      setShowDepositField(null);
      setDepositAmount('');
    }
  };

  // Mint transaction
  const { write: mintTokens, data: mintData } = useContractWrite({
    address: PNP_FACTORY_ADDRESS,
    abi: PNP_ABI,
    functionName: 'mintDecisionTokens',
  });

  // Wait for transaction
  const { isLoading: isTransactionLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: mintData,
  });

  // Fetch user token balances
  const fetchUserBalances = async () => {
    if (!address || !tokenIds.yesTokenId || !tokenIds.noTokenId) return;

    try {
      console.log("=== Fetching User Balances ===");
      console.log("User Address:", address);
      console.log("Token IDs:", tokenIds);

      const yesBalance = await publicClient.readContract({
        address: PNP_FACTORY_ADDRESS,
        abi: ERC1155_SUPPLY_ABI,
        functionName: 'balanceOf',
        args: [address, tokenIds.yesTokenId],
      });

      const noBalance = await publicClient.readContract({
        address: PNP_FACTORY_ADDRESS,
        abi: ERC1155_SUPPLY_ABI,
        functionName: 'balanceOf',
        args: [address, tokenIds.noTokenId],
      });

      console.log("Balances:", {
        yesBalance: yesBalance.toString(),
        noBalance: noBalance.toString()
      });

      setUserBalances({
        yesBalance: formatEther(yesBalance),
        noBalance: formatEther(noBalance)
      });
    } catch (error) {
      console.error("Error fetching user balances:", error);
    }
  };

  // Fetch balances when token IDs or user address changes
  useEffect(() => {
    if (tokenIds.yesTokenId && tokenIds.noTokenId && address) {
      fetchUserBalances();
    }
  }, [tokenIds.yesTokenId, tokenIds.noTokenId, address]);

  // Fetch settlement data from Supabase when market is settled
  useEffect(() => {
    const fetchSettlementData = async () => {
      if (!conditionId || !isMarketSettled) return;
      
      try {
        setIsLoadingSettlementData(true);
        
        // Query Supabase for the settlement data using the condition ID
        const { data, error } = await supabase
          .from('market_ai_reasoning')
          .select('*')
          .eq('condition_id', conditionId)
          .single();
        
        if (error) {
          console.error('Error fetching settlement data:', error);
          return;
        }
        
        if (data) {
          console.log('Settlement data found:', data);
          setSettlementData(data);
        }
      } catch (err) {
        console.error('Error in fetchSettlementData:', err);
      } finally {
        setIsLoadingSettlementData(false);
      }
    };
    
    fetchSettlementData();
  }, [conditionId, isMarketSettled]);
  
  // Fetch resolution details from market_ai_resolution table
  useEffect(() => {
    const fetchResolutionDetails = async () => {
      if (!conditionId) return;
      
      try {
        setIsLoadingResolutionDetails(true);
        
        // Query Supabase for the resolution details using the condition ID
        const { data, error } = await supabase
          .from('market_ai_resolution')
          .select('*')
          .eq('condition_id', conditionId)
          .single();
        
        if (error) {
          console.error('Error fetching resolution details:', error);
          return;
        }
        
        if (data) {
          console.log('Resolution details found:', data);
          setResolutionDetails(data);
        }
      } catch (err) {
        console.error('Error in fetchResolutionDetails:', err);
      } finally {
        setIsLoadingResolutionDetails(false);
        setResolutionFetchAttempted(true);
      }
    };
    
    fetchResolutionDetails();
  }, [conditionId]);

  if (isLoading || isLoadingMarketSettled || (isMarketSettled && isLoadingWinningTokenId)) {
    return (
      <div className="saruman-container saruman-loading-container">
        <div className="saruman-spinner"></div>
        <p className="saruman-loading-text">Fetching Latest Market...</p>
      </div>
    );
  }

  // Destructure with defaults from marketData
  const {
    question = 'Market details not available',
    yesPrice = 0,
    noPrice = 0,
    marketReserve = '0',
    collateralTokenAddress,
    resolutionSource = "Perplexity",
    marketEndTime = null,
  } = marketData || {};

  // Calculate multipliers
  const { yesMultiplier, noMultiplier } = calculateMultipliers(yesPrice, noPrice);

  const isTimeUp = marketEndTime && Number(marketEndTime) * 1000 < new Date().getTime();

  let containerClass = "saruman-container";
  if (isMarketSettled && winningOutcome) {
    containerClass += " market-is-settled";
  } else if (isTimeUp && !isMarketSettled) {
    containerClass += " market-is-settling";
  }

  // Determine if we should show the Next button
  // Only show if we have more than one open market and the current market is not settled
  const showNextButton = openMarkets.length > 1 && !(isMarketSettled || isTimeUp);

  return (
    <div className={containerClass}>
      {/* Next Market Button */}
      {showNextButton && (
        <button 
          className="next-market-button" 
          onClick={onNextMarket}
          aria-label="View next open market"
        >
          Next Market <span className="next-arrow">→</span>
        </button>
      )}
      
      <div className="market-header">
        <div className="market-question">
          {String(question)}
        </div>
        
        {(resolutionData || resolutionDetails) && (
          <div className={`resolution-indicator ${(resolutionDetails?.resolvable || resolutionData?.resolvable) ? 'resolvable' : 'not-resolvable'}`}>
            {(resolutionDetails?.resolvable || resolutionData?.resolvable) ? (
              <div className="indicator-icon checkmark">✓</div>
            ) : (
              <div className="indicator-icon cross">✕</div>
            )}
            <span className="indicator-text">
              {(resolutionDetails?.resolvable || resolutionData?.resolvable) ? 'AI Resolvable' : 'Needs Review'}
            </span>
          </div>
        )}
      </div>
      
      {isMarketSettled && winningOutcome ? (
        <div className="market-settled-container">
          <div className="settled-header">Market Settled</div>
          <div className={`winning-outcome ${winningOutcome.toLowerCase()}`}>
            {winningOutcome} WON
          </div>
          
          {isLoadingSettlementData ? (
            <div className="settlement-reasoning-loading">
              <div className="mini-spinner"></div>
              <span>Loading settlement reasoning...</span>
            </div>
          ) : settlementData ? (
            <div className="settlement-reasoning">
              <h4>Settlement Reasoning</h4>
              <p>{settlementData.reasoning || "No reasoning provided."}</p>
            </div>
          ) : null}
        </div>
      ) : isTimeUp && !isMarketSettled ? (
        <div className="market-settled-container">
          <div className="settling-soon-header">Time's Up!</div>
          <div className="settling-soon-text">Settling Soon...</div>
        </div>
      ) : (
        <>
          <div className="odds-container">
            <div className="odds-column yes-column">
              <div className="odds-header">YES</div>
              <div className="price-value">${Number(yesPrice).toFixed(2)}</div>
              <div className="multiplier">×{Number(yesMultiplier).toFixed(2)}</div>
              <div className="user-balance">
                Balance: {parseFloat(userBalances.yesBalance).toFixed(2)}
              </div>
              <button 
                onClick={() => handleDepositClick(true)}
                className="deposit-trigger"
              >
                Buy YES
              </button>
            </div>
            
            <div className="odds-column no-column">
              <div className="odds-header">NO</div>
              <div className="price-value">${Number(noPrice).toFixed(2)}</div>
              <div className="multiplier">×{Number(noMultiplier).toFixed(2)}</div>
              <div className="user-balance">
                Balance: {parseFloat(userBalances.noBalance).toFixed(2)}
              </div>
              <button 
                onClick={() => handleDepositClick(false)}
                className="deposit-trigger"
              >
                Buy NO
              </button>
            </div>
          </div>

          {marketData?.id && marketData.id !== 'default-market' && (
            <button 
              className="trade-now-button" 
              onClick={() => navigate(`/gandalf/${marketData.id}/trade`)}
            >
              Click to Trade
            </button>
          )}
        </>
      )}

      {resolutionData || resolutionDetails ? (
        <div className="resolution-metadata">
          <div className="metadata-header">
            <h3>Settlement Criteria</h3>
          </div>
          
          <div className="metadata-content">
            {(resolutionDetails?.reasoning || resolutionData?.reasoning) && (
              <div className="metadata-field">
                <div className="field-label">AI Analysis</div>
                <div className="field-value">{resolutionDetails?.reasoning || resolutionData?.reasoning}</div>
              </div>
            )}
            
            {(resolutionDetails?.settlement_criteria || resolutionData?.settlement_criteria) && (
              <div className="metadata-field">
                <div className="field-label">Criteria</div>
                <div className="field-value">{resolutionDetails?.settlement_criteria || resolutionData?.settlement_criteria}</div>
              </div>
            )}
            
            {((resolutionDetails?.resolution_sources && resolutionDetails.resolution_sources.length > 0) || 
               (resolutionData?.resolution_sources && resolutionData.resolution_sources.length > 0)) && (
              <div className="metadata-field">
                <div className="field-label">Sources</div>
                <div className="field-value">
                  <ul className="sources-list">
                    {(resolutionDetails?.resolution_sources || resolutionData?.resolution_sources || []).map((source, index) => (
                      <li key={index}>{source}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : resolutionFetchAttempted && !isLoadingResolutionDetails ? (
        <div className="resolution-metadata">
          <div className="metadata-header">
            <h3>Settlement Criteria</h3>
          </div>
          
          <div className="resolution-generating">
            <div className="generating-icon">
              <div className="mini-spinner"></div>
            </div>
            <div className="generating-text">
              <p>AI analyzing market question...</p>
              <p>Settlement criteria coming soon</p>
            </div>
          </div>
        </div>
      ) : null}
      
      <div className="market-footer">
        <div className="footer-top-row">
          <div className="market-collateral">
            <div className="usdc-icon">
              <img src="/usdc.svg" alt="USDC" width="14" height="14" />
            </div>
            USDC Collateral
          </div>
          
          <div className="resolution-source">
            <img src="/globe.svg" alt="Globe" className="globe-icon" width="14" height="14" />
            {resolutionSource} AI
          </div>
        </div>
        
        <div className="footer-bottom-row">
          <div className="market-metric">
            <div className="metric-label">Reserve</div>
            <div className="metric-value">${marketReserve}</div>
          </div>
          
          <div className="market-metric">
            <div className="metric-label">Time Left</div>
            <CountdownTimer endTime={marketEndTime} isMarketSettled={isMarketSettled} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Saruman; 