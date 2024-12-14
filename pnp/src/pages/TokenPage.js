import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createChart } from 'lightweight-charts';
import Navbar from '../components/Navbar';
import './TokenPage.css';

const validatePriceData = (data) => {
  if (!Array.isArray(data)) return false;
  return data.every(point => (
    point.hasOwnProperty('time') &&
    point.hasOwnProperty('value') &&
    typeof point.value === 'number' &&
    typeof point.time === 'string'
  ));
};

const TokenPage = () => {
  const { tokenAddress } = useParams();
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const wsRef = useRef(null);
  const [timeframe, setTimeframe] = useState('24h');
  const seriesRef = useRef(null);
  const [error, setError] = useState(null);

  // Function to fetch historical data
  const fetchHistoricalData = async () => {
    try {
      setError(null);
      const response = await fetch(`http://localhost:8080/api/prices/${tokenAddress}?timeframe=${timeframe}`);
      const data = await response.json();
      console.log('Fetched historical data:', data); // Log the fetched data

      // Validate data format
      if (!validatePriceData(data)) {
        throw new Error('Invalid data format received from API');
      }

      if (seriesRef.current) {
        seriesRef.current.setData(data);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setError('Failed to load price data');
    }
  };

  // Setup WebSocket connection
  const setupWebSocket = () => {
    const ws = new WebSocket(`ws://localhost:8080/ws/prices/${tokenAddress}`);
    
    ws.onmessage = (event) => {
      try {
        const newPrice = JSON.parse(event.data);
        
        // Validate single price point
        if (!newPrice.time || !newPrice.value || typeof newPrice.value !== 'number') {
          throw new Error('Invalid price update format');
        }

        if (seriesRef.current) {
          seriesRef.current.update({
            time: newPrice.time,
            value: newPrice.value
          });
        }
      } catch (error) {
        console.error('WebSocket data error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Real-time updates disconnected');
    };

    wsRef.current = ws;
  };

  useEffect(() => {
    if (chartContainerRef.current) {
      // Create the chart
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
        layout: {
          background: { color: '#ffffff' },
          textColor: '#333',
        },
        grid: {
          vertLines: { color: '#f0f0f0' },
          horzLines: { color: '#f0f0f0' },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: timeframe === '24h',
          tickMarkFormatter: (time) => {
            const date = new Date(time);
            if (timeframe === '24h') {
              return date.toLocaleTimeString();
            }
            return date.toLocaleDateString();
          }
        },
      });

      // Create a line series
      const lineSeries = chart.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
        priceFormat: {
          type: 'price',
          precision: 6,
          minMove: 0.000001,
        },
      });

      seriesRef.current = lineSeries;
      chartRef.current = chart;

      // Fetch initial historical data
      fetchHistoricalData();

      // Setup WebSocket for real-time updates
      setupWebSocket();

      // Handle window resize
      const handleResize = () => {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      };

      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        if (wsRef.current) {
          wsRef.current.close();
        }
        chart.remove();
      };
    }
  }, [tokenAddress, timeframe]);

  useEffect(() => {
    fetchHistoricalData();
    setupWebSocket();
    // Cleanup function
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [fetchHistoricalData, setupWebSocket]);

  return (
    <div className="token-page">
      <Navbar />
      <div className="token-content">
        <h1>Token Details</h1>
        <p>Token Address: {tokenAddress}</p>
        <div className="timeframe-selector">
          <button onClick={() => setTimeframe('24h')} className={timeframe === '24h' ? 'active' : ''}>24H</button>
          <button onClick={() => setTimeframe('7d')} className={timeframe === '7d' ? 'active' : ''}>7D</button>
          <button onClick={() => setTimeframe('30d')} className={timeframe === '30d' ? 'active' : ''}>30D</button>
          <button onClick={() => setTimeframe('1y')} className={timeframe === '1y' ? 'active' : ''}>1Y</button>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div 
          ref={chartContainerRef} 
          className="chart-container"
          style={{ width: '100%', height: '400px' }}
        />
      </div>
    </div>
  );
};

export default TokenPage;
