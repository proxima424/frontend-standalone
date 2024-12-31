import { useWallets } from '@privy-io/react-auth';
import { ethers, JsonRpcProvider, Contract, parseUnits } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from './config';
import { useState, useCallback } from 'react';

// Constants for token addresses
const COLLATERAL_TOKENS = {
    USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
};

const MODULE_ID = 1; // Constant module ID

export const usePnpFactory = () => {
    const { wallets } = useWallets();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createPredictionMarket = useCallback(async ({
        collateralAmount,
        collateralToken,
        tokenAddress,
        poolAddress,
        marketParams
    }) => {
        if (!wallets?.[0]?.provider) {
            throw new Error('Wallet not connected');
        }

        setLoading(true);
        setError(null);
        try {
            const provider = new JsonRpcProvider(wallets[0].provider.rpcUrl);
            const signer = await provider.getSigner();
            
            // Get the factory contract
            const factoryContract = new Contract(
                CONTRACT_ADDRESSES.PNP_FACTORY,
                CONTRACT_ABIS.PNP_FACTORY,
                signer
            );

            // Convert collateral amount to proper decimals (6 for USDT/USDC)
            const collateralAmountWithDecimals = parseUnits(collateralAmount.toString(), 6);

            // Create the market
            const tx = await factoryContract.createPredictionMarket(
                tokenAddress,
                marketParams,
                collateralAmountWithDecimals,
                COLLATERAL_TOKENS[collateralToken],
                poolAddress
            );

            await tx.wait();

            return tx;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [wallets]);

    return {
        createPredictionMarket,
        loading,
        error,
        COLLATERAL_TOKENS // Export for use in components
    };
};
