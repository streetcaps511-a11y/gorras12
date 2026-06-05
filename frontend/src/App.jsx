import React, { Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SearchProvider, CartProvider } from "./features/shared/contexts";
import { Header, Footer } from "./features/shared/services";
import AppRoutes from "./routes/AppRoutes";

const AppContent = () => {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Ocultar Header/Footer en Admin y Auth
  const showHeader =
    !location.pathname.startsWith("/admin") &&
    location.pathname !== "/login" &&
    location.pathname !== "/reset-password";

  return (
    <div className="app-root-container">
      {showHeader && <Header />}
      
      <main className="app-main-content">
        {/* Suspense global para manejar la carga de rutas lazy */}
        <Suspense fallback={
          <div style={{ 
            minHeight: '80vh', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            color: '#666'
          }}>
            Preparando interfaz...
          </div>
        }>
          <AppRoutes />
        </Suspense>
      </main>
      
      {showHeader && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <SearchProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </SearchProvider>
  );
}