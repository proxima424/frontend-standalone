/* global BigInt */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount, useChainId, usePublicClient, useWriteContract, useWaitForTransactionReceipt, useConnect, useReadContract } from 'wagmi';
import { formatEther, parseUnits, keccak256, encodePacked } from 'viem';
import { injected } from 'wagmi/connectors';
import './GandalfTradePage.css';
import { PNP_FACTORY_ADDRESS, USDPNP_ADDRESS, ETH_SEPOLIA_CHAIN_ID, PNP_ABI } from '../contracts/contractConfig';

// Constants for using in this component only (not exported from contractConfig.js)
const PRICE_LIBRARY = '0x49a0882e5664e09584aa57AcC2157612472Be32d';

// Define ERC20_APPROVE_ABI since it's not in contractConfig.js
const ERC20_APPROVE_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Price Library ABI
const PRICE_LIBRARY_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "r", type: "uint256" },
      { internalType: "uint256", name: "a", type: "uint256" },
      { internalType: "uint256", name: "b", type: "uint256" }
    ],
    name: "getPrice",
    outputs: [{ internalType: "uint256", name: "price", type: "uint256" }],
    stateMutability: "pure",
    type: "function"
  }
];

// ERC1155Supply ABI for totalSupply
const ERC1155_SUPPLY_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
];

// Factory read functions ABI
const FACTORY_READ_ABI = [
  { inputs: [{internalType: "bytes32", name: "", type: "bytes32"}], name: "marketQuestion", outputs: [{internalType: "string", name: "", type: "string"}], stateMutability: "view", type: "function" },
  { inputs: [{internalType: "bytes32", name: "", type: "bytes32"}], name: "marketEndTime", outputs: [{internalType: "uint256", name: "", type: "uint256"}], stateMutability: "view", type: "function" },
  { inputs: [{internalType: "bytes32", name: "", type: "bytes32"}], name: "marketReserve", outputs: [{internalType: "uint256", name: "", type: "uint256"}], stateMutability: "view", type: "function" },
  { inputs: [{internalType: "bytes32", name: "", type: "bytes32"}], name: "collateralToken", outputs: [{internalType: "address", name: "", type: "address"}], stateMutability: "view", type: "function" }
];

const MINIMUM_BET_AMOUNT = 2; // Same as in Gandalf.js

// Default market data to prevent errors before loading
const DEFAULT_MARKET_DATA = {
  id: 'loading',
  question: "Loading market details... 🔮",
  yesPrice: 0.5,
  noPrice: 0.5,
  yesMultiplier: 2,
  noMultiplier: 2,
  marketReserve: "0",
  collateralTokenAddress: USDPNP_ADDRESS,
  resolutionSource: "Perplexity",
  marketEndTime: BigInt(Math.floor(Date.now() / 1000) + (24 * 60 * 60)),
};

