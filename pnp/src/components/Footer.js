import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2025 PNP Foundation.   All rights reserved.</p>
        <nav className="footer-nav">
          <a href="/about">About Us</a>
          <span>|</span>
          <a href="/contact">Instagram</a>
          <span>|</span>
          <a href="/privacy">Privacy Policy</a>
        </nav>
        <div className="social-media">
          {/* Redirect to Twitter */}
          <a href="https://x.com/predictandpump" target="_blank" rel="noopener noreferrer">
            Twitter
          </a>
          {/* Open email client to send email */}
          <a href="mailto:proxima424@pnp.exchange" target="_blank" rel="noopener noreferrer">
            Email Us
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
