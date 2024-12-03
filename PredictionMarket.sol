// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PredictionMarketAMM {
    uint256 public c; // Scaling factor, dynamically adjusted
    uint256 public totalReserve; // Total reserve in the contract
    uint256 public feePercentage = 5; // 5% fee

    uint256 public tokenYesSupply;
    uint256 public tokenNoSupply;

    mapping(address => uint256) public tokenYesBalance;
    mapping(address => uint256) public tokenNoBalance;

    event BuyTokens(address indexed user, uint256 yesTokens, uint256 noTokens, uint256 amountPaid);
    event SellTokens(address indexed user, uint256 yesTokens, uint256 noTokens, uint256 amountReceived);
    event FeeAccrued(uint256 fee);
    event ReserveUpdated(uint256 totalReserve, uint256 c);

    constructor() {
        c = 1e18; // Initial scaling factor
    }

    function _reserveFormula(uint256 yes, uint256 no) internal view returns (uint256) {
        return c * sqrt(yes * yes + no * no);
    }

    function _updateC() internal {
        // Ensure c aligns with totalReserve
        if (tokenYesSupply == 0 && tokenNoSupply == 0) {
            c = 1e18; // Reset c if no tokens are in supply
        } else {
            c = (totalReserve * 1e18) / sqrt(tokenYesSupply**2 + tokenNoSupply**2); // Maintain precision
        }
    }

    function sqrt(uint256 x) internal pure returns (uint256) {
        if(x==0){
            return 0;
        }
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }

    function buyTokens(uint256 yesWeight, uint256 noWeight) external payable {
        require(msg.value > 0, "Must send ETH to buy tokens");
        require(yesWeight + noWeight == 100, "Weights must sum to 100");

        uint256 fee = (msg.value * feePercentage) / 100; // Calculate 5% fee
        uint256 netAmount = msg.value - fee;

        // Current reserve
        uint256 currentReserve = c * sqrt(tokenYesSupply**2 + tokenNoSupply**2);

        // Post-transaction reserve (excluding fees)
        uint256 reserveWithFee = currentReserve + msg.value;
        uint256 reserveWithoutFee = currentReserve + netAmount;

        // Proportional increments
        uint256 weightMagnitude = sqrt(yesWeight**2 + noWeight**2);
        uint256 tokenIncrementFactor = (reserveWithoutFee / c - sqrt(tokenYesSupply**2 + tokenNoSupply**2)) / weightMagnitude;

        uint256 yesTokens = tokenIncrementFactor * yesWeight / 100;
        uint256 noTokens = tokenIncrementFactor * noWeight / 100;

        // Update token supplies
        tokenYesSupply += yesTokens;
        tokenNoSupply += noTokens;

        // Recalculate c
        c = reserveWithFee * 1e18 / sqrt(tokenYesSupply**2 + tokenNoSupply**2);

        // Update balances
        tokenYesBalance[msg.sender] += yesTokens;
        tokenNoBalance[msg.sender] += noTokens;

        // Update reserve
        totalReserve += msg.value;

        // Emit events
        emit FeeAccrued(fee);
        emit BuyTokens(msg.sender, yesTokens, noTokens, msg.value);
        emit ReserveUpdated(totalReserve, c);
    }



    function sellTokens(uint256 yesAmount, uint256 noAmount) external {
        require(tokenYesBalance[msg.sender] >= yesAmount, "Insufficient YES tokens");
        require(tokenNoBalance[msg.sender] >= noAmount, "Insufficient NO tokens");

        // Calculate the current reserve
        uint256 currentReserve = c * sqrt(tokenYesSupply**2 + tokenNoSupply**2);

        // Calculate new supply after burning the tokens
        uint256 newTokenYesSupply = tokenYesSupply - yesAmount;
        uint256 newTokenNoSupply = tokenNoSupply - noAmount;

        // Calculate the new reserve after burning the tokens
        uint256 newReserve = c * sqrt(newTokenYesSupply**2 + newTokenNoSupply**2);

        // Calculate the payout (no fees applied)
        uint256 payout = currentReserve - newReserve;

        // Burn the tokens from the user's balance
        tokenYesSupply = newTokenYesSupply;
        tokenNoSupply = newTokenNoSupply;

        // Update user's token balance
        tokenYesBalance[msg.sender] -= yesAmount;
        tokenNoBalance[msg.sender] -= noAmount;

        // Send the payout to the user
        totalReserve -= payout;  // Update the total reserve
        payable(msg.sender).transfer(payout);  // Transfer the payout to the user

        // Emit events
        emit SellTokens(msg.sender, yesAmount, noAmount, payout);
        emit ReserveUpdated(totalReserve, c);  // No change in 'c', as it remains the same
    }

}
