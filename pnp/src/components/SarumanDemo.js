import React, { useState } from 'react';
import SarumanAlt1 from './SarumanAlt1';
import SarumanAlt2 from './SarumanAlt2';
import SarumanAlt3 from './SarumanAlt3';
import './SarumanDemo.css';

// Sample data for demonstration
const SAMPLE_MARKET_DATA = {
  id: 'demo-market-123',
  question: 'Will Bitcoin reach $100,000 by the end of 2024?',
  yesPrice: 0.35,
  noPrice: 0.65,
  marketReserve: '25,430',
  collateralTokenAddress: '0x1234567890abcdef1234567890abcdef12345678',
  resolutionSource: 'CoinGecko API',
  marketEndTime: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
};

const SAMPLE_RESOLUTION_DATA = {
  resolvable: true,
  reasoning: "This market has clear, objective criteria for resolution. Bitcoin's price can be verified through multiple reliable cryptocurrency exchanges and price aggregators.",
  settlement_criteria: "AI will resolve this market to YES if Bitcoin (BTC) trades at or above $100,000 on any major exchange (Coinbase, Binance, Kraken) by 11:59 PM UTC on December 31, 2024. Price must be sustained for at least 15 minutes.",
  resolution_sources: [
    "CoinGecko API",
    "CoinMarketCap API", 
    "Binance API",
    "Coinbase Pro API"
  ],
  suggested_improvements: "None"
};

const SAMPLE_NON_RESOLVABLE_DATA = {
  resolvable: false,
  reasoning: "This market contains subjective criteria that cannot be objectively verified through automated AI systems.",
  settlement_criteria: "AI settlement depends on subjective interpretation of 'mainstream adoption' which lacks clear, measurable criteria for reliable resolution.",
  resolution_sources: [
    "Manual review required",
    "Community voting"
  ],
  suggested_improvements: "Define specific, measurable criteria such as: number of institutional adoptions, transaction volume thresholds, or regulatory approvals."
};

const SarumanDemo = () => {
  const [selectedUI, setSelectedUI] = useState('alt1');
  const [useProblematicData, setUseProblematicData] = useState(false);

  const currentResolutionData = useProblematicData ? SAMPLE_NON_RESOLVABLE_DATA : SAMPLE_RESOLUTION_DATA;

  const renderSelectedUI = () => {
    const props = {
      isLoading: false,
      marketData: SAMPLE_MARKET_DATA,
      resolutionData: currentResolutionData,
    };

    switch (selectedUI) {
      case 'alt1':
        return <SarumanAlt1 {...props} />;
      case 'alt2':
        return <SarumanAlt2 {...props} />;
      case 'alt3':
        return <SarumanAlt3 {...props} />;
      default:
        return <SarumanAlt1 {...props} />;
    }
  };

  return (
    <div className="saruman-demo-container">
      <div className="demo-controls">
        <h2>Saruman UI Alternatives Demo</h2>
        
        <div className="ui-selector">
          <label>Select UI Design:</label>
          <div className="ui-options">
            <button 
              className={selectedUI === 'alt1' ? 'active' : ''}
              onClick={() => setSelectedUI('alt1')}
            >
              Tabbed Interface
            </button>
            <button 
              className={selectedUI === 'alt2' ? 'active' : ''}
              onClick={() => setSelectedUI('alt2')}
            >
              Card-Based Layout
            </button>
            <button 
              className={selectedUI === 'alt3' ? 'active' : ''}
              onClick={() => setSelectedUI('alt3')}
            >
              Mobile-First Compact
            </button>
          </div>
        </div>

        <div className="data-toggle">
          <label>
            <input
              type="checkbox"
              checked={useProblematicData}
              onChange={(e) => setUseProblematicData(e.target.checked)}
            />
            Show problematic resolution data
          </label>
        </div>

        <div className="feature-summary">
          <h3>Current UI Features:</h3>
          {selectedUI === 'alt1' && (
            <ul>
              <li>🔄 <strong>Tabbed Interface</strong> - Separates trading and details</li>
              <li>📱 <strong>Mobile Optimized</strong> - Responsive tabs and collapsible sections</li>
              <li>🎯 <strong>Progressive Disclosure</strong> - Expand/collapse detailed info</li>
              <li>✨ <strong>Smooth Animations</strong> - Tab transitions and section reveals</li>
            </ul>
          )}
          {selectedUI === 'alt2' && (
            <ul>
              <li>🎴 <strong>Card-Based Design</strong> - Distinct sections for different info</li>
              <li>🔍 <strong>Progressive Enhancement</strong> - Click to reveal more details</li>
              <li>🎨 <strong>Visual Hierarchy</strong> - Clear separation of concerns</li>
              <li>📱 <strong>Touch Friendly</strong> - Large buttons and touch targets</li>
            </ul>
          )}
          {selectedUI === 'alt3' && (
            <ul>
              <li>📱 <strong>Mobile-First</strong> - Designed primarily for mobile devices</li>
              <li>📋 <strong>Bottom Sheet</strong> - iOS/Android style detail panels</li>
              <li>⚡ <strong>Quick Actions</strong> - Essential info immediately visible</li>
              <li>🎯 <strong>Space Efficient</strong> - Compact layout with smart use of space</li>
            </ul>
          )}
        </div>
      </div>

      <div className="demo-preview">
        <div className="preview-container">
          {renderSelectedUI()}
        </div>
      </div>
    </div>
  );
};

export default SarumanDemo; 