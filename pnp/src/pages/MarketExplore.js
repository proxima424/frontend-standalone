/* global BigInt */
import React from 'react';
import { useParams } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import PredictionMarketCard from '../components/PredictionMarketCard';
import { PREDICTION_MARKET_ADDRESS } from '../constants';
import { PREDICTION_MARKET_ABI } from '../contracts/predictionMarket';
import TradingViewWidget from '../components/TradingViewWidget';

const MarketExplore = () => {
  const { conditionId } = useParams();

  const { data: marketReserve } = useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'marketReserve',
    args: [conditionId],
  });

  const { data: marketEndTime, isError: isMarketEndTimeError, isLoading: isMarketEndTimeLoading, error: marketEndTimeError } = useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getMarketEndTime',
    args: [conditionId],
  });

  const { data: marketTargetPrice, isError: isMarketTargetPriceError, isLoading: isMarketTargetPriceLoading, error: marketTargetPriceError } = useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getMarketTargetPrice',
    args: [conditionId],
  });

  const { data: tokenInQuestion } = useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'tokenInQuestion',
    args: [conditionId],
  });

  const { data: marketSettled } = useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'marketSettled',
    args: [conditionId],
  });

  const { data: collateralToken } = useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'collateralToken',
    args: [conditionId],
  });

  console.log('Market Reserve:', marketReserve);
  console.log('Market End Time:', marketEndTime);
  console.log('Market Target Price:', marketTargetPrice);
  console.log('Token In Question:', tokenInQuestion);
  console.log('Market Settled:', marketSettled);

  if (isMarketEndTimeLoading || isMarketTargetPriceLoading) {
    console.log('Loading market details...');
    return <div>Loading market details...</div>;
  }
  if (isMarketEndTimeError || isMarketTargetPriceError) {
    console.error('Error fetching market details:', marketEndTimeError || marketTargetPriceError);
    return <div>Error fetching market details</div>;
  }

  const marketDetails = {
    marketReserve,
    marketEndTime,
    marketTargetPrice,
    tokenInQuestion,
    marketSettled,
    collateralToken: collateralToken,
  };

  if (!marketEndTime || !marketTargetPrice) {
    return <div>Loading market details...</div>;
  }

  const calculateRemainingDays = (endTime) => {
    const currentTime = BigInt(Math.floor(Date.now() / 1000)); // Current time in UNIX as BigInt
    const remainingTime = BigInt(endTime) - currentTime;
    return Math.max(0, Number(remainingTime / BigInt(24 * 60 * 60))); // Convert seconds to days
  };

  const remainingDays = calculateRemainingDays(marketEndTime);

  console.log('Remaining Days:', remainingDays);

  return (
    <div className="market-explore-container">
      <div className="market-explore-content">
        <div className="market-card-section">
          <PredictionMarketCard 
            tokenName="BTC"
            tokenAddress={tokenInQuestion}
            targetPrice={marketTargetPrice}
            timeframe={remainingDays}
            yesMultiplier={5.6}
            noMultiplier={4.2}
            conditionId={conditionId}
            collateralTokenAddress={marketDetails?.collateralToken}
          />
        </div>
        
        <div className="chart-section">
          <div className="chart-container">
            <TradingViewWidget />
          </div>
        </div>
      </div>

      <style jsx>{`
        .market-explore-container {
          padding: 2rem;
          background-color: var(--spotify-black);
          min-height: calc(100vh - 64px);
        }

        .market-explore-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .market-card-section {
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
        }

        .chart-section {
          background: #1e1e1e;
          border-radius: 12px;
          padding: 1rem;
          height: 500px;
        }

        .chart-container {
          height: 100%;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default MarketExplore;
