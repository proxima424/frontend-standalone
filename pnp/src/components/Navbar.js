import React, { useState } from 'react';
import './Navbar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAccount, useDisconnect, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const USDPNP_ADDRESS = '0x77dE2966e1e5dD240ef3317B8d88d8945a4e9Bd6';
const USDPNP_ABI = [
  {
    "inputs": [],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const SEPOLIA_CHAIN_ID = 11155111;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [isMinting, setIsMinting] = useState(false);
  const chainId = useChainId();

  const { writeContract, data: hash } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleMint = async () => {
    if (!isConnected) return;
    if (chainId !== SEPOLIA_CHAIN_ID) {
      alert('Please switch to Sepolia testnet to continue');
      return;
    }
    setIsMinting(true);
    try {
      await writeContract({
        address: USDPNP_ADDRESS,
        abi: USDPNP_ABI,
        functionName: 'mint',
      });
    } catch (error) {
      console.error('Minting error:', error);
      setIsMinting(false);
    }
  };

  // Reset minting state when transaction is confirmed
  React.useEffect(() => {
    if (isSuccess) {
      setIsMinting(false);
    }
  }, [isSuccess]);

  const handleProtocolTitleClick = () => {
    navigate('/');
  };

  const isGandalfPage = location.pathname.includes('/gandalf');

  return (
    <nav className="navbar">
      <div className="moving-strip">
        <div className="scroll-text">
          <span>🌐 CREATE A PREDICTION MARKET ON ANY EVENT</span>
          <span>🔄 PERMISSIONLESS MARKETS</span>
          <span>📊 COMPLETELY ONCHAIN</span>
          <span>🌐 PERPLEXITY SONAR API SETTLES MARKETS</span>   
          <span>📊 NETWORK OF AVS OPERATORS</span>
        </div>
      </div>
      <div className="navbar-content">
        <div 
          className="navbar-brand" 
          onClick={handleProtocolTitleClick}
          style={{ cursor: 'pointer' }}
        >
          pnp protocol
        </div>
        <div className="nav-links">
          <button 
            className="nav-button"
            onClick={() => navigate('/docs')}
          >
            How it works?
          </button>
          <button 
            className="nav-button" 
            onClick={() => navigate('/gandalf')}
          >
            PERPLEXITY MARKETS
          </button>
          <button className="nav-button"
          onClick={() => window.open('https://polynews.in', '_blank')}>POLY NEWS</button>
        </div>
        <div className="navbar-right">
          {isConnected && isGandalfPage && (
            <button 
              className="test-token-button"
              onClick={handleMint}
              disabled={isMinting || isConfirming}
            >
              {isMinting || isConfirming ? 'Minting...' : 'Get Test Tokens'}
            </button>
          )}
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              return (
                <div
                  {...(!mounted && {
                    'aria-hidden': true,
                    'style': {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!mounted || !account || !chain) {
                      return (
                        <button className="connect-button" onClick={openConnectModal}>
                          Login
                        </button>
                      );
                    }

                    if (chain.id !== SEPOLIA_CHAIN_ID) {
                      return (
                        <button className="connect-button" onClick={openChainModal}>
                          Switch to Sepolia
                        </button>
                      );
                    }

                    return (
                      <div className="wallet-container">
                        <button className="address-button" onClick={openAccountModal}>
                          {account.displayName}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
