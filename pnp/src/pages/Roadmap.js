import "./Roadmap.css";
import React, { useState, useEffect } from "react";
import { MapPin, Calendar, ChevronRight, Layers, CheckCircle, Clock, Calendar as CalendarIcon } from "lucide-react";

function Roadmap() {
  const [activeTab, setActiveTab] = useState("phase1");
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
        }
      });
    }, observerOptions);

    document.querySelectorAll('.milestone-card').forEach(card => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, [activeTab]);

  const phases = [
    {
      id: "phase1",
      title: "Phase 1: Foundation & Testing",
      description: "Core development, testing, and initial launches",
      timeframe: "Q1 2025",
      progress: 45,
      milestones: [
        {
          title: "Solana Devnet Launch",
          description: [
            "Rewrite Smart Contracts for SVM with E2E Testing.",
            "Deployment on Solana Devnet.",
          ],
          status: "in-progress",
          date: "Jan 2025",
        },
        {
          title: "X Bot Launch",
          description: [
            "Launch v1 of PNP X bot - Requires $PNP to interact.",
            "Add analytical features to the PNP Bot with real time access to all prediction markets",
          ],
          status: "in-progress",
          date: "Feb 2025",
        },
        {
          title: "UI Enhancement",
          description: [
            "Search bar for creating markets with a single prompt.",
            "Iterative UI improvements.",
            "Focusing on optimal positioning for Solana mainnet.",
          ],
          status: "in-progress",
          date: "Feb 2025",
        },
        {
          title: "PolyNews V1",
          description: [
            "Newspaper-style interface displaying future news powered by prediction market questions and outcomes.",
            "Future analytics platform features accessible by holding $PNP.",
          ],
          status: "planned",
          date: "Mar 2025",
        },
        {
          title: "Solana Audit",
          description: [
            "Prepare and submit Solana contracts for a comprehensive security audit.",
          ],
          status: "planned",
          date: "Mar 2025",
        },
        {
          title: "$PNP Utility",
          description: [
            "A portion of protocol-generated revenue will be used for $PNP token buybacks and burns.",
            "A comprehensive schedule detailing the token burn mechanics and frequency will be publicly released in the near future.",
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
      progress: 10,
      milestones: [
        {
          title: "Solana Mainnet Launch",
          description: ["Deployment of smart contracts on Solana mainnet."],
          status: "planned",
          date: "Apr 2025",
        },
        {
          title: "X Bot Markets Integration",
          description: [
            "Enable market creation directly through X.",
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
      progress: 0,
      milestones: [
        {
          title: "Platform Enhancement",
          description: [
            "Launch a full-fledged Solana app with a comprehensive prediction markets and analytics dashboard.",
          ],
          status: "planned",
          date: "Jul 2025",
        },
        {
          title: "PolyNews Expansion",
          description: [
            "Major PolyNews upgrade with advanced features and full $PNP integration.",
          ],
          status: "planned",
          date: "Jul 2025",
        },
        {
          title: "Community Growth",
          description: [
            "Launch reward games and community initiatives on Telegram and X.",
          ],
          status: "planned",
          date: "Aug 2025",
        },
        {
          title: "Global Outreach",
          description: [
            "Begin worldwide on-ground promotions and increase platform usage globally.",
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

    const StatusIcon = () => {
      switch (status) {
        case "completed":
          return <CheckCircle size={12} className="status-icon" />;
        case "in-progress":
          return <Clock size={12} className="status-icon" />;
        case "planned":
        default:
          return <CalendarIcon size={12} className="status-icon" />;
      }
    };

    return (
      <span className={getStatusStyles()}>
        <StatusIcon />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const activePhase = phases.find(phase => phase.id === activeTab);
  
  return (
    <div className="roadmap-container">
      <div className="roadmap-content">
        <header className="roadmap-header">
          <div className="title-wrapper">
            <h1 className="roadmap-title">Project Roadmap</h1>
            <div className="title-accent"></div>
          </div>
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
                <span className="tab-title">{phase.title.split(":")[0]}</span>
                <div className="progress-indicator">
                  <div className="progress-bar" style={{ width: `${phase.progress}%` }}></div>
                  <span className="progress-text">{phase.progress}%</span>
                </div>
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
                        <strong>Timeline: January - May 2025</strong>
                      )}
                      {phase.id === 'phase2' && (
                        <strong>Timeline: April - June 2025</strong>
                      )}
                      {phase.id === 'phase3' && (
                        <strong>Timeline: July - September 2025</strong>
                      )}
                    </span>
                  </div>
                  <p className="phase-description">{phase.description}</p>
                </div>

                <div className="milestones-grid">
                  {phase.milestones.map((milestone, index) => (
                    <div 
                      id={`${phase.id}-milestone-${index}`} 
                      key={index} 
                      className={`milestone-card ${isVisible[`${phase.id}-milestone-${index}`] ? 'visible' : ''}`}
                      style={{ animationDelay: `${index * 0.15}s` }}
                    >
                      <div className="milestone-header">
                        <div className="milestone-title-container">
                          <h3 className="milestone-title">{milestone.title}</h3>
                          <StatusBadge status={milestone.status} />
                        </div>
                        <div className="milestone-date">
                          <Calendar size={14} className="date-icon" />
                          <span>{milestone.date}</span>
                        </div>
                      </div>
                      <div className="milestone-content">
                        <ul className="milestone-list">
                          {milestone.description.map((point, i) => (
                            <li key={i} className="milestone-list-item">
                              <ChevronRight size={18} className="list-icon" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className={`milestone-glow ${milestone.status}`}></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="roadmap-timeline">
          <div className="timeline-container">
            <div className="timeline-track">
              {phases.map((phase, index) => (
                <div 
                  key={phase.id} 
                  className={`timeline-node ${activeTab === phase.id ? 'active' : ''} ${index === 0 ? 'first' : ''} ${index === phases.length - 1 ? 'last' : ''}`}
                  onClick={() => setActiveTab(phase.id)}
                >
                  <div className="node-dot">
                    {activeTab === phase.id && <div className="node-pulse"></div>}
                  </div>
                  <div className="node-label">{phase.title.split(":")[0]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="current-focus">
          <div className="focus-badge">
            <MapPin className="focus-icon" />
            <span>Current Focus: {activePhase ? activePhase.title.split(":")[1].trim() : ""}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Roadmap;