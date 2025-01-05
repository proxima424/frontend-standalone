import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import './TokenMarket.css';
import { getPoolAddressFromTokenData, getPriceFromModule } from '../contracts/priceModule';
import { usePrivy } from '@privy-io/react-auth';
import { usePnpFactory } from '../hooks/usePnpFactory';
import { predictionMarketABI } from '../contracts/predictionMarketABI';
import { priceCheckerABI } from '../contracts/priceCheckerABI';

const PRICE_MODULE_ADDRESS = "0x51242F79e60e380125DE602b17E792c8eE2bcAae";
const PRICE_CHECKER_ADDRESS = "0x0000000000cDC1F8d393415455E382c30FBc0a84";
const TOKEN_ADDRESSES = {
  USDT: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
};

const TokenMarket = () => {
  const { address } = useParams();
  const navigate = useNavigate();
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [latestBlockNumber, setLatestBlockNumber] = useState('');
  const [deadlineValue, setDeadlineValue] = useState("");
  const [deadlineUnit, setDeadlineUnit] = useState("days");
  const [selectedToken, setSelectedToken] = useState("USDT");
  const [lastClickedPercentage, setLastClickedPercentage] = useState(null);
  const [collateralAmount, setCollateralAmount] = useState('');
  const [targetPrice, setTargetPrice] = useState(""); 
  const [priceChangePercent, setPriceChangePercent] = useState('');
  const [currentPrice, setCurrentPrice] = useState(null);
  const [onChainPrice, setOnChainPrice] = useState(null);
  const [calculatedTargetPrice, setCalculatedTargetPrice] = useState(null);
  const [contracts, setContracts] = useState({
    predictionMarket: null,
    priceChecker: null
  });
  
  // Get all required Privy hooks
  const { 
    ready,
    authenticated,
    user,
    login,
    connectWallet,
    createWallet
  } = usePrivy();

  // Add PnP Factory hook
  const { createPredictionMarket } = usePnpFactory();

  useEffect(() => {
    const initializeContracts = async () => {
      if (authenticated && user?.wallet) {
        try {
          console.log('Starting contract initialization with user:', user);
          
          // Get the wallets
          const wallets = await user.getWallets();
          console.log('Available wallets:', wallets);
          
          const firstWallet = wallets[0];
          console.log('Using first wallet:', firstWallet);
          
          // Get provider and signer
          const provider = await firstWallet.getEthersProvider();
          console.log('Got provider:', provider);
          
          const signer = await firstWallet.getEthersSigner();
          console.log('Got signer:', signer);
          
          // Get wallet address
          const address = await signer.getAddress();
          console.log('Wallet address:', address);

          console.log('Contract addresses:', {
            PRICE_MODULE_ADDRESS,
            PRICE_CHECKER_ADDRESS
          });

          const predictionMarket = new ethers.Contract(PRICE_MODULE_ADDRESS, predictionMarketABI, provider);
          console.log('Prediction Market contract initialized:', predictionMarket);
          
          const priceChecker = new ethers.Contract(PRICE_CHECKER_ADDRESS, priceCheckerABI, signer);
          console.log('Price Checker contract initialized:', priceChecker);
          
          setContracts({
            predictionMarket,
            priceChecker
          });
          console.log('Contracts set in state successfully');
          
        } catch (error) {
          console.error('Error in contract initialization:', error);
          console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code
          });
        }
      } else {
        console.log('Not initializing contracts:', {
          authenticated,
          hasWallet: !!user?.wallet
        });
      }
    };

    initializeContracts();
  }, [authenticated, user]);

  // Fetch on-chain price using priceChecker contract
  const fetchOnChainPrice = async () => {
    if (!contracts.priceChecker || !address) {
      console.log('Cannot fetch price:', {
        hasContract: !!contracts.priceChecker,
        address: address
      });
      return;
    }

    try {
      console.log('Fetching on-chain price for token:', address);
      console.log('Using price checker contract:', contracts.priceChecker);
      
      const [price, description] = await contracts.priceChecker.checkPrice(address);
      console.log('Contract call successful');
      console.log('Raw price from contract:', price.toString());
      console.log('Description from contract:', description);
      
      const priceInEth = ethers.formatUnits(price, 18);
      console.log('Formatted price in ETH:', priceInEth);
      
      setOnChainPrice(priceInEth);
      console.log('Price set in state successfully');
      
    } catch (error) {
      console.error('Error fetching on-chain price:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        data: error.data
      });
    }
  };

  // Call fetchOnChainPrice when contracts are initialized or address changes
  useEffect(() => {
    if (contracts.priceChecker && address) {
      fetchOnChainPrice();
      // Refresh price every 30 seconds
      const interval = setInterval(fetchOnChainPrice, 30000);
      return () => clearInterval(interval);
    }
  }, [contracts.priceChecker, address]);

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
        hasWallet: !!user?.wallet,
        hasProvider: !!user?.wallet?.provider
      });
    } catch (error) {
      console.error("Error ensuring wallet connection:", error);
      setError("Failed to connect wallet: " + error.message);
    }
  };

  // Check wallet connection on component mount
  useEffect(() => {
    if (ready) {
      ensureWalletConnection();
    }
  }, [ready, authenticated, user]);

  // Update prices when percentage changes
  const updatePrices = async () => {
    try {
      if (!user?.wallet?.provider) {
        await ensureWalletConnection();
        return;
      }

      if (!tokenData || !priceChangePercent) {
        console.warn('Missing required data for price update:', {
          hasTokenData: !!tokenData,
          hasPriceChange: !!priceChangePercent,
        });
        return;
      }

      setLoading(true);

      const provider = user.wallet.provider;
      console.log("Using provider:", provider);

      const price = await getPriceFromModule(
        PRICE_MODULE_ADDRESS,
        tokenData,
        provider
      );

      const currentPriceInEth = ethers.formatUnits(price, 18);
      setCurrentPrice(currentPriceInEth);

      const multiplier = 1 + (parseFloat(priceChangePercent) / 100);
      const targetPrice = parseFloat(currentPriceInEth) * multiplier;
      setCalculatedTargetPrice(targetPrice);
      setTargetPrice(targetPrice.toString()); 

      console.log('Price Data Updated:', {
        currentPrice: currentPriceInEth,
        percentageChange: priceChangePercent + '%',
        calculatedTargetPrice: targetPrice
      });
    } catch (error) {
      console.error('Error updating prices:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update prices when percentage changes or provider becomes available
  useEffect(() => {
    if (ready && authenticated && user?.wallet?.provider && tokenData && priceChangePercent) {
      updatePrices();
    }
  }, [ready, authenticated, user?.wallet?.provider, tokenData, priceChangePercent]);

  const calculatePercentagePrice = (percentage) => {
    setPriceChangePercent(percentage.toString());
    setLastClickedPercentage(percentage);
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

  useEffect(() => {
    const fetchLatestBlockNumber = async () => {
      try {
        const blockNumber = await fetchLatestBlockNumberFromAPI();
        setLatestBlockNumber(blockNumber);
      } catch (err) {
        console.error('Error fetching latest block number:', err);
      }
    };

    const intervalId = setInterval(fetchLatestBlockNumber, 5000); 

    return () => clearInterval(intervalId); 
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleCreatePredictionMarket = async (e) => {
    e.preventDefault();
    
    try {
      if (!user?.wallet?.provider) {
        await ensureWalletConnection();
        return;
      }

      if (!calculatedTargetPrice) {
        console.error('Target price not calculated. Please set a price change percentage.');
        setError('Please set a price change percentage');
        return;
      }

      if (!collateralAmount || parseFloat(collateralAmount) <= 0) {
        setError('Please enter a valid collateral amount');
        return;
      }

      setLoading(true);
      setError(null);

      const poolAddress = getPoolAddressFromTokenData(tokenData);
      
      // Convert deadline to seconds and validate
      const deadlineInSeconds = deadlineUnit === 'days' 
        ? Number(deadlineValue) * 24 * 60 * 60
        : Number(deadlineValue) * 60 * 60;

      if (deadlineInSeconds <= 0) {
        throw new Error('Invalid deadline value');
      }

      // Get current timestamp and validate deadline is in future
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const expiryTimestamp = currentTimestamp + deadlineInSeconds;
      
      if (expiryTimestamp <= currentTimestamp) {
        throw new Error('Deadline must be in the future');
      }

      // Convert target price to wei
      const targetPriceInWei = ethers.parseUnits(calculatedTargetPrice.toString(), 18);
      
      // Convert collateral amount to wei (assuming 6 decimals for USDC/USDT)
      const collateralInWei = ethers.parseUnits(collateralAmount, 6);

      // Convert expiry timestamp to ethers BigNumber
      const expiryBigNumber = ethers.getBigInt(expiryTimestamp);

      // Prepare market parameters array (just price and expiry)
      const marketParams = [targetPriceInWei, expiryBigNumber];

      console.log('Creating market with params:', {
        initialLiquidity: collateralInWei.toString(),
        tokenInQuestion: tokenData?.attributes?.address,
        moduleId: 1,
        collateralToken: TOKEN_ADDRESSES[selectedToken],
        marketParams: marketParams.map(p => p.toString()),
        pool: poolAddress
      });

      // Call the contract
      const tx = await createPredictionMarket(
        collateralInWei,
        tokenData?.attributes?.address,
        1, // moduleId for price module
        TOKEN_ADDRESSES[selectedToken],
        marketParams,
        poolAddress
      );

      console.log('Transaction sent:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      // Show success message
      setError(null);
      alert('Market created successfully!');
      setShowModal(false);

    } catch (error) {
      console.error('Error creating prediction market:', error);
      setError(error.message || 'Failed to create market. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestBlockNumberFromAPI = async () => {
    return '1234567';
  };

  const handleQuickAdd = (value) => {
    setDeadlineValue((prev) => {
      const currentValue = prev === "" ? 0 : parseFloat(prev);
      return (currentValue + value).toString();
    });
  };

  if (loading) return <div className="loading">Loading token data...</div>;
  if (error) return <div className="error">{error}</div>;

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
                <div className="modal-inner">
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
                    <p className="font-medium text-right">${tokenData?.attributes?.price_usd || '0.00'}</p>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Target Price Change (%)</label>
                    <div className="input-container">
                      <input 
                        type="number"
                        placeholder="Enter target price change in %"
                        className="modal-input"
                        value={priceChangePercent}
                        onChange={(e) => setPriceChangePercent(e.target.value)}
                      />
                    </div>
                  </div>

                  {currentPrice && (
                    <div className="price-info">
                      <h3>Price Information</h3>
                      <p>
                        <span className="label">Current Price (CoinGecko):</span>
                        <span className="value">{currentPrice} ETH</span>
                      </p>
                      <p>
                        <span className="label">Target Price Change:</span>
                        <span className="value">{priceChangePercent}%</span>
                      </p>
                      <p>
                        <span className="label">Calculated Target Price:</span>
                        <span className="value">{calculatedTargetPrice} ETH</span>
                      </p>
                      <div className="onchain-price">
                        <p>
                          <span className="label">Uniswap On-chain Price:</span>
                          <span className="value">{onChainPrice ? `${onChainPrice} ETH` : 'Loading...'}</span>
                        </p>
                      </div>
                    </div>
                  )}

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
                        <div className="denomination-toggle">
                          <button 
                            className={`denomination-button ${deadlineUnit === 'days' ? 'active' : ''}`}
                            onClick={() => setDeadlineUnit('days')}
                          >
                            days
                          </button>
                          <button 
                            className={`denomination-button ${deadlineUnit === 'hours' ? 'active' : ''}`}
                            onClick={() => setDeadlineUnit('hours')}
                          >
                            hours
                          </button>
                        </div>
                      </div>
                      <div className="quick-add-container">
                        <button className="quick-add-button" onClick={() => handleQuickAdd(1)}>+1</button>
                        <button className="quick-add-button" onClick={() => handleQuickAdd(2)}>+2</button>
                        <button className="quick-add-button" onClick={() => handleQuickAdd(3)}>+3</button>
                        <button className="quick-add-button" onClick={() => handleQuickAdd(5)}>+5</button>
                        <button className="quick-add-button" onClick={() => handleQuickAdd(7)}>+7</button>
                        <button className="quick-add-button" onClick={() => handleQuickAdd(12)}>+12</button>
                      </div>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Collateral Amount</label>
                    <div className="input-container">
                      <input 
                        type="number"
                        placeholder="Enter amount"
                        className="modal-input"
                        value={collateralAmount}
                        onChange={(e) => setCollateralAmount(e.target.value)}
                      />
                      <div className="denomination-toggle">
                        <button 
                          className={`denomination-button ${selectedToken === 'USDT' ? 'active' : ''}`}
                          onClick={() => setSelectedToken('USDT')}
                        >
                          USDT
                        </button>
                        <button 
                          className={`denomination-button ${selectedToken === 'USDC' ? 'active' : ''}`}
                          onClick={() => setSelectedToken('USDC')}
                        >
                          USDC
                        </button>
                      </div>
                    </div>
                  </div>

                  <button className="create-market-button" onClick={handleCreatePredictionMarket}>
                    Create Market
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
};

export default TokenMarket;
