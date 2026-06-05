/* === COMPONENTE REUTILIZABLE === 
    Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
    Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';

const getMonthName = (monthNumber) => {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return months[monthNumber - 1] || monthNumber;
};

const formatDashboardValue = (v) => {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`;
  return `$${v}`;
};

/**
 * Componente para mostrar gráfico de ventas mensuales
 */
 export const SalesChart = ({ data = [] }) => {
   const chartData = data || Array.from({ length: 12 }, (_, i) => ({ month: getMonthName(i + 1), total: 0 }));
   
   return (
     <div className="chart-visual-box">
       <h3 className="chart-header-dark">Ventas Mensuales</h3>
       <ResponsiveContainer width="100%" height={250}>
         <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
           <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
           <XAxis dataKey="month" tick={{ fill: '#ffffff', fontSize: 10 }} axisLine={false} tickLine={false} />
           <YAxis 
             width={45}
             tick={{ fill: '#ffffff', fontSize: 10 }} 
             axisLine={false} 
             tickLine={false} 
             tickFormatter={formatDashboardValue}
           />
           <Tooltip 
             cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
             contentStyle={{ backgroundColor: '#030712', border: '1px solid white' }}
             formatter={(v) => [`$${Number(v).toLocaleString('es-CO')}`, 'Total']}
           />
           <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={22} minPointSize={5}>
             <LabelList 
               dataKey="total" 
               position="top" 
               fill="#ffffff" 
               fontSize={11} 
               fontWeight="bold"
               formatter={(v) => v > 0 ? formatDashboardValue(v) : ''} 
             />
           </Bar>
         </BarChart>
       </ResponsiveContainer>
     </div>
   );
 };

/**
  * Componente para mostrar gráfico de compras mensuales
  */
 export const PurchasesChart = ({ data = [] }) => {
   const chartData = data || Array.from({ length: 12 }, (_, i) => ({ month: getMonthName(i + 1), total: 0 }));
   
   return (
     <div className="chart-visual-box">
       <h3 className="chart-header-dark">Compras Mensuales</h3>
       <ResponsiveContainer width="100%" height={250}>
         <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
           <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
           <XAxis dataKey="month" tick={{ fill: '#ffffff', fontSize: 10 }} axisLine={false} tickLine={false} />
           <YAxis 
             width={45}
             tick={{ fill: '#ffffff', fontSize: 10 }} 
             axisLine={false} 
             tickLine={false}
             tickFormatter={formatDashboardValue}
           />
           <Tooltip 
             cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
             contentStyle={{ backgroundColor: '#030712', border: '1px solid white' }}
             formatter={(v) => [`$${Number(v).toLocaleString('es-CO')}`, 'Total']}
           />
           <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} barSize={22} minPointSize={5}>
             <LabelList 
               dataKey="total" 
               position="top" 
               fill="#ffffff" 
               fontSize={11} 
               fontWeight="bold"
               formatter={(v) => v > 0 ? formatDashboardValue(v) : ''} 
             />
           </Bar>
         </BarChart>
       </ResponsiveContainer>
     </div>
   );
 };

export default { SalesChart, PurchasesChart };
