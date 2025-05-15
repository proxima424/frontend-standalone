/* global BigInt */
import React, { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { useReadContract, useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../contracts/config';
import './Testing.css';

const PRICE_CHECKER_ADDRESS = "0x0000000000cDC1F8d393415455E382c30FBc0a84";
const TEST_TOKEN_ADDRESS = "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b";
const PREDICTION_MARKET_ADDRESS = "0xD70E46d039bcD87e5bFce37C38727D7020C1998D";
const PREDICTION_MARKET_ABI = CONTRACT_ABIS.PNP_FACTORY.abi;

function Testing() {
  const { wallets } = useWallets();
  const [texts, setTexts] = useState([]);
  const [question, setQuestion] = useState('');
  const [username, setUsername] = useState('');
  const [endTime, setEndTime] = useState('');
  const [initialLiquidity, setInitialLiquidity] = useState('');

  const { data, error, isPending, refetch } = useReadContract({
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
    args: [TEST_TOKEN_ADDRESS],
    chainId: 8453, // Base mainnet
  });

  const { writeContract } = useWriteContract();

  const handleCreateMarket = async () => {
    try {
      const endTimeUnix = Math.floor(Date.now() / 1000) + parseInt(endTime) * 60;
      const initialLiquidityParsed = BigInt(Math.floor(parseFloat(initialLiquidity) * 1_000_000));

      await writeContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'createTwitterMarket',
        args: [
          question,
          username,
          endTimeUnix,
          '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          initialLiquidityParsed
        ],
      });
    } catch (error) {
      console.error('Error creating Twitter market:', error);
    }
  };

  return (
    <div className="testing-container">
      <label>
        Enter Market Question:
        <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} />
      </label>
      <label>
        Enter Twitter Username:
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <label>
        Enter Market Duration (in minutes):
        <input type="number" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
      </label>
      <label>
        Initial Liquidity:
        <input type="number" value={initialLiquidity} onChange={(e) => setInitialLiquidity(e.target.value)} />
      </label>
      <button onClick={handleCreateMarket} className="create-market-button">
        Create Twitter Market
      </button>
      <div className="text-container">
        {texts.map((text, index) => (
          <p key={index}>{text}</p>
        ))}
      </div>
    </div>
  );
}

export default Testing;
