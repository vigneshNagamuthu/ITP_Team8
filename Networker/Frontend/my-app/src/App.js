import React, { useEffect, useState } from 'react';

function App() {
  const [interfaces, setInterfaces] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/interfaces')
      .then(res => {
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        return res.text();
      })
      .then(data => {
        setInterfaces(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading interfaces...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <pre style={{
      backgroundColor: '#f0f0f0',
      padding: '1rem',
      fontFamily: 'monospace',
      borderRadius: '5px',
      margin: '1rem'
    }}>
      {interfaces}
    </pre>
  );
}

export default App;
