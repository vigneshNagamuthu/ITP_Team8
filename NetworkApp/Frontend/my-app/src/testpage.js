import React, { useState } from 'react';
import axios from 'axios';
import './css/test.css';
import { Link } from 'react-router-dom';  // Add this import

const TestPage = () => {
  const [portNames, setPortNames] = useState([]);
  const [speedData, setSpeedData] = useState({ port1: '', port2: '' });

  const getInterfaces = async () => {
    try {
      const response = await axios.get('http://YOUR_PI_IP:8080/get-interfaces');
      setPortNames(response.data.interfaces || []);
    } catch (error) {
      console.error('Error fetching interfaces:', error);
    }
  };

  const getSpeedData = async () => {
    try {
      const [port1Res, port2Res] = await Promise.all([
        axios.get('http://YOUR_PI_IP:8080/get-speed-data?port=eth0'),
        axios.get('http://YOUR_PI_IP:8080/get-speed-data?port=eth1'),
      ]);
      setSpeedData({
        port1: port1Res.data.output || '',
        port2: port2Res.data.output || '',
      });
    } catch (error) {
      console.error('Error fetching speed data:', error);
    }
  };

  return (
    <div className="test">
      <div className="navigation-bar">
        <div className="nav-title">5G Dashboard</div>
        <div className="nav-links">
          <Link className="nav-item" to="/traffic">Traffic</Link>
          <Link className="nav-item" to="/setting">Setting</Link> {/* Corrected path */}
        </div>
      </div>

      <div className="content-wrapper">
        <div className="button-section">
          <button className="action-button" onClick={getInterfaces}>Get Interface</button>
          <div className="row port-row">
            <div className="port-name"><strong>Port 1:</strong> {portNames[0] || 'N/A'}</div>
            <div className="port-name"><strong>Port 2:</strong> {portNames[1] || 'N/A'}</div>
          </div>

          <div className="button-group">
            <button className="action-btn" onClick={getSpeedData}>Upload Speed</button>
            <button className="action-btn" onClick={getSpeedData}>Download Speed</button>
          </div>
        </div>

        <div className="row port-row" style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: '30px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Port 1 Speed Details</div>
          <pre>{speedData.port1 || 'Click the buttons to fetch data.'}</pre>
        </div>
        <div className="row port-row" style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: '20px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Port 2 Speed Details</div>
          <pre>{speedData.port2 || 'Click the buttons to fetch data.'}</pre>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
