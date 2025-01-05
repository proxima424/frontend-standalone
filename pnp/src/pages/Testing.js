import React, { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { predictionMarketABI } from '../contracts/predictionMarketABI';
import { priceCheckerABI } from '../contracts/priceCheckerABI';
import './Testing.css';

const contractAddress = "0xeD687976873D5194b5aE6315F2c54b32AfE2456d";
const PRICE_CHECKER_ADDRESS = "0x0000000000cDC1F8d393415455E382c30FBc0a84";
const TEST_TOKEN_ADDRESS = "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b";

function Testing() {
  const [texts, setTexts] = useState([]);
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();

  const handleClick = async () => {
    if (authenticated && wallets.length > 0) {
      try {
        const wallet = wallets[0];
        const provider = await wallet.getEthersProvider();
        const signer = await wallet.getEthersSigner();
        
        // Call prediction market contract
        const predictionContract = new ethers.Contract(contractAddress, predictionMarketABI, provider);
        const moduleAddr = await predictionContract.moduleAddress(0);
        setTexts([...texts, `nan - Module 0 Address: ${moduleAddr}`]);

        // Call price checker contract
        console.log('Calling price checker for token:', TEST_TOKEN_ADDRESS);
        const priceChecker = new ethers.Contract(PRICE_CHECKER_ADDRESS, priceCheckerABI, signer);
        console.log('Price checker contract initialized');
        
        try {
          const [price, description] = await priceChecker.checkPrice(TEST_TOKEN_ADDRESS);
          console.log('Raw price from contract:', price.toString());
          console.log('Description:', description);
          console.log('Formatted price in ETH:', ethers.formatUnits(price, 18));
        } catch (priceError) {
          console.error('Price checker error:', {
            message: priceError.message,
            code: priceError.code,
            data: priceError.data
          });
        }
        
      } catch (error) {
        console.error('Error:', error);
        setTexts([...texts, `Error: ${error.message}`]);
      }
    } else {
      setTexts([...texts, "nan - No wallet connected"]);
    }
  };

  return (
    <div className="testing-container">
      <button 
        onClick={handleClick}
        className="bro-button"
      >
        bro
      </button>
      <div className="nan-container">
        {texts.map((text, index) => (
          <div key={index} className="nan-text">{text}</div>
        ))}
      </div>
    </div>
  );
}

export default Testing;
