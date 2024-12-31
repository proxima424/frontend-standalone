import React, { useState, useEffect } from 'react';
import { ethers, parseUnits } from 'ethers';
import { usePnpFactory } from '../contracts/usePnpFactory';
import { useUniswapPool } from '../contracts/useUniswapPool';
import './CreateMarketModal.css';

const CreateMarketModal = ({ isOpen, onClose, tokenAddress, poolAddresses, tokenData }) => {
    const { createPredictionMarket, loading: factoryLoading, error: factoryError } = usePnpFactory();
    const poolAddress = poolAddresses[0]; // Using the first pool
    const { 
        token0, 
        token1,
        token0Symbol,
        token1Symbol,
        getPrice,
        loading: poolLoading, 
        error: poolError 
    } = useUniswapPool(poolAddress);
    
    const [formData, setFormData] = useState({
        collateralAmount: '',
        collateralToken: 'USDT',
        targetPrice: '',
        deadline: ''
    });

    // Determine which token is the base token (the one we're pricing)
    const isToken0Base = token0?.toLowerCase() === tokenAddress?.toLowerCase();
    const baseTokenSymbol = isToken0Base ? token0Symbol : token1Symbol;
    const quoteTokenSymbol = isToken0Base ? token1Symbol : token0Symbol;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convert deadline to timestamp
            const deadlineTimestamp = Math.floor(Date.now() / 1000) + (parseInt(formData.deadline) * 3600); // hours to seconds
            
            // Convert target price to the format expected by the contract
            const targetPriceWei = parseUnits(formData.targetPrice, 18);
            
            // Create market params array
            const marketParams = [
                deadlineTimestamp.toString(),
                targetPriceWei.toString()
            ];
            
            await createPredictionMarket({
                collateralAmount: formData.collateralAmount,
                collateralToken: formData.collateralToken,
                tokenAddress: tokenAddress,
                poolAddress: poolAddress,
                marketParams: marketParams
            });
            onClose();
        } catch (err) {
            console.error('Failed to create market:', err);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (!isOpen) return null;

    const prices = getPrice();
    const currentPrice = isToken0Base ? prices?.token0Price : prices?.token1Price;
    const loading = factoryLoading || poolLoading;
    const error = factoryError || poolError;

    // Format USD price with commas and fixed decimal places
    const formatUsdPrice = (price) => {
        if (!price) return '0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
        }).format(price);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Create Prediction Market</h2>
                <form onSubmit={handleSubmit}>
                    {currentPrice && (
                        <div className="current-price">
                            <div>Pool Price: {currentPrice} {baseTokenSymbol}/{quoteTokenSymbol}</div>
                            <div>USD Price: {formatUsdPrice(tokenData?.attributes?.price_usd)}</div>
                        </div>
                    )}
                    <div className="form-group">
                        <label>Target Price ({baseTokenSymbol}/{quoteTokenSymbol})</label>
                        <input
                            type="number"
                            name="targetPrice"
                            value={formData.targetPrice}
                            onChange={handleChange}
                            placeholder="Enter target price"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Deadline (hours)</label>
                        <input
                            type="number"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleChange}
                            placeholder="Enter hours"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Collateral Amount</label>
                        <input
                            type="number"
                            name="collateralAmount"
                            value={formData.collateralAmount}
                            onChange={handleChange}
                            placeholder="Enter amount"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Collateral Token</label>
                        <select
                            name="collateralToken"
                            value={formData.collateralToken}
                            onChange={handleChange}
                            required
                        >
                            <option value="USDT">USDT</option>
                            <option value="USDC">USDC</option>
                        </select>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <div className="button-group">
                        <button type="button" onClick={onClose} className="cancel-button">
                            Cancel
                        </button>
                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Market'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateMarketModal;
