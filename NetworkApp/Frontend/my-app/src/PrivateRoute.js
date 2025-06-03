// PrivateRoute.js
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("auth") === "true"; // or use a token

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;