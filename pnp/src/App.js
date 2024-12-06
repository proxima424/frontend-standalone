import './App.css';
import { useState } from 'react';
import Navbar from './components/Navbar';

function App() {
  const [address, setAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle the blockchain address here
    console.log('Submitted address:', address);
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

export default App;
