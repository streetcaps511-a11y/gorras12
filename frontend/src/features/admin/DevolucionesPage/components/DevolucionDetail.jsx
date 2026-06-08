/* === SUB-COMPONENTE DE DETALLE ===
   Este componente muestra la información en modo de solo lectura de una Devolución seleccionada:
   - Datos generales (Cliente, Dirección, Venta).
   - Motivo detallado del retorno.
   - Flujo de mercancía (Producto saliente y Producto entrante).
   - Evidencia fotográfica asociada. */

import React from 'react';
import { FaUser, FaExchangeAlt, FaCamera, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';

const DevolucionDetail = ({
  devolucionViendo,
  setDevolucionViendo,
  setExpandedImage,
}) => {
  return (
    <div className="devoluciones-premium-registration-grid detail-view-grid">
      {/* COLUMNA IZQUIERDA: DATOS Y PRODUCTOS */}
      <div className="devoluciones-registration-column">
        {/* CARD 1: DATOS GENERALES */}
        <div className="devoluciones-registration-card">
          <h3 className="devoluciones-card-title dev-detail-card-title-wrapper">
            <div className="dev-detail-card-title-prefix">
              <FaUser className="card-icon" /> DATOS GENERALES DE LA SOLICITUD
            </div>
            <span className="dev-detail-card-title-date">
              FECHA: {devolucionViendo?.fecha}
            </span>
          </h3>
          <div className="dev-card-body">
            <div className="dev-form-row">
              <div className="dev-form-group client dev-detail-form-field-flex">
                <label className="dev-field-label">CLIENTE</label>
                <div className="form-field-display">
                  {devolucionViendo?.cliente}
                </div>
              </div>
              <div className="dev-form-group address dev-detail-form-field-flex">
                <label className="dev-field-label">DIRECCIÓN</label>
                <div className="form-field-display">
                  {devolucionViendo?.direccion}
                </div>
              </div>
              <div className="dev-form-group sale dev-detail-form-field-flex">
                <label className="dev-field-label">VENTA / RECIBO</label>
                <div className="form-field-display id">
                  ORDEN #
                  {devolucionViendo?.idVenta ||
                  devolucionViendo?.noVenta ||
                  devolucionViendo?.id
                    ? (() => {
                        const raw = devolucionViendo.idVenta || devolucionViendo.noVenta || devolucionViendo.id;
                        const num = Number(raw);
                        if (isNaN(num)) return raw;
                        return num < 1000 ? num + 1000 : num;
                      })()
                    : "N/A"}
                </div>
              </div>
            </div>
            <div className="dev-form-group">
              <label className="dev-field-label">MOTIVO DE DEVOLUCIÓN</label>
              <div className="dev-field-textarea readonly">
                {devolucionViendo?.motivo || "Sin motivo especificado."}
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: PRODUCTOS */}
        <div className="devoluciones-registration-card">
          <div className="devoluciones-card-header">
            <h3 className="devoluciones-card-title" style={{ margin: 0 }}>
              <FaExchangeAlt className="card-icon" />{" "}
              {devolucionViendo?.isLot
                ? "PRODUCTOS EN EL PEDIDO"
                : "FLUJO DE MERCANCÍA"}
            </h3>
            {devolucionViendo?.mismoModelo && (
              <div className="mismo-modelo-badge">MISMO MODELO</div>
            )}
          </div>
          <div className="dev-card-body products">
            {devolucionViendo?.isLot ? (
              <div className="dev-detail-product-lot">
                {(() => {
                  const grouped = (devolucionViendo?.items || []).reduce(
                    (acc, item) => {
                      const key = item.idProducto || item.productoOriginal;
                      if (!acc[key]) {
                        acc[key] = {
                          nombre: item.nombreProducto || item.productoOriginal,
                          total: 0,
                          precio: item.precio,
                          breakdown: [],
                        };
                      }
                      acc[key].total += item.cantidad || 1;
                      acc[key].breakdown.push({
                        talla: item.talla,
                        cantidad: item.cantidad || 1,
                      });
                      return acc;
                    },
                    {}
                  );

                  return Object.entries(grouped).map(([id, group]) => {
                    return (
                      <div key={id} style={{ marginBottom: "10px" }}>
                        <div className="form-field-display product-readonly dev-detail-product-readonly-lot-item">
                          <div className="dev-detail-product-readonly-lot-info">
                            <span className="product-name dev-detail-product-readonly-lot-name">
                              {group.nombre}
                            </span>
                            <div className="dev-detail-product-readonly-lot-breakdown">
                              {group.breakdown.map((b, idx) => (
                                <span key={idx} className="dev-detail-product-readonly-lot-badge">
                                  Talla:{" "}
                                  {b.talla && b.talla !== "UNICA" && b.talla !== "N/A"
                                    ? b.talla
                                    : "ÚNICA"}{" "}
                                  | Cant: {b.cantidad}
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className="product-price dev-detail-product-readonly-lot-price">
                            ${parseFloat(group.precio || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              <div className="dev-form-row products">
                <div className="dev-form-group product-main">
                  <label className="dev-field-label return">
                    PRODUCTO A DEVOLVER (SALIENTE)
                  </label>
                  <div className="form-field-display product-readonly dev-detail-product-readonly-single">
                    <span className="product-name dev-detail-product-readonly-single-name">
                      {devolucionViendo?.productoOriginal ||
                        devolucionViendo?.nombreProducto ||
                        devolucionViendo?.producto ||
                        "Producto"}
                    </span>
                    <div className="dev-detail-product-readonly-single-row2">
                      <span className="dev-detail-product-readonly-single-badge">
                        Talla: {devolucionViendo?.talla || "N/A"} | Cantidad:{" "}
                        {devolucionViendo?.cantidad || 1}
                      </span>
                      <span className="product-price">
                        ${devolucionViendo?.precio?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {!devolucionViendo?.mismoModelo && devolucionViendo?.productoCambio ? (
                  <>
                    <div className="dev-product-separator horizontal">
                      <FaExchangeAlt />
                    </div>
                    <div className="dev-form-group product-main">
                      <label className="dev-field-label replace">
                        PRODUCTO DE REEMPLAZO (ENTRANTE)
                      </label>
                      <div className="form-field-display product-readonly replace dev-detail-product-readonly-single">
                        <span className="product-name dev-detail-product-readonly-single-name">
                          {devolucionViendo?.productoCambio ||
                            devolucionViendo?.nombreProductoCambio ||
                            devolucionViendo?.productoDestino ||
                            "Producto"}
                        </span>
                        <div className="dev-detail-product-readonly-single-row2">
                          <span className="dev-detail-product-readonly-single-badge">
                            Talla: {devolucionViendo?.talla || "N/A"} | Cantidad:{" "}
                            {devolucionViendo?.cantidad || 1}
                          </span>
                          <span className="product-price">
                            ${devolucionViendo?.precio?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  devolucionViendo?.mismoModelo && (
                    <div className="dev-mismo-modelo-info standalone">
                      <FaCheckCircle className="info-icon" />
                      <p>REEMPLAZO POR EL MISMO MODELO Y TALLA</p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {devolucionViendo?.estado?.toLowerCase().includes("rechaz") && (
          <div className="dev-rejection-reason-box">
            <div className="rejection-title">
              <FaTimesCircle size={14} /> MOTIVO DEL RECHAZO
            </div>
            <div className="rejection-content">
              {devolucionViendo?.motivoRechazo || "No se especificó un motivo."}
            </div>
          </div>
        )}
      </div>

      {/* COLUMNA DERECHA: EVIDENCIA RECIBIDA */}
      <div className="devoluciones-registration-column">
        <div className="devoluciones-registration-card full-height">
          <h3 className="devoluciones-card-title">
            <FaCamera className="card-icon" /> EVIDENCIA RECIBIDA
          </h3>

          <div className="dev-evidence-dropzone detail-mode">
            <div className="dev-evidence-content">
              <div className="dev-evidence-viewer">
                <div 
                  className="dev-preview-wrapper detail-view"
                  onClick={() => {
                    const img = (devolucionViendo?.viewingEvidencia === 2
                      ? devolucionViendo?.evidencia2
                      : devolucionViendo?.evidencia) || devolucionViendo?.evidencia;
                    if (img) setExpandedImage(img);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={
                      (devolucionViendo?.viewingEvidencia === 2
                        ? devolucionViendo?.evidencia2
                        : devolucionViendo?.evidencia) ||
                      devolucionViendo?.evidencia ||
                      "/placeholder.png"
                    }
                    alt="Evidencia"
                    onError={(e) => { e.target.src = "/placeholder.png"; }}
                  />
                </div>

                {devolucionViendo?.evidencia2 && (
                  <div className="dev-viewer-controls">
                    <button
                      className={`dev-dot ${
                        devolucionViendo?.viewingEvidencia === 1 ? "active" : ""
                      }`}
                      onClick={() =>
                        setDevolucionViendo({
                          ...devolucionViendo,
                          viewingEvidencia: 1,
                        })
                      }
                    />
                    <button
                      className={`dev-dot ${
                        devolucionViendo?.viewingEvidencia === 2 ? "active" : ""
                      }`}
                      onClick={() =>
                        setDevolucionViendo({
                          ...devolucionViendo,
                          viewingEvidencia: 2,
                        })
                      }
                    />
                  </div>
                )}

                <div className="dev-viewer-label">
                  {devolucionViendo?.evidencia2
                    ? `Vista ${devolucionViendo?.viewingEvidencia} de 2`
                    : "Vista única"}
                </div>
              </div>
            </div>
          </div>

          <div className="dev-detail-info-footer">
            <p>
              Esta información es de solo lectura y representa el estado actual de la solicitud en el sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevolucionDetail;
