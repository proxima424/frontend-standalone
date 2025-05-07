export const PNP_FACTORY_ADDRESS = '0xD6692C4F0F4C7A8aF1d6026Bdf48987b7Cf11499';
export const USDPNP_ADDRESS = '0x77dE2966e1e5dD240ef3317B8d88d8945a4e9Bd6';

// TODO: Replace with actual collateral token address
export const COLLATERAL_TOKEN_DEFAULT = '0x77dE2966e1e5dD240ef3317B8d88d8945a4e9Bd6'; // Placeholder for default collateral

// Comprehensive ABI for the PNP_FACTORY_ADDRESS contract
export const PNP_ABI = [
  // == Events ==
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "conditionId", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "marketCreator", "type": "address" }
    ],
    "name": "PNP_MarketCreated",
    "type": "event"
  },
  // == Write Functions ==
  {
    "inputs": [
      { "internalType": "uint256", "name": "_initialLiquidity", "type": "uint256" },
      { "internalType": "address", "name": "_collateralToken", "type": "address" },
      { "internalType": "string", "name": "_question", "type": "string" },
      { "internalType": "uint256", "name": "_endTime", "type": "uint256" }
    ],
    "name": "createPredictionMarket",
    "outputs": [{ "internalType": "bytes32", "name": "conditionId", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "conditionId", "type": "bytes32" },
      { "internalType": "uint256", "name": "collateralAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "tokenIdToMint", "type": "uint256" }
    ],
    "name": "mintDecisionTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Potentially other write functions like: settleMarket, redeemTokens, etc.

  // == View/Pure Functions ==
  {
    "inputs": [{ "internalType": "bytes32", "name": "conditionId", "type": "bytes32" }],
    "name": "marketQuestion",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "conditionId", "type": "bytes32" }],
    "name": "getMarketEndTime",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "conditionId", "type": "bytes32" }],
    "name": "marketReserve",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "conditionId", "type": "bytes32" }],
    "name": "collateralToken", // Changed from marketCollateralToken for consistency
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "conditionId", "type": "bytes32" }],
    "name": "getYesTokenId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "pure", // Assuming these are pure as per previous definitions
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "conditionId", "type": "bytes32" }],
    "name": "getNoTokenId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "pure", // Assuming these are pure
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "totalSupply", // For ERC1155 token supply, if on this contract
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "bytes32", "name": "conditionId", "type": "bytes32" } ],
    "name": "isMarketCreatedAndNotSettled", // Example, add other view functions as needed
    "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" },
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
  // Add other view/pure functions relevant to PNP_FACTORY_ADDRESS
];

export const ERC20_APPROVE_ABI = [
  {
    "name": "approve",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }]
  }
];

// Deprecated or specific ABIs (can be removed if PNP_ABI is comprehensive and used everywhere)
// export const PREDICTION_MARKET_ABI = [ ... ]; // Can be removed if createPredictionMarket is in PNP_ABI
// export const MARKET_DETAILS_ABI = [ ... ];  // Can be removed if its functions are in PNP_ABI

// Chain IDs
export const ETH_SEPOLIA_CHAIN_ID = 11155111; // Ethereum Sepolia testnet
export const BASE_SEPOLIA_CHAIN_ID = 84532; // Base Sepolia testnet 