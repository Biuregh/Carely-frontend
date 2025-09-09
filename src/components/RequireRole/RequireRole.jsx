import { useContext } from "react";
import { Navigate } from "react-router";
import { UserContext } from "../../contexts/UserContext.jsx";

function RequireRole({ roles, children }) {
  const { user } = useContext(UserContext);
  return roles.includes(user?.role) ? children : <Navigate to="/" replace />;
}

export default RequireRole;
