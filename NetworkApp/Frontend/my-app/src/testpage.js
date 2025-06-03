import React, { useState } from 'react';
import './css/test.css';
import { useNavigate } from 'react-router-dom';

const Test = () => {
  const navigate = useNavigate();
  const [showPorts, setShowPorts] = useState(false); // 👈 Controls visibility

  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/"); // Redirect to login
  };

  const handleGetInterface = () => {
    setShowPorts(true); // 👈 Show ports when button is clicked
  };

  return (
    <div className="test">
      {/* Navigation Bar */}
      <div className="navigation-bar">
        <div className="nav-title">5G NETWORKING<br />WEB DASHBOARD</div>
        <div className="nav-links">
          <span className="nav-item" onClick={handleLogout}>LOGOUT</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-wrapper">
        <button className="action-btn" onClick={handleGetInterface}>Get Interface</button>

        {showPorts && (
          <>
            <div className="row port-row">
              <span>Eth0</span>
              <span>SPEED-1</span>
            </div>
            <div className="row port-row">
              <span>Eth1</span>
              <span>SPEED-2</span>
            </div>
          </>
        )}

        <div className="button-group">
          <button className="action-btn">Upload</button>
          <button className="action-btn">Download</button>
        </div>
      </div>
    </div>
  );
};

export default Test;
