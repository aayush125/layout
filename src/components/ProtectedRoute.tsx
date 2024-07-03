import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  onUnauthorizedAccess: () => void;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  onUnauthorizedAccess,
}) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      onUnauthorizedAccess();
      navigate("/", { replace: true });
    }
  }, [user, loading, onUnauthorizedAccess, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <Outlet /> : null;
};

export default ProtectedRoute;
