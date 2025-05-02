import React, { useState } from 'react';
import './Docs.css';

// Placeholder components for content sections
const PlaceholderContent = ({ title }) => (
  <div className="docs-placeholder">
    <h2>{title}</h2>
    <p>Content for {title} will be displayed here.</p>
    {/* Add more detailed placeholder content or structure later */}
  </div>
);

const IntroductionContent = () => <PlaceholderContent title="Introduction" />;
const WhatIsPnpContent = () => (
  <div className="docs-page-content">
    <h2>What is PNP Exchange?</h2>
    <p>
      PNP Exchange is a protocol building on the  frontier of info finance by enabling permissionless prediction markets. 
      We let users create a prediction market out of any question and make it instantly tradable.
    </p>
    <p>
      At its core, <a href="https://pnp.exchange" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>pnp.exchange</a> embodies the concept of "correct-by-construction" markets: we start from facts we want to know, then deliberately design markets to optimally elicit that information from participants. Any user can pose a question about future events, create an instantly tradable market around it, and earn fees from the trading pool.
    </p>
    <p>
      This represents a fundamental shift from traditional finance. While all financial markets implicitly contain information, prediction markets are explicitly designed to surface specific knowledge. For bettors, PNP is a trading platform; for readers, it's an information source providing valuable signals about real-world probabilities.
    </p>
    <p>
      Info finance offers a meaningful alternative to speculative coin trading by connecting financial incentives directly to real-world outcomes. PNP Exchange aims to make these powerful information mechanisms accessible to everyone through a diverse range of consumer-focused applications.
    </p>
    <p>
      As Vitalik Buterin noted, "The current decade presents a unique opportunity" for info finance with scalable blockchains as infrastructure and AI as potential market participants. PNP Exchange is building for this future, where prediction markets move beyond just elections to become a fundamental primitive in the information economy.
    </p>

    <div className="links-section">
      <h3>Useful Links</h3>
      {/* User will paste links here directly in the code later */}
      <ul>
        <li><a href="https://vitalik.eth.limo/general/2024/11/09/infofinance.html" target="_blank" rel="noopener noreferrer">Vitalik Buterin: From Prediction Markets to Info Finance</a></li>
        <li><a href="#" target="_blank" rel="noopener noreferrer">Link Placeholder 2</a></li>
      </ul>
    </div>
  </div>
);

