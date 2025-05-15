import { useReadContracts } from 'wagmi';
import { PNP_FACTORY_ADDRESS, MARKET_DETAILS_ABI } from '../contracts/contractConfig';
import { formatUnits } from 'viem';

const useMarketDetails = (conditionId) => {
  const contractReads = [
    {
      address: PNP_FACTORY_ADDRESS,
      abi: MARKET_DETAILS_ABI,
      functionName: 'marketQuestion',
      args: [conditionId],
    },
    {
      address: PNP_FACTORY_ADDRESS,
      abi: MARKET_DETAILS_ABI,
      functionName: 'getMarketEndTime',
      args: [conditionId],
    },
    {
      address: PNP_FACTORY_ADDRESS,
      abi: MARKET_DETAILS_ABI,
      functionName: 'marketReserve',
      args: [conditionId],
    },
    {
      address: PNP_FACTORY_ADDRESS,
      abi: MARKET_DETAILS_ABI,
      functionName: 'getYesTokenId',
      args: [conditionId],
    },
    {
      address: PNP_FACTORY_ADDRESS,
      abi: MARKET_DETAILS_ABI,
      functionName: 'getNoTokenId',
      args: [conditionId],
    },
    {
      address: PNP_FACTORY_ADDRESS,
      abi: MARKET_DETAILS_ABI,
      functionName: 'isMarketCreated',
      args: [conditionId],
    },
    {
      address: PNP_FACTORY_ADDRESS,
      abi: MARKET_DETAILS_ABI,
      functionName: 'marketSettled',
      args: [conditionId],
    },
    {
      address: PNP_FACTORY_ADDRESS,
      abi: MARKET_DETAILS_ABI,
      functionName: 'collateralToken',
      args: [conditionId],
    },
    {
      address: PNP_FACTORY_ADDRESS,
      abi: MARKET_DETAILS_ABI,
      functionName: 'winningTokenId',
      args: [conditionId],
    },
    {
      address: PNP_FACTORY_ADDRESS,
      abi: MARKET_DETAILS_ABI,
      functionName: 'isTradingStopped',
      args: [conditionId],
    },
  ];

  const { data, isError, isLoading, error, refetch } = useReadContracts({
    contracts: contractReads,
    query: {
      enabled: !!conditionId, // Only run query if conditionId is present
    },
  });

  // Process and structure the data
  const marketData = data ? {
    question: data[0]?.result,
    endTime: data[1]?.result, // This will be a BigInt
    reserve: data[2]?.result, // This will be a BigInt, scaled by 18 decimals
    yesTokenId: data[3]?.result,
    noTokenId: data[4]?.result,
    isCreated: data[5]?.result,
    isSettled: data[6]?.result,
    collateralAddress: data[7]?.result,
    winningToken: data[8]?.result,
    isTradingHalted: data[9]?.result,
    // Formatted reserve for display (assuming 18 decimals for marketReserve)
    formattedMarketReserve: data[2]?.result ? formatUnits(data[2].result, 18) : '0',
  } : null;

  return { marketData, isLoading, isError, error, refetchMarketDetails: refetch };
};

export default useMarketDetails; 