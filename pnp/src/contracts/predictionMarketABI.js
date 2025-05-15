export const predictionMarketABI = [
  {
    "inputs": [
      { "type": "uint256", "name": "_initialLiquidity" },
      { "type": "address", "name": "_tokenInQuestion" },
      { "type": "uint8", "name": "_moduleId" },
      { "type": "address", "name": "_collateralToken" },
      { "type": "uint256[]", "name": "_marketParams" },
      { "type": "address", "name": "_pool" }
    ],
    "name": "createPredictionMarket",
    "outputs": [{ "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "type": "bytes32", "name": "conditionId" },
      { "type": "uint256", "name": "tokenIdToMint" },
      { "type": "uint256", "name": "tokensToMint" }
    ],
    "name": "mintDecisionTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "type": "bytes32", "name": "conditionId" },
      { "type": "uint256", "name": "tokenIdToBurn" },
      { "type": "uint256", "name": "tokensToBurn" }
    ],
    "name": "burnDecisionTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "type": "bytes32", "name": "conditionId" }],
    "name": "settleMarket",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "type": "bytes32", "name": "conditionId" }],
    "name": "redeemPosition",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "type": "uint8", "name": "moduleType" },
      { "type": "address", "name": "moduleAddr" }
    ],
    "name": "setModuleAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "type": "uint256", "name": "_takeFee" }],
    "name": "setTakeFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "type": "bytes32", "name": "conditionId" }],
    "name": "moduleTypeUsed",
    "outputs": [{ "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "type": "uint8", "name": "moduleId" }],
    "name": "moduleAddress",
    "outputs": [{ "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "type": "bytes32", "name": "conditionId" }],
    "name": "marketParams",
    "outputs": [{ "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "type": "bytes32", "name": "conditionId" }],
    "name": "marketSettled",
    "outputs": [{ "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "type": "bytes32", "name": "conditionId" }],
    "name": "marketReserve",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "type": "bytes32", "name": "conditionId" }],
    "name": "collateralToken",
    "outputs": [{ "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "type": "bytes32", "name": "conditionId" }],
    "name": "winningTokenId",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "type": "bytes32", "name": "conditionId" }],
    "name": "conditionIdToPool",
    "outputs": [{ "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "TAKE_FEE",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];
