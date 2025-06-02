import React, { useState } from 'react';

function App() {
  const [username, setUsername] = useState('');

  const fetchUsername = async () => {
    try {
      const response = await fetch('http://localhost:8080/whoami');
      const text = await response.text();
      setUsername(text);
    } catch (error) {
      setUsername('Error fetching username');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Whoami React App</h1>
      <button onClick={fetchUsername}>Get Current User</button>
      {username && (
        <p><strong>{username}</strong></p>
      )}
    </div>
  );
}

export default App;
