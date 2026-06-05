import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../features/shared/contexts";
import { STORE_ROUTES } from "./config";
import { AdminLayout, AccessDenied } from "../features/shared/services";
import ProtectedRoute from "./ProtectedRoute";
import AuthGuard from "./AuthGuard";

// 🔥 LAZY LOADING para componentes pesados
const Home = lazy(() => import("../features/tienda/Home/pages/Home"));
const Login = lazy(() => import("../features/auth/pages/Login"));
const ResetPassword = lazy(() => import("../features/auth/pages/ResetPassword"));

// Admin pages - carga directa desde sus rutas
const AdminDashboard = lazy(() => import("../features/admin/dashboard/pages/AdminDashboard"));
const ProductosPage = lazy(() => import("../features/admin/Productos/pages/ProductosPage"));
const ClientesPage = lazy(() => import("../features/admin/ClientesPage/pages/ClientesPage"));
const ComprasPage = lazy(() => import("../features/admin/ComprasPage/pages/ComprasPage"));
const DevolucionesPage = lazy(() => import("../features/admin/DevolucionesPage/pages/DevolucionesPage"));
const ProveedoresPage = lazy(() => import("../features/admin/ProveedoresPage/pages/ProveedoresPage"));
const RolesPage = lazy(() => import("../features/admin/RolesPage/pages/RolesPage"));
const UsersPage = lazy(() => import("../features/admin/UsersPage/pages/UsersPage"));
const VentasPage = lazy(() => import("../features/admin/VentasPage/pages/VentasPage"));
const AdminCategorias = lazy(() => import("../features/admin/Categorias/pages/Categorias"));

const PageLoader = () => (
  <div style={{ 
    minHeight: '100vh', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    background: '#0f172a'
  }}>
  </div>
);

const AppRoutes = () => {
  const { isStaff } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* 🎯 RUTA RAÍZ INTELIGENTE */}
        <Route
          path="/"
          element={
            isStaff ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Home />
            )
          }
        />

        {/* 🛍️ RUTAS DE LA TIENDA - Mapeo de STORE_ROUTES */}
        {STORE_ROUTES
          .filter(route => route.path !== '/')  // Filtramos "/" para no duplicar
          .map((route) => {
            const clientOnlyPaths = ['/perfil', '/mis-pedidos'];
            const authPaths = ['/login', '/reset-password'];
            const isClientOnly = clientOnlyPaths.includes(route.path);
            const isAuthPath = authPaths.includes(route.path);

            return (
              <Route 
                key={route.path} 
                path={route.path} 
                element={
                  <Suspense fallback={<PageLoader />}>
                    {isClientOnly ? (
                      <ProtectedRoute requireStaff={false} disallowStaff staffRedirectTo="/login">
                        {route.element}
                      </ProtectedRoute>
                    ) : isAuthPath ? (
                      <AuthGuard>
                        {route.element}
                      </AuthGuard>
                    ) : (
                      route.element
                    )}
                  </Suspense>
                } 
              />
            );
          })}

        {/* 🔐 RUTAS DE ADMINISTRACIÓN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="productos" element={<ProductosPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="compras" element={<ComprasPage />} />
          <Route path="devoluciones" element={<DevolucionesPage />} />
          <Route path="proveedores" element={<ProveedoresPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="ventas" element={<VentasPage />} />
          <Route path="categorias" element={<AdminCategorias />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* ❌ RUTAS DE ERROR */}
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;