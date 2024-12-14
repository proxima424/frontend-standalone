import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Spline from '@splinetool/react-spline';

function HomePage() {
  return (
    <div className="main-container">
      <div className="content">
        <div className="title-container">
          <h1 className="title">Permissionless</h1>
          <h1 className="title poppins-font">Prediction</h1>
          <h1 className="title poppins-font">Markets</h1>
        </div>
        <Spline scene="https://prod.spline.design/6ldcqpsBFd-EJkRh/scene.splinecode" />
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route 
        path="/token/:tokenAddress" 
        element={<Spline scene="https://prod.spline.design/DgI5mbX9cHYbIT7F/scene.splinecode" />} 
      />
    </Routes>
  );
}

export default AppRoutes;
