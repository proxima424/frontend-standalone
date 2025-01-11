/* global BigInt */
import React, { useState, useEffect } from 'react';
import { useReadContract, useWriteContract } from 'wagmi';
import { erc20Abi } from 'viem';
import './TwitterMarketCard.css';
import { CONTRACT_ABIS } from '../contracts/config';

const PNP_FACTORY_ADDRESS = '0xD70E46d039bcD87e5bFce37C38727D7020C1998D';

const TwitterMarketCard = ({ 
  marketQuestion,
  marketReserve,
  twitterUsername,
  endTime,
  conditionId,
  onMint,
  onProvideLiquidity
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [collateralAmount, setCollateralAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  const { data: collateralTokenAddress } = useReadContract({
    address: PNP_FACTORY_ADDRESS,
    abi: CONTRACT_ABIS.PNP_FACTORY.abi,
    functionName: 'collateralToken',
    args: [conditionId],
    chainId: 8453,
  });

  const { data: yesTokenId } = useReadContract({
    address: PNP_FACTORY_ADDRESS,
    abi: CONTRACT_ABIS.PNP_FACTORY.abi,
    functionName: 'getYesTokenId',
    args: [conditionId],
    chainId: 8453,
    enabled: !!conditionId,
  });

  const { data: noTokenId } = useReadContract({
    address: PNP_FACTORY_ADDRESS,
    abi: CONTRACT_ABIS.PNP_FACTORY.abi,
    functionName: 'getNoTokenId',
    args: [conditionId],
    chainId: 8453,
    enabled: !!conditionId,
  });

  const { writeContract: writeApprove } = useWriteContract();
  const { writeContract: writeMint } = useWriteContract();

  const handleMint = async () => {
    if (!collateralTokenAddress || !collateralAmount || !selectedOption) return;

    try {
      setIsApproving(true);
      // Scale the collateral amount by 10^6
      const scaledAmount = BigInt(Math.floor(parseFloat(collateralAmount) * 10**6));
      
      // First approve the factory contract to spend tokens
      await writeApprove({
        address: collateralTokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [PNP_FACTORY_ADDRESS, scaledAmount],
        chainId: 8453,
      });

      setIsApproving(false);
      setIsMinting(true);

      // Get the appropriate token ID based on selection
      const tokenId = selectedOption === 'YES' ? yesTokenId : noTokenId;

      // Then mint the decision tokens
      await writeMint({
        address: PNP_FACTORY_ADDRESS,
        abi: CONTRACT_ABIS.PNP_FACTORY.abi,
        functionName: 'mintDecisionTokens',
        args: [conditionId, scaledAmount, tokenId],
        chainId: 8453,
      });

      setIsMinting(false);
      setCollateralAmount('');
      setSelectedOption(null);
      
    } catch (error) {
      console.error('Error during minting:', error);
      setIsApproving(false);
      setIsMinting(false);
    }
  };

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    if (!endTime) return;

    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const difference = endTime - now;

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        };
      }

      return {
        days: Math.floor(difference / (60 * 60 * 24)),
        hours: Math.floor((difference % (60 * 60 * 24)) / (60 * 60)),
        minutes: Math.floor((difference % (60 * 60)) / 60),
        seconds: Math.floor(difference % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const twitterLink = twitterUsername ? `https://x.com/${twitterUsername.replace('@', '')}` : '#';

  return (
    <div className="twitter-market-card">
      <div className="white-rectangle">
        <div className="question-section">
          <h2 className="white-rectangle-title">{marketQuestion}</h2>
          <span className="info-icon" title="Market Information">ⓘ</span>
        </div>

        <div className="countdown-container">
          <div className="countdown-title">MARKET ENDS IN</div>
          <div className="countdown-section">
            <div className="countdown-number">{timeLeft.days}</div>
            <div className="countdown-label">d</div>
            <div className="countdown-separator">:</div>
            <div className="countdown-number">{timeLeft.hours}</div>
            <div className="countdown-label">h</div>
            <div className="countdown-separator">:</div>
            <div className="countdown-number">{timeLeft.minutes}</div>
            <div className="countdown-label">m</div>
            <div className="countdown-separator">:</div>
            <div className="countdown-number">{timeLeft.seconds}</div>
            <div className="countdown-label">s</div>
          </div>
        </div>

        <div className="options-section">
          <button
            className={`prediction-button yes-button ${selectedOption === 'YES' ? 'selected' : ''}`}
            onClick={() => setSelectedOption('YES')}
          >
            YES
          </button>
          <button
            className={`prediction-button no-button ${selectedOption === 'NO' ? 'selected' : ''}`}
            onClick={() => setSelectedOption('NO')}
          >
            NO
          </button>
        </div>

        <div className="mint-controls">
          <input
            type="number"
            value={collateralAmount}
            onChange={(e) => setCollateralAmount(e.target.value)}
            placeholder="Enter collateral amount"
            className="collateral-input"
            disabled={isApproving || isMinting}
          />
          <button
            className="mint-button"
            onClick={handleMint}
            disabled={!selectedOption || !collateralAmount || isApproving || isMinting}
          >
            {isApproving ? 'Approving...' : isMinting ? 'Minting...' : 'Mint Position'}
          </button>
        </div>
      </div>

      <div className='footer-info'>
        <div className="footer-section">
          <div className="footer-item">
            <div className="footer-label">MARKET RESERVE</div>
            <div className="footer-value market-reserve-value">${marketReserve}</div>
          </div>
          <div className="footer-divider" />
          <div className="footer-item">
            <div className="footer-label">TWEETS TRACKED AS TRUTH SOURCE</div>
            <a href={`https://twitter.com/${twitterUsername}`} target="_blank" rel="noopener noreferrer" className="twitter-username">
              @{twitterUsername}
              <span className="external-link-icon">↗</span>
            </a>
          </div>
          <div className="footer-divider" />
          <div className="footer-item">
            <div className="footer-label">WANT TO EARN 1% FEES?</div>
            <button className="provide-liquidity-btn">
              Provide Liquidity +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwitterMarketCard;
