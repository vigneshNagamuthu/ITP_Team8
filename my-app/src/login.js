import React, { useState, useEffect } from "react";
import './css/style.css';
import { useNavigate } from 'react-router-dom';


const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate(); 
 
  useEffect(() => {
    localStorage.removeItem("auth");
    window.history.pushState(null, "", "/"); // Clear browser history stack
  }, []);


  const handleLogin = (e) => {
    e.preventDefault();

    const validUsername = "admin";
    const validPassword = "11111111";

    if (username === validUsername && password === validPassword) {
      // setIsLoggedIn(true);
      localStorage.setItem("auth", "true");  
      navigate('/main');
      setError("");
    } else {
      setError("Invalid username or password.");
      setIsLoggedIn(false);
    }
  };

  return (
    <main style={{ height: "300px", fontFamily: "'Montserrat', sans-serif" }}>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />

      <div className="form-wrapper">
        <form onSubmit={handleLogin}>
          <fieldset className="membership">
            <legend><b>Login</b></legend>

            <div>
              <label>Username:</label>
              <br />
              <input
                type="text"
                name="username"
                required
                placeholder="Please enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label>Password:</label>
              <br />
              <input
                type="password"
                name="password"
                required
                pattern="[0-9]{8}"
                placeholder="Please enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                title="Password must be 8 characters long"
              />
            </div>

            <button type="submit" className="login">
              Login
            </button>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {isLoggedIn && <p style={{ color: "green" }}>Login successful!</p>}
          </fieldset>
        </form>
      </div>
    </main>
  );
};

export default Login;
