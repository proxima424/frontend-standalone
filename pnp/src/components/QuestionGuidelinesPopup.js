import React from 'react';
import './QuestionGuidelinesPopup.css';

const QuestionGuidelinesPopup = ({ onClose }) => {
  return (
    <div className="question-guidelines-popup-overlay">
      <div className="question-guidelines-popup-content">
        <button className="question-guidelines-popup-close" onClick={onClose}>
          &times;
        </button>
        <h2>Guidelines for Making Better Markets</h2>
        <ul>
          <li>Coming soon...</li>
          <li>Coming soon...</li>
          <li>Coming soon...</li>
          <li>Coming soon...</li>
          <li>Coming soon...</li>
        </ul>
      </div>
    </div>
  );
};

export default QuestionGuidelinesPopup; 