import { Navigate } from "react-router-dom";
import { getRole, getToken } from "./auth";

export default function ProtectedRoute({ children, role }) {
  const token = getToken();
  const userRole = getRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role) {
    if (Array.isArray(role)) {
      if (!role.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
      }
    } else if (userRole !== role) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}