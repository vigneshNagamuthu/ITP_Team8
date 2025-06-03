//import logo from './logo.svg';
import './App.css';
import Login from "./login";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from "./main";
import Traffic from "./traffic";
import Setting from "./setting";
import PrivateRoute from './PrivateRoute';
import TestPage from "./testpage";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/test" element={<TestPage />} /> 
        <Route path="/main" 
          element={
            <PrivateRoute>
              <Main />
            </PrivateRoute>
          } 
        />
        <Route path="/traffic" element={
          <PrivateRoute>
            <Traffic />
          </PrivateRoute>
        } />
        <Route path="/setting" 
          element={
            <PrivateRoute>
              <Setting />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
