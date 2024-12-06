import './App.css';
import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import TokenPage from './pages/TokenPage';

function HomePage() {
  const [address, setAddress] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Navigate to token page with the entered address
    navigate(`/token/${address}`);
  };

  return (
    <div className="App">
      <Navbar />
      <div className="search-container">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="search-input"
            placeholder="Enter token address to bet on"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/token/:tokenAddress" element={<TokenPage />} />
      </Routes>
    </Router>
  );
}

export default App;
