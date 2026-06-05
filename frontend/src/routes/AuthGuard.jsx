/* === AUTH GUARD ===
   Protege rutas públicas (como login) de usuarios autenticados.
   Si el usuario YA está autenticado, lo redirige al home o a donde venía.
*/
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/shared/contexts';

const AuthGuard = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  // Si el usuario YA está autenticado, no puede acceder a rutas de auth (login, registro)
  if (user) {
    // Redirigir a donde venía, o al home si no viene de ningún lado
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  // Si no está autenticado, mostrar la página de login/registro
  return children;
};

export default AuthGuard;
