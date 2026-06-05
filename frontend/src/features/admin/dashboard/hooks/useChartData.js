/* === HOOK DE LÓGICA === 
   Este archivo maneja el estado de React, las reglas de negocio, y las validaciones del módulo. 
   Separa la 'inteligencia' de la interfaz visual para mantener el código limpio. 
   Recibe eventos de la UI y se comunica con los Servicios API. */

import { useMemo } from 'react';

/**
 * Parsea fecha de forma robusta (soporta DD/MM/YYYY y ISO Strings)
 */
export const parseDate = (dateStr) => {
  if (!dateStr) return null;
  
  // 1. Si ya es un objeto Date
  if (dateStr instanceof Date) return dateStr;

  // 2. Intentar parseo directo (ISO Strings)
  const directDate = new Date(dateStr);
  if (!isNaN(directDate.getTime()) && dateStr.toString().includes('T')) return directDate;

  // 3. Fallback para formatos manuales con diferentes separadores (DD/MM/YYYY, DD-MM-YYYY)
  const parts = dateStr.split(/[/.-]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    
    // Validar que el año sea razonable (ej: 2024)
    if (year > 100) {
      return new Date(year, month - 1, day);
    }
  }
  
  return directDate instanceof Date && !isNaN(directDate.getTime()) ? directDate : null;
};

/**
 * Formatea moneda en pesos colombianos
 */
