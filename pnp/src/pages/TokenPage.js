import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { createChart } from 'lightweight-charts';
import Navbar from '../components/Navbar';
import './TokenPage.css';

const TokenPage = () => {
  const { tokenAddress } = useParams();
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

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
      });

      // Create a line series
      const lineSeries = chart.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
      });

      // Sample data - replace this with actual API call to get token price data
      const sampleData = [
        { time: '2023-01-01', value: 100 },
        { time: '2023-01-02', value: 120 },
        { time: '2023-01-03', value: 110 },
        { time: '2023-01-04', value: 130 },
      ];

      lineSeries.setData(sampleData);

      // Handle window resize
      const handleResize = () => {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      };

      window.addEventListener('resize', handleResize);
      chartRef.current = chart;

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }
  }, [tokenAddress]);

  return (
    <div className="token-page">
      <Navbar />
      <div className="token-content">
        <h1>Token Details</h1>
        <p>Token Address: {tokenAddress}</p>
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
