import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useEffect } from "react";

export default function RequireAdmin({ children }) {
  const { user, loading, isAdmin, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (user && !isAdmin) {
      signOut();
    }
  }, [user, isAdmin, signOut]);

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
