/* === SUB-COMPONENTE DE FORMULARIO ===
   Este componente contiene el formulario de registro de Devoluciones.
   Permite buscar el cliente, asociar una orden, seleccionar el producto a devolver,
   buscar el producto de cambio (si aplica) y subir la evidencia fotográfica. */

import React from 'react';
import { FaUser, FaExchangeAlt, FaCamera, FaTrash, FaImage, FaCheckCircle } from 'react-icons/fa';
import { SearchSelect } from '../../../shared/services';

const DevolucionForm = ({
  formData,
  setFormData,
  clientes,
  ventasCliente,
  productosVenta,
  productosMismoPrecio,
  loadingVentas,
  errors,
  handleImageUpload,
}) => {
  return (
    <div className="devoluciones-premium-registration-grid yellow-scrollbar">
      {/* COLUMNA IZQUIERDA: DATOS Y PRODUCTOS */}
      <div className="devoluciones-registration-column">
        {/* CARD 1: DATOS GENERALES */}
        <div className="devoluciones-registration-card">
          <h3 className="devoluciones-card-title">
            <FaUser className="card-icon" /> DATOS GENERALES
          </h3>
          <div className="dev-card-body">
            <div className="dev-form-row">
              <div className="dev-form-group client">
                <label className="dev-field-label">
                  CLIENTE <span className="required">*</span>
                </label>
                <SearchSelect
                  options={clientes}
                  selectedItem={clientes.find(
                    (c) => String(c.id) === String(formData.idCliente)
                  )}
                  onSelect={(client) => {
                    const cid = client?.id || client?.IdCliente || "";
                    setFormData({
                      ...formData,
                      idCliente: cid,
                      cliente: client?.nombreCompleto || client?.Nombre || "",
                      productoOriginalId: "",
                      idVenta: "",
                      productoCambioId: "",
                    });
                  }}
                  placeholder="Buscar por nombre, documento o correo..."
                  error={errors.cliente}
                  filterFn={(c, term) => {
                    const t = term.toLowerCase();
                    return (
                      (c.nombreCompleto || c.Nombre || "")
                        .toLowerCase()
                        .includes(t) ||
                      (c.numeroDocumento || c.Documento || c.numDocumento || "")
                        .toLowerCase()
                        .includes(t) ||
                      (c.email || c.Email || "").toLowerCase().includes(t)
                    );
                  }}
                  renderOption={(c) => (
                    <div className="dev-search-option-cli">
                      <span className="dev-search-option-cli-name">
                        {c.nombreCompleto || c.Nombre}
                      </span>
                      <div className="dev-search-option-cli-details">
                        <span>Doc: {c.numeroDocumento || c.Documento || "N/A"}</span>
                        <span>•</span>
                        <span>{c.email || c.Email || "Sin Correo"}</span>
                      </div>
                    </div>
                  )}
                />
              </div>
              <div className="dev-form-group sale">
                <label className="dev-field-label">
                  VENTA RELACIONADA <span className="required">*</span>
                </label>
                <SearchSelect
                  options={ventasCliente}
                  selectedItem={ventasCliente.find(
                    (v) => String(v.id || v.IdVenta) === String(formData.idVenta)
                  )}
                  onSelect={(sale) => {
                    setFormData({
                      ...formData,
                      idVenta: sale?.id || sale?.IdVenta || "",
                      productoOriginalId: "",
                      productoCambioId: "",
                    });
                  }}
                  placeholder={
                    !formData.idCliente
                      ? "Primero..."
                      : loadingVentas
                      ? "Cargando..."
                      : "Venta/Recibo..."
                  }
                  disabled={!formData.idCliente || loadingVentas}
                  error={errors.idVenta}
                  renderOption={(v) => (
                    <div className="dev-search-option-sale">
                      <div className="dev-search-option-sale-left">
                        <span className="dev-search-option-sale-ord">
                          ORDEN #{v.id || v.IdVenta}
                        </span>
                        <span className="dev-search-option-sale-date">
                          Fecha: {v.fecha || v.Fecha || v.FechaVenta || "N/A"}
                        </span>
                      </div>
                      <div className="dev-search-option-sale-right">
                        <span className="dev-search-option-sale-total">
                          ${parseFloat(v.total || v.Total || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                  filterFn={(v, term) => String(v.id || v.IdVenta).includes(term)}
                />
              </div>
            </div>

            <div className="dev-form-group">
              <label className="dev-field-label">
                MOTIVO DE DEVOLUCIÓN <span className="required">*</span>
              </label>
              <textarea
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                placeholder="Describa el motivo detallado..."
                className={`dev-field-textarea ${errors.motivo ? "has-error" : ""}`}
              />
            </div>
          </div>
        </div>

        {/* CARD 2: PRODUCTOS */}
        <div className="devoluciones-registration-card">
          <div className="devoluciones-card-header">
            <h3 className="devoluciones-card-title" style={{ margin: 0 }}>
              <FaExchangeAlt className="card-icon" /> PRODUCTOS EN PROCESO
            </h3>
            <label className="dev-checkbox-container">
              <span>MISMO MODELO</span>
              <input
                type="checkbox"
                checked={formData.mismoModelo}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    mismoModelo: e.target.checked,
                    productoCambioId: "",
                  });
                }}
              />
              <span className="dev-checkmark"></span>
            </label>
          </div>

          <div className="dev-card-body products">
            <div className="dev-form-row products">
              <div className="dev-form-group product-main">
                <label className="dev-field-label return">
                  PRODUCTO A DEVOLVER <span className="required">*</span>
                </label>
                <SearchSelect
                  options={productosVenta}
                  selectedItem={productosVenta.find(
                    (p) => String(p._tempId || p.id) === String(formData.productoOriginalId)
                  )}
                  onSelect={(prod) => {
                    setFormData({
                      ...formData,
                      productoOriginalId: prod?._tempId || prod?.id || "",
                      idVenta: prod?.idVenta || formData.idVenta,
                      productoCambioId: "",
                    });
                  }}
                  placeholder={
                    !formData.idCliente
                      ? "Primero..."
                      : loadingVentas
                      ? "Cargando..."
                      : "Buscar producto..."
                  }
                  disabled={!formData.idCliente || loadingVentas}
                  error={errors.prodOrig}
                  filterFn={(p, term) => {
                    const t = term.toLowerCase();
                    return (p.nombre || p.Nombre || "").toLowerCase().includes(t);
                  }}
                  renderOption={(p) => {
                    const imgPath =
                      (p.imagenes && p.imagenes[0]) ||
                      (p.Imagenes && p.Imagenes[0]) ||
                      null;
                    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
                    const imgSrc = imgPath
                      ? imgPath.startsWith("http")
                        ? imgPath
                        : `${baseUrl}${imgPath}`
                      : "/placeholder.png";

                    return (
                      <div className="dev-search-option-prod">
                        <div className="dev-search-option-prod-img-box">
                          <img
                            src={imgSrc}
                            alt=""
                            className="dev-search-option-prod-img"
                            onError={(e) => { e.target.src = "/placeholder.png"; }}
                          />
                        </div>
                        <div className="dev-search-option-prod-info">
                          <span className="dev-search-option-prod-name">
                            {p.nombre || p.Nombre}
                          </span>
                          <span className="dev-search-option-prod-sub">
                            ${parseFloat(p.precio || 0).toLocaleString()} • Talla: {p.tallaComprada || "N/A"}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
              </div>

              {!formData.mismoModelo ? (
                <>
                  <div className="dev-product-separator horizontal">
                    <FaExchangeAlt />
                  </div>
                  <div className="dev-form-group product-main">
                    <label className="dev-field-label replace">
                      PRODUCTO DE REEMPLAZO <span className="required">*</span>
                    </label>
                    <SearchSelect
                      options={productosMismoPrecio}
                      selectedItem={productosMismoPrecio.find(
                        (p) => String(p.id || p.IdProducto) === String(formData.productoCambioId)
                      )}
                      onSelect={(prod) => {
                        setFormData({
                          ...formData,
                          productoCambioId: prod?.id || prod?.IdProducto || "",
                        });
                      }}
                      placeholder={!formData.productoOriginalId ? "Primero..." : "Buscar..."}
                      disabled={!formData.productoOriginalId}
                      error={errors.prodCambio || errors.price_mismatch}
                      filterFn={(p, term) => {
                        const t = term.toLowerCase();
                        return (p.nombre || p.Nombre || "").toLowerCase().includes(t);
                      }}
                      renderOption={(p) => {
                        const imgPath =
                          (p.imagenes && p.imagenes[0]) ||
                          (p.Imagenes && p.Imagenes[0]) ||
                          null;
                        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
                        const imgSrc = imgPath
                          ? imgPath.startsWith("http")
                            ? imgPath
                            : `${baseUrl}${imgPath}`
                          : "/placeholder.png";

                        return (
                          <div className="dev-search-option-prod">
                            <div className="dev-search-option-prod-img-box">
                              <img
                                src={imgSrc}
                                alt=""
                                className="dev-search-option-prod-img"
                                onError={(e) => { e.target.src = "/placeholder.png"; }}
                              />
                            </div>
                            <div className="dev-search-option-prod-info">
                              <span className="dev-search-option-prod-name">
                                {p.nombre || p.Nombre}
                              </span>
                              <span className="dev-search-option-prod-sub-cambio">
                                ${parseFloat(p.precio || p.Precio || p.precioVenta || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      }}
                    />
                    {errors.price_mismatch && (
                      <p className="dev-price-error">⚠ Precios desiguales</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="dev-mismo-modelo-info standalone">
                  <FaCheckCircle className="info-icon" />
                  <p>Mismo producto.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA: EVIDENCIA */}
      <div className="devoluciones-registration-column">
        <div className="devoluciones-registration-card full-height">
          <h3 className="devoluciones-card-title">
            <FaCamera className="card-icon" /> EVIDENCIA FOTOGRÁFICA <span className="required">*</span>
          </h3>

          <div className={`dev-evidence-dropzone ${errors.evidencia ? "has-error" : ""}`}>
            <div className="dev-evidence-content">
              {(formData.evidencia || formData.evidencia2) && (
                <div className="dev-evidence-viewer">
                  {formData.viewingEvidencia === 1 ? (
                    formData.evidencia ? (
                      <div className="dev-preview-wrapper">
                        <img src={formData.evidencia} alt="Evidencia 1" />
                        <button
                          onClick={() => setFormData({ ...formData, evidencia: null })}
                          className="dev-btn-delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="dev-empty-preview"
                        onClick={() => document.getElementById("file-1").click()}
                      >
                        <FaImage className="empty-icon" />
                        <p>Vista Frontal del Producto</p>
                        <span className="dev-upload-link">SUBIR IMAGEN</span>
                      </div>
                    )
                  ) : formData.evidencia2 ? (
                    <div className="dev-preview-wrapper">
                      <img src={formData.evidencia2} alt="Evidencia 2" />
                      <button
                        onClick={() => setFormData({ ...formData, evidencia2: null })}
                        className="dev-btn-delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="dev-empty-preview"
                      onClick={() => document.getElementById("file-2").click()}
                    >
                      <FaImage className="empty-icon" />
                      <p>Vista Posterior o Extra</p>
                      <span className="dev-upload-link">SUBIR IMAGEN</span>
                    </div>
                  )}

                  <div className="dev-viewer-controls">
                    <button
                      className={`dev-dot ${formData.viewingEvidencia === 1 ? "active" : ""}`}
                      onClick={() => setFormData({ ...formData, viewingEvidencia: 1 })}
                    />
                    <button
                      className={`dev-dot ${formData.viewingEvidencia === 2 ? "active" : ""}`}
                      onClick={() => setFormData({ ...formData, viewingEvidencia: 2 })}
                    />
                  </div>
                </div>
              )}

              {!formData.evidencia && !formData.evidencia2 && (
                <div className="dev-drag-drop-area">
                  <FaImage className="drag-icon" />
                  <p className="drag-text">Arrastra una imagen o selecciona un archivo</p>
                  <label className="dev-btn-upload-premium">
                    SUBIR IMAGEN
                    <input
                      id="file-1"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 1)}
                      style={{ display: "none" }}
                    />
                  </label>
                  <input
                    id="file-2"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 2)}
                    style={{ display: "none" }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevolucionForm;
