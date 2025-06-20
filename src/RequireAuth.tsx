import { Navigate } from "react-router-dom";

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = localStorage.getItem("authenticated") === "1";
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default RequireAuth;
