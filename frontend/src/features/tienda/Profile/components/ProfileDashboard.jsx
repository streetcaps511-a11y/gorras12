/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';
import { Package, RotateCcw, ShoppingBag, ArrowRight } from 'lucide-react';
import '../styles/ProfileDashboard.css';

const ProfileDashboard = ({ allOrders, allReturns, setActiveTab, setSelectedOrder, setOrderView, setSelectedReturn, setReturnView }) => {
  return (
    <div className="gm-dashboard-container">
      <h2 className="gm-dashboard-title">mi cuenta</h2>
      
      <div className="gm-stats-grid">
        <div className="gm-stat-card">
          <div className="gm-stat-icon orders">
            <Package size={22} color="#FFC107" strokeWidth={1.5} />
          </div>
          <div className="gm-stat-info">
            <label className="gm-stat-label">Pedidos:</label>
            <div className="gm-stat-value">{allOrders.length} Totales</div>
          </div>
        </div>
        <div className="gm-stat-card">
          <div className="gm-stat-icon returns">
            <RotateCcw size={22} color="#ef4444" strokeWidth={1.5} />
          </div>
          <div className="gm-stat-info">
            <label className="gm-stat-label">Devoluciones:</label>
            <div className="gm-stat-value">
              {allReturns.filter(r => r.status === 'Pendiente').length} En curso
            </div>
          </div>
        </div>
      </div>

      <div className="gm-summary-grid">
        {/* Bloque Devoluciones */}
        <div className="gm-summary-card">
          <div className="gm-summary-header">
            <h4 className="gm-summary-title">devoluciones recientes</h4>
            <button onClick={() => setActiveTab('returns')} className="gm-summary-link">
              ver todas <ArrowRight size={14} style={{ marginLeft: '4px' }} />
            </button>
          </div>
          <div className="gm-summary-list">
            {allReturns.length > 0 ? (
              [...allReturns].sort((a, b) => {
                const idA = typeof a.id === 'string' && a.id.startsWith('DEV-') ? parseInt(a.id.replace('DEV-', '')) : 0;
                const idB = typeof b.id === 'string' && b.id.startsWith('DEV-') ? parseInt(b.id.replace('DEV-', '')) : 0;
                // Si ambos tienen 0 (son lotes), ordenar por fecha
                if (idA === 0 && idB === 0) return new Date(b.date) - new Date(a.date);
                return idB - idA;
              }).slice(0, 5).map(r => (
                <div 
                  key={r.id} 
                  className="gm-return-mini-item clickable"
                  onClick={() => {
                    setSelectedReturn(r);
                    setReturnView('detail');
                    setActiveTab('returns');
                  }}
                >
                  <div className="gm-item-info">
                    <span className="gm-summary-value">{r.isLot ? "Devolución de Pedido" : r.productName}</span>
                  </div>
                  <span 
                    className="gm-status-badge-mini"
                    style={{ backgroundColor: `${r.statusColor}20`, color: r.statusColor }}
                  >
                    {r.status}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No hay devoluciones</div>
            )}
          </div>
        </div>

        {/* Bloque Últimos Pedidos */}
        <div className="gm-summary-card">
          <div className="gm-summary-header">
            <h4 className="gm-summary-title">Últimos Pedidos</h4>
            <button onClick={() => setActiveTab('orders')} className="gm-summary-link">
              ver todos <ArrowRight size={14} style={{ marginLeft: '4px' }} />
            </button>
          </div>
          <div className="gm-summary-list">
            {allOrders.length > 0 ? (
              [...allOrders].sort((a, b) => {
                const idA = parseInt(String(a.id).replace('PED-', ''));
                const idB = parseInt(String(b.id).replace('PED-', ''));
                return idB - idA;
              }).slice(0, 5).map(o => (
                <div 
                  key={o.id} 
                  className="gm-order-mini-item clickable"
                  onClick={() => {
                    setSelectedOrder(o);
                    setOrderView('detail');
                    setActiveTab('orders');
                  }}
                >
                  <div className="gm-order-details">
                    <span className="gm-order-id">{o.id}</span>
                    <span className="gm-order-date">{o.date}</span>
                  </div>
                  <span 
                    className="gm-status-badge-mini"
                    style={{ backgroundColor: `${o.statusColor}20`, color: o.statusColor }}
                  >
                    {(String(o.status).toUpperCase() === 'ANULADO' || String(o.status).toUpperCase() === 'ANULADA') ? 'RECHAZADO' : o.status}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No hay pedidos</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
