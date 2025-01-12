/* global BigInt */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TokenMarket.css';
import { usePrivy } from '@privy-io/react-auth';
import { useReadContract, useWriteContract } from 'wagmi';

const PRICE_CHECKER_ADDRESS = "0x0000000000cDC1F8d393415455E382c30FBc0a84";
const PREDICTION_MARKET_ADDRESS = "0xd40B3EbcA13E63e72D03d07C2e6a84D00aA035C2";

const TOKEN_ADDRESSES = {
  USDT: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
};

const ERC20_ABI = [
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  }
];

const PREDICTION_MARKET_ABI = [
  {
    inputs: [
      { name: "_initialLiquidity", type: "uint256" },
      { name: "_tokenInQuestion", type: "address" },
      { name: "_moduleId", type: "uint8" },
      { name: "_collateralToken", type: "address" },
      { name: "_marketParams", type: "uint256[]" }
    ],
    name: "createPredictionMarket",
    outputs: [{ name: "conditionId", type: "bytes32" }],
    stateMutability: "payable",
    type: "function"
  }
];

const TokenMarket = () => {
  const { address } = useParams();
  const navigate = useNavigate();
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState('USDT');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [deadlineValue, setDeadlineValue] = useState('');
  const [deadlineUnit, setDeadlineUnit] = useState('days');
  const [lastClickedPercentage, setLastClickedPercentage] = useState(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [priceChangePercent, setPriceChangePercent] = useState('');
  const [isApproved, setIsApproved] = useState(false);

  // Get all required Privy hooks
  const { 
    ready,
    authenticated,
    user,
    login,
    connectWallet,
  } = usePrivy();

  // Add wagmi's useReadContract for price checking
  const { data: priceData, error: priceError, isPending: priceIsPending, refetch: refetchPrice } = useReadContract({
    address: PRICE_CHECKER_ADDRESS,
    abi: [{
      name: 'checkPrice',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'token', type: 'address' }],
      outputs: [
        { name: 'price', type: 'uint256' },
        { name: 'priceStr', type: 'string' }
      ],
    }],
    functionName: 'checkPrice',
    args: [address],
    chainId: 8453, // Base mainnet
  });

  // Add allowance check
  const { data: allowanceData } = useReadContract({
    address: TOKEN_ADDRESSES[selectedToken],
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [user?.wallet?.address, PREDICTION_MARKET_ADDRESS],
    chainId: 8453,
  });

  // Check if allowance is sufficient
  useEffect(() => {
    if (allowanceData && collateralAmount) {
      const requiredAmount = BigInt(Math.floor(parseFloat(collateralAmount) * 1_000_000));
      console.log('Current allowance:', allowanceData.toString());
      console.log('Required amount:', requiredAmount.toString());
      setIsApproved(BigInt(allowanceData) >= requiredAmount);
    }
  }, [allowanceData, collateralAmount]);

  const { writeContract } = useWriteContract();

  const handleApprove = async () => {
    try {
      const approvalAmount = BigInt(Math.floor(parseFloat(collateralAmount) * 1_000_000));
      await writeContract({
        address: TOKEN_ADDRESSES[selectedToken],
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [PREDICTION_MARKET_ADDRESS, approvalAmount],
      });
    } catch (error) {
      console.error('Error approving tokens:', error);
    }
  };

  const handleCreateMarket = async () => {
    if (!isApproved) {
      console.error('Please approve tokens first');
      return;
    }

    try {
      // Convert collateral amount to proper decimals (assuming 6 decimals)
      const initialLiquidity = BigInt(Math.floor(parseFloat(collateralAmount) * 1_000_000));

      // Get token address from current token data
      const tokenInQuestion = tokenData?.attributes?.address || "0x0";

      // Calculate deadline timestamp
      let deadlineTimestamp;
      switch(deadlineUnit) {
        case 'minutes':
          deadlineTimestamp = Math.floor(Date.now()/1000) + (parseInt(deadlineValue) * 60);
          break;
        case 'hours':
          deadlineTimestamp = Math.floor(Date.now()/1000) + (parseInt(deadlineValue) * 3600);
          break;
        case 'days':
          deadlineTimestamp = Math.floor(Date.now()/1000) + (parseInt(deadlineValue) * 86400);
          break;
        default:
          deadlineTimestamp = Math.floor(Date.now()/1000) + (parseInt(deadlineValue) * 86400);
      }

      // Validate price data
      if (!priceData || priceData.length === 0) {
        throw new Error('Current price not available from smart contract');
      }
      
      // a = current price from price_checker (first uint returned)
      const a = BigInt(priceData[0]);

      // b = user's entered target price (convert to BigInt)
      const b = BigInt(Math.floor(parseFloat(targetPrice) * 1_000_000));

      // Calculate percentage change (r)
      // Use 10000 as base to maintain precision without floating point
      const r = ((b - a) * 10000n) / a;

      // Calculate new target price by applying r% change to original price
      const targetPriceForContract = a * (10000n + r) / 10000n;

      // Prepare market params
      const marketParams = [
        BigInt(deadlineTimestamp),
        targetPriceForContract
      ];

      // Log all parameters for debugging
      console.log('Creating Prediction Market with Parameters:');
      console.log('Initial Liquidity:', initialLiquidity.toString());
      console.log('Token In Question:', tokenInQuestion);
      console.log('Current Price (a):', a.toString());
      console.log('Target Price (b):', b.toString());
      console.log('Percentage Change (r):', r.toString());
      console.log('Target Price for Contract:', targetPriceForContract.toString());
      console.log('Module ID:', 0n);
      console.log('Collateral Token:', TOKEN_ADDRESSES[selectedToken]);
      console.log('Market Params:', marketParams.map(param => param.toString()));

      const conditionId = await writeContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'createPredictionMarket',
        args: [
          initialLiquidity,      // uint256
          tokenInQuestion,       // address
          0n,                   // uint8
          TOKEN_ADDRESSES[selectedToken], // address
          marketParams          // uint256[]
        ],
      });

      console.log('Created Condition ID:', conditionId);

      // Navigate to the live markets page
      navigate('/live_markets');

    } catch (error) {
      console.error('Error creating prediction market:', error);
      // If there's a more detailed error from the transaction, log it
      if (error.cause) {
        console.error('Detailed Error:', error.cause);
      }
    }
  };

  // Update price data when contract call returns
  useEffect(() => {
    if (priceData) {
      const [price, priceStr] = priceData;
      console.log('On-chain Price:', price.toString());
      console.log('Price String:', priceStr);
    }
  }, [priceData]);

  // Refresh price every 30 seconds
  useEffect(() => {
    if (address) {
      refetchPrice();
      const interval = setInterval(() => {
        refetchPrice();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [address, refetchPrice]);

  // Handle wallet connection
  const ensureWalletConnection = async () => {
    try {
      if (!authenticated) {
        console.log("Not authenticated, logging in...");
        await login();
        return;
      }

      if (!user?.wallet) {
        console.log("No wallet, connecting...");
        await connectWallet();
        return;
      }

      console.log("Wallet status:", {
        authenticated,
        hasWallet: !!user?.wallet
      });
    } catch (error) {
      console.error("Error ensuring wallet connection:", error);
    }
  };

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/base/tokens/${address}`);
        const data = await response.json();
        console.log('Token Data:', data.data); 
        setTokenData(data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching token data:', err);
        setError('Failed to fetch token data');
        setLoading(false);
      }
    };

    fetchTokenData(); 
    const intervalId = setInterval(fetchTokenData, 5000); 

    return () => clearInterval(intervalId); 
  }, [address]);

  const calculatePercentagePrice = (percentage) => {
    setPriceChangePercent(percentage.toString());
    setLastClickedPercentage(percentage);
  };

  return (
    <div className="token-market-container">
      {!authenticated ? (
        <div className="connect-wallet-prompt">
          <h2>Please connect your wallet</h2>
          <button onClick={ensureWalletConnection}>Connect Wallet</button>
        </div>
      ) : (
        <div>
          <div className="chart-container">
            <iframe
              id="geckoterminal-embed"
              title="GeckoTerminal Embed"
              src={`https://www.geckoterminal.com/base/pools/${address}?embed=1&info=1&swaps=0&grayscale=0&light_chart=0`}
              frameBorder="0"
              allow="clipboard-write"
              allowFullScreen
              className="chart-iframe"
            ></iframe>
          </div>
          <div className="button-container">
            <button 
              className="create-prediction-market-btn"
              onClick={() => setShowModal(true)}
            >
              Create Prediction Market
            </button>
            <button 
              className="view-markets-btn"
            >
              View Existing Markets
            </button>
          </div>

          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="modal-title">Token Details</h2>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="modal-close-button"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>

                <div className="token-grid">
                  <p className="font-medium">{tokenData?.attributes?.name || 'Loading...'}</p>
                  <div className="price-display">
                    {priceIsPending ? (
                      <span>Loading price...</span>
                    ) : priceError ? (
                      <span>${tokenData?.attributes?.price_usd || '0.00'}</span>
                    ) : priceData ? (
                      <span>${priceData[1]}</span>
                    ) : (
                      <span>${tokenData?.attributes?.price_usd || '0.00'}</span>
                    )}
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Target Price</label>
                  <div className="input-container">
                    <input 
                      type="number"
                      placeholder="Enter target price"
                      className="modal-input"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                    />
                  </div>
                  <div className="percentage-buttons">
                    <button
                      className={`percentage-button ${lastClickedPercentage === -10 ? 'active' : ''}`}
                      onClick={() => {
                        const currentPrice = priceData ? parseFloat(priceData[1]) : parseFloat(tokenData?.attributes?.price_usd || '0');
                        const newPrice = currentPrice * 0.9; // -10%
                        setTargetPrice(newPrice.toFixed(2));
                        setLastClickedPercentage(-10);
                      }}
                    >
                      -10%
                    </button>
                    <button
                      className={`percentage-button ${lastClickedPercentage === -5 ? 'active' : ''}`}
                      onClick={() => {
                        const currentPrice = priceData ? parseFloat(priceData[1]) : parseFloat(tokenData?.attributes?.price_usd || '0');
                        const newPrice = currentPrice * 0.95; // -5%
                        setTargetPrice(newPrice.toFixed(2));
                        setLastClickedPercentage(-5);
                      }}
                    >
                      -5%
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Deadline</label>
                  <div className="deadline-container">
                    <div className="deadline-input-group">
                      <input 
                        type="number"
                        placeholder="Enter duration"
                        className="deadline-input"
                        value={deadlineValue}
                        onChange={(e) => setDeadlineValue(e.target.value)}
                      />
                      <select 
                        value={deadlineUnit}
                        onChange={(e) => setDeadlineUnit(e.target.value)}
                        className="deadline-select"
                      >
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Collateral Token</label>
                  <select 
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="modal-select"
                  >
                    <option value="USDT">USDT</option>
                    <option value="USDC">USDC</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Collateral Amount</label>
                  <div className="input-container">
                    <input 
                      type="number"
                      placeholder="Enter collateral amount"
                      className="modal-input"
                      value={collateralAmount}
                      onChange={(e) => setCollateralAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-buttons">
                  <button 
                    className="approve-button"
                    onClick={handleApprove}
                    disabled={isApproved}
                  >
                    {isApproved ? 'Approved ✓' : 'Approve Collateral'}
                  </button>
                  <button
                    className="create-button"
                    onClick={handleCreateMarket}
                    disabled={!isApproved}
                  >
                    Create Prediction Market
                  </button>
                </div>

                <style jsx>{`
                  .modal-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-top: 1rem;
                  }

                  .approve-button {
                    padding: 0.8rem;
                    border-radius: 8px;
                    border: none;
                    font-weight: 600;
                    cursor: pointer;
                    background: ${isApproved ? '#10b981' : 'rgba(16, 185, 129, 0.1)'};
                    color: ${isApproved ? 'white' : '#10b981'};
                    border: 1px solid #10b981;
                    transition: all 0.3s ease;
                  }

                  .approve-button:hover:not(:disabled) {
                    background: ${isApproved ? '#0d9668' : 'rgba(16, 185, 129, 0.2)'};
                  }

                  .approve-button:disabled {
                    cursor: not-allowed;
                    opacity: 0.7;
                  }

                  .create-button {
                    padding: 0.8rem;
                    border-radius: 8px;
                    border: none;
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                  }

                  .create-button:hover:not(:disabled) {
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                  }

                  .create-button:disabled {
                    cursor: not-allowed;
                    opacity: 0.5;
                  }
                `}</style>

              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TokenMarket;
