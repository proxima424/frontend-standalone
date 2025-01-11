/* global BigInt */
import React, { useState, useEffect } from 'react';
import { useReadContract, useWriteContract } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';

const TOKEN_ADDRESSES = {
  USDT: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
};

const PNP_FACTORY_ADDRESS = '0xD70E46d039bcD87e5bFce37C38727D7020C1998D';

const ERC20_ABI = [
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  }
];

const CreateTwitterMarket = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    marketQuestion: '',
    twitterUsername: '',
    deadline: '',
    deadlineUnit: 'days',
    initialLiquidity: '',
    liquidityToken: 'USDC'
  });

  const { user } = usePrivy();
  const { writeContractAsync } = useWriteContract();

  // Check USDC allowance
  const { data: usdcAllowance } = useReadContract({
    address: TOKEN_ADDRESSES.USDC,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [user?.wallet?.address, PNP_FACTORY_ADDRESS],
    chainId: 8453,
  });

  // Check USDT allowance
  const { data: usdtAllowance } = useReadContract({
    address: TOKEN_ADDRESSES.USDT,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [user?.wallet?.address, PNP_FACTORY_ADDRESS],
    chainId: 8453,
  });

  useEffect(() => {
    if (usdcAllowance) {
      console.log('USDC Allowance:', Number(usdcAllowance) / (10 ** 6), 'USDC');
    }
    if (usdtAllowance) {
      console.log('USDT Allowance:', Number(usdtAllowance) / (10 ** 6), 'USDT');
    }
  }, [usdcAllowance, usdtAllowance]);

  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    if (formData.initialLiquidity) {
      const requiredAmount = BigInt(formData.initialLiquidity) * BigInt(10 ** 6);
      const currentAllowance = formData.liquidityToken === 'USDC' ? usdcAllowance : usdtAllowance;
      
      if (currentAllowance) {
        setIsApproved(BigInt(currentAllowance) >= requiredAmount);
        console.log(
          `Current ${formData.liquidityToken} allowance:`, 
          Number(currentAllowance) / (10 ** 6),
          formData.liquidityToken,
          '| Required:', 
          Number(requiredAmount) / (10 ** 6),
          formData.liquidityToken
        );
      }
    }
  }, [usdcAllowance, usdtAllowance, formData.initialLiquidity, formData.liquidityToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApprove = async () => {
    try {
      const amount = BigInt(formData.initialLiquidity) * BigInt(10 ** 6);
      await writeContractAsync({
        address: TOKEN_ADDRESSES[formData.liquidityToken],
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [PNP_FACTORY_ADDRESS, amount],
        chainId: 8453,
      });
    } catch (error) {
      console.error('Error approving tokens:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isApproved) return;
    // Handle form submission logic here
    console.log('Form submitted:', formData);
  };

  if (!isFormVisible) {
    return (
      <div 
        className='create-twitter-market'
        onClick={() => setIsFormVisible(true)}
      >
        <style jsx>{`
          .create-twitter-market {
            background: #1e1e1e;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-top: 1rem;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            width: 100%;
          }

          .create-twitter-market:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          }

          .plus-sign {
            font-size: 4rem;
            color: #3b82f6;
          }

          @media (max-width: 768px) {
            .plus-sign {
              font-size: 3rem;
            }
          }
        `}</style>
        <div className='plus-sign'>+</div>
      </div>
    );
  }

  return (
    <div className='create-market-form'>
      <style jsx>{`
        .create-market-form {
          background: #1e1e1e;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-top: 1rem;
          width: 100%;
        }

        .form-title {
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          color: #888;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid #333;
          background: #2d2d2d;
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .input-group {
          display: flex;
          gap: 1rem;
        }

        .select-input {
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid #333;
          background: #2d2d2d;
          color: white;
          font-size: 1rem;
          cursor: pointer;
        }

        .button-group {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .approve-button, .create-button {
          flex: 1;
          padding: 0.75rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .approve-button {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          border: 1px solid #3b82f6;
        }

        .approve-button:hover {
          background: rgba(59, 130, 246, 0.2);
        }

        .create-button {
          background: #3b82f6;
          color: white;
          border: none;
        }

        .create-button:hover:not(:disabled) {
          background: #2563eb;
        }

        .create-button:disabled {
          background: #4b5563;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          color: #888;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          transition: color 0.3s ease;
        }

        .close-button:hover {
          color: white;
        }
      `}</style>

      <button 
        className='close-button'
        onClick={() => setIsFormVisible(false)}
      >
        ×
      </button>

      <h2 className='form-title'>Create Twitter Market</h2>

      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label className='form-label'>Market Question</label>
          <input
            type='text'
            name='marketQuestion'
            value={formData.marketQuestion}
            onChange={handleInputChange}
            placeholder='e.g., Will BTC reach $100k by end of 2024?'
            className='form-input'
          />
        </div>

        <div className='form-group'>
          <label className='form-label'>Twitter Username</label>
          <input
            type='text'
            name='twitterUsername'
            value={formData.twitterUsername}
            onChange={handleInputChange}
            placeholder='@username'
            className='form-input'
          />
        </div>

        <div className='form-group'>
          <label className='form-label'>End Deadline</label>
          <div className='input-group'>
            <input
              type='number'
              name='deadline'
              value={formData.deadline}
              onChange={handleInputChange}
              placeholder='Enter duration'
              className='form-input'
              style={{ flex: 2 }}
            />
            <select
              name='deadlineUnit'
              value={formData.deadlineUnit}
              onChange={handleInputChange}
              className='select-input'
              style={{ flex: 1 }}
            >
              <option value='minutes'>Minutes</option>
              <option value='hours'>Hours</option>
              <option value='days'>Days</option>
            </select>
          </div>
        </div>

        <div className='form-group'>
          <label className='form-label'>Initial Liquidity</label>
          <div className='input-group'>
            <input
              type='number'
              name='initialLiquidity'
              value={formData.initialLiquidity}
              onChange={handleInputChange}
              placeholder='Enter amount'
              className='form-input'
              style={{ flex: 2 }}
            />
            <select
              name='liquidityToken'
              value={formData.liquidityToken}
              onChange={handleInputChange}
              className='select-input'
              style={{ flex: 1 }}
            >
              <option value='USDC'>USDC</option>
              <option value='USDT'>USDT</option>
            </select>
          </div>
        </div>

        <div className='button-group'>
          <button 
            type='button' 
            className='approve-button'
            onClick={handleApprove}
            disabled={isApproved}
          >
            {isApproved ? 'Approved' : 'Approve Contract'}
          </button>
          <button 
            type='submit' 
            className='create-button'
            disabled={!isApproved}
          >
            Create Market
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTwitterMarket;
