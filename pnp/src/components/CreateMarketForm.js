import React, { useState } from 'react';
import './CreateMarketForm.css';

const CreateMarketForm = ({ onClose }) => {
  const [question, setQuestion] = useState('');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [deadlineValue, setDeadlineValue] = useState('');
  const [deadlineUnit, setDeadlineUnit] = useState('days'); // 'days' or 'months'

  const isApproveDisabled = !collateralAmount || isNaN(parseFloat(collateralAmount)) || parseFloat(collateralAmount) <= 0;

  const handleApprove = () => {
    // Placeholder for approve logic
    console.log('Approve collateral:', collateralAmount);
    // Add actual approval logic here (e.g., contract interaction)
  };

  const handleCreate = (e) => {
    e.preventDefault();
    // Basic validation (can be expanded)
    if (!question || !collateralAmount || !deadlineValue) {
      alert('Please fill in all required fields.');
      return;
    }
    
    const formData = {
      question,
      collateralAmount,
      deadline: `${deadlineValue} ${deadlineUnit}`,
    };
    console.log('Creating market with data:', formData);
    // Add actual market creation logic here
    onClose(); // Close form after submission (or success)
  };

  return (
    <form className="create-market-form" onSubmit={handleCreate}>
      <button type="button" className="form-close-button" onClick={onClose}>
        &times;
      </button>
      
      <div className="form-group">
        <label htmlFor="question">Question</label>
        <input 
          type="text" 
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., Will ETH price exceed $5,000?"
          required
        />
        <small className="helper-text">Must have a clear YES/NO outcome.</small>
      </div>

      <div className="form-group form-group-inline">
        <label htmlFor="collateral">Collateral</label>
        <div className="collateral-input-group">
          <div className="usdc-tag">
            <img src="/usdc.svg" alt="USDC" width="18" height="18" />
            <span>USDC</span>
          </div>
          <input 
            type="number" 
            id="collateral"
            value={collateralAmount}
            onChange={(e) => setCollateralAmount(e.target.value)}
            placeholder="Amount"
            step="any"
            min="0"
            required
          />
          <button 
            type="button" 
            className={`approve-button ${isApproveDisabled ? 'disabled' : ''}`}
            onClick={handleApprove}
            disabled={isApproveDisabled}
          >
            Approve
          </button>
        </div>
      </div>

      <div className="form-group form-group-inline">
        <label htmlFor="deadline">Deadline</label>
        <div className="deadline-input-group">
          <input 
            type="number" 
            id="deadline"
            value={deadlineValue}
            onChange={(e) => setDeadlineValue(e.target.value)}
            placeholder="Duration"
            min="1"
            required
          />
          <div className="unit-selector">
            <button 
              type="button" 
              className={`unit-button ${deadlineUnit === 'days' ? 'active' : ''}`}
              onClick={() => setDeadlineUnit('days')}
            >
              Days
            </button>
            <button 
              type="button" 
              className={`unit-button ${deadlineUnit === 'months' ? 'active' : ''}`}
              onClick={() => setDeadlineUnit('months')}
            >
              Months
            </button>
          </div>
        </div>
      </div>

      <button type="submit" className="create-button">
        Create Market
      </button>
    </form>
  );
};

export default CreateMarketForm; 