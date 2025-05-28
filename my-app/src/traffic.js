import React from 'react'; 
import './css/traffic.css';
import { Link } from 'react-router-dom';

const Traffic = () => {
  return (
    <div className="traffic">
      {/* Navigation Bar */}
      <div className="navigation-bar">
        <div className="nav-title">TRAFFIC</div>
        <div className="nav-links">
          <Link to="/main" className="nav-item">Back</Link>
        </div>
      </div>

      {/* Traffic Blocks */}
      <div className="traffic-content">
        <div className="traffic-block">TCP Stream 1</div>
        <div className="traffic-block">Link Speed_1</div>
        <div className="traffic-block">UDP Stream 2</div>
        <div className="traffic-block">Link Speed_2</div>

        {/* Buttons */}
        <div className="traffic-buttons">
          <button className="traffic-btn">Upload</button>
          <button className="traffic-btn">Download</button>
        </div>
      </div>
    </div>
  );
};

export default Traffic;
