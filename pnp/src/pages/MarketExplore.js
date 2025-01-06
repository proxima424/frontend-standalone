import React from 'react';
import { useParams } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import PredictionMarketCard from '../components/PredictionMarketCard'; // We'll create this component

const PREDICTION_MARKET_ADDRESS = "0xeD687976873D5194b5aE6315F2c54b32AfE2456d";

const PREDICTION_MARKET_ABI = [
  {
    inputs: [{ name: "conditionId", type: "bytes32" }],
    name: "marketReserve",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "conditionId", type: "bytes32" }],
    name: "marketParams",
    outputs: [{ name: "params", type: "uint256[2]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "conditionId", type: "bytes32" }],
    name: "tokenInQuestion",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "conditionId", type: "bytes32" }],
    name: "marketSettled",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  }
];

const MarketExplore = () => {
  const { conditionId } = useParams();

  const { data: marketReserve } = useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'marketReserve',
    args: [conditionId],
  });

  const { data: marketParams } = useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'marketParams',
    args: [conditionId],
  });

  console.log('Market Params:', marketParams);

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
    functionName: 'getMarketDetails',
    args: [conditionId],
  });

  const marketDetails = {
    marketReserve,
    marketParams: marketParams || [],
    tokenInQuestion,
    marketSettled,
    collateralToken: collateralToken?.collateralToken,
  };

  console.log('Market Reserve:', marketReserve);
  console.log('Token In Question:', tokenInQuestion);
  console.log('Market Settled:', marketSettled);

  if (!marketParams || !marketParams.length) {
    return <div>Loading market details...</div>;
  }

  return (
    <div className="market-explore-container">
      <PredictionMarketCard 
        tokenName="BTC"  // You'll want to dynamically fetch this
        tokenAddress={tokenInQuestion}
        targetPrice={marketParams[1]}  // From marketParams
        timeframe={30}  // From marketParams
        yesMultiplier={5.6}  // Calculate dynamically
        noMultiplier={4.2}  // Calculate dynamically
        conditionId={conditionId}
        collateralTokenAddress={marketDetails.collateralToken}
      />
    </div>
  );
};

export default MarketExplore;
