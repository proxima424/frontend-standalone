import "./Roadmap.css";
import React, { useState } from "react";
import { MapPin, Calendar, ChevronRight, Layers } from "lucide-react";

function Roadmap() {
  // State to track active tab
  const [activeTab, setActiveTab] = useState("phase1");

  const phases = [
    {
      id: "phase1",
      title: "Phase 1: Foundation & Testing",
      description: "Core development, testing, and initial launches",
      timeframe: "Q1 2025",
      milestones: [
        {
          title: "Solana Devnet Launch",
          description: [
            "Rewrite Smart Contracts for SVM with E2E Testing",
            "Deployment on Solana Devnet",
          ],
          status: "in-progress",
          date: "Jan 2025",
        },
        {
          title: "X Bot Launch",
          description: [
            "Launch v1 of PNP X bot - Requires $PNP to interact ) ",
            "Add analytics features to PNP Bot",
          ],
          status: "in-progress",
          date: "Feb 2025",
        },
        {
          title: "UI Enhancement",
          description: [
            "Search bar for creating markets by a single prompt",
            "Iterative UI improvements",
            "Focusing on optimal positioning for Solana mainnet",
          ],
          status: "in-progress",
          date: "Feb 2025",
        },
        {
          title: "PolyNews V1",
          description: [
            "Newspaper-style interface displaying future news powered by prediction market questions and outcomes.",
            "Future analytics platform features accessible by holding $PNP."
          ],
          status: "planned",
          date: "Mar 2025",
        },
        {
          title: "Solana Audit",
          description: [
            "Prepare and submit Solana contracts for comprehensive security audit",
          ],
          status: "planned",
          date: "Mar 2025",
        },
        {
          title: "$PNP Utility",
          description: [
            "A portion of protocol-generated revenue will be utilized for $PNP token buybacks and burns",
            "A comprehensive schedule detailing the token burn mechanics and frequency will be publicly released in the near future."
          ],
          status: "planned", 
          date: "Ongoing"
        }
      ]
    },
    {
      id: "phase2",
      title: "Phase 2: Mainnet Integration",
      description: "Mainnet deployment and advanced features",
      timeframe: "Q2 2025",
      milestones: [
        {
          title: "Solana Mainnet Launch",
          description: ["Deployment of smart contracts on Solana mainnet"],
          status: "planned",
          date: "Apr 2025",
        },
        {
          title: "X Bot Markets Integration",
          description: [
            "Enable market creation directly through X ",
          ],
          status: "planned",
          date: "May 2025",
        },
        {
          title: "🤫 Stealth Project Reveal",
          description: ["Details to be announced soon! Get ready for something exciting."],
          status: "planned",
          date: "June 2025",
        },
      ],
    },
    {
      id: "phase3",
      title: "Phase 3: Platform Expansion",
      description: "Global expansion and community growth",
      timeframe: "Q3 2025",
      milestones: [
        {
          title: "Platform Enhancement",
          description: [
            "Launch full-fledged Solana app with comprehensive prediction markets and analytics dashboard",
          ],
          status: "planned",
          date: "Jul 2025",
        },
        {
          title: "PolyNews Expansion",
          description: [
            "Major PolyNews upgrade with advanced features and full $PNP integration",
          ],
          status: "planned",
          date: "Jul 2025",
        },
        {
          title: "Community Growth",
          description: [
            "Launch reward games and community initiatives on Telegram and X",
          ],
          status: "planned",
          date: "Aug 2025",
        },
        {
          title: "Global Outreach",
          description: [
            "Begin worldwide on-ground promotions and increase platform usage globally",
          ],
          status: "planned",
          date: "Sep 2025",
        },
      ],
    },
  ];

  const StatusBadge = ({ status }) => {
    const getStatusStyles = () => {
      switch (status) {
        case "completed":
          return "status-badge completed";
        case "in-progress":
          return "status-badge in-progress";
        case "planned":
        default:
          return "status-badge planned";
      }
    };

    return (
      <span className={getStatusStyles()}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="roadmap-container">
      <div className="roadmap-content">
        <header className="roadmap-header">
          <h1 className="roadmap-title">Project Roadmap</h1>
          <p className="roadmap-subtitle">
            Our strategic plan for development and delivery, outlining key
            milestones and timelines.
          </p>
        </header>

        <div className="tabs-container">
          <div className="tabs-list">
            {phases.map((phase) => (
              <button
                key={phase.id}
                className={`tab-button ${activeTab === phase.id ? "active" : ""}`}
                onClick={() => setActiveTab(phase.id)}
              >
                {phase.title.split(":")[0]}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {phases.map((phase) => (
              <div
                key={phase.id}
                className={`phase-content ${activeTab === phase.id ? "active" : ""}`}
              >
                <div className="phase-header">
                  <div className="phase-title-container">
                    <Layers className="phase-icon" />
                    <h2 className="phase-title">{phase.title}</h2>
                  </div>
                  <div className="phase-timeframe">
                    <Calendar className="timeframe-icon" />
                    <span>
                      {phase.id === 'phase1' && (
                        <strong>End: End of May 2025</strong>
                      )}
                      {phase.id === 'phase2' && (
                        <strong>End: Mid June 2025</strong>
                      )}
                    </span>
                  </div>
                  <p className="phase-description">{phase.description}</p>
                </div>

                <div className="milestones-grid">
                  {phase.milestones.map((milestone, index) => (
                    <div key={index} className="milestone-card">
                      <div className="milestone-header">
                        <div className="milestone-title-container">
                          <h3 className="milestone-title">{milestone.title}</h3>
                          <StatusBadge status={milestone.status} />
                        </div>
                      </div>
                      <div className="milestone-content">
                        <ul style={{ listStyle: 'none', paddingLeft: '0', color: '#d1d1d1' }}>
                          {milestone.description.map((point, i) => (
                            <li key={i} style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start' }}>
                              <ChevronRight size={18} style={{ marginRight: '0.5rem', color: '#ff8da1', flexShrink: 0, marginTop: '2px' }} />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="current-focus">
          <div className="focus-badge">
            <MapPin className="focus-icon" />
            <span>Current Focus: Q1 2025 Objectives</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Roadmap;
