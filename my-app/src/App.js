//import logo from './logo.svg';
import './App.css';
import Login from "./login";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from "./main";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<Main />} />
      </Routes>
    </Router>
  );
}

export default App;