// Updated component for Key Features section
const KeyFeaturesContent = () => (
  <div className="docs-page-content key-features-layout">
    <h2>Key Features</h2>
    <div className="features-container">
      <div className="feature-box a1-container">
        <h3>MARKET TRADING</h3>
        <div className="feature-details market-trading-details">
          {/* Modern card layout for Trading section */}
          <div className="feature-highlight">
            <div className="feature-heading">
              <div className="feature-icon curve-icon">
                {/* Improved curve SVG */}
                <svg viewBox="0 0 100 50" preserveAspectRatio="none">
                  <path d="M 0 50 Q 50 -10 100 50" stroke="#ff69b4" fill="none" strokeWidth="3"/>
                </svg>
              </div>
              <h4>On-Chain Bonding Curve</h4>
            </div>
            <p>Instant liquidity and deterministic pricing, setting us apart from traditional exchanges.</p>
          </div>
          
          {/* Equation in its own highlight box */}
          <div className="feature-highlight equation-card">
            <h4>Pythagorean Bonding Curve</h4>
            <div className="equation-image-container">
              <img src="/what.png" alt="Bonding Curve Equation" />
            </div>
          </div>
          
          {/* No Orderbook with improved design */}
          <div className="feature-highlight">
            <div className="feature-heading">
              <div className="feature-icon cross-icon">
                <svg viewBox="0 0 50 50">
                  <line x1="10" y1="10" x2="40" y2="40" stroke="#e74c3c" strokeWidth="4" />
                  <line x1="40" y1="10" x2="10" y2="40" stroke="#e74c3c" strokeWidth="4" />
                </svg>
              </div>
              <h4>No Off-Chain Orderbooks</h4>
            </div>
            <p>Complete transparency and zero counterparty risk, unlike traditional market mechanisms.</p>
          </div>
          
          {/* Optional: Summary point */}
          <div className="feature-summary">
            <span>Trading that's deterministic, transparent, and fully on-chain.</span>
          </div>
        </div>
      </div>
      <div className="feature-box a2-container">
        <h3>MARKET SETTLEMENT</h3>
        <div className="feature-details market-settlement-details">
          {/* No Oracle Dependencies */}
          <div className="feature-highlight">
            <div className="feature-heading">
              <div className="feature-icon cross-icon">
                <svg viewBox="0 0 50 50">
                  <line x1="10" y1="10" x2="40" y2="40" stroke="#e74c3c" strokeWidth="4" />
                  <line x1="40" y1="10" x2="10" y2="40" stroke="#e74c3c" strokeWidth="4" />
                </svg>
              </div>
              <h4>No Optimistic Oracle Dependencies</h4>
            </div>
            <p>Unlike UMA and other platforms, we avoid third-party oracle dependencies that can introduce risks and centralization points to the settlement process.</p>
          </div>
          
          {/* LLM Technology - Special highlight */}
          <div className="feature-highlight llm-card">
            <h4>Powered by Advanced LLMs</h4>
            <div className="llm-description">
              <p>We leverage excellent reasoning Large Language Models (LLMs) from industry-leading providers to analyze real-world events with unprecedented accuracy.</p>
            </div>
            <div className="llm-providers">
              <div className="provider-logo">
                <img src="/gemini.png" alt="Gemini AI" className="placeholder-img" />
                <span>Gemini</span>
              </div>
              <div className="provider-logo">
                <img src="/pplx.svg" alt="Perplexity AI" className="placeholder-img" />
                <span>Perplexity</span>
              </div>
            </div>
          </div>
          
          {/* Market Flexibility */}
          <div className="feature-highlight">
            <div className="feature-heading">
              <div className="feature-icon global-icon">
                <svg viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="none" stroke="#ff69b4" strokeWidth="2" />
                  <path d="M25 5 v40 M5 25 h40" stroke="#ff69b4" strokeWidth="1.5" />
                  <path d="M10 15 C 20 5, 30 5, 40 15" stroke="#ff69b4" strokeWidth="1.5" fill="none" />
                  <path d="M10 35 C 20 45, 30 45, 40 35" stroke="#ff69b4" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
              <h4>Global Real-Time Information</h4>
            </div>
            <p>LLMs with access to real-time global information enable markets on virtually any topic that can be indexed by modern search engines.</p>
          </div>
          
          {/* Summary statement */}
          <div className="feature-summary">
            <span>Settlement powered by AI, not oracles — faster, more versatile, and future-proof.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const GettingStartedContent = () => <PlaceholderContent title="Getting Started" />;
const QuickStartGuideContent = () => (
  <div className="docs-page-content">
    <h2>Quick Start Guide</h2>
    
    <div className="quick-start-container">
      {/* Step 1: Sign In */}
      <div className="quick-start-step">
        <div className="step-image">
          <img src="/aftersignin.png" alt="Privy Sign In Screen" />
        </div>
        <div className="step-content">
          <h3>1. Create an Account</h3>
          <p>
            Head over to <a href="https://pnp.exchange" target="_blank" rel="noopener noreferrer">pnp.exchange</a> and login via Privy. 
            With Privy you do not need a wallet, it provides you options to create one with any of your social logins.
          </p>
        </div>
      </div>
      
      {/* Step 2: App Interface */}
      <div className="quick-start-step">
        <div className="step-image">
          <img src="/app.png" alt="PNP Exchange App Interface" />
        </div>
        <div className="step-content">
          <h3>2. Access the Platform</h3>
          <p>
            Head over to <em>pnp.exchange/{"live-soon"}</em>
            
          </p>
        </div>
      </div>
      
      {/* Step 3: Browse Markets */}
      <div className="quick-start-step">
        <div className="step-image">
          <img src="/buy.png" alt="Browse Available Markets" />
        </div>
        <div className="step-content">
          <h3>3. Browse Markets</h3>
          <p>
            You can browse all the available markets. Whenever anyone creates a market, it appears in this list.
          </p>
        </div>
      </div>
      
      {/* Step 4: Click Create */}
      <div className="quick-start-step">
        <div className="step-image">
          <img src="/clickcreate.png" alt="Click Create Market Button" />
        </div>
        <div className="step-content">
          <h3>4. Initiate Market Creation</h3>
          <p>
            In order to create market, click on this button on the left hand side of the screen
          </p>
        </div>
      </div>
      
      {/* Step 5: Create Market Form */}
      <div className="quick-start-step">
        <div className="step-image">
          <img src="/createmarket.png" alt="Create Market Form" />
        </div>
        <div className="step-content">
          <h3>5. Define Your Market</h3>
          <p>
            Enter the string question. Enter the initial liquidity. This liquidity is used to set YES and NO at equal price equal odds.
            This liquidity can be as low as $1.
          </p>
        </div>
      </div>
      
      <div className="base-testnet-note">
        <p className="coming-soon-text">( DETAILS FOR HOW TO USE THE BASE TESTNET COMING SOON )</p>
      </div>
    </div>
  </div>
);
const UserRequirementsContent = () => (
  <div className="docs-page-content">
    <h2>User Requirements</h2>
    <div className="simple-content">
      <p className="emphasized-text">ANYONE.</p>
      <p className="emphasized-text">NO CAPTCHA, DID WE ASK?</p>
      <p className="emphasized-text">ANYONE, THAT WAS THE POINT</p>
    </div>
  </div>
);

const CoreConceptsContent = () => <PlaceholderContent title="Core Concepts" />;
const PredictionMarkets101Content = () => (
  <div className="docs-page-content">
    <h2>Prediction Markets 101</h2>
    
    <div className="concept-grid">
      {/* First Row - 3 cards side by side */}
      
      {/* Card 1: What Are Prediction Markets */}
      <div className="concept-card">
        <div className="concept-header">
          <div className="concept-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="#ff69b4" strokeWidth="2" fill="none">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="8" />
            </svg>
          </div>
          <h3>What Are Prediction Markets?</h3>
        </div>
        <p>Prediction markets are platforms where participants trade shares based on the potential outcomes of future events. These markets harness the "wisdom of crowds" to generate forecasts often more accurate than individual experts.</p>
      </div>
      
      {/* Card 2: How They Work */}
      <div className="concept-card">
        <div className="concept-header">
          <div className="concept-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="#ff69b4" strokeWidth="2" fill="none">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </div>
          <h3>How They Work</h3>
        </div>
        <p>In a typical prediction market, shares pay out 1 unit if an event occurs and 0 if it doesn't. For example, in a market for "Will Candidate X win the election?", a "Yes" share pays 1 unit if they win, 0 if they lose. Share prices reflect the market's assessment of the event's probability.</p>
      </div>

      {/* Card 3: Benefits - Moved here */}
      <div className="concept-card">
        <div className="concept-header">
          <div className="concept-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="#ff69b4" strokeWidth="2" fill="none">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <h3>Benefits</h3>
        </div>
        <ul className="benefit-list">
          <li><strong>Better Forecasting:</strong> Often outperform expert predictions and polls</li>
          <li><strong>Incentivized Truth:</strong> Financial stake encourages quality information</li>
          <li><strong>Real-time Updates:</strong> Prices adjust instantly to new information</li>
          <li><strong>Decentralization:</strong> No single authority determines outcomes</li>
        </ul>
      </div>
      
      {/* Second Row - Trump Case Study (span 2) */}
      
      {/* Trump Election Example */}
      <div className="concept-card featured-card">
        <div className="concept-header">
          <div className="concept-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="#ff69b4" strokeWidth="2" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9"/>
            </svg>
          </div>
          <h3>Case Study: Presidential Elections</h3>
        </div>
        <div className="case-study-content">
          <p>The 2020 and upcoming 2024 U.S. Presidential elections featuring Donald Trump have been among the highest-volume events in prediction market history.</p>
          
          <div className="stat-highlight">
            <div className="stat">$1B+</div>
            <div className="stat-desc">Trading volume across platforms during the 2020 election cycle</div>
          </div>
          
          <p>During peak periods, the Trump election markets saw:</p>
          <ul>
            <li>24-hour volumes exceeding $100M</li>
            <li>Rapid price swings reflecting real-time events</li>
            <li>Greater participation than professional polling</li>
          </ul>
        </div>
      </div>
      
      {/* Third Row - Types of Markets - Moved here */}
      
      {/* Types of Markets */}
      <div className="concept-card">
        <div className="concept-header">
          <div className="concept-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="#ff69b4" strokeWidth="2" fill="none">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
            </svg>
          </div>
          <h3>Types of Prediction Markets</h3>
        </div>
        <ul className="types-list">
          <li><strong>Binary:</strong> Yes/No outcomes (Will X happen?)</li>
          <li><strong>Multiple Choice:</strong> Several possible outcomes (Who will win?)</li>
          <li><strong>Scalar:</strong> Range of numeric outcomes (What will the price be?)</li>
          <li><strong>Conditional:</strong> Outcomes dependent on other events</li>
        </ul>
      </div>
    </div>
  </div>
);
const PermissionlessProtocolsContent = () => (
  <div className="docs-page-content">
    <h2>Hall of Fame Prediction Markets</h2>
    <p className="hall-intro">Explore some of the most successful prediction markets that demonstrate the power of permissionless protocols. If these were created on PNP Exchange, here's what the creators would have earned.</p>
    
    <div className="hall-of-fame-grid">
      {/* Market 1 */}
      <div className="fame-card">
        <div className="fame-card-header">
          <h3>Presidential Election 2024</h3>
          <div className="category-tag">Politics</div>
        </div>
        
        <a href="https://polymarket.com/event/presidential-election-winner-2024?tid=1746213095873" target="_blank" rel="noopener noreferrer" className="market-link">
          <div className="market-screenshot">
            <img 
              src="/trump.png" 
              alt="2024 Presidential Election Market" 
              className="market-image"
              style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
            />
          </div>
        </a>
        
        <div className="market-stats">
          <div className="stat-item">
            <div className="stat-label">Trading Volume</div>
            <div className="stat-value">$3.68B+</div>
          </div>
          <div className="stat-item highlight">
            <div className="stat-label">Creator Fees (PNP)</div>
            <div className="stat-value">$36.8M+</div>
          </div>
        </div>
        
        <p className="fame-caption">
          <span className="fame-highlight">If created on PNP:</span> The market creator would have earned over $36.8 million in fees from this single market, while providing real-time election forecasting.
        </p>
      </div>
      
      {/* Market 2 */}
      <div className="fame-card">
        <div className="fame-card-header">
          <h3>Champions League Winner</h3>
          <div className="category-tag">Sports</div>
        </div>
        
        <a href="https://polymarket.com/event/champions-league-winner-2025" target="_blank" rel="noopener noreferrer" className="market-link">
          <div className="market-screenshot">
            <img 
              src="/champions.png" 
              alt="Champions League Winner Market" 
              className="market-image"
              style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
            />
          </div>
        </a>
        
        <div className="market-stats">
          <div className="stat-item">
            <div className="stat-label">Trading Volume</div>
            <div className="stat-value">$995.8M+</div>
          </div>
          <div className="stat-item highlight">
            <div className="stat-label">Creator Fees (PNP)</div>
            <div className="stat-value">$9.9M+</div>
          </div>
        </div>
        
        <p className="fame-caption">
          <span className="fame-highlight">If created on PNP:</span> The creator would have captured nearly $10 million in fees through this Champions League market — a passive income beyond most people's dreams.
        </p>
      </div>
      
      {/* Market 3 */}
      <div className="fame-card">
        <div className="fame-card-header">
          <h3>NBA Champion 2024-2025</h3>
          <div className="category-tag">Sports</div>
        </div>
        
        <a href="https://polymarket.com/event/nba-champion-2024-2025?tid=1746215040212" target="_blank" rel="noopener noreferrer" className="market-link">
          <div className="market-screenshot">
            <img 
              src="/nba.png" 
              alt="NBA Champion Market" 
              className="market-image"
              style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
            />
          </div>
        </a>
        
        <div className="market-stats">
          <div className="stat-item">
            <div className="stat-label">Trading Volume</div>
            <div className="stat-value">$1.66B+</div>
          </div>
          <div className="stat-item highlight">
            <div className="stat-label">Creator Fees (PNP)</div>
            <div className="stat-value">$16.6M+</div>
          </div>
        </div>
        
        <p className="fame-caption">
          <span className="fame-highlight">If created on PNP:</span> This NBA Championship market would generate $16.6M+ in creator fees, all while providing valuable real-time predictions for basketball fans.
        </p>
      </div>
    </div>
  </div>
);

const ProtocolArchitectureContent = () => <PlaceholderContent title="Protocol Architecture" />;
const SystemOverviewContent = () => (
  <div className="docs-page-content system-overview">
    <h2>System Overview</h2>
    
    <div className="overview-intro">
      <p>
        To solve the problem of turning an existing protocol into a hyperstructure, we start by breaking it into simpler, composable parts:
      </p>
      
      <div className="protocol-pillars">
        <div className="protocol-pillar">Market Creation</div>
        <div className="protocol-pillar">Market Trading</div>
        <div className="protocol-pillar">Market Settlement</div>
      </div>
      
      <p>
        By addressing each component individually, we've developed a fully on-chain prediction market system that maximizes decentralization while maintaining usability.
      </p>
    </div>
    
    <div className="architecture-diagram-container">
      <div className="architecture-diagram">
        <img src="/diagram.png" alt="PNP Exchange Architecture Diagram" />
      </div>
    </div>
    
    <div className="system-section">
      <h3>Market Creation</h3>
      <div className="section-content">
        <p>
          The market creation process is straightforward yet powerful. A user enters a string question and defines the possible outcomes (currently supporting binary markets with YES/NO outcomes).
        </p>
        
        <p>
          In return, they receive a <code>bytes32 conditionId</code> as a unique identifier for that market, derived from the market parameters. This ID serves as the foundation for all subsequent interactions with the market.
        </p>
        
        <div className="technical-details">
          <h4>Tokenization</h4>
          <p>
            The outcome tokens (YES and NO) are tokenized using the ERC1155 token standard on Ethereum and equivalent standards on other chains like Solana. Each outcome token has a unique identifier generated through:
          </p>
          
          <div className="code-snippet">
            <pre>
              <code>
uint256 yesTokenId = uint256(keccak256(abi.encodePacked(conditionId, "YES")));

uint256 noTokenId = uint256(keccak256(abi.encodePacked(conditionId, "NO")));
              </code>
            </pre>
          </div>
          
          <p>
            Each ERC1155 token is intrinsically bound to the string question of the market it represents, creating a verifiable connection between the token and its underlying market.
          </p>
        </div>
        
        <p>
          During market creation, the user provides USDC which is used for the initial outcome tokens mint. Equal numbers of YES and NO outcomes are minted, starting the market with a balanced 50/50 price point.
        </p>
      </div>
    </div>
    
    <div className="system-section">
      <h3>Market Trading</h3>
      <div className="section-content">
        <p>
          We've implemented on-chain bonding curves rather than traditional off-chain orderbooks. While prominent exchanges typically use orderbooks for settling trades, this approach suffers from low liquidity for non-active markets.
        </p>
        
        <div className="highlight-box">
          <h4>Why Bonding Curves?</h4>
          <p>
            Bonding curves are mathematical functions that link a token's supply to its price, creating a dynamic pricing mechanism. When someone buys tokens, the price adjusts upward according to the curve's formula. Similarly, when tokens are sold, the supply decreases, causing the price to adjust downward.
          </p>
          
          <p>
            This method ensures that the price of tokens always responds to changes in demand and supply, allowing for an automated and transparent valuation process without needing a centralized entity or powerful traders to control the market.
          </p>
        </div>
        
        <p>
          In traditional crypto markets, prices and liquidity can be chaotic. Markets typically rely on interactions between traders to set prices, leading to volatility influenced by large trades or market manipulation. Liquidity fully depends on the availability of buyers and sellers.
        </p>
        
        <p>
          Using bonding curves solves these issues by:
        </p>
        
        <ul className="benefits-list">
          <li><strong>Ensuring constant liquidity</strong> — Any market becomes instantly tradeable, regardless of popularity</li>
          <li><strong>Providing transparent pricing</strong> — Prices follow a predetermined mathematical formula</li>
          <li><strong>Eliminating counterparty risk</strong> — Trading happens against the curve, not other traders</li>
          <li><strong>Enabling fair distribution</strong> — No privileged access or asymmetric information</li>
        </ul>
        
        <div className="equation-display">
          <h4>Pythagorean Bonding Curve</h4>
          <div className="equation-container">
            <img src="/what.png" alt="Pythagorean Bonding Curve Formula" />
          </div>
          <p className="equation-caption">Our implementation uses the Pythagorean Bonding Curve to efficiently price outcome tokens</p>
        </div>
      </div>
    </div>
    
    <div className="system-section">
      <h3>Market Settlement</h3>
      <div className="section-content">
        <p>
          Current exchanges typically settle their markets by outsourcing settlement to third-party solutions tasked with resolving the market and getting the result on-chain. For example, UMA's Optimistic Oracle relies on a small group of human voters, which introduces several limitations:
        </p>
        
        <ul className="limitations-list">
          <li>Potential bias from personal opinions or beliefs of human voters</li>
          <li>Basic method of manual dispute resolution instead of fully automated systems</li>
          <li>Risk of centralization if voters are not diverse or are swayed by outside influences</li>
          <li>Limited scalability as human verification becomes a bottleneck</li>
        </ul>
        
        <div className="ai-settlement">
          <h4>SETTLED BY AI</h4>
          <div className="ai-settlement-content">
            <div className="ai-left">
              <p>
                Modern prediction markets are hindered by reliance on human oracles for settlement, introducing 
                delays and costs. PNP Exchange utilizes AI for automated market resolution, enabling:
              </p>
              <ul>
                <li>Objective verification of real-world outcomes</li>
                <li>Rapid settlement without human intermediaries</li>
                <li>Reduced operating costs and higher trading volumes</li>
                <li>Support for complex market conditions beyond binary outcomes</li>
              </ul>
              <p>
                Our AI settlement engine works by analyzing multiple trusted data sources and 
                applying reasoning algorithms to determine market outcomes with high confidence.
              </p>
            </div>
            <div className="ai-right">
              <div className="ai-models">
                <div className="ai-model">
                  <img src="/openai-logo.svg" alt="OpenAI" className="ai-logo" />
                  <span>GPT-4o / Claude 3 Opus</span>
                </div>
                <div className="ai-model">
                  <img src="/gemini-logo.svg" alt="Gemini" className="ai-logo" />
                  <span>Gemini 2.5 Pro Preview</span>
                </div>
                <div className="ai-model">
                  <img src="/llama-logo.svg" alt="Llama" className="ai-logo" />
                  <span>Perplexity Sonar Pro</span>
                </div>
              </div>
              <div className="ai-capabilities">
                <span>Multi-source Verification</span>
                <span>Cross-model Consensus</span>
                <span>Automated Fact Checking</span>
                <span>Chain-of-thought Reasoning</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div className="references">
      <h4>References & Credits</h4>
      <ul>
        <li>Bonding curve concepts inspired by <a href="https://hackernoon.com/educational-byte-what-are-bonding-curves-and-how-can-you-earn-with-them" target="_blank" rel="noopener noreferrer">Hackernoon: What Are Bonding Curves</a></li>
        <li>Pythagorean Bonding Curve implementation based on <a href="https://blog.obyte.org/introducing-prophet-prediction-markets-based-on-bonding-curves-3716651db344" target="_blank" rel="noopener noreferrer">Obyte's Prophet Prediction Markets</a></li>
      </ul>
    </div>
  </div>
);
const SmartContractsContent = () => (
  <div className="docs-page-content">
    <h2>Smart Contracts</h2>
    
    <div className="contracts-section">
      <h3>EVM Chains</h3>
      <div className="contracts-buttons">
        <a 
          href="https://github.com/pnp-protocol/contracts/blob/fresh/src/libraries/PythagoreanBondingCurve.sol" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="contract-button"
        >
          src/libraries/PythagoreanBondingCurve.sol
        </a>
        <a 
          href="https://github.com/pnp-protocol/contracts/blob/fresh/src/pnpFactory.sol" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="contract-button"
        >
          src/pnpFactory.sol
        </a>
      </div>
    </div>
    
    <div className="contracts-section">
      <h3>Solana</h3>
      <div className="contracts-buttons">
        <span className="contract-button coming-soon">
          <em>Coming soon</em>
        </span>
        <span className="contract-button coming-soon">
          <em>Coming soon</em>
        </span>
      </div>
    </div>
  </div>
);

const ResourcesContent = () => (
  <div className="docs-page-content">
    <h2>Resources</h2>
    
    <div className="resource-links">
      <a 
        href="https://x.com/proxima424/status/1917724539129323857" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="resource-button"
      >
        @proxima424 - Info Finance Thread
      </a>
      
      <a 
        href="https://www.polynews.in/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="resource-button"
      >
        Polynews - The Future Times
      </a>
      
      <a 
        href="https://polymarket.com/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="resource-button"
      >
        Polymarket
      </a>
      
      <a 
        href="https://kalshi.com/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="resource-button"
      >
        Kalshi
      </a>
      
      <a 
        href="https://www.youtube.com/watch?v=ngX1nIvnMOM" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="resource-button"
      >
        YouTube: Prediction Markets & Info Finance
      </a>
    </div>
    
    <p className="resources-footer">Adding more resources, dive in</p>
  </div>
);

const docsStructure = [
  { id: 'intro', title: 'Introduction', component: IntroductionContent, subpages: [
      { id: 'what-is-pnp', title: 'What is PNP Exchange?', component: WhatIsPnpContent },
      { id: 'key-features', title: 'Key Features', component: KeyFeaturesContent }
    ]
  },
  { id: 'getting-started', title: 'Getting Started', component: GettingStartedContent, subpages: [
      { id: 'quick-start', title: 'Quick Start Guide', component: QuickStartGuideContent },
      { id: 'user-reqs', title: 'User Requirements', component: UserRequirementsContent }
    ]
  },
  { id: 'core-concepts', title: 'Core Concepts', component: CoreConceptsContent, subpages: [
      { id: 'prediction-markets-101', title: 'Prediction Markets 101', component: PredictionMarkets101Content },
      { id: 'permissionless-protocols', title: 'Hall of Fame', component: PermissionlessProtocolsContent }
    ]
  },
  { id: 'protocol-architecture', title: 'Protocol Architecture', component: ProtocolArchitectureContent, subpages: [
      { id: 'system-overview', title: 'System Overview', component: SystemOverviewContent },
      { id: 'smart-contracts', title: 'Smart Contracts', component: SmartContractsContent }
    ]
  },
  { id: 'resources', title: 'Resources', component: ResourcesContent, subpages: [] }
];

// Helper to find a page/subpage component by id
const findComponentById = (id) => {
  for (const section of docsStructure) {
    if (section.id === id) return section.component;
    for (const subpage of section.subpages) {
      if (subpage.id === id) return subpage.component;
    }
  }
  return WhatIsPnpContent; // Default to the first subpage
};


const Docs = () => {
  const [activePageId, setActivePageId] = useState('what-is-pnp'); // Default to first subpage

  const ActiveComponent = findComponentById(activePageId);

  return (
    <div className="docs-container">
      <div className="docs-content">
        <nav className="modi-1 docs-nav">
          <h3>Documentation</h3>
          <ul>
            {docsStructure.map(section => (
              <li key={section.id}>
                <button 
                  onClick={() => setActivePageId(section.subpages.length > 0 ? section.subpages[0].id : section.id)}
                  className={activePageId === section.id || section.subpages.some(sp => sp.id === activePageId) ? 'nav-section-active' : ''}
                >
                  {section.title}
                </button>
                {section.subpages.length > 0 && (
                  <ul>
                    {section.subpages.map(subpage => (
                      <li key={subpage.id}>
                        <button 
                          onClick={() => setActivePageId(subpage.id)}
                          className={activePageId === subpage.id ? 'nav-link-active' : ''}
                        >
                          {subpage.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <main className="modi-2 docs-main-content">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
};

export default Docs; 