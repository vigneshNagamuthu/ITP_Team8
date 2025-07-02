import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend
} from 'recharts';

function App() {
  const [username, setUsername] = useState('');
  const [sysinfo, setSysinfo] = useState('');
  const [loadingSysinfo, setLoadingSysinfo] = useState(false);
  const [interfaces, setInterfaces] = useState([]);
  const [iperfInterfacesInput, setIperfInterfacesInput] = useState('');
  const [iperfResults, setIperfResults] = useState([]);

  const fetchUsername = async () => {
    try {
      const response = await fetch('http://localhost:8080/whoami');
      const text = await response.text();
      setUsername(text);
    } catch (error) {
      setUsername('Error fetching username');
    }
  };

  const fetchSysInfo = async () => {
    setLoadingSysinfo(true);
    setSysinfo('');
    try {
      const response = await fetch('http://localhost:8080/sysinfo');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const text = await response.text();
      setSysinfo(text);
    } catch (error) {
      setSysinfo('Error fetching system info: ' + error.message);
    }
    setLoadingSysinfo(false);
  };

  const runIperfTest = async () => {
    const ifaces = iperfInterfacesInput
      .split(',')
      .map(name => name.trim())
      .filter(Boolean);

    if (ifaces.length === 0) {
      alert("Please enter at least one interface name.");
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/iperf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interfaces: ifaces }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setIperfResults(data);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.error("iPerf test failed:", error);
      alert("iPerf test failed: " + error.message);
    }
  };

  const handleIpChange = (index, field, value) => {
    setInterfaces(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addInterface = () => {
    setInterfaces(prev => [...prev, { name: '', staticIp: '', userIp: '' }]);
  };

  const removeInterface = index => {
    setInterfaces(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    alert('Interfaces data:\n' + JSON.stringify(interfaces, null, 2));
  };

  return (
    <div style={{ padding: 20, maxWidth: 700 }}>
      <h1>Whoami React App</h1>

      <button onClick={fetchUsername}>Get Current User</button>
      {username && <p><strong>User:</strong> {username}</p>}

      <hr style={{ margin: '20px 0' }} />

      <button onClick={fetchSysInfo} disabled={loadingSysinfo}>
        {loadingSysinfo ? 'Loading System Info...' : 'Check System Info'}
      </button>
      {sysinfo && (
        <pre style={{ whiteSpace: 'pre-wrap', marginTop: 10 }}>{sysinfo}</pre>
      )}

      <hr style={{ margin: '20px 0' }} />

      <h2>iPerf Speed Test</h2>

      <p>Enter interface names to test (e.g., <code>eth0,eno1</code>):</p>

      <input
        type="text"
        value={iperfInterfacesInput}
        onChange={e => setIperfInterfacesInput(e.target.value)}
        placeholder="e.g. eth0,eno1"
        style={{ width: '100%', maxWidth: 400, padding: 8, marginBottom: 10 }}
      />

      <button onClick={runIperfTest}>Run iPerf Test</button>

      {iperfResults.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>iPerf Speed Results</h3>
          <LineChart
            width={650}
            height={300}
            data={iperfResults[0].data.map((_, i) => {
              const row = { time: i };
              iperfResults.forEach(({ name, data }) => {
                row[name] = data[i].speed;
              });
              return row;
            })}
          >
            <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Speed (Mbps)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            {iperfResults.map(({ name }) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
              />
            ))}
          </LineChart>
        </div>
      )}

      <hr style={{ margin: '30px 0' }} />

      <h2>Traffic Controller</h2>
      {interfaces.length === 0 && <p>No interfaces. Click "Add Interface" to add rows.</p>}

      {interfaces.length > 0 && (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={thStyle}>Interface Name</th>
              <th style={thStyle}>Static IP</th>
              <th style={thStyle}>IP Address (User Input)</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {interfaces.map(({ name, staticIp, userIp }, i) => (
              <tr key={i}>
                <td style={tdStyle}>
                  <input
                    type="text"
                    value={name}
                    onChange={e => handleIpChange(i, 'name', e.target.value)}
                    style={inputStyle}
                    placeholder="Interface name"
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    type="text"
                    value={staticIp}
                    onChange={e => handleIpChange(i, 'staticIp', e.target.value)}
                    style={inputStyle}
                    placeholder="Static IP"
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    type="text"
                    value={userIp}
                    onChange={e => handleIpChange(i, 'userIp', e.target.value)}
                    style={inputStyle}
                    placeholder="IP address"
                  />
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => removeInterface(i)}
                    style={{ color: 'red' }}
                    title="Remove this interface"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button onClick={addInterface} style={{ marginTop: 12 }}>
        + Add Interface
      </button>

      {interfaces.length > 0 && (
        <button onClick={handleSubmit} style={{ marginTop: 12, marginLeft: 12 }}>
          Submit Interfaces
        </button>
      )}
    </div>
  );
}

const thStyle = {
  border: '1px solid #ddd',
  padding: '8px',
  backgroundColor: '#f2f2f2',
  textAlign: 'left',
};

const tdStyle = {
  border: '1px solid #ddd',
  padding: '8px',
};

const inputStyle = {
  width: '100%',
  padding: '6px',
  boxSizing: 'border-box',
};

export default App;
