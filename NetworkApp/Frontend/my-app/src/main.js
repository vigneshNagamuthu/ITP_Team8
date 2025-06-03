import React from 'react';
import './css/main.css';
import { Link, useNavigate } from 'react-router-dom';


const Dashboard = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/"); // Redirect to login
  };
  
  return (
    <div className="dashboard">
      {/* Navigation Bar */}
      <div className="navigation-bar">
        <div className="nav-title">5G NETWORKING<br />WEB DASHBOARD</div>
        <div className="nav-links">
          <Link to="/traffic" className="nav-item">TRAFFIC</Link>
          <Link to="/setting" className="nav-item">SETTING</Link>
          <span className="nav-item" onClick={handleLogout}>LOGOUT</span>
        </div>
      </div>

      {/* Bandwidth Graph Title */}
      <div className="bandwidth-header">
        <h2>Bandwidth by Application</h2>
        <div className="total-bandwidth">
          <p>Total Bandwidth</p>
          <span className="bmp">bpm</span>
        </div>
      </div>

      {/* Graph Placeholder */}
      <div className="time-series-graph">
        {/* Insert your graph component or image here */}
      </div>

      {/* Header Row */}
      <div className="row titles">
        <span>PORT NUMBER</span>
        <span>SPEED</span>
      </div>

      {/* Port Rows */}
      <div className="row port-row">
        <span>PORT NO.1</span>
        <span>SPEED-1</span>
      </div>

      <div className="row port-row">
        <span>PORT NO.2</span>
        <span>SPEED-2</span>
      </div>
    </div>
  );
};

export default Dashboard;