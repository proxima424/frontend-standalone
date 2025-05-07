/* global BigInt */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount, useChainId, usePublicClient, useWatchContractEvent, useContractRead, useContractWrite, useWaitForTransactionReceipt, useConnect, useDisconnect } from 'wagmi';
import { decodeEventLog, formatEther, parseEther, keccak256, encodePacked } from 'viem';
import { injected } from 'wagmi/connectors';
import './Gandalf.css';
import Saruman from '../components/Saruman';
import CreateMarketForm from '../components/CreateMarketForm'; // Kept for the create functionality
import MarketTile from '../components/MarketTile'; // Kept for other markets display
import { PNP_FACTORY_ADDRESS, USDPNP_ADDRESS, ETH_SEPOLIA_CHAIN_ID, PNP_ABI } from '../contracts/contractConfig'; // Main factory address
import WelcomePopup from '../components/WelcomePopup';

// Constants for fetching market data (event and read ABIs)
const pnpMarketCreatedEventAbiItem = {
    type: "event",
    name: "PNP_MarketCreated",
    inputs: [
      { indexed: true, name: "conditionId", type: "bytes32" },
      { indexed: true, name: "marketCreator", type: "address" },
    ]
};

const FACTORY_READ_ABI = [
    { inputs: [{internalType: "bytes32", name: "", type: "bytes32"}], name: "marketQuestion", outputs: [{internalType: "string", name: "", type: "string"}], stateMutability: "view", type: "function" },
    { inputs: [{internalType: "bytes32", name: "", type: "bytes32"}], name: "marketEndTime", outputs: [{internalType: "uint256", name: "", type: "uint256"}], stateMutability: "view", type: "function" },
    { inputs: [{internalType: "bytes32", name: "", type: "bytes32"}], name: "marketReserve", outputs: [{internalType: "uint256", name: "", type: "uint256"}], stateMutability: "view", type: "function" },
    { inputs: [{internalType: "bytes32", name: "", type: "bytes32"}], name: "collateralToken", outputs: [{internalType: "address", name: "", type: "address"}], stateMutability: "view", type: "function" }
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

const PRICE_LIBRARY = '0x49a0882e5664e09584aa57AcC2157612472Be32d';

// Default market data for /gandalf base route
const DEFAULT_SARUMAN_DATA = {
  id: 'default-market',
  question: "Will today be a good day for crypto? 🔮",
  yesPrice: 0.65,
  noPrice: 0.35,
  yesMultiplier: 1.54,
  noMultiplier: 2.86,
  marketReserve: "123,456",
  collateralTokenAddress: USDPNP_ADDRESS,
  resolutionSource: "Perplexity",
  marketEndTime: BigInt(Math.floor(Date.now() / 1000) + (24 * 60 * 60)),
};

const SEPOLIA_CHAIN_ID = 11155111;

const MINIMUM_BET_AMOUNT = 2;

const Gandalf = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [isCorrectChain, setIsCorrectChain] = useState(false);
  const { connect } = useConnect({
    connector: injected()
  });
  const { disconnect } = useDisconnect();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const { creatorAddress, conditionId: conditionIdFromParams } = useParams();
  const [sampleMarkets, setSampleMarkets] = useState([]);

  const publicClient = usePublicClient();
  const [sarumanDisplayData, setSarumanDisplayData] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showSarumanModal, setShowSarumanModal] = useState(false);
  const [modalBetAmount, setModalBetAmount] = useState('');
  
  const [modalActionLoading, setModalActionLoading] = useState(false);
  const [modalButtonLoading, setModalButtonLoading] = useState(null);
  const [modalActionMessage, setModalActionMessage] = useState('');
  const [isAmountLessThanMinimum, setIsAmountLessThanMinimum] = useState(false);

  const navigate = useNavigate();
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);

  useEffect(() => {
    setIsCorrectChain(chainId === SEPOLIA_CHAIN_ID);
  }, [chainId]);

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Function to get token IDs
  const getTokenIds = (conditionId) => {
    try {
      // For sample IDs, return predefined dummy values to avoid BytesSizeMismatchError
      if (typeof conditionId === 'string' && !conditionId.startsWith('0x')) {
        console.log("Using predefined token IDs for sample:", conditionId);
        return {
          yesTokenId: BigInt('0x1000000000000000000000000000000000000000000000000000000000000001'),
          noTokenId: BigInt('0x2000000000000000000000000000000000000000000000000000000000000002')
        };
      }
      
      // For real bytes32 condition IDs
      if (typeof conditionId === 'string' && conditionId.startsWith('0x') && conditionId.length === 66) {
        const yesTokenId = BigInt(keccak256(encodePacked(['bytes32', 'string'], [conditionId, 'YES'])));
        const noTokenId = BigInt(keccak256(encodePacked(['bytes32', 'string'], [conditionId, 'NO'])));
        return { yesTokenId, noTokenId };
      }
      
      throw new Error(`Invalid conditionId format: ${conditionId}`);
    } catch (error) {
      console.error("Error in getTokenIds:", error);
      // Return dummy values for fallback
      return { 
        yesTokenId: BigInt('0x1000000000000000000000000000000000000000000000000000000000000001'),
        noTokenId: BigInt('0x2000000000000000000000000000000000000000000000000000000000000002')
      };
    }
  };

  // Function to get token supplies
  const getTokenSupplies = async (yesTokenId, noTokenId) => {
    try {
      // For sample data, return predefined values
      if (yesTokenId.toString() === '0x1000000000000000000000000000000000000000000000000000000000000001') {
        return { yesSupply: BigInt(1), noSupply: BigInt(1) };
      }
      
      // Real data fetching
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
      return { yesSupply: BigInt(1), noSupply: BigInt(1) };
    }
  };

  const calculatePrices = async (marketReserve, conditionId) => {
    try {
      // For sample data without a proper conditionId, use hardcoded values
      if (!conditionId || (typeof conditionId === 'string' && !conditionId.startsWith('0x'))) {
        const yesPriceFormatted = 0.65;
        const noPriceFormatted = 0.35;
        return {
          yesPrice: yesPriceFormatted,
          noPrice: noPriceFormatted,
          yesMultiplier: 1 / yesPriceFormatted,
          noMultiplier: 1 / noPriceFormatted
        };
      }
      
      // Get token IDs
      const { yesTokenId, noTokenId } = getTokenIds(conditionId);
      
      // Get token supplies
      const { yesSupply, noSupply } = await getTokenSupplies(yesTokenId, noTokenId);

      // For YES price: r = marketReserve, a = yesSupply, b = noSupply
      const yesPrice = await publicClient.readContract({
        address: PRICE_LIBRARY,
        abi: PRICE_LIBRARY_ABI,
        functionName: 'getPrice',
        args: [marketReserve, yesSupply, noSupply],
        chainId: ETH_SEPOLIA_CHAIN_ID
      });

      // For NO price: r = marketReserve, a = noSupply, b = yesSupply
      const noPrice = await publicClient.readContract({
        address: PRICE_LIBRARY,
        abi: PRICE_LIBRARY_ABI,
        functionName: 'getPrice',
        args: [marketReserve, noSupply, yesSupply],
        chainId: ETH_SEPOLIA_CHAIN_ID
      });

      // Calculate multipliers (1/price)
      // Convert from wei to ETH for display
      const yesPriceFormatted = parseFloat(formatEther(yesPrice));
      const noPriceFormatted = parseFloat(formatEther(noPrice));
      
      // Calculate multipliers - if price is 0, multiplier is 0 to avoid division by zero
      const yesMultiplier = yesPriceFormatted > 0 ? (1 / yesPriceFormatted) : 0;
      const noMultiplier = noPriceFormatted > 0 ? (1 / noPriceFormatted) : 0;

      return {
        yesPrice: yesPriceFormatted,
        noPrice: noPriceFormatted,
        yesMultiplier,
        noMultiplier
      };
    } catch (error) {
      console.error("Error calculating prices:", error);
      return {
        yesPrice: 0.65,
        noPrice: 0.35,
        yesMultiplier: 1.54,
        noMultiplier: 2.86
      };
    }
  };

  const fetchMarketByConditionId = async (condId) => {
    if (!publicClient || !condId) {
      setErrorMessage("Client or Condition ID not available.");
      setIsLoadingData(false);
      return;
    }
    console.log(`Gandalf: Fetching market by conditionId: ${condId}`);
    try {
      const marketQuestionData = await publicClient.readContract({ 
        address: PNP_FACTORY_ADDRESS, 
        abi: FACTORY_READ_ABI, 
        functionName: 'marketQuestion', 
        args: [condId],
        chainId: ETH_SEPOLIA_CHAIN_ID
      });
      if (!marketQuestionData || marketQuestionData.trim() === "") {
          setErrorMessage(`Market with Condition ID ${condId} not found or has no question.`);
          setSarumanDisplayData(DEFAULT_SARUMAN_DATA);
          setIsLoadingData(false);
          return;
      }
      const marketEndTimeData = await publicClient.readContract({ address: PNP_FACTORY_ADDRESS, abi: FACTORY_READ_ABI, functionName: 'marketEndTime', args: [condId] });
      const marketReserveData = await publicClient.readContract({ address: PNP_FACTORY_ADDRESS, abi: FACTORY_READ_ABI, functionName: 'marketReserve', args: [condId] });
      const collateralTokenData = await publicClient.readContract({ address: PNP_FACTORY_ADDRESS, abi: FACTORY_READ_ABI, functionName: 'collateralToken', args: [condId] });
      const formattedMarketReserve = marketReserveData !== undefined ? formatEther(marketReserveData) : '0';

      // Calculate YES and NO prices using the PRICE_LIBRARY with token supplies
      const priceData = await calculatePrices(marketReserveData, condId);

      setSarumanDisplayData({
        id: condId,
        question: marketQuestionData,
        marketEndTime: marketEndTimeData,
        marketReserve: formattedMarketReserve,
        collateralTokenAddress: collateralTokenData,
        yesPrice: priceData.yesPrice, 
        noPrice: priceData.noPrice, 
        yesMultiplier: priceData.yesMultiplier, 
        noMultiplier: priceData.noMultiplier, 
        resolutionSource: "Perplexity",
      });
    } catch (err) {
      console.error("Gandalf: Error fetching market by conditionId:", err);
      setErrorMessage(`Error fetching market ${condId}: ${(err.shortMessage || err.message)}`);
      setSarumanDisplayData(DEFAULT_SARUMAN_DATA);
    }
  };

  // Function to fetch markets from contract events
  const fetchMarkets = async () => {
    try {
      console.log("=== Fetching Markets from Contract ===");
      
      // Get all PNP_MarketCreated events
      const events = await publicClient.getLogs({
        address: PNP_FACTORY_ADDRESS,
        event: {
          type: 'event',
          name: 'PNP_MarketCreated',
          inputs: [
            { indexed: true, name: 'conditionId', type: 'bytes32' },
            { indexed: true, name: 'marketCreator', type: 'address' }
          ]
        },
        fromBlock: 0n,
        toBlock: 'latest'
      });

      console.log("Found market events:", events);

      // Fetch details for each market
      const marketDetails = await Promise.all(
        events.map(async (event) => {
          const conditionId = event.args.conditionId;
          
          // Fetch market details
          const [question, endTime, reserve] = await Promise.all([
            publicClient.readContract({
              address: PNP_FACTORY_ADDRESS,
              abi: PNP_ABI,
              functionName: 'marketQuestion',
              args: [conditionId]
            }),
            publicClient.readContract({
              address: PNP_FACTORY_ADDRESS,
              abi: PNP_ABI,
              functionName: 'getMarketEndTime',
              args: [conditionId]
            }),
            publicClient.readContract({
              address: PNP_FACTORY_ADDRESS,
              abi: PNP_ABI,
              functionName: 'marketReserve',
              args: [conditionId]
            })
          ]);

          // Get token IDs
          const yesTokenId = await publicClient.readContract({
            address: PNP_FACTORY_ADDRESS,
            abi: PNP_ABI,
            functionName: 'getYesTokenId',
            args: [conditionId]
          });

          const noTokenId = await publicClient.readContract({
            address: PNP_FACTORY_ADDRESS,
            abi: PNP_ABI,
            functionName: 'getNoTokenId',
            args: [conditionId]
          });

          // Get token supplies
          const [yesSupply, noSupply] = await Promise.all([
            publicClient.readContract({
              address: PNP_FACTORY_ADDRESS,
              abi: PNP_ABI,
              functionName: 'totalSupply',
              args: [yesTokenId]
            }),
            publicClient.readContract({
              address: PNP_FACTORY_ADDRESS,
              abi: PNP_ABI,
              functionName: 'totalSupply',
              args: [noTokenId]
            })
          ]);

          // Calculate prices using the price library
          const yesPrice = await publicClient.readContract({
            address: PRICE_LIBRARY,
            abi: PRICE_LIBRARY_ABI,
            functionName: 'getPrice',
            args: [reserve, yesSupply, noSupply]
          });

          const noPrice = await publicClient.readContract({
            address: PRICE_LIBRARY,
            abi: PRICE_LIBRARY_ABI,
            functionName: 'getPrice',
            args: [reserve, noSupply, yesSupply]
          });

          // Convert prices to numbers and calculate multipliers
          const yesPriceFormatted = parseFloat(formatEther(yesPrice));
          const noPriceFormatted = parseFloat(formatEther(noPrice));
          const yesMultiplier = yesPriceFormatted > 0 ? (1 / yesPriceFormatted) : 0;
          const noMultiplier = noPriceFormatted > 0 ? (1 / noPriceFormatted) : 0;

          return {
            id: conditionId,
            question,
            yesPrice: yesPriceFormatted,
            noPrice: noPriceFormatted,
            yesMultiplier: Number(yesMultiplier.toFixed(2)),
            noMultiplier: Number(noMultiplier.toFixed(2)),
            endTime: Number(endTime),
            reserve: formatEther(reserve),
            creator: event.args.marketCreator
          };
        })
      );

      console.log("Processed market details:", marketDetails);
      setSampleMarkets(marketDetails);
    } catch (error) {
      console.error("Error fetching markets:", error);
    }
  };

  // Fetch markets when component mounts
  useEffect(() => {
    if (publicClient) {
      fetchMarkets();
    }
  }, [publicClient]);

  // Watch for new market creation events
  useWatchContractEvent({
    address: PNP_FACTORY_ADDRESS,
    abi: [pnpMarketCreatedEventAbiItem],
    eventName: 'PNP_MarketCreated',
    chainId: ETH_SEPOLIA_CHAIN_ID,
    onLogs(logs) {
      logs.forEach(async (log) => {
        console.log('🎉 New market created! Refreshing markets...');
        await fetchMarkets(); // Refresh all markets when a new one is created
      });
    },
  });

  const fetchLatestMarketByCreator = async (creator) => {
    if (!publicClient || !creator) {
      setErrorMessage("Client or Creator Address not available.");
      setIsLoadingData(false);
      return;
    }
    console.log(`Gandalf: Fetching latest market for creator: ${creator}`);
    try {
      const logs = await publicClient.getLogs({
        address: PNP_FACTORY_ADDRESS,
        event: pnpMarketCreatedEventAbiItem,
        args: { marketCreator: creator },
        fromBlock: 'earliest',
        toBlock: 'latest'
      });

      if (logs && logs.length > 0) {
        // Sort logs by block number to get the latest
        const sortedLogs = logs.sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber));
        const latestCondId = sortedLogs[0]?.args?.conditionId;
        
        if (latestCondId) {
          console.log("Found latest market:", latestCondId);
          await fetchMarketByConditionId(latestCondId);
        } else {
          setErrorMessage(`No valid conditionId found in latest market event for ${creator}.`);
          setSarumanDisplayData(DEFAULT_SARUMAN_DATA);
        }
      } else {
        setErrorMessage(`No markets found for creator: ${creator}. Displaying default market.`);
        setSarumanDisplayData(DEFAULT_SARUMAN_DATA);
      }
    } catch (err) {
      console.error("Gandalf: Error fetching latest market by creator:", err);
      setErrorMessage(`Error fetching markets for ${creator}: ${(err.shortMessage || err.message)}`);
      setSarumanDisplayData(DEFAULT_SARUMAN_DATA);
    }
  };

  useEffect(() => {
    setIsLoadingData(true);
    setErrorMessage(null);

    if (conditionIdFromParams) {
      fetchMarketByConditionId(conditionIdFromParams);
    } else if (creatorAddress) {
      fetchLatestMarketByCreator(creatorAddress);
    } else {
      console.log("Gandalf: Displaying default market.");
      setSarumanDisplayData(DEFAULT_SARUMAN_DATA);
      setIsLoadingData(false);
    }
  }, [conditionIdFromParams, creatorAddress, publicClient]);

  useEffect(() => {
    if(sarumanDisplayData || errorMessage) setIsLoadingData(false);
  }, [sarumanDisplayData, errorMessage]);

  const handleShowForm = () => setShowCreateForm(true);
  const handleHideForm = () => setShowCreateForm(false);

  const handleMarketSelect = (market) => {
    console.log("Market tile clicked:", market);
    navigate(`/gandalf/market/${market.id}`);
  };
  
  let sarumanContent;
  if (isLoadingData) {
    sarumanContent = <Saruman isLoading={true} />;
  } else if (sarumanDisplayData) {
    sarumanContent = <Saruman isLoading={false} marketData={sarumanDisplayData} />;
  } else {
    sarumanContent = <Saruman isLoading={false} marketData={DEFAULT_SARUMAN_DATA} />;
  }

  // useContractWrite for mintDecisionTokens
  const { 
    write: mintModalTokens, 
    data: mintModalData, 
    error: mintModalError, 
    isLoading: isMintModalWriteLoading,
    isError: isMintModalWriteError,
    isSuccess: isMintModalWriteSuccess
  } = useContractWrite({
    address: PNP_FACTORY_ADDRESS,
    abi: PNP_ABI,
    functionName: 'mintDecisionTokens',
    chainId: ETH_SEPOLIA_CHAIN_ID,
  });

  // Track approval state
  const [approvalState, setApprovalState] = useState({
    isApproved: false,
    isApproving: false,
    approvalError: null,
    approvalTxHash: null
  });

  // Wait for approval transaction receipt
  const { 
    isLoading: isApprovalTxLoading, 
    isSuccess: isApprovalTxSuccess,
    error: approvalReceiptError
  } = useWaitForTransactionReceipt({
    hash: approvalState.approvalTxHash,
    chainId: ETH_SEPOLIA_CHAIN_ID,
    enabled: !!approvalState.approvalTxHash,
  });

  // Reset approval state when modal closes
  useEffect(() => {
    if (!showSarumanModal) {
      setApprovalState({
        isApproved: false,
        isApproving: false,
        approvalError: null,
        approvalTxHash: null
      });
    }
  }, [showSarumanModal]);

  // Monitor approval transaction status
  useEffect(() => {
    if (isApprovalTxSuccess && approvalState.mintParams) {
      setApprovalState(prev => ({
        ...prev,
        isApproved: true,
        isApproving: false
      }));
      setModalActionMessage('Approval successful! Now placing your bet...');
      
      // After approval completes, proceed with minting
      const proceedWithMint = async () => {
        try {
          const { conditionId, collateralAmount, tokenIdToMint } = approvalState.mintParams;
          
          if (!mintModalTokens) {
            throw new Error("Minting function not initialized");
          }
          
          mintModalTokens({
            args: [conditionId, collateralAmount, tokenIdToMint]
          });
          
          setModalActionMessage('Bet transaction submitted! Waiting for confirmation...');
        } catch (error) {
          console.error("Error proceeding with mint after approval:", error);
          setModalActionMessage(`Error: ${error.shortMessage || error.message}`);
          setModalButtonLoading(null);
        }
      };
      proceedWithMint();
    }
    
    if (isApprovalTxLoading) {
      setModalActionMessage('Waiting for approval confirmation...');
    }
    
    if (approvalReceiptError) {
      setApprovalState(prev => ({
        ...prev,
        isApproving: false,
        approvalError: approvalReceiptError
      }));
      setModalActionMessage(`Approval failed: ${approvalReceiptError.shortMessage || approvalReceiptError.message}`);
      setModalButtonLoading(null);
    }
  }, [isApprovalTxSuccess, isApprovalTxLoading, approvalReceiptError, approvalState.mintParams, mintModalTokens]);

  const { 
    data: mintModalReceiptData, 
    isLoading: isMintModalTxLoading, 
    isSuccess: isMintModalTxSuccess, 
    error: mintModalReceiptError 
  } = useWaitForTransactionReceipt({
    hash: mintModalData?.hash,
    chainId: ETH_SEPOLIA_CHAIN_ID,
  });

  useEffect(() => {
    console.log("Gandalf debug: useContractWrite (mintModalTokens) hook state update:");
    console.log("  - mintModalTokens (write function available):", !!mintModalTokens);
    console.log("  - mintModalData (tx data from hook):", mintModalData);
    console.log("  - isMintModalWriteLoading (hook loading state):", isMintModalWriteLoading);
    console.log("  - isMintModalWriteError (hook error flag):", isMintModalWriteError);
    console.log("  - isMintModalWriteSuccess (hook success flag):", isMintModalWriteSuccess);
    if (isMintModalWriteError && mintModalError) {
        console.error("Gandalf debug: Detailed useContractWrite (mintModalTokens) hook error object:", mintModalError);
    }
  }, [mintModalTokens, mintModalData, mintModalError, isMintModalWriteLoading, isMintModalWriteError, isMintModalWriteSuccess]);

  // Function to get token IDs within Gandalf.js (similar to Saruman.js)
  const getModalTokenIds = async (conditionId) => {
    if (!publicClient || !conditionId || !PNP_ABI) {
        console.error("Public client, conditionId, or PNP_ABI not available for getModalTokenIds");
        throw new Error("Cannot fetch token IDs: missing prerequisites.");
    }
    try {
      console.log("Gandalf Modal: Fetching token IDs for conditionId:", conditionId);
      const yesTokenId = await publicClient.readContract({
        address: PNP_FACTORY_ADDRESS,
        abi: PNP_ABI.filter(item => item.name === 'getYesTokenId'), 
        functionName: 'getYesTokenId',
        args: [conditionId],
      });
      const noTokenId = await publicClient.readContract({
        address: PNP_FACTORY_ADDRESS,
        abi: PNP_ABI.filter(item => item.name === 'getNoTokenId'), 
        functionName: 'getNoTokenId',
        args: [conditionId],
      });
      console.log("Gandalf Modal: YES Token ID:", yesTokenId?.toString(), "NO Token ID:", noTokenId?.toString());
      return { yesTokenId, noTokenId };
    } catch (error) {
      console.error("Gandalf Modal: Error getting token IDs from contract:", error);
      throw error;
    }
  };

  const handleModalBetPlacement = async (isYesBet) => {
    const currentAmount = parseFloat(modalBetAmount);
    if (isNaN(currentAmount) || currentAmount < MINIMUM_BET_AMOUNT) {
      setIsAmountLessThanMinimum(true);
      setModalActionMessage(`Minimum bet amount is ${MINIMUM_BET_AMOUNT} USDC.`);
      return;
    }
    setIsAmountLessThanMinimum(false);

    if (!sarumanDisplayData?.id) {
      setModalActionMessage('Market condition ID not found.');
      return;
    }
    if (!isConnected || !address) {
      setModalActionMessage('Please connect your wallet.');
      return;
    }

    setModalButtonLoading(isYesBet ? 'yes' : 'no');
    setModalActionMessage('Preparing transaction...');
    try {
      const { yesTokenId, noTokenId } = await getModalTokenIds(sarumanDisplayData.id);
      if (!yesTokenId || !noTokenId) throw new Error("Token IDs could not be fetched.");

      const tokenIdToMint = isYesBet ? yesTokenId : noTokenId;
      const collateralAmount = parseEther(modalBetAmount); 

      console.log("Gandalf Modal Mint params:", {
        conditionId: sarumanDisplayData.id,
        collateralAmount: collateralAmount.toString(),
        tokenIdToMint: tokenIdToMint.toString(),
      });

      // Get collateral token address from the market
      const collateralTokenAddress = sarumanDisplayData.collateralTokenAddress || USDPNP_ADDRESS;
      
      // Set approval state with mint parameters
      setApprovalState({
        isApproved: false,
        isApproving: true,
        approvalError: null,
        approvalTxHash: null,
        mintParams: { conditionId: sarumanDisplayData.id, collateralAmount, tokenIdToMint }
      });
      
      // Execute approval transaction
      setModalActionMessage('Approving token transfer...');
      
      try {
        // Call the ERC20 approve function directly using the public client
        const tx = await publicClient.writeContract({
          address: collateralTokenAddress,
          abi: [
            {
              name: 'approve',
              type: 'function',
              stateMutability: 'nonpayable',
              inputs: [
                { name: 'spender', type: 'address', internalType: 'address' },
                { name: 'amount', type: 'uint256', internalType: 'uint256' }
              ],
              outputs: [{ name: '', type: 'bool', internalType: 'bool' }]
            }
          ],
          functionName: 'approve',
          args: [PNP_FACTORY_ADDRESS, collateralAmount],
          account: address,
          chainId: ETH_SEPOLIA_CHAIN_ID
        });
        
        if (tx) {
          setApprovalState(prev => ({
            ...prev,
            approvalTxHash: tx
          }));
          setModalActionMessage('Approval transaction submitted. Waiting for confirmation...');
        } else {
          throw new Error("Failed to submit approval transaction");
        }
      } catch (approvalErr) {
        console.error("Approval error:", approvalErr);
        throw new Error(`Token approval failed: ${approvalErr.shortMessage || approvalErr.message}`);
      }
    } catch (err) {
      console.error("Error performing modal bet action:", err);
      setModalActionMessage(`Error: ${err.shortMessage || err.message}`);
      setModalButtonLoading(null);
    }
  };

  useEffect(() => {
    if (modalBetAmount) {
        const amount = parseFloat(modalBetAmount);
        setIsAmountLessThanMinimum(!isNaN(amount) && amount < MINIMUM_BET_AMOUNT && amount > 0);
        if (!isNaN(amount) && amount >= MINIMUM_BET_AMOUNT) {
            setModalActionMessage(''); // Clear min amount message if valid
        }
    } else {
        setIsAmountLessThanMinimum(false);
    }
  }, [modalBetAmount]);

  useEffect(() => {
    if (isMintModalTxSuccess) {
      setModalActionMessage('Bet placed successfully!');
      setModalButtonLoading(null);
      setModalBetAmount('');
      setApprovalState({
        isApproved: false,
        isApproving: false,
        approvalError: null,
        approvalTxHash: null
      });
      setTimeout(() => { 
        setModalActionMessage('');
        // setShowSarumanModal(false); // Optionally close modal on success
      }, 5000);
    }
    if (mintModalError) { // Error from useContractWrite (e.g. user rejected, setup issue)
      setModalActionMessage(`Transaction Error: ${mintModalError.shortMessage || mintModalError.message}`);
      setModalButtonLoading(null);
      setTimeout(() => setModalActionMessage(''), 8000);
    }
    if (mintModalReceiptError) { // Error from useWaitForTransactionReceipt (e.g. transaction reverted)
        setModalActionMessage(`Transaction Receipt Error: ${mintModalReceiptError.shortMessage || mintModalReceiptError.message}`);
        setModalButtonLoading(null);
        setTimeout(() => setModalActionMessage(''), 8000);
    }
  }, [isMintModalTxSuccess, mintModalError, mintModalReceiptError]);
  
  useEffect(() => {
    if (!showSarumanModal) {
        setModalBetAmount('');
        setModalActionMessage('');
        setModalButtonLoading(null);
        setIsAmountLessThanMinimum(false);
    }
  }, [showSarumanModal]);

  // Function to navigate to the trade page
  const navigateToTrade = () => {
    if (sarumanDisplayData?.id) {
      navigate(`/gandalf/${sarumanDisplayData.id}/trade`);
    }
  };

  return (
    <div className="gandalf-container">
      {showWelcomePopup && <WelcomePopup onClose={() => setShowWelcomePopup(false)} />}
      {errorMessage && <div className="gandalf-error-banner">{errorMessage}</div>}
      
      {showSarumanModal && (
        <div className="gandalf-modal-overlay" onClick={() => setShowSarumanModal(false)}> 
          <div className="gandalf-modal-content gandalf-bet-modal" onClick={(e) => e.stopPropagation()}> 
            <button className="gandalf-modal-close" onClick={() => setShowSarumanModal(false)}>×</button>
            <h2 className="gandalf-modal-title">Place Your Bet</h2>
            <p className="gandalf-modal-question">{sarumanDisplayData?.question || DEFAULT_SARUMAN_DATA.question}</p>
            
            <div className="gandalf-modal-bet-section">
                <div className="modal-input-container">
                    <input
                        type="number"
                        value={modalBetAmount}
                        onChange={(e) => setModalBetAmount(e.target.value)}
                        placeholder={`Enter amount (Min ${MINIMUM_BET_AMOUNT} USDC)`}
                        className={`modal-input ${isAmountLessThanMinimum ? 'input-error' : ''}`}
                        min="0" // HTML5 min, actual check is in JS
                        step="any"
                    />
                    <span className="modal-input-label">USDC</span>
                </div>
                {isAmountLessThanMinimum && <p className="gandalf-modal-warning">Minimum bet is {MINIMUM_BET_AMOUNT} USDC.</p>}

                <div className="modal-bet-actions">
                    <button 
                        className={`gandalf-modal-button yes`}
                        onClick={() => handleModalBetPlacement(true)}
                        disabled={modalButtonLoading === 'yes' || modalButtonLoading === 'no' || !modalBetAmount || parseFloat(modalBetAmount) < MINIMUM_BET_AMOUNT}
                    >
                        {modalButtonLoading === 'yes' ? 'Processing...' : 'BET YES'}
                    </button>
                    <button 
                        className={`gandalf-modal-button no`}
                        onClick={() => handleModalBetPlacement(false)}
                        disabled={modalButtonLoading === 'yes' || modalButtonLoading === 'no' || !modalBetAmount || parseFloat(modalBetAmount) < MINIMUM_BET_AMOUNT }
                    >
                        {modalButtonLoading === 'no' ? 'Processing...' : 'BET NO'}
                    </button>
                </div>
            </div>

            {modalActionMessage && !isAmountLessThanMinimum && <p className="gandalf-modal-status">{modalActionMessage}</p>}

          </div>
        </div>
      )}

      <div className="alpha-container">
        <div className="alpha-left">
          {showCreateForm ? (
            <CreateMarketForm onClose={handleHideForm} />
          ) : (
            <button className="create-market-button" onClick={handleShowForm}>
              <div className="plus-icon">+</div>
              <div className="create-text">Create Market</div>
            </button>
          )}
        </div>
        <div className="alpha-right">
          <div className="saruman-wrapper">
            {sarumanContent}
          </div>
        </div>
      </div>
      
      <div className="gamma-container">
        <div className="search-container">
          <input 
            type="text" 
            className="market-search" 
            placeholder="Search (coming soon...)"
          />
        </div>
        
        <div className="market-tiles-container">
          {sampleMarkets.map(market => (
            <MarketTile 
              key={market.id} 
              question={market.question}
              yesPrice={market.yesPrice}
              noPrice={market.noPrice}
              yesMultiplier={market.yesMultiplier}
              noMultiplier={market.noMultiplier}
              onClick={() => handleMarketSelect(market)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gandalf;