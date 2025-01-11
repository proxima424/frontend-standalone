import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { CONTRACT_ABIS } from '../contracts/config';
import TwitterMarketCard from '../components/TwitterMarketCard';
import CreateTwitterMarket from '../components/CreateTwitterMarket';
import './TwitterMarket.css';

const PNP_FACTORY_ADDRESS = '0xD70E46d039bcD87e5bFce37C38727D7020C1998D';

const TwitterMarket = () => {
  const { conditionId } = useParams();
  const [marketQuestion, setMarketQuestion] = useState('Loading...');
  const [twitterUsername, setTwitterUsername] = useState('Loading...');
  const [marketReserve, setMarketReserve] = useState('Loading...');
  const [endTime, setEndTime] = useState(null);

  const { data: questionData } = useReadContract({
    address: PNP_FACTORY_ADDRESS,
    abi: CONTRACT_ABIS.PNP_FACTORY.abi,
    functionName: 'twitterQuestion',
    args: [conditionId],
    chainId: 8453,
  });

  const { data: settlerData } = useReadContract({
    address: PNP_FACTORY_ADDRESS,
    abi: CONTRACT_ABIS.PNP_FACTORY.abi,
    functionName: 'twitterSettlerId',
    args: [conditionId],
    chainId: 8453,
  });

  const { data: reserveData } = useReadContract({
    address: PNP_FACTORY_ADDRESS,
    abi: CONTRACT_ABIS.PNP_FACTORY.abi,
    functionName: 'marketReserve',
    args: [conditionId],
    chainId: 8453,
  });

  const { data: endTimeData } = useReadContract({
    address: PNP_FACTORY_ADDRESS,
    abi: CONTRACT_ABIS.PNP_FACTORY.abi,
    functionName: 'twitterEndTime',
    args: [conditionId],
    chainId: 8453,
  });

  useEffect(() => {
    if (questionData) {
      setMarketQuestion(questionData);
      console.log('Market Question:', questionData);
    }
  }, [questionData]);

  useEffect(() => {
    if (settlerData) {
      setTwitterUsername(settlerData);
      console.log('Twitter Username:', settlerData);
    }
  }, [settlerData]);

  useEffect(() => {
    if (reserveData) {
      const scaledReserve = Number(reserveData) / (10 ** 18);
      setMarketReserve(scaledReserve.toFixed(2));
      console.log('Market Reserve:', scaledReserve);
    }
  }, [reserveData]);

  useEffect(() => {
    if (endTimeData) {
      setEndTime(Number(endTimeData));
      console.log('End Time:', new Date(Number(endTimeData) * 1000).toLocaleString());
    }
  }, [endTimeData]);

  const marketData = {
    marketQuestion,
    yesMultiplier: "5.6",
    noMultiplier: "4.2",
    marketReserve,
    twitterUsername,
    endTime,
  };

  const handleMint = (amount) => {
    console.log('Minting position with amount:', amount);
  };

  const handleProvideLiquidity = () => {
    console.log('Providing liquidity');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <TwitterMarketCard
        marketQuestion={marketQuestion}
        twitterUsername={twitterUsername}
        marketReserve={marketReserve}
        endTime={endTime}
        onMint={handleMint}
        onProvideLiquidity={handleProvideLiquidity}
      />
      <CreateTwitterMarket />
    </div>
  );
};

export default TwitterMarket;
