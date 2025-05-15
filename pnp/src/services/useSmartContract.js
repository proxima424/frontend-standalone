import { useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { useState } from 'react';

export const useSmartContract = (contractAddress, contractABI) => {
  const { wallets } = useWallets();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getContract = async () => {
    if (!wallets || wallets.length === 0) {
      throw new Error('No wallet connected');
    }

    const wallet = wallets[0];
    const provider = await wallet.getEthersProvider();
    const signer = provider.getSigner();
    return new ethers.Contract(contractAddress, contractABI, signer);
  };

  const executeContractMethod = async (methodName, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getContract();
      const transaction = await contract[methodName](...args);
      const receipt = await transaction.wait();
      return receipt;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    executeContractMethod,
    loading,
    error,
  };
};
