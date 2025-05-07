/* global BigInt */

import React, { useState, useEffect, useRef } from 'react';
import './CreateMarketForm.css';
import { useNavigate } from 'react-router-dom';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi';
import { PNP_FACTORY_ADDRESS, PNP_ABI, USDPNP_ADDRESS, ETH_SEPOLIA_CHAIN_ID } from '../contracts/contractConfig';
import { parseUnits, formatUnits } from 'viem';

const USDPNP_ABI = [
  {
    "inputs": [],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const CreateMarketForm = ({ onClose }) => {
  const [question, setQuestion] = useState('');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [deadlineValue, setDeadlineValue] = useState('');
  const [deadlineUnit, setDeadlineUnit] = useState('days');
  const [isApprovedForCurrentAmount, setIsApprovedForCurrentAmount] = useState(false);
  const [isPollingAllowance, setIsPollingAllowance] = useState(false);
  const [showApproveSuccessMessage, setShowApproveSuccessMessage] = useState(false);
  const [userBalance, setUserBalance] = useState('0');
  const [marketCreationSuccessDetails, setMarketCreationSuccessDetails] = useState(null);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  const { address: userAddress, chainId: connectedChainId } = useAccount();
  const navigate = useNavigate();
  const countdownIntervalRef = useRef(null);

  const MINIMUM_COLLATERAL = 2;
  const MINIMUM_DEADLINE_DAYS = 2;

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const { data: balanceData } = useReadContract({
    address: USDPNP_ADDRESS,
    abi: USDPNP_ABI,
    functionName: 'balanceOf',
    args: [userAddress],
    query: { enabled: !!userAddress, refetchInterval: 5000 }
  });

  useEffect(() => {
    if (balanceData !== undefined) setUserBalance(formatUnits(balanceData, 6));
  }, [balanceData]);

  const isCollateralAmountValid = collateralAmount && !isNaN(parseFloat(collateralAmount)) && parseFloat(collateralAmount) >= MINIMUM_COLLATERAL;

  const { data: currentAllowance, refetch: refetchAllowance } = useReadContract({
    address: USDPNP_ADDRESS,
    abi: [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "allowance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'allowance',
    args: [userAddress, PNP_FACTORY_ADDRESS],
    query: {
      enabled: !!userAddress && !!collateralAmount && parseFloat(collateralAmount) > 0,
      refetchInterval: isPollingAllowance ? 2000 : false
    }
  });

  useEffect(() => {
    if (isCollateralAmountValid && currentAllowance !== undefined) {
      const requiredAmountUnits = parseUnits(collateralAmount, 6);
      const approved = requiredAmountUnits <= currentAllowance;
      setIsApprovedForCurrentAmount(approved);
      if (approved) {
        setIsPollingAllowance(false);
      }
    } else {
      setIsApprovedForCurrentAmount(false);
    }
  }, [collateralAmount, currentAllowance, isCollateralAmountValid]);

  const { data: marketTxHash, error: marketWriteError, isPending: isCreatingMarket, writeContractAsync: createMarketAsync } = useWriteContract();
  const { data: approveTxHash, error: approveWriteError, isPending: isApproving, writeContractAsync: approveAsync } = useWriteContract();
  
  const { isLoading: isMarketTxProcessing, isSuccess: isMarketTxSuccess, error: marketTxReceiptError, data: marketReceipt } = useWaitForTransactionReceipt({ hash: marketTxHash });
  const { isLoading: isApproveTxProcessing, isSuccess: isApproveTxSuccess, error: approveTxReceiptError } = useWaitForTransactionReceipt({ hash: approveTxHash });

  useEffect(() => {
    if (approveTxHash) setIsPollingAllowance(true);
  }, [approveTxHash]);

  useEffect(() => {
    if (approveWriteError || approveTxReceiptError) setIsPollingAllowance(false);
  }, [approveWriteError, approveTxReceiptError]);
  
  useEffect(() => {
    if (isApproveTxSuccess) {
      refetchAllowance();
      setShowApproveSuccessMessage(true);
      const timer = setTimeout(() => setShowApproveSuccessMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isApproveTxSuccess, refetchAllowance]);

  useEffect(() => {
    if (isMarketTxSuccess && marketReceipt && marketTxHash) {
      console.log("Market creation tx successful. Receipt:", marketReceipt);
      setMarketCreationSuccessDetails({ question, collateral: collateralAmount, txHash: marketTxHash });
      setRedirectCountdown(5);

      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }

      countdownIntervalRef.current = setInterval(() => {
        setRedirectCountdown(prevCountdown => {
          if (prevCountdown <= 1) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
            if (userAddress) {
              console.log(`Redirecting to /gandalf/user/${userAddress}`);
              navigate(`/gandalf/user/${userAddress}`);
              if (onClose) onClose();
            } else {
              console.error("User address not available for redirect after countdown.");
              if(onClose) onClose();
            }
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);
    }
    return () => {
        if(countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current)
            countdownIntervalRef.current = null;
        }
    };
  }, [isMarketTxSuccess, marketReceipt, marketTxHash, question, collateralAmount, userAddress, navigate, onClose]);

  const handleCollateralChange = (e) => {
    setCollateralAmount(e.target.value);
    setIsPollingAllowance(false);
  };
  
  const getDeadlineInSeconds = () => {
    if (!deadlineValue || isNaN(parseInt(deadlineValue))) return 0;
    const now = Math.floor(Date.now() / 1000);
    const duration = parseInt(deadlineValue);
    if (deadlineUnit === 'days') return now + duration * 24 * 60 * 60;
    if (deadlineUnit === 'months') return now + duration * 30 * 24 * 60 * 60;
    return 0;
  };

  const isDeadlineValid = () => {
    if (!deadlineValue || isNaN(parseInt(deadlineValue))) return false;
    const duration = parseInt(deadlineValue);
    if (deadlineUnit === 'days') return duration >= MINIMUM_DEADLINE_DAYS;
    if (deadlineUnit === 'months') return duration >= 1;
    return false;
  };

  const handleApprove = async () => {
    if (!userAddress) { alert('Please connect wallet.'); return; }
    if (connectedChainId !== ETH_SEPOLIA_CHAIN_ID) { alert(`Switch to Ethereum Sepolia (ID: ${ETH_SEPOLIA_CHAIN_ID}).`); return; }
    if (!isCollateralAmountValid) { alert(`Enter valid initial liquidity (min ${MINIMUM_COLLATERAL} USDTest).`); return; }
    try {
      const amount = parseUnits(collateralAmount, 6);
      await approveAsync({
        address: USDPNP_ADDRESS,
        abi: [
          {
            "inputs": [
              {"internalType": "address", "name": "spender", "type": "address"},
              {"internalType": "uint256", "name": "amount", "type": "uint256"}
            ],
            "name": "approve",
            "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'approve',
        args: [PNP_FACTORY_ADDRESS, amount],
        chainId: ETH_SEPOLIA_CHAIN_ID
      });
    } catch (err) { console.error("Error approving USDPNP:", err); alert(`Approval failed: ${(err.shortMessage || err.message).substring(0,100)}`); }
  };

  const handleCreateMarket = async (e) => {
    e.preventDefault();
    if (!question || !collateralAmount || !deadlineValue) { alert('Please fill all required fields.'); return; }
    if (!userAddress) { alert('Please connect your wallet.'); return; }
    if (connectedChainId !== ETH_SEPOLIA_CHAIN_ID) { alert(`Please switch to Ethereum Sepolia network.`); return; }
    if (!isApprovedForCurrentAmount) { alert('The entered initial liquidity amount is not approved. Please approve it first.'); return; }
    if (!isCollateralAmountValid) { alert(`Please enter a valid initial liquidity amount (minimum ${MINIMUM_COLLATERAL} USDTest).`); return; }
    if (!isDeadlineValid()) { alert(`Minimum deadline is ${MINIMUM_DEADLINE_DAYS} days.`); return; }

    let parsedCollateralAmountBn;
    try { parsedCollateralAmountBn = parseUnits(collateralAmount, 6); }
    catch (error) { console.error("Invalid initial liquidity:", error); alert("Invalid initial liquidity amount. Please enter a valid number."); return; }

    const deadlineInSeconds = getDeadlineInSeconds();
    if (deadlineInSeconds <= Math.floor(Date.now() / 1000)) { alert("Deadline must be in the future."); return; }
    
    try {
      await createMarketAsync({
        address: PNP_FACTORY_ADDRESS,
        abi: PNP_ABI,
        functionName: 'createPredictionMarket',
        args: [
          parsedCollateralAmountBn,
          USDPNP_ADDRESS,
          question,
          BigInt(deadlineInSeconds)
        ],
        chainId: ETH_SEPOLIA_CHAIN_ID
      });
    } catch (err) { console.error("Create market error:", err); alert(`Market creation failed: ${(err.shortMessage || err.message).substring(0,100)}`); }
  };

  const isCreateMarketButtonDisabled = isCreatingMarket || isMarketTxProcessing;
  const createMarketButtonText = isCreatingMarket ? 'Sending...' : isMarketTxProcessing ? 'Confirming...' : 'Create Market';

  if (marketCreationSuccessDetails) {
    return (
      <div className="market-success-screen">
        <h2 className="success-title">MARKET CREATED SUCCESSFULLY!</h2>
        <p className="success-question">"{marketCreationSuccessDetails.question}"</p>
        <p className="success-liquidity">WITH INITIAL LIQUIDITY <span className="success-amount">{marketCreationSuccessDetails.collateral} USDTest</span></p>
        <div className="success-transaction">
          <p>TRANSACTION HASH:</p>
          <a href={`https://base-sepolia.blockscout.com/tx/${marketCreationSuccessDetails.txHash}`} target="_blank" rel="noopener noreferrer" className="success-tx-link">{marketCreationSuccessDetails.txHash}</a>
        </div>
        <p className="redirect-countdown-message">
          Redirecting to your market in: <span className="countdown-seconds">{redirectCountdown}</span>s
        </p>
        <button 
            type="button"
            className="form-close-button simple-close-button" 
            onClick={() => {
                if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                onClose(); 
            }}
            title="Close and cancel redirect"
        >X</button>
      </div>
    );
  }
  
  const approveButtonText = isApproving ? 'Approving...' : isApproveTxProcessing ? 'Confirming...' : isApprovedForCurrentAmount ? 'Approved' : 'Approve';
  const isApproveButtonDisabled = !isCollateralAmountValid || isApprovedForCurrentAmount || isApproving || isApproveTxProcessing;

  return (
    <form className="create-market-form" onSubmit={handleCreateMarket}>
      <button type="button" className="form-close-button" onClick={onClose} title="Close Form">&times;</button>
      <div className="form-group">
        <label htmlFor="question">Question</label>
        <input type="text" id="question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g., Will ETH price exceed $5,000?" required />
        <small className="helper-text">Must have a clear YES/NO outcome.</small>
      </div>
      <div className="form-group form-group-inline">
        <label htmlFor="collateral">Initial Liquidity</label>
        <div className="collateral-input-group">
          <div className="usdc-tag">
            <img src="/usdc.svg" alt="USDTest" width="18" height="18" />
            <span>USDTest</span>
          </div>
          <input type="number" id="collateral" value={collateralAmount} onChange={handleCollateralChange} placeholder="Amount" step="any" min={MINIMUM_COLLATERAL} required />
          <button 
            type="button" 
            className={`approve-button ${isApproveButtonDisabled ? 'disabled' : ''}`}
            onClick={handleApprove} 
            disabled={isApproveButtonDisabled}
          >
            {approveButtonText}
          </button>
        </div>
        <div className="balance-info">
          <small className={parseFloat(userBalance) === 0 ? 'warning-text' : 'helper-text'}>
            Balance: {userBalance} USDTest {parseFloat(userBalance) === 0 && ' - Get test tokens first!'}
          </small>
        </div>
        {collateralAmount && !isCollateralAmountValid && ( <small className="warning-text">Min initial liquidity {MINIMUM_COLLATERAL} USDTest</small> )}
        {collateralAmount && isCollateralAmountValid && !isApprovedForCurrentAmount && ( <small className="warning-text">This amount requires approval</small> )}
        {isPollingAllowance && ( <small className="info-text">Checking approval status...</small> )}
      </div>
      <div className="form-group form-group-inline">
        <label htmlFor="deadline">Deadline</label>
        <div className="deadline-input-group">
          <input type="number" id="deadline" value={deadlineValue} onChange={(e) => setDeadlineValue(e.target.value)} placeholder="Duration" min={deadlineUnit === 'days' ? MINIMUM_DEADLINE_DAYS : 1} required />
          <div className="unit-selector">
            <button type="button" className={`unit-button ${deadlineUnit === 'days' ? 'active' : ''}`} onClick={() => setDeadlineUnit('days')}>Days</button>
            <button type="button" className={`unit-button ${deadlineUnit === 'months' ? 'active' : ''}`} onClick={() => setDeadlineUnit('months')}>Months</button>
          </div>
        </div>
        {deadlineValue && !isDeadlineValid() && ( <small className="warning-text">Min deadline {MINIMUM_DEADLINE_DAYS} days</small> )}
      </div>
      <button type="submit" className="create-button" disabled={isCreateMarketButtonDisabled || !isApprovedForCurrentAmount || !isCollateralAmountValid}>{createMarketButtonText}</button>
      
      {(marketWriteError || marketTxReceiptError || approveWriteError || approveTxReceiptError) && (
        <div className="error-message">
          Error: { ((marketWriteError || marketTxReceiptError || approveWriteError || approveTxReceiptError)?.shortMessage || (marketWriteError || marketTxReceiptError || approveWriteError || approveTxReceiptError)?.message)?.substring(0,100) }...
        </div>
      )}
      {(marketTxHash || approveTxHash) && !isMarketTxSuccess && !marketTxReceiptError && !isApproveTxSuccess && !approveTxReceiptError && (
         <div className="transaction-status">
           Tx sent! Hash: {(marketTxHash || approveTxHash).substring(0,10)}... {(isMarketTxProcessing || isApproveTxProcessing) ? 'Confirming...' : 'Please wait.'}
         </div>
      )}
      {isMarketTxSuccess && !marketCreationSuccessDetails && (
        <div className="success-message">Market created successfully! Preparing details...</div>
      )}
      {showApproveSuccessMessage && ( <div className="success-message">USDTest approved successfully! You can now create the market.</div> )}
    </form>
  );
};

export default CreateMarketForm; 