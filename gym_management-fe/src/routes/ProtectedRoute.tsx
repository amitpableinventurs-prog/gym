import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps): JSX.Element => {
  const isAuthenticated = !!Cookies.get("authToken");
  if (!isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute;
