/* === HOOK DE LÓGICA === 
    Este archivo maneja el estado de React, las reglas de negocio, y las validaciones del módulo. 
    Separa la 'inteligencia' de la interfaz visual para mantener el código limpio. 
    Recibe eventos de la UI y se comunica con los Servicios API. */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchDashboardVentas,
  fetchDashboardCompras,
  fetchDashboardClientes,
  fetchDashboardStats
} from '../services/dashboardApi';
import { NitroCache } from '../../../shared/utils/NitroCache';

/**
 * Hook para obtener datos del dashboard con CACHÉ PERSISTENTE.
 * Los datos persisten mientras el usuario esté en sesión sin expiración.
 */
export const useDashboardData = () => {
  const [ventas, setVentas] = useState([]);
  const [compras, setCompras] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [stats, setStats] = useState({
    totalVentas: 0,
    totalCompras: 0,
    totalClientes: 0,
    ventasHoy: 0,
    ventasMes: 0,
    totalVentasHistorico: 0
  });

  const loadDashboardData = useCallback(async () => {
    const user = JSON.parse(sessionStorage.getItem('user') || 'null');
    const token = sessionStorage.getItem('token');

    if (!user || !token) {
      return;
    }

    // Usar caché si existe (sin TTL - persiste indefinidamente)
    const cached = NitroCache.get('dashboard_admin');
    if (cached?.data) {
      setVentas(cached.data.ventas || []);
      setCompras(cached.data.compras || []);
      setClientes(cached.data.clientes || []);
      setStats(cached.data.stats || {});
      return;
    }

    const loadPiece = async (fetchFn, setterFn, fallbackValue) => {
      try {
        const result = await fetchFn();
        setterFn(result || fallbackValue);
        return result || fallbackValue;
      } catch (err) {
        console.error(`Error cargando pieza del dashboard:`, err);
        setterFn(fallbackValue);
        return fallbackValue;
      }
    };

    try {
      const [rVentas, rCompras, rClientes, rStats] = await Promise.all([
        loadPiece(fetchDashboardVentas, setVentas, []),
        loadPiece(fetchDashboardCompras, setCompras, []),
        loadPiece(fetchDashboardClientes, setClientes, []),
        loadPiece(fetchDashboardStats, (data) => {
           setStats({
              ...data,
              productosMasVendidos: data?.productosMasVendidos || [],
              clientesRecurrentes: data?.clientesRecurrentes || []
           });
        }, {})
      ]);

      NitroCache.set('dashboard_admin', { 
        ventas: rVentas, 
        compras: rCompras, 
        clientes: rClientes, 
        stats: rStats 
      });
    } catch (err) {
      console.error('Error general en Dashboard:', err);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const refresh = useCallback(() => {
    NitroCache.remove('dashboard_admin');
    loadDashboardData();
  }, [loadDashboardData]);

  return { 
    ventas, 
    compras, 
    clientes, 
    stats,
    loading: false, 
    error: null,
    refresh
  };
};