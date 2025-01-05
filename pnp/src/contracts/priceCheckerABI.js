export const priceCheckerABI = [
  {
    "inputs": [
      { "type": "address", "name": "token" }
    ],
    "name": "checkPrice",
    "outputs": [
      { "type": "uint256" },
      { "type": "string" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
