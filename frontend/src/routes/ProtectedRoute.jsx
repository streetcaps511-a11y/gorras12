// src/routes/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/shared/contexts';

const ProtectedRoute = ({
  children,
  requireStaff = true,
  disallowStaff = false,
  staffRedirectTo = "/login",
}) => {
  const { user, isStaff, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 🛡️ BLOQUEAR BOTÓN "ATRÁS"
  useEffect(() => {
    if (requireStaff && isStaff) {
      const preventBackNavigation = () => {
        navigate('/admin/dashboard', { replace: true });
      };

      window.addEventListener('popstate', preventBackNavigation);
      window.history.pushState(null, '', window.location.href);

      return () => {
        window.removeEventListener('popstate', preventBackNavigation);
      };
    }
  }, [requireStaff, isStaff, navigate, location.pathname]);

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (disallowStaff && isStaff) {
    return <Navigate to={staffRedirectTo} replace />;
  }

  if (requireStaff && !isStaff) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

export default ProtectedRoute;