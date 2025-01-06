import React, { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { useReadContract } from 'wagmi';
import './Testing.css';

const PRICE_CHECKER_ADDRESS = "0x0000000000cDC1F8d393415455E382c30FBc0a84";
const TEST_TOKEN_ADDRESS = "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b";

function Testing() {
  const { wallets } = useWallets();
  const [texts, setTexts] = useState([]);

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

  const handleClick = async () => {
    try {
      await refetch();
      if (data) {
        const [price, priceStr] = data;
        console.log('Price:', price.toString());
        console.log('Price String:', priceStr);
        setTexts([...texts, `Price: ${price.toString()} | ${priceStr}`]);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="testing-container">
      <button onClick={handleClick} className="testing-button">
        BRO
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
