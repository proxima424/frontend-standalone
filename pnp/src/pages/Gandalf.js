/* global BigInt */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount, useChainId, usePublicClient, useWatchContractEvent, useContractRead, useContractWrite, useWaitForTransactionReceipt, useConnect, useDisconnect, useBlockNumber } from 'wagmi';
import { decodeEventLog, formatEther, parseEther, keccak256, encodePacked } from 'viem';
import { injected } from 'wagmi/connectors';
import './Gandalf.css';
import Saruman from '../components/Saruman';
import CreateMarketForm from '../components/CreateMarketForm'; // Kept for the create functionality
import MarketTile from '../components/MarketTile'; // Kept for other markets display
import { PNP_FACTORY_ADDRESS, USDPNP_ADDRESS, ETH_SEPOLIA_CHAIN_ID, PNP_ABI } from '../contracts/contractConfig'; // Main factory address
import WelcomePopup from '../components/WelcomePopup';
import { BLOCKED_CREATOR_ADDRESSES, BLOCKED_CONDITION_IDS } from '../config/blockedCreators'; // Import blocked addresses and condition IDs

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
const MAX_MARKETS_TO_FETCH = 40; // Max markets for general display
const MAX_SCAN_ITERATIONS = 500; // Max number of chunks to scan backwards

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
  const { data: currentBlockNumber } = useBlockNumber(); // Get current block number
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

  // Updated fetchMarkets to fetch a list of markets (chunked)
  const fetchMarkets = async () => {
    if (!publicClient || !currentBlockNumber) {
      console.log("Gandalf fetchMarkets: Public client or current block number not available yet.");
      setIsLoadingData(true); // Keep loading until fetch can happen
      return;
    }

    try {
      console.log(`Gandalf fetchMarkets: Fetching latest ${MAX_MARKETS_TO_FETCH} markets, scanning back from ${currentBlockNumber}, max ${MAX_SCAN_ITERATIONS} chunks.`);
      setIsLoadingData(true); // Set loading state for the list fetch
      let allEvents = [];
      const chunkSize = 499n;
      let iterations = 0;

      for (let toBlock = currentBlockNumber; iterations < MAX_SCAN_ITERATIONS; toBlock -= chunkSize) {
        if (toBlock < 0n) { // Stop if we somehow go past genesis
            console.log("Gandalf fetchMarkets: Reached block 0 or below, stopping scan.");
            break;
        }

        if (allEvents.length >= MAX_MARKETS_TO_FETCH) {
          console.log(`Gandalf fetchMarkets: Reached ${MAX_MARKETS_TO_FETCH} markets. Stopping fetch.`);
          break;
        }

        const fromChunkBlock = (toBlock - chunkSize + 1n) > 0n ? (toBlock - chunkSize + 1n) : 0n;
        
        // console.log(`Gandalf fetchMarkets: Fetching chunk: ${fromChunkBlock} to ${toBlock}`); // Optional: Verbose logging

        const chunkEvents = await publicClient.getLogs({
          address: PNP_FACTORY_ADDRESS,
          event: pnpMarketCreatedEventAbiItem, // Use the defined ABI item
          fromBlock: fromChunkBlock,
          toBlock: toBlock
        });

        allEvents = [...chunkEvents, ...allEvents];

        if (allEvents.length > MAX_MARKETS_TO_FETCH) {
          allEvents = allEvents.slice(0, MAX_MARKETS_TO_FETCH);
        }

        if (fromChunkBlock === 0n) { // Reached the earliest possible block for this chunk
            console.log("Gandalf fetchMarkets: Current chunk reached block 0.");
            iterations++; // Count this iteration
            break; // Stop if the current chunk started from block 0
        }
        iterations++;
      }

      if (iterations >= MAX_SCAN_ITERATIONS && allEvents.length < MAX_MARKETS_TO_FETCH) {
        console.log(`Gandalf fetchMarkets: Scanned max ${MAX_SCAN_ITERATIONS} chunks (approx ${MAX_SCAN_ITERATIONS * Number(chunkSize)} blocks) without finding ${MAX_MARKETS_TO_FETCH} markets. Found ${allEvents.length}.`);
      }

      // Deduplicate and sort (newest first)
      const uniqueEvents = allEvents
        .sort((a, b) => {
          if (b.blockNumber !== a.blockNumber) return Number(b.blockNumber - a.blockNumber);
          if (b.transactionIndex !== a.transactionIndex) return Number(b.transactionIndex - a.transactionIndex);
          return Number(b.logIndex - a.logIndex);
        })
        .filter((event, index, self) =>
          index === self.findIndex((e) => (
            e.blockNumber === event.blockNumber && e.transactionIndex === event.transactionIndex && e.logIndex === event.logIndex
          ))
        )
        .slice(0, MAX_MARKETS_TO_FETCH);

      console.log("Gandalf fetchMarkets: Found market events (chunked):", uniqueEvents.length);

      if (uniqueEvents.length === 0) {
        console.log("Gandalf fetchMarkets: No market events found in the specified range.");
        setSampleMarkets([]); // Clear existing markets
        // setIsLoadingData(false); // Keep true until Saruman data is loaded or default set
        return; // Exit early, let useEffect handle Saruman loading
      }

      // Fetch details for each market found (for the list display)
      const marketDetailsList = await Promise.all(
        uniqueEvents.map(async (event) => {
          try {
            const condId = event.args.conditionId;
            if (BLOCKED_CONDITION_IDS.includes(condId) || BLOCKED_CREATOR_ADDRESSES.includes(event.args.marketCreator)) {
               console.log(`Gandalf fetchMarkets: Skipping blocked market/creator: ${condId}`);
               return null; // Skip blocked items
             }

            const [question, endTime, reserve] = await Promise.all([
              publicClient.readContract({ address: PNP_FACTORY_ADDRESS, abi: FACTORY_READ_ABI, functionName: 'marketQuestion', args: [condId], chainId: ETH_SEPOLIA_CHAIN_ID }),
              publicClient.readContract({ address: PNP_FACTORY_ADDRESS, abi: FACTORY_READ_ABI, functionName: 'marketEndTime', args: [condId], chainId: ETH_SEPOLIA_CHAIN_ID }),
              publicClient.readContract({ address: PNP_FACTORY_ADDRESS, abi: FACTORY_READ_ABI, functionName: 'marketReserve', args: [condId], chainId: ETH_SEPOLIA_CHAIN_ID })
            ]);
           
            const prices = await calculatePrices(reserve, condId); // Use existing price calculation

            return {
              id: condId,
              question,
              yesPrice: prices.yesPrice,
              noPrice: prices.noPrice,
              yesMultiplier: prices.yesMultiplier,
              noMultiplier: prices.noMultiplier,
              marketReserve: formatEther(reserve),
              marketEndTime: Number(endTime),
              creator: event.args.marketCreator // Include creator if needed for MarketTile display
            };
          } catch (detailError) {
            console.error(`Gandalf fetchMarkets: Error fetching details for market ${event.args.conditionId}:`, detailError);
            return null; // Skip markets that fail to fetch details
          }
        })
      );

      const validMarketDetails = marketDetailsList.filter(detail => detail !== null);
      console.log("Gandalf fetchMarkets: Fetched market details list:", validMarketDetails.length);
      setSampleMarkets(validMarketDetails);

    } catch (error) {
      console.error("Gandalf fetchMarkets: Error fetching markets list:", error);
      setErrorMessage("Error loading market list.");
      setSampleMarkets([]); // Clear markets on error
    } finally {
      // Don't set isLoadingData to false here yet, wait for Saruman data below
      // setIsLoadingData(false); 
    }
  };

  // Fetch latest market for a specific creator (for Saruman display)
  // Scans backwards in chunks to find the most recent market efficiently.
  const fetchLatestMarketByCreator = async (creator) => {
    if (!publicClient || !creator || !currentBlockNumber) {
      setErrorMessage("Client, Creator Address, or Block Number not available.");
      setIsLoadingData(false);
      return;
    }
    console.log(`Gandalf: Fetching latest market for creator: ${creator}, scanning back from ${currentBlockNumber}`);
    setIsLoadingData(true); // Ensure loading state is active

    try {
      let latestLog = null;
      const chunkSize = 499n; // Match fetchMarkets chunk size, < 100k limit
      let iterations = 0;
      const maxScanIterationsForCreator = MAX_SCAN_ITERATIONS; // Use the same limit as fetchMarkets

      for (let toBlock = currentBlockNumber; iterations < maxScanIterationsForCreator; toBlock -= chunkSize) {
        if (toBlock < 0n) {
          console.log("Gandalf (creator fetch): Reached block 0 or below, stopping scan.");
          break;
        }

        const fromChunkBlock = (toBlock - chunkSize + 1n) > 0n ? (toBlock - chunkSize + 1n) : 0n;
        
        // console.log(`Gandalf (creator fetch): Fetching chunk for creator: ${fromChunkBlock} to ${toBlock}`);

        const chunkLogs = await publicClient.getLogs({
          address: PNP_FACTORY_ADDRESS,
          event: pnpMarketCreatedEventAbiItem,
          args: { marketCreator: creator },
          fromBlock: fromChunkBlock,
          toBlock: toBlock
        });

        if (chunkLogs && chunkLogs.length > 0) {
          // Sort logs within the chunk to get the latest one first
          const sortedChunkLogs = chunkLogs.sort((a, b) => {
            if (b.blockNumber !== a.blockNumber) return Number(b.blockNumber - a.blockNumber);
            if (b.transactionIndex !== a.transactionIndex) return Number(b.transactionIndex - a.transactionIndex);
            return Number(b.logIndex - a.logIndex);
          });
          
          latestLog = sortedChunkLogs[0]; // Found the latest log in this chunk
          console.log(`Gandalf (creator fetch): Found latest market in chunk [${fromChunkBlock}-${toBlock}] at block ${latestLog.blockNumber}`);
          break; // Stop scanning, we found the most recent one
        }

        if (fromChunkBlock === 0n) {
            console.log("Gandalf (creator fetch): Current chunk reached block 0.");
            iterations++;
            break; 
        }
        iterations++;
      }

      if (latestLog) {
        const latestCondId = latestLog.args?.conditionId;
        if (latestCondId) {
          console.log("Gandalf (creator fetch): Found latest market conditionId:", latestCondId);
          await fetchMarketByConditionId(latestCondId); // Fetch details for the found market
        } else {
          // This case should be unlikely if the event was decoded correctly
          setErrorMessage(`No valid conditionId found in latest market event for ${creator}.`);
          setSarumanDisplayData(DEFAULT_SARUMAN_DATA);
        }
      } else {
        console.log(`Gandalf (creator fetch): No markets found for creator ${creator} within the scanned range (approx ${maxScanIterationsForCreator * Number(chunkSize)} blocks).`);
        setErrorMessage(`No markets found for creator: ${creator}. Displaying default market.`);
        setSarumanDisplayData(DEFAULT_SARUMAN_DATA);
      }
    } catch (err) {
      console.error("Gandalf: Error fetching latest market by creator:", err);
      // Handle specific RPC errors if needed, e.g., rate limiting
      if (err.message && err.message.includes("block range")) {
          setErrorMessage(`Error fetching markets for ${creator}: RPC block range limit exceeded. Try refreshing.`)
      } else {
          setErrorMessage(`Error fetching markets for ${creator}: ${(err.shortMessage || err.message)}`);
      }
      setSarumanDisplayData(DEFAULT_SARUMAN_DATA);
    } finally {
        // Loading state is handled within fetchMarketByConditionId or set directly on error/not found
        // setIsLoadingData(false); // Removed this to let subsequent calls manage it
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
      // Check if we have markets from events
      if (sampleMarkets && sampleMarkets.length > 0) {
        console.log("Gandalf: Displaying most recent market from fetched events.");
        // Use the first market from sampleMarkets (which is now sorted by most recent first)
        const mostRecentMarket = sampleMarkets[0];
        fetchMarketByConditionId(mostRecentMarket.id);
      } else {
        console.log("Gandalf: No markets found, displaying default market.");
        setSarumanDisplayData(DEFAULT_SARUMAN_DATA);
        setIsLoadingData(false);
      }
    }
  }, [conditionIdFromParams, creatorAddress, publicClient, sampleMarkets, currentBlockNumber]); // Add currentBlockNumber dependency

  useEffect(() => {
    if(sarumanDisplayData || errorMessage) setIsLoadingData(false);
  }, [sarumanDisplayData, errorMessage]);

  // Add this useEffect to fetch the list of markets for the tiles
  useEffect(() => {
    if (publicClient && currentBlockNumber) {
      console.log("Gandalf: Triggering fetchMarkets due to client/block update.");
      fetchMarkets();
    }
  }, [publicClient, currentBlockNumber]); // Re-run if client or block number changes

  const handleShowForm = () => setShowCreateForm(true);
  const handleHideForm = () => setShowCreateForm(false);

  const handleMarketSelect = (market) => {
    console.log("Market tile clicked:", market);
    navigate(`/gandalf/${market.id}/trade`);
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
              onClick={() => navigate(`/gandalf/${market.id}/trade`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gandalf;