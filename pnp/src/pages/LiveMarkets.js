/* global BigInt */
import React, { useState, useEffect } from 'react';
import { useWatchContractEvent, useReadContract } from 'wagmi';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { base } from 'viem/chains';
import { PREDICTION_MARKET_ADDRESS } from '../constants';
import { PREDICTION_MARKET_ABI } from '../contracts/predictionMarket';
import PredictionMarketCard from '../components/PredictionMarketCard';

const ERC20_ABI = [
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  }
];

const client = createPublicClient({
  chain: base,
  transport: http("https://rpc.ankr.com/base")
});

const LiveMarkets = () => {
  const [markets, setMarkets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMarketDetails = async (conditionId) => {
    try {
      console.log('🔍 Fetching details for market:', conditionId);

      // Fetch token in question
      const tokenInQuestion = await client.readContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'tokenInQuestion',
        args: [conditionId],
      });
      console.log('  Token In Question:', tokenInQuestion);

      // Fetch token name
      const tokenName = await client.readContract({
        address: tokenInQuestion,
        abi: ERC20_ABI,
        functionName: 'name',
      });
      console.log('  Token Name:', tokenName);

      // Fetch market end time
      const endTime = await client.readContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'getMarketEndTime',
        args: [conditionId],
      });
      console.log('  Market End Time:', endTime.toString());

      // Calculate timeframe in days from endTime
      const currentTime = BigInt(Math.floor(Date.now() / 1000));
      const timeframeInSeconds = endTime - currentTime;
      const timeframeInDays = Math.ceil(Number(timeframeInSeconds) / (24 * 60 * 60));
      console.log('  Timeframe in days:', timeframeInDays);

      // Fetch target price
      const targetPrice = await client.readContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'getMarketTargetPrice',
        args: [conditionId],
      });
      console.log('  Target Price:', targetPrice.toString());

      // Fetch market settled status
      const marketSettled = await client.readContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'marketSettled',
        args: [conditionId],
      });
      console.log('  Market Settled:', marketSettled);

      // Fetch market reserve
      const marketReserve = await client.readContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'marketReserve',
        args: [conditionId],
      });
      console.log('  Market Reserve:', marketReserve.toString());

      // Fetch collateral token
      const collateralToken = await client.readContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'collateralToken',
        args: [conditionId],
      });
      console.log('  Collateral Token:', collateralToken);

      // Fetch winning token ID (if market is settled)
      const winningTokenId = await client.readContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'winningTokenId',
        args: [conditionId],
      });
      console.log('  Winning Token ID:', winningTokenId.toString());

      // Fetch module type used
      const moduleType = await client.readContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'moduleTypeUsed',
        args: [conditionId],
      });
      console.log('  Module Type:', moduleType);

      return {
        conditionId,
        tokenInQuestion,
        tokenName,
        marketSettled,
        marketReserve,
        collateralToken,
        winningTokenId,
        moduleType,
        endTime,
        targetPrice,
        timeframe: timeframeInDays,
        // Hardcoded values
        yesMultiplier: BigInt(2000000000000000000), // 2.0 in wei
        noMultiplier: BigInt(2000000000000000000),  // 2.0 in wei
      };
    } catch (error) {
      console.error('❌ Error fetching market details:', error);
      return null;
    }
  };

  // Watch for new market creation events
  useWatchContractEvent({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    eventName: 'PnpMarketCreated',
    onLogs(logs) {
      logs.forEach(async (log) => {
        const { args: { conditionId, marketCreator }, blockNumber } = log;
        console.log('🎉 New market created!');
        console.log('📝 Event details:');
        console.log('  ConditionId:', conditionId);
        console.log('  Market Creator:', marketCreator);
        console.log('  Block Number:', blockNumber);

        const marketDetails = await fetchMarketDetails(conditionId);
        if (marketDetails) {
          setMarkets(prev => [...prev, { ...marketDetails, marketCreator, blockNumber }]);
        }
      });
    },
  });

  // Load past events when component mounts
  useEffect(() => {
    const loadPastEvents = async () => {
      try {
        console.log('🔍 Starting to fetch past markets...');
        setIsLoading(true);
        
        const currentBlock = await client.getBlockNumber();
        console.log('📦 Current block:', currentBlock);

        const fromBlock = currentBlock - 10000n;
        console.log('🏁 Fetching events from block:', fromBlock);

        const eventAbi = parseAbiItem('event PnpMarketCreated(bytes32 indexed conditionId, address indexed marketCreator)');
        
        console.log('🔎 Fetching logs...');
        const logs = await client.getLogs({
          address: PREDICTION_MARKET_ADDRESS,
          event: eventAbi,
          fromBlock,
          toBlock: currentBlock
        });

        console.log(`✨ Found ${logs.length} past markets`);
        
        // Process logs and fetch market details for each
        const marketsData = await Promise.all(logs.map(async (log) => {
          const { args: { conditionId, marketCreator }, blockNumber } = log;
          console.log('📊 Processing market:', conditionId);
          
          const marketDetails = await fetchMarketDetails(conditionId);
          if (marketDetails) {
            return { ...marketDetails, marketCreator, blockNumber };
          }
          return null;
        }));

        // Filter out any failed fetches and sort by block number
        const validMarkets = marketsData.filter(market => market !== null);
        validMarkets.sort((a, b) => Number(b.blockNumber - a.blockNumber));
        
        console.log('🔄 Setting markets in state...');
        setMarkets(validMarkets);
        console.log('✅ Past markets loaded successfully!');

      } catch (error) {
        console.error("❌ Error loading past events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPastEvents();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading markets...</div>
        <style jsx>{`
          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: calc(100vh - 64px);
            background-color: var(--spotify-black);
            color: white;
          }
          .loading-text {
            font-size: 1.5rem;
            color: #3b82f6;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="live-markets-container">
      <div className="markets-header">
        <h1>Live Prediction Markets</h1>
        <p>Explore and trade in active prediction markets</p>
        <div className="markets-count">
          Total Markets: {markets.length}
        </div>
      </div>

      <div className="markets-grid">
        {markets.map((market) => (
          <div key={market.conditionId} className="market-card-wrapper">
            <PredictionMarketCard 
              conditionId={market.conditionId}
              tokenAddress={market.tokenInQuestion}
              collateralTokenAddress={market.collateralToken}
              targetPrice={market.targetPrice}
              timeframe={market.timeframe}
              yesMultiplier={market.yesMultiplier}
              noMultiplier={market.noMultiplier}
              tokenName={market.tokenName}
            />
          </div>
        ))}
      </div>

      <style jsx>{`
        .live-markets-container {
          padding: 2rem;
          min-height: calc(100vh - 64px);
          background-color: var(--spotify-black);
        }

        .markets-header {
          text-align: center;
          margin-bottom: 3rem;
          color: white;
          max-width: 1200px;
          margin: 0 auto 3rem;
        }

        .markets-header h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .markets-header p {
          color: #888;
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }

        .markets-count {
          display: inline-block;
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 500;
        }

        .markets-grid {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          max-width: 800px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .market-card-wrapper {
          width: 100%;
        }

        @media (max-width: 850px) {
          .markets-grid {
            padding: 0 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LiveMarkets;
