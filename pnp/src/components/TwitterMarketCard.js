/* global BigInt */
import React, { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { erc20Abi } from 'viem';
import './TwitterMarketCard.css';
import { CONTRACT_ABIS } from '../contracts/config';

const PNP_FACTORY_ADDRESS = '0xD70E46d039bcD87e5bFce37C38727D7020C1998D';

const TwitterMarketCard = ({ 
  marketQuestion,
  marketReserve: initialMarketReserve,
  twitterUsername,
  endTime,
  conditionId,
  onMint,
  onProvideLiquidity
}) => {
  const { address: userAddress } = useAccount();
  const [selectedOption, setSelectedOption] = useState(null);
  const [collateralAmount, setCollateralAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [hasAllowance, setHasAllowance] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successAmount, setSuccessAmount] = useState('');
  const [successOption, setSuccessOption] = useState('');
  const [approvalPending, setApprovalPending] = useState(false);
  const [marketReserve, setMarketReserve] = useState(initialMarketReserve);

  const { waitForTransactionReceipt } = useWaitForTransactionReceipt();

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

  useEffect(() => {
    setMarketReserve(initialMarketReserve);
    console.log('Market reserve prop received:', initialMarketReserve);
  }, [initialMarketReserve]);

  // Check allowance whenever collateral amount changes
  const { data: currentAllowance, refetch: refetchAllowance } = useReadContract({
    address: collateralTokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [userAddress, PNP_FACTORY_ADDRESS],
    chainId: 8453,
    enabled: !!collateralTokenAddress && !!userAddress && !!collateralAmount,
    watch: true,
  });

  const { writeContract: writeApprove } = useWriteContract();
  const { writeContract: writeMint } = useWriteContract();

  // Update hasAllowance whenever allowance or amount changes
  useEffect(() => {
    if (currentAllowance && collateralAmount) {
      const requiredAmount = BigInt(Math.floor(parseFloat(collateralAmount) * 10**6));
      const sufficientAllowance = BigInt(currentAllowance) >= requiredAmount;
      setHasAllowance(sufficientAllowance);
      
      // If we were waiting for approval and now have sufficient allowance, clear the pending state
      if (approvalPending && sufficientAllowance) {
        setApprovalPending(false);
        setIsApproving(false);
      }

      console.log('Allowance check:', {
        currentAllowance: currentAllowance.toString(),
        requiredAmount: requiredAmount.toString(),
        hasEnough: sufficientAllowance,
        approvalPending
      });
    }
  }, [currentAllowance, collateralAmount, approvalPending]);

  const handleApprove = async () => {
    if (!collateralTokenAddress || !collateralAmount) return;

    try {
      setIsApproving(true);
      const scaledAmount = BigInt(Math.floor(parseFloat(collateralAmount) * 10**6));
      
      console.log('Approving tokens:', {
        token: collateralTokenAddress,
        spender: PNP_FACTORY_ADDRESS,
        amount: scaledAmount.toString()
      });

      await writeApprove({
        address: collateralTokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [PNP_FACTORY_ADDRESS, scaledAmount],
        chainId: 8453,
      });

      // Set pending state after transaction is submitted
      setApprovalPending(true);
      
      // Start polling allowance
      const pollAllowance = setInterval(async () => {
        await refetchAllowance();
      }, 2000); // Poll every 2 seconds

      // Cleanup polling after 2 minutes (in case something goes wrong)
      setTimeout(() => {
        clearInterval(pollAllowance);
        if (approvalPending) {
          setApprovalPending(false);
          setIsApproving(false);
          console.error('Approval timed out after 2 minutes');
        }
      }, 120000);

    } catch (error) {
      console.error('Error approving tokens:', error);
      setIsApproving(false);
      setApprovalPending(false);
    }
  };

  const handleMint = async () => {
    if (!collateralTokenAddress || !collateralAmount || !selectedOption || !hasAllowance) return;

    try {
      setIsMinting(true);
      const scaledAmount = BigInt(Math.floor(parseFloat(collateralAmount) * 10**6));
      const tokenId = selectedOption === 'YES' ? yesTokenId : noTokenId;

      console.log('Minting tokens:', {
        conditionId,
        amount: scaledAmount.toString(),
        tokenId: tokenId.toString()
      });

      const { hash } = await writeMint({
        address: PNP_FACTORY_ADDRESS,
        abi: CONTRACT_ABIS.PNP_FACTORY.abi,
        functionName: 'mintDecisionTokens',
        args: [conditionId, scaledAmount, tokenId],
        chainId: 8453,
      });

      // Wait for transaction confirmation
      console.log('Waiting for mint transaction confirmation...');
      const receipt = await waitForTransactionReceipt({ hash });
      console.log('Mint transaction confirmed:', receipt);

      // Only show success notification after confirmation
      setSuccessAmount(collateralAmount);
      setSuccessOption(selectedOption);
      setShowSuccess(true);

      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);

      setIsMinting(false);
      setCollateralAmount('');
      setSelectedOption(null);
      
    } catch (error) {
      console.error('Error minting tokens:', error);
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
      {showSuccess && (
        <div className="success-notification">
          <div className="success-content">
            <div className="success-icon">✓</div>
            <div className="success-message">
              Bought ${successAmount} worth of '{successOption}' tokens
            </div>
            <button 
              className="close-button"
              onClick={() => setShowSuccess(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
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
          {!hasAllowance ? (
            <button
              className="approve-button"
              onClick={handleApprove}
              disabled={!selectedOption || !collateralAmount || isApproving}
            >
              {isApproving ? (
                <>
                  <span className="loading-dots">Approving</span>
                  {approvalPending && <span className="approval-note">Waiting for allowance update...</span>}
                </>
              ) : (
                'Approve Contract'
              )}
            </button>
          ) : (
            <button
              className="mint-button"
              onClick={handleMint}
              disabled={!selectedOption || !collateralAmount || isMinting}
            >
              {isMinting ? 'Minting...' : 'Mint Position'}
            </button>
          )}
        </div>
      </div>

      <div className='footer-info'>
        <div className="footer-section">
          <div className="footer-item">
            <div className="footer-label">MARKET RESERVE</div>
            <div className="footer-value market-reserve-value">
              {marketReserve !== 'Loading...' ? 
                `$${marketReserve}` : 
                'Loading...'
              }
            </div>
          </div>
          <div className="footer-divider" />
          <div className="footer-item">
            <div className="footer-label">TWEETS TRACKED AS TRUTH SOURCE</div>
            <a href={twitterLink} target="_blank" rel="noopener noreferrer" className="twitter-username">
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
