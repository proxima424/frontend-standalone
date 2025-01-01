import { ethers } from 'ethers';

// Minimal ABI for the getPrice function
const priceModuleABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "pool",
                "type": "address"
            }
        ],
        "name": "getPrice",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

/**
 * Extracts pool address from token data
 * @param {Object} tokenData - Token data from API
 * @returns {string} Pool address
 * @throws {Error} If no pool address found
 */
export const getPoolAddressFromTokenData = (tokenData) => {
    if (!tokenData?.relationships?.top_pools?.data?.[0]?.id) {
        throw new Error('No pool address found in token data');
    }
    const poolId = tokenData.relationships.top_pools.data[0].id;
    // Remove the 'base_' prefix and validate address
    const address = poolId.replace('base_', '');
    if (!ethers.isAddress(address)) {
        throw new Error('Invalid pool address format');
    }
    return address;
};

/**
 * Fetches current price from PriceModule contract
 * @param {string} priceModuleAddress - Address of the PriceModule contract
 * @param {Object} tokenData - Token data containing pool information
 * @param {ethers.Provider} provider - Ethers provider instance
 * @returns {Promise<BigNumber>} Price in wei
 * @throws {Error} If contract interaction fails
 */
export const getPriceFromModule = async (priceModuleAddress, tokenData, provider) => {
    try {
        if (!ethers.isAddress(priceModuleAddress)) {
            throw new Error('Invalid PriceModule address');
        }

        const poolAddress = getPoolAddressFromTokenData(tokenData);

        // Get signer if provider is a Web3Provider
        let signerOrProvider = provider;
        if (provider instanceof ethers.BrowserProvider) {
            try {
                signerOrProvider = await provider.getSigner();
            } catch (error) {
                console.warn('Could not get signer, falling back to provider', error);
            }
        }

        // Create contract instance with proper error handling
        const priceModule = new ethers.Contract(
            priceModuleAddress,
            priceModuleABI,
            signerOrProvider
        );

        // Add gas estimation for safety
        const gasEstimate = await priceModule.getPrice.estimateGas(poolAddress);
        console.log('Estimated gas for price fetch:', gasEstimate.toString());

        // Call getPrice with proper error handling
        const price = await priceModule.getPrice(poolAddress);
        
        // Validate returned price
        if (!price || price.eq(0)) {
            throw new Error('Invalid price returned from contract');
        }

        return price;
    } catch (error) {
        // Enhance error message for better debugging
        const enhancedError = new Error(
            `Failed to fetch price: ${error.message}\n` +
            `Module: ${priceModuleAddress}\n` +
            `Pool: ${tokenData?.relationships?.top_pools?.data?.[0]?.id}`
        );
        enhancedError.originalError = error;
        throw enhancedError;
    }
};