export const formatCurrency = (amount) => {
  return `$${Number(amount || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
};

/**
 * Obtiene nombre del mes abreviado
 */
export const getMonthName = (monthNumber) => {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return months[monthNumber - 1] || monthNumber;
};

/**
 * Hook para calcular datos de ventas mensuales
 */
export const useSalesByMonth = (ventas, selectedYear, selectedMonth = "", selectedDay = "") => {
  return useMemo(() => {
    const map = {};
    (ventas || []).forEach(v => {
      // Priorizar fechaOriginal (raw) y fallback a fecha/Fecha
      const d = parseDate(v.fechaOriginal || v.fecha || v.Fecha);
      
      // Si no hay año seleccionado, usar el año de la venta o año actual
      const targetYear = selectedYear && selectedYear.toString().length === 4 
        ? selectedYear.toString() 
        : d ? d.getFullYear().toString() : new Date().getFullYear().toString();

      if (d && d.getFullYear().toString() === targetYear) {
        const m = d.getMonth() + 1;
        const day = d.getDate().toString();

        if (selectedMonth && m.toString() !== selectedMonth.toString()) return;
        if (selectedDay && day !== selectedDay.toString()) return;

        // Conversión infalible de dinero
        let monto = 0;
        const raw = v.total || v.Total || 0;
        if (typeof raw === 'number') monto = raw;
        else monto = parseFloat(String(raw).replace(/[^0-9.-]/g, '')) || 0;
        
        map[m] = (map[m] || 0) + monto;
      }
    });
    return Array.from({ length: 12 }, (_, i) => ({ 
      month: getMonthName(i + 1), 
      total: map[i + 1] || 0 
    }));
  }, [ventas, selectedYear, selectedMonth, selectedDay]);
};

/**
  * Hook para calcular datos de compras mensuales
  */
 export const usePurchasesByMonth = (compras, selectedYear, selectedMonth = "", selectedDay = "") => {
   return useMemo(() => {
     const map = {};
     (compras || []).forEach(c => {
       const d = parseDate(c.Fecha || c.fecha);
       if (!d) return;
       
       // Procesar sin filtrar si no hay año seleccionado
       const targetYear = selectedYear?.toString() || d.getFullYear().toString();
       if (d.getFullYear().toString() !== targetYear) return;

       const m = d.getMonth() + 1;
       const day = d.getDate().toString();

       // Aplicar filtros de mes y día si existen
       if (selectedMonth && m.toString() !== selectedMonth.toString()) return;
       if (selectedDay && day !== selectedDay.toString()) return;

       // 💰 Conversión infalible de dinero
       let monto = 0;
       const raw = c.total || c.Total || 0;
       if (typeof raw === 'number') monto = raw;
       else monto = parseFloat(String(raw).replace(/[^0-9.-]/g, '')) || 0;
       
       map[m] = (map[m] || 0) + monto;
     });
     return Array.from({ length: 12 }, (_, i) => ({ 
       month: getMonthName(i + 1), 
       total: map[i + 1] || 0 
     }));
   }, [compras, selectedYear, selectedMonth, selectedDay]);
 };

/**
  * Hook para obtener productos top filtrados por fecha
  */
 export const useTopProducts = (ventas, productSearch, selectedYear, selectedMonth = "", selectedDay = "") => {
   return useMemo(() => {
     const pSales = {};
     (ventas || []).forEach(v => {
       // Si hay filtro de año, validar; si no, procesar todas
       if (selectedYear && selectedYear.toString().length === 4) {
         const d = parseDate(v.fechaOriginal || v.fecha || v.Fecha);
         if (!d) return;
         if (d.getFullYear().toString() !== selectedYear.toString()) return;
         
         const m = (d.getMonth() + 1).toString();
         const day = d.getDate().toString();
         if (selectedMonth && m !== selectedMonth.toString()) return;
         if (selectedDay && day !== selectedDay.toString()) return;
       }

       // Intentar obtener productos de los detalles
       const arrayDetalles = v.productos || v.detalles || v.Detalles;
       if (arrayDetalles && Array.isArray(arrayDetalles)) {
         arrayDetalles.forEach(det => {
           const nombre = det.nombre || det.producto?.nombre || det.NombreProducto || det.nombreProducto || "Producto";
           const cant = Number(det.cantidad || det.Cantidad || 1);
           if (nombre && nombre !== "Producto") {
             pSales[nombre] = (pSales[nombre] || 0) + cant;
           }
         });
       }
     });

     return Object.entries(pSales)
       .map(([nombre, cantidad]) => ({ nombre, cantidad }))
       .filter(p => p.nombre.toLowerCase().includes((productSearch || "").toLowerCase()))
       .sort((a, b) => b.cantidad - a.cantidad)
       .slice(0, 24);
   }, [ventas, productSearch, selectedYear, selectedMonth, selectedDay]);
 };

/**
  * Hook para obtener clientes frecuentes filtrados por fecha
  */
 export const useTopCustomers = (ventas, customerSearch, selectedYear, selectedMonth = "", selectedDay = "") => {
   return useMemo(() => {
     const cSales = {};
     (ventas || []).forEach(v => {
       // Procesar sin filtrar si no hay año seleccionado
       if (selectedYear) {
         const d = parseDate(v.fechaOriginal || v.fecha || v.Fecha);
         if (!d) return;
         const y = d.getFullYear().toString();
         const m = (d.getMonth() + 1).toString();
         const day = d.getDate().toString();

         if (y !== selectedYear.toString()) return;
         if (selectedMonth && m !== selectedMonth.toString()) return;
         if (selectedDay && day !== selectedDay.toString()) return;
       }

       // Intentar obtener nombre de múltiples campos posibles
       const nombre = v.cliente?.nombre || v.clienteData?.nombreCompleto || v.clienteData?.Nombre || 
                      v.cliente || v.Cliente || v.usuario || v.Usuario || 
                      "Cliente Anónimo";
       
       if (nombre && typeof nombre === 'string' && nombre !== "Cliente Anónimo") {
         cSales[nombre] = (cSales[nombre] || 0) + 1;
       }
     });

     return Object.entries(cSales)
       .map(([nombre, cantidad]) => ({ nombre, cantidad }))
       .filter(c => c.nombre.toLowerCase().includes((customerSearch || "").toLowerCase()))
       .sort((a, b) => b.cantidad - a.cantidad)
       .slice(0, 24);
   }, [ventas, customerSearch, selectedYear, selectedMonth, selectedDay]);
 };
