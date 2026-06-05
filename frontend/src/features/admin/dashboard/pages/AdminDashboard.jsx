/* === PÁGINA PRINCIPAL ===
Este componente es la interfaz visual principal de la ruta.
Se encarga de dibujar el HTML/JSX e invoca el Hook para obtener todas las funciones y estados necesarios. */
import '../style/AdminDashboard.css';
import React, { useCallback, useState, useEffect } from "react";
import { FaSyncAlt } from "react-icons/fa";

// Hooks
import {
  useDashboardData,
  useSalesByMonth,
  usePurchasesByMonth,
  useTopProducts,
  useTopCustomers,
  getMonthName
} from '../hooks';

// Componentes
import { 
  SalesChart, 
  PurchasesChart, 
  TopProductsList, 
  FrequentCustomersList
} from '../components';

/**
Página principal del dashboard del admin
Conectada a API, con filtros de fecha que persisten al navegar
*/
const AdminDashboard = () => {
  // Filtros que persisten usando sessionStorage
  const [selectedDay, setSelectedDay] = useState(() => sessionStorage.getItem('dashboard_day') || "");
  const [selectedMonth, setSelectedMonth] = useState(() => sessionStorage.getItem('dashboard_month') || "");
  const [selectedYear, setSelectedYear] = useState(() => sessionStorage.getItem('dashboard_year') || new Date().getFullYear().toString());

  // Guardar filtros en sessionStorage cuando cambien
  useEffect(() => {
    sessionStorage.setItem('dashboard_day', selectedDay);
  }, [selectedDay]);

  useEffect(() => {
    sessionStorage.setItem('dashboard_month', selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    sessionStorage.setItem('dashboard_year', selectedYear);
  }, [selectedYear]);

  // Datos del dashboard desde API
  const { ventas, compras, stats: _stats, refresh } = useDashboardData();

  // Datos procesados para gráficos (con filtros)
  const salesByMonth = useSalesByMonth(ventas, selectedYear, selectedMonth, selectedDay);
  const purchasesByMonth = usePurchasesByMonth(compras, selectedYear, selectedMonth, selectedDay);

  // Listas calculadas dinámicamente (con filtros)
  const topProducts = useTopProducts(ventas, "", selectedYear, selectedMonth, selectedDay);
  const frequentCustomers = useTopCustomers(ventas, "", selectedYear, selectedMonth, selectedDay);

  // Handler para botón de refresh
  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="dashboard-container">
      
      {/* HEADER CON FILTROS */}
      <div className="header-top">
        <h1 className="dashboard-label">Panel de Dashboard</h1>
        <div className="filters-row">
          <select
            className="slim-input"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
          >
            <option value="">Día</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            className="slim-input slim-input-month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="">Mes</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{getMonthName(m)}</option>
            ))}
          </select>

          <input
            type="number"
            className="slim-input slim-input-year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            placeholder="Año"
            title="Filtrar por año"
          />

          <button className="reset-button" onClick={handleRefresh} title="Actualizar datos">
            <FaSyncAlt size={12} />
          </button>
        </div>
      </div>

      {/* SECCIÓN DE GRÁFICOS Y LISTAS */}
      <div className="dashboard-content-row">
        <SalesChart data={salesByMonth} />
        <PurchasesChart data={purchasesByMonth} />
      </div>

      <div className="dashboard-content-row">
        <TopProductsList products={topProducts} />
        <FrequentCustomersList customers={frequentCustomers} />
      </div>

    </div>
  );
};

export default AdminDashboard;