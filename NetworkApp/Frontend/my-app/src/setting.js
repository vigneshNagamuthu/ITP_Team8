import React from 'react';
import './css/setting.css';
import { Link } from 'react-router-dom';

const Setting = () => {
  return (
    <div className="setting">
      {/* Navigation Bar */}
      <div className="navigation-bar">
        <div className="nav-title">SETTING</div>
        <div className="nav-links">
          <Link to="/main" className="nav-item">Back</Link>
        </div>
      </div>

      {/* Interface Section */}
      <div className="interface-container">
        {/* IF_1 */}
        <div classname="IF1-container">
          <div className="interface-block if1">
            <div className="interface-label">IF_1</div>
            <div className="add-btn">+</div>
          </div>
          <div className="interface-entry entry1">
            <span>wiki</span>
            <span>192.0.2.1</span>
          </div>
        </div>
        

        {/* IF_2 */}
        <div classname="IF2-container">
          <div className="interface-block if2">
            <div className="interface-label">IF_2</div>
            <div className="add-btn">+</div>
          </div>
          <div className="interface-entry entry2">
            <span>Github</span>
            <span>140.82.112.0/20</span>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Setting;
