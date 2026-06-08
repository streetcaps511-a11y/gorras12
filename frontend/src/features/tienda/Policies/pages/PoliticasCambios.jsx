/* === PÁGINA PRINCIPAL === 
   Este componente es la interfaz visual principal de la ruta. 
   Se encarga de dibujar el HTML/JSX e invoca el Hook para obtener todas las funciones y estados necesarios. */

import React, { useEffect } from 'react';
import { FaExchangeAlt, FaTimesCircle, FaTools, FaHeadset } from 'react-icons/fa';
import '../styles/Policies.css';

const PoliticasCambios = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy-page-container">
      <div className="policy-content-wrapper">
        <div className="policy-header">
          <h1 className="policy-title">Políticas de Cambios y Devoluciones 🔄</h1>
          <p className="policy-subtitle">Queremos que estés 100% satisfecho</p>
        </div>

        <div className="policy-card">
          <div className="policy-card-header">
            <FaExchangeAlt className="policy-card-icon" />
            <h3 className="policy-card-title">Cambios</h3>
          </div>
          <p className="policy-card-text">
            Se aceptan solicitudes de cambio dentro de las <strong>primeras 48 horas</strong> posteriores a la recepción del producto.
          </p>
          <p className="policy-card-text">
            Es indispensable que la gorra esté <strong>sin uso</strong>, en <strong>perfecto estado</strong> y con sus <strong>etiquetas originales</strong>.
          </p>
        </div>

        <div className="policy-card">
          <div className="policy-card-header">
            <FaTimesCircle className="policy-card-icon" />
            <h3 className="policy-card-title">⚠️ Reembolsos</h3>
          </div>
          <p className="policy-card-text">
            <strong>No se realizan devoluciones de dinero</strong>, solo se permiten cambios por otro producto de la tienda.
          </p>
          <p className="policy-card-text">
            Los costos de envío asociados al cambio corren por cuenta del cliente, excepto en situaciones donde exista un <strong>defecto de fábrica</strong>.
          </p>
        </div>

        <div className="policy-card">
          <div className="policy-card-header">
            <FaTools className="policy-card-icon" />
            <h3 className="policy-card-title">Productos con Defecto</h3>
          </div>
          <p className="policy-card-text">
            Si recibes un producto con algún defecto de fabricación, debes <strong>reportarlo dentro de las primeras 48 horas</strong> después de la entrega.
          </p>
          <p className="policy-card-text">
            En este escenario, <strong>nosotros asumimos el costo total del cambio</strong> sin cargo adicional para ti.
          </p>
        </div>

        <div className="policy-card">
          <div className="policy-card-header">
            <FaHeadset className="policy-card-icon" />
            <h3 className="policy-card-title">Atención al Cliente</h3>
          </div>
          <p className="policy-card-text">
            Para cualquier solicitud o duda, puedes contactarnos a través de nuestra línea de <strong>WhatsApp</strong> o mediante nuestras <strong>redes sociales</strong> oficiales.
          </p>
          <p className="policy-card-text">
            Estamos atentos para brindarte la mejor experiencia de compra.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PoliticasCambios;
