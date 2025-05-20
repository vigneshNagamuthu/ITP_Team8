import React from 'react';
import './css/main.css'; // Assuming the CSS is in the same folder

const Dashboard = () => {
  return (
    <div className="dashboard">
      {/* Navigation Bar */}
      <div className="navigation-bar">
        <div className="nav-title">5G NETWORKING<br />WEB DASHBOARD</div>
        <div className="nav-links">
          <span className="nav-item">DEVICES</span>
          <span className="nav-item">SETTINGS</span>
        </div>
      </div>

      {/* Bandwidth Graph Title */}
      <div className="bandwidth-header">
        <h2>Bandwidth by Application</h2>
        <div className="total-bandwidth">
          <p>Total Bandwidth</p>
          <span className="bmp">bmp</span>
        </div>
      </div>

      {/* Graph Placeholder */}
      <div className="time-series-graph">
        {/* Insert your graph component or image here */}
      </div>

      {/* Header Row */}
      <div className="row titles">
        <span>PORT NUMBER</span>
        <span>TIME SERIES</span>
        <span>BPM</span>
      </div>

      {/* Port Rows */}
      <div className="row port-row">
        <span>PORT NO.1</span>
        <span>TIME SERIES-1</span>
        <span>BPM-1</span>
      </div>

      <div className="row port-row">
        <span>PORT NO.2</span>
        <span>TIME SERIES-2</span>
        <span>BPM-2</span>
      </div>
    </div>
  );
};

export default Dashboard;
