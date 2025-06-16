import React, { useState } from 'react';
import axios from 'axios';
import './css/test.css';
import { Link } from 'react-router-dom';

const TestPage = () => {
  const [portNames, setPortNames] = useState([]);
  // Example: { enp0s3: { bitrate: "12.45 Mbps" }, ... }
  const [uploadSpeeds, setUploadSpeeds] = useState({});
  const [downloadSpeeds, setDownloadSpeeds] = useState({});
  const [error, setError] = useState('');

  const backendUrl = 'http://localhost:8080'; // Change if backend is on another machine

  const getInterfaces = async () => {
    try {
      setError('');
      const response = await axios.get(`${backendUrl}/get-interfaces`);
      setPortNames(response.data.interfaces || []);
      setUploadSpeeds({});
      setDownloadSpeeds({});
    } catch (error) {
      setError('Error fetching interfaces: ' + error.message);
      setPortNames([]);
    }
  };

  // mode: "upload" or "download"
  const getSpeedData = async (mode) => {
    try {
      setError('');
      const speeds = {};
      for (const port of portNames) {
        const response = await axios.get(
          `${backendUrl}/get-speed-data?port=${port}&mode=${mode}`
        );
        speeds[port] = response.data; // expects { bitrate: "XX.XX Mbps" }
      }
      if (mode === 'upload') {
        setUploadSpeeds(speeds);
      } else {
        setDownloadSpeeds(speeds);
      }
    } catch (error) {
      setError('Error fetching speed data: ' + error.message);
      if (mode === 'upload') setUploadSpeeds({});
      if (mode === 'download') setDownloadSpeeds({});
    }
  };

  const displayBitrate = (port, mode) => {
    const speeds = mode === 'upload' ? uploadSpeeds : downloadSpeeds;
    if (speeds[port] && speeds[port].bitrate) {
      return speeds[port].bitrate;
    }
    return 'No data yet.';
  };

  return (
    <div className="test">
      <div className="navigation-bar">
        <div className="nav-title">5G Dashboard</div>
        <div className="nav-links">
          <Link className="nav-item" to="/traffic">Traffic</Link>
          <Link className="nav-item" to="/setting">Setting</Link>
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
            <button className="action-btn" onClick={() => getSpeedData('upload')}>Upload Speed</button>
            <button className="action-btn" onClick={() => getSpeedData('download')}>Download Speed</button>
          </div>
        </div>
        {error && (
          <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>
        )}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          marginTop: '30px'
        }}>
          {[0, 1].map(i => (
            <React.Fragment key={i}>
              <div className="speed-box" style={{
                border: '1px solid #ddd',
                borderRadius: 10,
                padding: 16,
                width: '45%',
                marginBottom: 20,
                background: '#f7f7f7'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                  {portNames[i] || `Port ${i + 1}`} Upload Speed
                </div>
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  {portNames[i] ? displayBitrate(portNames[i], 'upload') : 'N/A'}
                </pre>
              </div>
              <div className="speed-box" style={{
                border: '1px solid #ddd',
                borderRadius: 10,
                padding: 16,
                width: '45%',
                marginBottom: 20,
                background: '#f7f7f7'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                  {portNames[i] || `Port ${i + 1}`} Download Speed
                </div>
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  {portNames[i] ? displayBitrate(portNames[i], 'download') : 'N/A'}
                </pre>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestPage;
