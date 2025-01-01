import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/react-auth';

// Factory contract ABI
const factoryABI = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_initialLiquidity",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_tokenInQuestion",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "_moduleId",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "_collateralToken",
                "type": "address"
            },
            {
                "internalType": "uint256[]",
                "name": "_marketParams",
                "type": "uint256[]"
            },
            {
                "internalType": "address",
                "name": "_pool",
                "type": "address"
            }
        ],
        "name": "createPredictionMarket",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Factory contract address on Base
const FACTORY_ADDRESS = '0x28c876BF878C3549adddAE5659Ff59B95Cb2C77f';

export const usePnpFactory = () => {
    const { user } = usePrivy();

    const createPredictionMarket = async (initialLiquidity, tokenInQuestion, moduleId, collateralToken, marketParams, pool) => {
        try {
            if (!user?.wallet?.provider) {
                throw new Error('Wallet not connected');
            }

            const provider = new ethers.BrowserProvider(user.wallet.provider);
            const signer = await provider.getSigner();
            
            const factory = new ethers.Contract(
                FACTORY_ADDRESS,
                factoryABI,
                signer
            );

            console.log('Creating prediction market with params:', {
                initialLiquidity: initialLiquidity.toString(),
                tokenInQuestion,
                moduleId,
                collateralToken,
                marketParams,
                pool
            });

            const tx = await factory.createPredictionMarket(
                initialLiquidity,
                tokenInQuestion,
                moduleId,
                collateralToken,
                marketParams,
                pool
            );

            console.log('Transaction sent:', tx.hash);
            return tx;
        } catch (error) {
            console.error('Error creating prediction market:', error);
            throw error;
        }
    };

    return {
        createPredictionMarket
    };
};
