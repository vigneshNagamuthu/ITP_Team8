import React, { useState } from 'react';
import axios from 'axios';
import './css/test.css';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

const TestPage = () => {
  const [portNames, setPortNames] = useState([]);
  const [uploadSpeeds, setUploadSpeeds] = useState({});
  const [downloadSpeeds, setDownloadSpeeds] = useState({});
  const [trafficDestinations, setTrafficDestinations] = useState([]);
  const [error, setError] = useState('');

  const backendUrl = 'http://localhost:8080'; 

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

  const getSpeedData = async (mode) => {
    try {
      setError('');
      const speeds = {};
      for (const port of portNames) {
        const response = await axios.get(`${backendUrl}/get-speed-data?port=${port}&mode=${mode}`);
        speeds[port] = {
          bitrate: response.data.bitrate,
          series: response.data.series || []
        };
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

  const getTrafficAnalysis = async () => {
    try {
      setError('');
      const response = await axios.get(`${backendUrl}/traffic-analysis`);
      setTrafficDestinations(response.data.destinations || []);
    } catch (error) {
      setError('Error running traffic analysis: ' + error.message);
      setTrafficDestinations([]);
    }
  };

  const SpeedGraph = ({ data, title }) => {
    const chartData = data.map((val, index) => ({
      second: index + 1,
      speed: val
    }));

    return (
      <div style={{ marginTop: 20 }}>
        <h4>{title}</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="second" label={{ value: 'Second', position: 'insideBottomRight' }} />
            <YAxis label={{ value: 'Mbps', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line type="monotone" dataKey="speed" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
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

        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: '30px' }}>
          {[0, 1].map(i => (
            <React.Fragment key={i}>
              {/* Upload Speed Box */}
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
                {portNames[i] && uploadSpeeds[portNames[i]]?.series?.length > 0 && (
                  <SpeedGraph
                    data={uploadSpeeds[portNames[i]].series}
                    title={`Upload Speed Over Time (${portNames[i]})`}
                  />
                )}
              </div>

              {/* Download Speed Box */}
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
                {portNames[i] && downloadSpeeds[portNames[i]]?.series?.length > 0 && (
                  <SpeedGraph
                    data={downloadSpeeds[portNames[i]].series}
                    title={`Download Speed Over Time (${portNames[i]})`}
                  />
                )}
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* New Section: Traffic Analysis */}
        <div className="traffic-analysis-section" style={{ marginTop: '30px' }}>
          <button className="action-button" onClick={getTrafficAnalysis}>Traffic Analysis</button>
          <div className="traffic-results" style={{
            border: '1px solid #ccc',
            borderRadius: 10,
            padding: 16,
            marginTop: 10,
            background: '#f0f0f0'
          }}>
            <h4>Destination IPs Captured (5s):</h4>
            {trafficDestinations.length > 0 ? (
              <ul>
                {trafficDestinations.map((dest, idx) => (
                  <li key={idx}>{dest}</li>
                ))}
              </ul>
            ) : (
              <p>No traffic data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