const GandalfTradePage = () => {
  const { conditionId } = useParams();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { connect } = useConnect({ connector: injected() });

  const [marketData, setMarketData] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const [betAmount, setBetAmount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(null); // 'yes' or 'no'
  const [actionMessage, setActionMessage] = useState('');
  const [isAmountLessThanMinimum, setIsAmountLessThanMinimum] = useState(false);

  // ----- Data Fetching Logic (adapted from Gandalf.js) -----
  const getTokenIds = (condId) => {
    try {
      if (typeof condId === 'string' && condId.startsWith('0x') && condId.length === 66) {
        const yesTokenId = BigInt(keccak256(encodePacked(['bytes32', 'string'], [condId, 'YES'])));
        const noTokenId = BigInt(keccak256(encodePacked(['bytes32', 'string'], [condId, 'NO'])));
        return { yesTokenId, noTokenId };
      }
      throw new Error(`Invalid conditionId format: ${condId}`);
    } catch (error) {
      console.error("Error in getTokenIds:", error);
      throw error; // Re-throw to be caught by caller
    }
  };

  const getTokenSupplies = async (yesTokenId, noTokenId) => {
    try {
      const yesSupply = await publicClient.readContract({
        address: PNP_FACTORY_ADDRESS,
        abi: ERC1155_SUPPLY_ABI,
        functionName: 'totalSupply',
        args: [yesTokenId],
        chainId: ETH_SEPOLIA_CHAIN_ID
      });
      const noSupply = await publicClient.readContract({
        address: PNP_FACTORY_ADDRESS,
        abi: ERC1155_SUPPLY_ABI,
        functionName: 'totalSupply',
        args: [noTokenId],
        chainId: ETH_SEPOLIA_CHAIN_ID
      });
      return { yesSupply, noSupply };
    } catch (error) {
      console.error("Error getting token supplies:", error);
      return { yesSupply: BigInt(1), noSupply: BigInt(1) }; // Fallback
    }
  };

  const calculatePrices = async (marketReserve, condId) => {
    try {
      const { yesTokenId, noTokenId } = getTokenIds(condId);
      const { yesSupply, noSupply } = await getTokenSupplies(yesTokenId, noTokenId);

      const yesPrice = await publicClient.readContract({
        address: PRICE_LIBRARY, abi: PRICE_LIBRARY_ABI, functionName: 'getPrice',
        args: [marketReserve, yesSupply, noSupply], chainId: ETH_SEPOLIA_CHAIN_ID
      });
      const noPrice = await publicClient.readContract({
        address: PRICE_LIBRARY, abi: PRICE_LIBRARY_ABI, functionName: 'getPrice',
        args: [marketReserve, noSupply, yesSupply], chainId: ETH_SEPOLIA_CHAIN_ID
      });

      const yesPriceFormatted = parseFloat(formatEther(yesPrice));
      const noPriceFormatted = parseFloat(formatEther(noPrice));
      const yesMultiplier = yesPriceFormatted > 0 ? (1 / yesPriceFormatted) : 0;
      const noMultiplier = noPriceFormatted > 0 ? (1 / noPriceFormatted) : 0;

      return { yesPrice: yesPriceFormatted, noPrice: noPriceFormatted, yesMultiplier, noMultiplier };
    } catch (error) {
      console.error("Error calculating prices:", error);
      return { yesPrice: 0.5, noPrice: 0.5, yesMultiplier: 2, noMultiplier: 2 }; // Fallback
    }
  };

  const fetchMarketByConditionId = async (condId) => {
    if (!publicClient || !condId) {
      setErrorMessage("Client or Condition ID not available.");
      setIsLoadingData(false);
      return;
    }
    setIsLoadingData(true);
    setErrorMessage(null);
    try {
      const marketQuestionData = await publicClient.readContract({ 
        address: PNP_FACTORY_ADDRESS, abi: FACTORY_READ_ABI, functionName: 'marketQuestion', 
        args: [condId], chainId: ETH_SEPOLIA_CHAIN_ID
      });

      if (!marketQuestionData || marketQuestionData.trim() === "") {
        setErrorMessage(`Market with Condition ID ${condId} not found or has no question.`);
        setMarketData(DEFAULT_MARKET_DATA); // Show default if not found
        setIsLoadingData(false);
        return;
      }
      const marketEndTimeData = await publicClient.readContract({ address: PNP_FACTORY_ADDRESS, abi: FACTORY_READ_ABI, functionName: 'marketEndTime', args: [condId], chainId: ETH_SEPOLIA_CHAIN_ID });
      const marketReserveData = await publicClient.readContract({ address: PNP_FACTORY_ADDRESS, abi: FACTORY_READ_ABI, functionName: 'marketReserve', args: [condId], chainId: ETH_SEPOLIA_CHAIN_ID });
      const collateralTokenData = await publicClient.readContract({ address: PNP_FACTORY_ADDRESS, abi: FACTORY_READ_ABI, functionName: 'collateralToken', args: [condId], chainId: ETH_SEPOLIA_CHAIN_ID });
      
      const formattedMarketReserve = marketReserveData !== undefined ? formatEther(marketReserveData) : '0';
      const priceData = await calculatePrices(marketReserveData, condId);

      setMarketData({
        id: condId,
        question: marketQuestionData,
        marketEndTime: marketEndTimeData,
        marketReserve: formattedMarketReserve,
        collateralTokenAddress: collateralTokenData,
        ...priceData,
        resolutionSource: "Perplexity", // Assuming, or fetch if available
      });
    } catch (err) {
      console.error("Error fetching market by conditionId:", err);
      setErrorMessage(`Error fetching market ${condId}: ${(err.shortMessage || err.message)}`);
      setMarketData(DEFAULT_MARKET_DATA);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (conditionId) {
      fetchMarketByConditionId(conditionId);
    } else {
      setErrorMessage("No condition ID provided.");
      setMarketData(DEFAULT_MARKET_DATA);
      setIsLoadingData(false);
    }
  }, [conditionId, publicClient]);

  // ----- Transaction Logic (adapted from CreateMarketForm.js) -----
  const { 
    data: mintTxHash, 
    error: mintWriteError, 
    isPending: isMintPending, 
    writeContractAsync: mintTokensAsync 
  } = useWriteContract();

  const { 
    data: approveTxHash, 
    error: approveWriteError, 
    isPending: isApprovePending, 
    writeContractAsync: approveTokenAsync 
  } = useWriteContract();

  const [isPollingAllowance, setIsPollingAllowance] = useState(false);
  const [isApprovedForAmount, setIsApprovedForAmount] = useState(false);

  // Track transaction receipts
  const { 
    isLoading: isApproveTxLoading, 
    isSuccess: isApproveTxSuccess 
  } = useWaitForTransactionReceipt({ 
    hash: approveTxHash,
    enabled: !!approveTxHash
  });

  const { 
    isLoading: isMintTxLoading, 
    isSuccess: isMintTxSuccess 
  } = useWaitForTransactionReceipt({ 
    hash: mintTxHash,
    enabled: !!mintTxHash
  });

  // Get allowance status - similar to CreateMarketForm.js
  const { data: currentAllowance, refetch: refetchAllowance } = useReadContract({
    address: marketData?.collateralTokenAddress || USDPNP_ADDRESS,
    abi: [
      {
        "inputs": [
          {"internalType": "address", "name": "owner", "type": "address"},
          {"internalType": "address", "name": "spender", "type": "address"}
        ],
        "name": "allowance",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'allowance',
    args: [address, PNP_FACTORY_ADDRESS],
    query: {
      enabled: !!address && !!betAmount && parseFloat(betAmount) > 0,
      refetchInterval: isPollingAllowance ? 2000 : false
    }
  });

  // Check if amount is approved
  useEffect(() => {
    if (betAmount && !isNaN(parseFloat(betAmount)) && parseFloat(betAmount) >= MINIMUM_BET_AMOUNT && currentAllowance !== undefined) {
      const requiredAmount = parseUnits(betAmount, 6);
      setIsApprovedForAmount(requiredAmount <= currentAllowance);
      if (requiredAmount <= currentAllowance) {
        setIsPollingAllowance(false);
      }
    } else {
      setIsApprovedForAmount(false);
    }
  }, [betAmount, currentAllowance]);

  // Update polling when approval transaction is sent
  useEffect(() => {
    if (approveTxHash) setIsPollingAllowance(true);
  }, [approveTxHash]);

  useEffect(() => {
    if (approveWriteError) setIsPollingAllowance(false);
  }, [approveWriteError]);

  // Update approval status on success
  useEffect(() => {
    if (isApproveTxSuccess) {
      refetchAllowance();
      setActionMessage('Approval successful! You can now place your bet.');
      setTimeout(() => setActionMessage(''), 5000);
    }
  }, [isApproveTxSuccess, refetchAllowance]);

  // Handle approve button click
  const handleApprove = async () => {
    if (!isConnected || !address) {
      setActionMessage('Please connect your wallet.');
      connect(); // Prompt connection
      return;
    }
    
    if (chainId !== ETH_SEPOLIA_CHAIN_ID) {
      setActionMessage('Please switch to the Sepolia network.');
      return;
    }
    
    setActionMessage('Preparing infinite approval...');
    
    try {
      const collateralTokenAddr = marketData?.collateralTokenAddress || USDPNP_ADDRESS;
      
      // Use max uint256 for infinite approval
      const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
      
      console.log('=== INFINITE APPROVAL PARAMETERS ===');
      console.log('Token Address:', collateralTokenAddr);
      console.log('Spender Address:', PNP_FACTORY_ADDRESS);
      console.log('Approval Amount:', MAX_UINT256.toString());
      console.log('==============================');
      
      await approveTokenAsync({
        address: collateralTokenAddr,
        abi: ERC20_APPROVE_ABI,
        functionName: 'approve',
        args: [PNP_FACTORY_ADDRESS, MAX_UINT256],
        chainId: ETH_SEPOLIA_CHAIN_ID
      });
      
      setActionMessage('Infinite approval transaction submitted. Waiting for confirmation...');
    } catch (approvalErr) {
      console.error("Approval error:", approvalErr);
      setActionMessage(`Token approval failed: ${approvalErr.shortMessage || approvalErr.message}`);
      setButtonLoading(null);
      setActionLoading(false);
    }
  };

  // Get Token IDs for minting (same as getModalTokenIds in Gandalf)
  const getMintTokenIds = async (condId) => {
    // This reuses the same PNP_ABI filtering logic as in Gandalf.js
    // For brevity, assuming PNP_ABI has getYesTokenId and getNoTokenId
     try {
      const yesTokenId = await publicClient.readContract({
        address: PNP_FACTORY_ADDRESS,
        abi: PNP_ABI.filter(item => item.name === 'getYesTokenId'), 
        functionName: 'getYesTokenId',
        args: [condId],
      });
      const noTokenId = await publicClient.readContract({
        address: PNP_FACTORY_ADDRESS,
        abi: PNP_ABI.filter(item => item.name === 'getNoTokenId'), 
        functionName: 'getNoTokenId',
        args: [condId],
      });
      return { yesTokenId, noTokenId };
    } catch (error) {
      console.error("Error getting token IDs from contract for minting:", error);
      throw error;
    }
  };

  // Handle bet placement
  const handleBetPlacement = async (isYesBet) => {
    // Check if approved first
    if (!isApprovedForAmount) {
      setActionMessage('Please approve token transfer first.');
      return;
    }
    
    const currentAmount = parseFloat(betAmount);
    if (isNaN(currentAmount) || currentAmount < MINIMUM_BET_AMOUNT) {
      setIsAmountLessThanMinimum(true);
      setActionMessage(`Minimum bet amount is ${MINIMUM_BET_AMOUNT} USDC.`);
      return;
    }
    setIsAmountLessThanMinimum(false);

    if (!marketData?.id || marketData.id === 'loading') {
      setActionMessage('Market data not loaded yet.');
      return;
    }
    if (!isConnected || !address) {
      setActionMessage('Please connect your wallet.');
      connect(); // Prompt connection
      return;
    }
    if (chainId !== ETH_SEPOLIA_CHAIN_ID) {
      setActionMessage('Please switch to the Sepolia network.');
      return;
    }

    setButtonLoading(isYesBet ? 'yes' : 'no');
    setActionLoading(true);
    setActionMessage('Preparing transaction...');

    try {
      const { yesTokenId, noTokenId } = await getMintTokenIds(marketData.id);
      if (!yesTokenId || !noTokenId) throw new Error("Token IDs could not be fetched for minting.");

      const tokenIdToMint = isYesBet ? yesTokenId : noTokenId;
      const collateralAmountParsed = parseUnits(betAmount, 6);

      // Add detailed console logging
      console.log('=== BET PLACEMENT PARAMETERS ===');
      console.log('Market Data:', {
        marketId: marketData.id,
        question: marketData.question,
        yesPrice: marketData.yesPrice,
        noPrice: marketData.noPrice,
        marketReserve: marketData.marketReserve,
        collateralTokenAddress: marketData.collateralTokenAddress
      });
      console.log('User Input:', {
        betAmount: betAmount,
        parsedBetAmount: collateralAmountParsed.toString(),
        isYesBet: isYesBet,
        userAddress: address,
        chainId: chainId
      });
      console.log('Token IDs:', {
        yesTokenId: yesTokenId.toString(),
        noTokenId: noTokenId.toString(),
        selectedTokenId: tokenIdToMint.toString()
      });
      console.log('Contract Parameters:', {
        conditionId: marketData.id,
        collateralAmount: collateralAmountParsed.toString(),
        tokenIdToMint: tokenIdToMint.toString()
      });
      console.log('Contract Addresses:', {
        factoryAddress: PNP_FACTORY_ADDRESS,
        collateralTokenAddress: marketData.collateralTokenAddress
      });
      console.log('Approval Status:', {
        isApprovedForAmount,
        currentAllowance: currentAllowance?.toString()
      });
      console.log('==============================');
      
      // Call mintTokensAsync directly
      await mintTokensAsync({
        address: PNP_FACTORY_ADDRESS,
        abi: PNP_ABI,
        functionName: 'mintDecisionTokens',
        args: [marketData.id, collateralAmountParsed, tokenIdToMint],
        chainId: ETH_SEPOLIA_CHAIN_ID
      });
      
      setActionMessage('Bet transaction submitted! Waiting for confirmation...');
    } catch (err) {
      console.error("Error during bet placement:", err);
      setActionMessage(`Error: ${err.shortMessage || err.message}`);
      setButtonLoading(null);
      setActionLoading(false);
    }
  };

  // Effect for handling minting success/failure
  useEffect(() => {
    if (isMintTxSuccess) {
      setActionMessage('Bet placed successfully!');
      setButtonLoading(null);
      setActionLoading(false);
      setBetAmount('');
      // Optionally navigate away or show a success message that persists
      setTimeout(() => { 
        setActionMessage('');
        navigate(`/gandalf/market/${conditionId}`); // Navigate back to market view or main Gandalf page
      }, 3000);
    }
  }, [isMintTxSuccess, navigate, conditionId]);

  // Handle minting errors
  useEffect(() => {
    if (mintWriteError) {
      setActionMessage(`Minting Error: ${mintWriteError.shortMessage || mintWriteError.message}`);
      setButtonLoading(null);
      setActionLoading(false);
    }
  }, [mintWriteError]);

  useEffect(() => {
    if (betAmount) {
        const amount = parseFloat(betAmount);
        setIsAmountLessThanMinimum(!isNaN(amount) && amount < MINIMUM_BET_AMOUNT && amount > 0);
        if (!isNaN(amount) && amount >= MINIMUM_BET_AMOUNT) {
            setActionMessage(''); 
        }
    } else {
        setIsAmountLessThanMinimum(false);
    }
  }, [betAmount]);

  if (isLoadingData) {
    return (
      <div className="gandalf-trade-page-overlay" onClick={() => navigate(-1)}>
        <div className="gandalf-trade-modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>Loading Market...</h2>
        </div>
      </div>
    );
  }
  
  const displayData = marketData || DEFAULT_MARKET_DATA;

  return (
    <div className="gandalf-trade-page-overlay" onClick={() => navigate(-1)}>
      <div className="gandalf-trade-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="gandalf-trade-modal-close" onClick={() => navigate(-1)}>×</button>
        <h2 className="gandalf-trade-modal-title">Place Your Bet</h2>
        {errorMessage && <p className="gandalf-trade-error">{errorMessage}</p>}
        <p className="gandalf-trade-modal-question">{displayData.question}</p>
        
        {/* Display market info like prices/multipliers if needed */}
        <div className="gandalf-trade-prices">
            <p>YES: Price ${displayData.yesPrice?.toFixed(2)} (x{displayData.yesMultiplier?.toFixed(2)})</p>
            <p>NO: Price ${displayData.noPrice?.toFixed(2)} (x{displayData.noMultiplier?.toFixed(2)})</p>
        </div>

        <div className="gandalf-trade-modal-bet-section">
          <div className="trade-modal-input-container">
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder={`Min ${MINIMUM_BET_AMOUNT} ${displayData.collateralTokenAddress === USDPNP_ADDRESS ? 'USDC' : 'Tokens'}`}
              className={`trade-modal-input ${isAmountLessThanMinimum ? 'input-error' : ''}`}
              min="0"
              step="any"
              disabled={actionLoading || isApproveTxLoading || isApprovedForAmount && isMintPending}
            />
            <span className="trade-modal-input-label">{displayData.collateralTokenAddress === USDPNP_ADDRESS ? 'USDC' : 'Tokens'}</span>
          </div>
          
          {/* Only show approval button if not already approved */}
          {!isApprovedForAmount && (
            <button 
              className="gandalf-trade-modal-button approve"
              onClick={handleApprove}
              disabled={isApprovedForAmount || isApprovePending || isApproveTxLoading}
            >
              {isApprovePending || isApproveTxLoading ? 'Approving...' : 'Approve infinite ( testnet only )'}
            </button>
          )}
          
          {/* Show approved status when approved */}
          {isApprovedForAmount && (
            <div className="approval-status-indicator">
              <span className="approved-text">Approved</span>
            </div>
          )}

          {isAmountLessThanMinimum && <p className="gandalf-trade-modal-warning">Minimum bet is {MINIMUM_BET_AMOUNT} {displayData.collateralTokenAddress === USDPNP_ADDRESS ? 'USDC' : 'Tokens'}.</p>}
          {isPollingAllowance && <p className="gandalf-trade-modal-info">Checking approval status...</p>}

          <div className="trade-modal-bet-actions">
            <button 
              className="gandalf-trade-modal-button yes"
              onClick={() => handleBetPlacement(true)}
              disabled={!isApprovedForAmount || actionLoading || isMintPending || isMintTxLoading || buttonLoading === 'yes' || buttonLoading === 'no' || !betAmount || parseFloat(betAmount) < MINIMUM_BET_AMOUNT}
            >
              {buttonLoading === 'yes' ? 'Processing...' : 'BET YES'}
            </button>
            <button 
              className="gandalf-trade-modal-button no"
              onClick={() => handleBetPlacement(false)}
              disabled={!isApprovedForAmount || actionLoading || isMintPending || isMintTxLoading || buttonLoading === 'yes' || buttonLoading === 'no' || !betAmount || parseFloat(betAmount) < MINIMUM_BET_AMOUNT}
            >
              {buttonLoading === 'no' ? 'Processing...' : 'BET NO'}
            </button>
          </div>
        </div>

        {actionMessage && !isAmountLessThanMinimum && <p className="gandalf-trade-modal-status">{actionMessage}</p>}
      </div>
    </div>
  );
};

export default GandalfTradePage; 