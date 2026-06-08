/* === PÁGINA PRINCIPAL ===
   Este componente es la interfaz visual principal de la ruta.
   Se encarga de dibujar el HTML/JSX e invoca el Hook para obtener todas las funciones y estados necesarios. */

import "../style/index.css";
import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import {
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaTimes,
  FaImage,
  FaUser,
  FaBoxOpen,
  FaCamera,
  FaDollarSign,
  FaExclamationTriangle,
  FaDownload,
  FaEye,
  FaFilePdf,
} from "react-icons/fa";

// ===== COMPONENTES COMPARTIDOS =====
import {
  Alert,
  EntityTable,
  SearchInput,
  UniversalModal,
  DateInputWithCalendar,
  StatusPill,
  SearchSelect,
} from "../../../shared/services";
import CustomPagination from "../../../shared/components/admin/CustomPagination";

import StatusFilter from "../components/StatusFilter";
import ProductoForm from "../components/ProductoForm";

// ===== HOOKS & SERVICIOS =====
import { useVentasLogic } from "../hooks/useVentasLogic";
// Se eliminan PAYMENT_METHODS y SIZES quemados

const AdminExpandedImageModal = ({ src, onClose }) => {
  const [zoomed, setZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (!zoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x, y });
  };

  const toggleZoom = (e) => {
    e.stopPropagation();
    setZoomed(!zoomed);
  };

  return (
    <div className="gm-zoom-overlay-admin" onClick={onClose}>
      <div
        className="gm-zoom-container-admin"
        onClick={(e) => e.stopPropagation()}
        style={{ overflow: 'hidden', borderRadius: '12px' }}
      >
        <button
          className="gm-zoom-close-admin"
          onClick={onClose}
        >
          <FaTimes size={24} />
        </button>
        <div
          onMouseMove={handleMouseMove}
          onClick={toggleZoom}
          style={{
            overflow: 'hidden',
            cursor: zoomed ? 'zoom-out' : 'zoom-in',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            borderRadius: '12px'
          }}
        >
          <img
            src={src}
            className="gm-zoom-img-admin"
            alt="zoom"
            style={{
              transition: zoomed ? 'none' : 'transform 0.2s ease',
              transformOrigin: `${position.x}% ${position.y}%`,
              transform: zoomed ? 'scale(2.5)' : 'scale(1)',
              display: 'block'
            }}
          />
        </div>
      </div>
    </div>
  );
};

const VentasPage = () => {
  const {
    availableStatuses,
    availableSizes,
    availableCustomers,
    availableProducts,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    currentPage,
    setCurrentPage,
    loading,
    alert,
    setAlert,
    modoVista,
    ventaViendo,
    approveModal,
    setApproveModal,
    rejectModal,
    setRejectModal,
    partialPaymentModal,
    setPartialPaymentModal,
    annulModal,
    setAnnulModal,
    sendConfirmModal,
    setSendConfirmModal,
    rejectionReason,
    setRejectionReason,
    errors,
    nuevaVenta,
    filtered,
    paginatedVentas,
    totalPages,
    mostrarLista,
    mostrarFormulario,
    mostrarDetalle,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
    calcularTotal,
    handleImageUpload,
    handleImage2Upload,
    handleCreateVenta,
    updateVentaStatus,
    handlePartialPayment,
    handleEnviarVenta,
    requiresReceipt,
  } = useVentasLogic();

  const columns = [
    {
      header: "No. Venta",
      field: "noVenta",
      render: (item) => (
        <span className="sale-id-text">{item.noVenta || item.id}</span>
      ),
    },
    {
      header: "Cliente",
      field: "cliente",
      render: (item) => (
        <span className="client-name-text">
          {typeof item.cliente === "object"
            ? item.cliente?.nombre
            : item.cliente}
        </span>
      ),
    },
    {
      header: "Fecha",
      field: "fecha",
      render: (item) => <span className="sale-date-text">{item.fecha}</span>,
    },
    {
      header: "Total",
      field: "total",
      render: (item) => (
        <span className="sale-total-text">
          $
          {Number(item.total).toLocaleString("es-CO", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </span>
      ),
    },
    {
      header: "Tipo",
      field: "tipoEntrega",
      render: (item) => (
        <span className={`delivery-type-pill ${item.tipoEntrega}`}>
          {item.tipoEntrega === "recoger" ? "🏪 Local" : "🚚 Envío"}
        </span>
      ),
    },
    {
      header: "Envío",
      field: "statusenvio",
      render: (item) => {
        const isCompleted = String(item.estado || item.idEstado || "")
          .toLowerCase()
          .includes("completad");
        const isRejected = String(item.estado || "")
          .toLowerCase()
          .includes("rechaz");
        let est;
        if (isRejected) {
          est = "Cancelado";
        } else if (isCompleted) {
          est = item.statusenvio || "Por enviar";
        } else {
          est = "En espera";
        }
        return <StatusPill status={est} />;
      },
    },
    {
      header: "Estado",
      field: "estado",
      render: (item) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <StatusPill status={item.estado} />
        </div>
      ),
    },
  ];

  // local state for image expansion
  const [imgModal, setImgModal] = useState({ open: false, src: "" });
  const openImage = (src) => setImgModal({ open: true, src });

  // 📦 AGRUPAR PRODUCTOS PARA EL DETALLE (Para que se vea igual que al registrar)
  const groupedProductsViendo = React.useMemo(() => {
    const rawProducts = ventaViendo?.productos || ventaViendo?.detalles;
    if (!rawProducts) return [];
    const grouped = [];
    rawProducts.forEach((p) => {
      const pId = p.id || p.idProducto;
      const pNombre = p.nombre || p.nombreProducto || p.producto?.nombre;
      
      const existing = grouped.find(
        (item) => item.id === pId && item.nombre === pNombre,
      );
      if (existing) {
        existing.variantes.push({
          talla: p.talla,
          cantidad: p.cantidad,
          _tempKey: Math.random(),
        });
      } else {
        grouped.push({
          ...p,
          id: pId,
          nombre: pNombre,
          variantes: [
            { talla: p.talla, cantidad: p.cantidad, _tempKey: Math.random() },
          ],
        });
      }
    });
    return grouped;
  }, [ventaViendo?.productos, ventaViendo?.detalles]);

  // local state for filtering products in detail view
  // Reset scroll when switching views
  useEffect(() => {
    window.scrollTo(0, 0);
    const wrappers = document.querySelectorAll(".yellow-scrollbar");
    wrappers.forEach((w) => (w.scrollTop = 0));
  }, [modoVista, ventaViendo]);

  const [detailSearch, setDetailSearch] = useState("");

  const handleExportPDF = () => {
    if (!ventaViendo) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const saleId = ventaViendo.noVenta || ventaViendo.id;
    const date = ventaViendo.fecha;
    // Group products by name to avoid repeating name for multiple sizes
    const rawItems = ventaViendo.productos || ventaViendo.detalles || [];
    const groupedItems = rawItems.reduce((acc, p) => {
      const price =
        typeof p.precio === "string"
          ? parseFloat(p.precio.replace(/[^0-9.]/g, ""))
          : p.precio;
      const subtotal =
        typeof p.subtotal === "string"
          ? parseFloat(p.subtotal.replace(/[^0-9.]/g, ""))
          : p.subtotal || (price * (parseInt(p.cantidad) || 0));

      const pNombre = p.nombre || p.nombreProducto || p.producto?.nombre;

      const existing = acc.find((item) => item.name === pNombre);
      if (existing) {
        existing.quantity =
          (parseInt(existing.quantity) || 0) + (parseInt(p.cantidad) || 0);
        if (!existing.sizes.includes(p.talla)) {
          existing.sizes.push(p.talla);
        }
        existing.subtotal += subtotal;
      } else {
        acc.push({
          name: pNombre,
          sizes: [p.talla],
          quantity: parseInt(p.cantidad) || 0,
          price: price,
          subtotal: subtotal,
        });
      }
      return acc;
    }, []);

    const total =
      typeof ventaViendo.total === "string"
        ? parseFloat(ventaViendo.total.replace(/[^0-9.]/g, ""))
        : ventaViendo.total || 0;

    const cliente = ventaViendo.cliente;
    const customerName =
      typeof cliente === "object" ? cliente?.nombre : cliente;
    const customerDoc =
      typeof cliente === "object" ? cliente?.num_documento : "N/A";
    const customerEmail = typeof cliente === "object" ? cliente?.correo : "N/A";
    const customerPhone =
      typeof cliente === "object" ? cliente?.telefono : "N/A";
    const customerAddress = ventaViendo.direccionEnvio || "Recogida en local";

    // Header - Left aligned Name, Right aligned Number
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text("Gorras medellín", 20, 25);
    
    doc.setFontSize(14);
    doc.text(`NUMERO PED: ${saleId}`, 190, 25, { align: 'right' });

    // Customer Data (Left)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text("Datos del cliente:", 20, 50);
    
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    
    const drawLine = (label, value, x, y) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, x, y);
      const labelWidth = doc.getTextWidth(label);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), x + labelWidth, y);
    };

    const shippingNote = ventaViendo.tipoEntrega === 'recoger' ? 'Recogida en local' : 'Consultar con el vendedor';

    drawLine("Fecha: ", date || '', 20, 57);
    drawLine("Nombre: ", customerName, 20, 62);
    drawLine("Documento: ", customerDoc, 20, 67);
    drawLine("Email: ", customerEmail, 20, 72);
    drawLine("Teléfono: ", customerPhone, 20, 77);
    drawLine("Dirección: ", customerAddress, 20, 82);
    drawLine("Método de Pago: ", ventaViendo.metodoPago || 'N/A', 20, 87);
    drawLine("Envío: ", shippingNote, 20, 92);

    // TOTAL FRONT OF CUSTOMER DATA (Right side) - Raised slightly to match OrdersSection.jsx
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("Total del pedido:", 190, 52, { align: 'right' });
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0); // Negro solicitado
    doc.text(`$${total.toLocaleString()}`, 190, 63, { align: 'right' });

    // Table Header - Black background
    const tableTop = 105;
    doc.setFillColor(0, 0, 0); 
    doc.rect(15, tableTop, 180, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("Item", 20, tableTop + 5.5);
    doc.text("Producto", 32, tableTop + 5.5);
    doc.text("Talla", 95, tableTop + 5.5);
    doc.text("Cantidad", 120, tableTop + 5.5);
    doc.text("Precio", 145, tableTop + 5.5);
    doc.text("Total", 175, tableTop + 5.5);

    // Table Rows
    let yPosItems = tableTop + 14;
    doc.setTextColor(0, 0, 0);
    const cols = [15, 28, 90, 115, 140, 168, 195];
    let currentPageTableTop = tableTop;

    groupedItems.forEach((item, idx) => {
      if (yPosItems > 260) {
        // Draw the bottom line and vertical lines of the table for the current page before adding a new page
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        const pageTableBottom = yPosItems - 8 + 2.5;
        doc.line(15, pageTableBottom, 195, pageTableBottom);

        cols.forEach(colX => {
          if (colX === 15 || colX === 195) {
            doc.line(colX, currentPageTableTop, colX, pageTableBottom);
          } else {
            doc.line(colX, currentPageTableTop + 8, colX, pageTableBottom);
          }
        });

        doc.addPage();
        currentPageTableTop = 10;
        
        // Draw header on new page
        doc.setFillColor(0, 0, 0); 
        doc.rect(15, 10, 180, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text("Item", 20, 10 + 5.5);
        doc.text("Producto", 32, 10 + 5.5);
        doc.text("Talla", 95, 10 + 5.5);
        doc.text("Cantidad", 120, 10 + 5.5);
        doc.text("Precio", 145, 10 + 5.5);
        doc.text("Total", 175, 10 + 5.5);
        
        doc.setTextColor(0, 0, 0);
        yPosItems = 10 + 14;
      }
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(String(idx + 1), 20, yPosItems);
      
      const displayName = item.name.length > 30 ? item.name.substring(0, 30) + "..." : item.name;
      doc.text(displayName, 32, yPosItems);
      doc.text(item.sizes.join(", "), 95, yPosItems);
      doc.text(String(item.quantity), 120, yPosItems);
      doc.text(`$${Number(item.price).toLocaleString("es-CO")}`, 145, yPosItems);
      doc.text(`$${Number(item.subtotal).toLocaleString("es-CO")}`, 175, yPosItems);
      
      // Draw thin gray horizontal line under each row
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      doc.line(15, yPosItems + 2.5, 195, yPosItems + 2.5);
      
      yPosItems += 8;
    });

    const tableBottom = yPosItems - 8 + 2.5;

    // Draw final page vertical lines
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    cols.forEach(colX => {
      if (colX === 15 || colX === 195) {
        doc.line(colX, currentPageTableTop, colX, tableBottom);
      } else {
        doc.line(colX, currentPageTableTop + 8, colX, tableBottom);
      }
    });

    // FOOTER CORPORATIVO
    const pageHeight = doc.internal.pageSize.height;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, pageHeight - 25, 195, pageHeight - 25);

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(
      "GORRAS MEDELLÍN - Tu estilo, nuestra pasión",
      105,
      pageHeight - 18,
      { align: "center" },
    );

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Alfonzo López - Medellin | WhatsApp: +57 300 6158180",
      105,
      pageHeight - 13,
      { align: "center" },
    );
    doc.text(
      "Email: duvann1991@gmail.com | Instagram: @gorrasmedellin",
      105,
      pageHeight - 8,
      { align: "center" },
    );

    doc.save(`Venta_${saleId}_GM_CAPS.pdf`);
  };

  return (
    <div className="ventas-page-wrapper">
      {alert.show && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
        />
      )}

      {partialPaymentModal.isOpen && (
        <div
          className="gm-zoom-overlay-admin"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#0b1220",
              border: "1.5px solid #FFC300",
              borderRadius: "16px",
              padding: "30px",
              maxWidth: "450px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
            }}
          >
            <h3
              style={{
                color: "#FFC300",
                fontSize: "20px",
                fontWeight: "800",
                marginBottom: "15px",
                letterSpacing: "0.5px",
              }}
            >
              Informar Pago Incompleto
            </h3>
            <div style={{ padding: "0 8px 15px", textAlign: "left" }}>
              <p
                style={{
                  color: "#fff",
                  marginBottom: "14px",
                  fontSize: "13px",
                  textAlign: "center",
                  lineHeight: "1.4",
                }}
              >
                La venta <strong>#{partialPaymentModal.venta?.id}</strong> es
                por un total de{" "}
                <strong>
                  $
                  {Number(partialPaymentModal.venta?.total || 0).toLocaleString(
                    "es-CO",
                  )}
                </strong>
                .
                <br />
                Ingrese cuánto dinero recibió realmente en el comprobante.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      color: "#FFC300",
                      fontSize: "11px",
                      fontWeight: "bold",
                      marginBottom: "5px",
                    }}
                  >
                    1RA CONSIGNACIÓN <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={partialPaymentModal.montoRecibido}
                    onChange={(e) =>
                      setPartialPaymentModal((prev) => ({
                        ...prev,
                        montoRecibido: e.target.value,
                      }))
                    }
                    placeholder="Ej: 400.000,50"
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "#0f172a",
                      border: "1px solid #1e293b",
                      borderRadius: "8px",
                      color: "#fff",
                      outline: "none",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      color: "#FFC300",
                      fontSize: "11px",
                      fontWeight: "bold",
                      marginBottom: "5px",
                    }}
                  >
                    2DA CONSIGNACIÓN
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={partialPaymentModal.montoNuevo}
                    onChange={(e) =>
                      setPartialPaymentModal((prev) => ({
                        ...prev,
                        montoNuevo: e.target.value,
                      }))
                    }
                    placeholder="Ej: 20.000,00"
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "#0f172a",
                      border: "1px solid #1e293b",
                      borderRadius: "8px",
                      color: "#fff",
                      outline: "none",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  background: "#000",
                  padding: "16px",
                  borderRadius: "12px",
                  marginBottom: "15px",
                  border: "1px solid rgba(255, 195, 0, 0.2)",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Total Recibido:
                  </span>
                  <span
                    style={{
                      fontSize: "15px",
                      color: "#fff",
                      fontWeight: "800",
                      fontFamily: '"Outfit", sans-serif',
                    }}
                  >
                    $
                    {(
                      Number(partialPaymentModal.montoRecibido || 0) +
                      Number(partialPaymentModal.montoNuevo || 0)
                    ).toLocaleString("es-CO", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Saldo Restante:
                  </span>
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: "800",
                      fontFamily: '"Outfit", sans-serif',
                      color:
                        Number(partialPaymentModal.venta?.total || 0) -
                          (Number(partialPaymentModal.montoRecibido || 0) +
                            Number(partialPaymentModal.montoNuevo || 0)) <=
                        0
                          ? "#10b981"
                          : "#ef4444",
                    }}
                  >
                    $
                    {Math.max(
                      0,
                      Number(partialPaymentModal.venta?.total || 0) -
                        (Number(partialPaymentModal.montoRecibido || 0) +
                          Number(partialPaymentModal.montoNuevo || 0)),
                    ).toLocaleString("es-CO", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#FFC300",
                    fontSize: "11px",
                    fontWeight: "bold",
                    marginBottom: "6px",
                  }}
                >
                  SEGUNDO COMPROBANTE
                </label>
                <div className="evidence-dropzone mini">
                  {partialPaymentModal.evidencia2 ? (
                    <div style={{ position: "relative" }}>
                      <img
                        src={partialPaymentModal.evidencia2}
                        alt="Comprobante 2"
                        style={{
                          width: "100%",
                          borderRadius: "8px",
                          maxHeight: "100px",
                          objectFit: "cover",
                        }}
                      />
                      <button
                        onClick={() =>
                          setPartialPaymentModal((p) => ({
                            ...p,
                            evidencia2: null,
                          }))
                        }
                        className="btn-remove-evidence mini"
                      >
                        <FaTrash size={10} />
                      </button>
                    </div>
                  ) : (
                    <label
                      className="btn-select-evidence mini"
                      style={{
                        backgroundColor: "transparent",
                        border: "1px solid #FFC300",
                        color: "#FFC300",
                      }}
                    >
                      SUBIR SEGUNDO PAGO
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImage2Upload}
                        className="display-none"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                  marginTop: "20px",
                }}
              >
                <button
                  onClick={() =>
                    setPartialPaymentModal({
                      isOpen: false,
                      venta: null,
                      montoRecibido: "",
                      evidencia2: null,
                    })
                  }
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    background: "transparent",
                    border: "1.5px solid rgba(255, 255, 255, 0.2)",
                    color: "#fff",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "14px",
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() =>
                    handlePartialPayment(
                      partialPaymentModal.montoRecibido,
                      partialPaymentModal.montoNuevo,
                    )
                  }
                  disabled={
                    loading ||
                    Number(partialPaymentModal.montoRecibido || 0) +
                      Number(partialPaymentModal.montoNuevo || 0) <
                      Number(partialPaymentModal.venta?.total || 0)
                  }
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    background:
                      Number(partialPaymentModal.montoRecibido || 0) +
                        Number(partialPaymentModal.montoNuevo || 0) <
                      Number(partialPaymentModal.venta?.total || 0)
                        ? "#1e293b"
                        : "#3b82f6",
                    color:
                      Number(partialPaymentModal.montoRecibido || 0) +
                        Number(partialPaymentModal.montoNuevo || 0) <
                      Number(partialPaymentModal.venta?.total || 0)
                        ? "#94a3b8"
                        : "#fff",
                    border: "none",
                    fontWeight: "800",
                    borderRadius: "10px",
                    cursor:
                      Number(partialPaymentModal.montoRecibido || 0) +
                        Number(partialPaymentModal.montoNuevo || 0) <
                      Number(partialPaymentModal.venta?.total || 0)
                        ? "not-allowed"
                        : "pointer",
                    fontSize: "14px",
                    boxShadow:
                      Number(partialPaymentModal.montoRecibido || 0) +
                        Number(partialPaymentModal.montoNuevo || 0) <
                      Number(partialPaymentModal.venta?.total || 0)
                        ? "none"
                        : "0 4px 12px rgba(59, 130, 246, 0.3)",
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? "Procesando..." : "Completar Venta"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {approveModal.isOpen && (
        <div
          className="gm-zoom-overlay-admin"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#0b1220",
              border: "1.5px solid #FFC300",
              borderRadius: "16px",
              padding: "35px",
              maxWidth: "450px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
            }}
          >
            <h3
              style={{
                color: "#FFC300",
                fontSize: "22px",
                fontWeight: "800",
                marginBottom: "20px",
                letterSpacing: "0.5px",
              }}
            >
              Confirmar Pago
            </h3>
            <p
              style={{
                color: "#fff",
                fontSize: "16px",
                marginBottom: "30px",
                fontWeight: "500",
              }}
            >
              ¿Estás seguro que deseas confirmar el pago de este envío:{" "}
              <strong style={{ color: "#3b82f6" }}>
                #{approveModal.venta?.noVenta || approveModal.venta?.id}
              </strong>
              ?
            </p>
            <div
              style={{ display: "flex", gap: "15px", justifyContent: "center" }}
            >
              <button
                onClick={() => setApproveModal({ isOpen: false, venta: null })}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: "transparent",
                  border: "1.5px solid rgba(255, 255, 255, 0.2)",
                  color: "#fff",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "14px",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  updateVentaStatus(availableStatuses[1], "", null, approveModal.venta?.id);
                }}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: "#FFC300",
                  border: "none",
                  color: "#000",
                  fontWeight: "800",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "14px",
                  boxShadow: "0 4px 12px rgba(255, 195, 0, 0.3)",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Confirmando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
      {rejectModal.isOpen && (
        <div
          className="gm-zoom-overlay-admin"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#0b1220",
              border: "1.5px solid #FFC300",
              borderRadius: "16px",
              padding: "35px",
              maxWidth: "450px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
            }}
          >
            <h3
              style={{
                color: "#FFC300",
                fontSize: "22px",
                fontWeight: "800",
                marginBottom: "20px",
                letterSpacing: "0.5px",
              }}
            >
              Rechazar Venta
            </h3>
            <p
              style={{
                color: "#fff",
                fontSize: "15px",
                marginBottom: "20px",
                fontWeight: "500",
              }}
            >
              ¿Desea rechazar la venta{" "}
              <strong style={{ color: "#3b82f6" }}>
                #{rejectModal.venta?.noVenta || rejectModal.venta?.id}
              </strong>
              ? Por favor, ingrese el motivo.
            </p>

            <div style={{ marginBottom: "25px", textAlign: "left" }}>
              <label
                style={{
                  display: "block",
                  color: "#FFC300",
                  fontSize: "12px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                MOTIVO DE RECHAZO <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ej: Comprobante de pago inválido, producto sin stock..."
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: "8px",
                  color: "#fff",
                  minHeight: "100px",
                  outline: "none",
                  fontSize: "13px",
                  opacity: loading ? 0.6 : 1,
                }}
              />
            </div>

            <div
              style={{ display: "flex", gap: "15px", justifyContent: "center" }}
            >
              <button
                onClick={() => {
                  setRejectModal({ isOpen: false, venta: null });
                  setRejectionReason("");
                }}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: "transparent",
                  border: "1.5px solid rgba(255, 255, 255, 0.2)",
                  color: "#fff",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "14px",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!rejectionReason.trim()) {
                    setAlert({
                      show: true,
                      message: "El motivo de rechazo es obligatorio",
                      type: "error",
                    });
                    return;
                  }
                  updateVentaStatus(availableStatuses[2], rejectionReason);
                }}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: "#ef4444",
                  border: "none",
                  color: "#fff",
                  fontWeight: "800",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "14px",
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Rechazando..." : "Rechazar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {annulModal.isOpen && (
        <div
          className="gm-zoom-overlay-admin"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#0b1220",
              border: "1.5px solid #F5C81B",
              borderRadius: "16px",
              padding: "35px",
              maxWidth: "450px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
            }}
          >
            <h3
              style={{
                color: "#F5C81B",
                fontSize: "22px",
                fontWeight: "800",
                marginBottom: "20px",
                letterSpacing: "0.5px",
              }}
            >
              Anular Venta
            </h3>
            <p
              style={{
                color: "#fff",
                fontSize: "16px",
                marginBottom: "30px",
                fontWeight: "500",
              }}
            >
              ¿Estás seguro de que deseas anular la venta{" "}
              <strong style={{ color: "#3b82f6" }}>
                #{annulModal.venta?.noVenta || annulModal.venta?.id}
              </strong>
              ?
            </p>
            <div
              style={{ display: "flex", gap: "15px", justifyContent: "center" }}
            >
              <button
                onClick={() => setAnnulModal({ isOpen: false, venta: null })}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: "transparent",
                  border: "1.5px solid rgba(255, 255, 255, 0.2)",
                  color: "#fff",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "14px",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => updateVentaStatus("Anulada")}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: "#F5C81B",
                  border: "none",
                  color: "#000",
                  fontWeight: "800",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "14px",
                  boxShadow: "0 4px 12px rgba(245, 200, 27, 0.3)",
                }}
              >
                {loading ? "Anulando..." : "Anular"}
              </button>
            </div>
          </div>
        </div>
      )}

      {sendConfirmModal.isOpen && (
        <div
          className="gm-zoom-overlay-admin"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#0b1220",
              border: "1.5px solid #FFC300",
              borderRadius: "16px",
              padding: "35px",
              maxWidth: "450px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
            }}
          >
            <h3
              style={{
                color: "#FFC300",
                fontSize: "22px",
                fontWeight: "800",
                marginBottom: "20px",
                letterSpacing: "0.5px",
              }}
            >
              Confirmar Envío
            </h3>
            <p
              style={{
                color: "#fff",
                fontSize: "16px",
                marginBottom: "30px",
                fontWeight: "500",
              }}
            >
              ¿Estás seguro de que deseas marcar el pedido{" "}
              <strong style={{ color: "#3b82f6" }}>
                #{sendConfirmModal.venta?.noVenta || sendConfirmModal.venta?.id}
              </strong>{" "}
              como <span style={{ color: "#10b981" }}>Enviado</span>?
            </p>
            <div
              style={{ display: "flex", gap: "15px", justifyContent: "center" }}
            >
              <button
                onClick={() =>
                  setSendConfirmModal({ isOpen: false, venta: null })
                }
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: "transparent",
                  border: "1.5px solid rgba(255, 255, 255, 0.2)",
                  color: "#fff",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "14px",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  handleEnviarVenta(sendConfirmModal.venta);
                  setSendConfirmModal({ isOpen: false, venta: null });
                }}
                style={{
                  flex: 1,
                  padding: "12px 20px",
                  background: "#FFC300",
                  border: "none",
                  color: "#000",
                  fontWeight: "800",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "14px",
                  boxShadow: "0 4px 12px rgba(255, 195, 0, 0.3)",
                }}
              >
                {loading ? "Procesando..." : "Confirmar Envío"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visualador de Comprobante Premium */}
      {imgModal.open && (
        <AdminExpandedImageModal src={imgModal.src} onClose={() => setImgModal({ open: false, src: "" })} />
      )}

      <div className="ventas-container">
        {/* HEADER */}
        <div className="ventas-header">
          <div className="ventas-header-top">
            <div className="header-title-block">
              {(modoVista === "formulario" || modoVista === "detalle") && (
                <button onClick={mostrarLista} className="view-btn-back">
                  <FaArrowLeft size={16} />
                </button>
              )}
              <div>
                <h1 className="ventas-title">
                  {modoVista === "lista" && "Ventas"}
                  {modoVista === "formulario" && "Registrar Venta"}
                  {modoVista === "detalle" && "Detalles Venta"}
                </h1>
                <p className="ventas-subtitle">
                  {modoVista === "lista" &&
                    "Gestión de ventas y compras de clientes"}
                  {modoVista === "formulario" &&
                    "Ingrese los datos de la venta y suba el comprobante de pago"}
                  {modoVista === "detalle" &&
                    "Revisión de venta y comprobante de pago"}
                </p>
              </div>
            </div>

            {modoVista === "lista" && (
              <button onClick={mostrarFormulario} className="ventas-btn-add">
                Registrar Venta
              </button>
            )}

            {modoVista === "detalle" && (
              <button
                onClick={handleExportPDF}
                className="compras-btn-pdf"
                style={{
                  backgroundColor: '#000000',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '8px',
                  padding: '0 15px',
                  height: '40px',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <FaFilePdf size={14} /> Descargar PDF
              </button>
            )}

            {modoVista === "formulario" && (
              <button
                onClick={handleCreateVenta}
                className="ventas-btn-submit"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar Venta"}
              </button>
            )}
          </div>

          {modoVista === "lista" && (
            <div
              className="ventas-controls"
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "5px",
                marginBottom: "2px",
              }}
            >
              <div style={{ flex: 1, marginRight: "20px" }}>
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar por cliente o número de venta..."
                  onClear={() => setSearchTerm("")}
                  fullWidth={true}
                />
              </div>
              <div className="ventas-filter-container">
                <StatusFilter
                  filterStatus={filterStatus}
                  statuses={availableStatuses}
                  onFilterSelect={(s) => {
                    setFilterStatus(s);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {modoVista === "lista" ? (
          <div className="ventas-table-container">
            <div className="ventas-table-wrapper yellow-scrollbar">
              <EntityTable
                entities={paginatedVentas}
                columns={columns}
                loading={loading}
                onView={mostrarDetalle}
                onApprove={(v) => setApproveModal({ isOpen: true, venta: v })}
                onReject={(v) => setRejectModal({ isOpen: true, venta: v })}
                onAnular={(v) => setAnnulModal({ isOpen: true, venta: v })}
                onPartialPago={(v) => {
                  setPartialPaymentModal({
                    isOpen: true,
                    venta: v,
                    montoRecibido: v.montoPagado || "",
                    montoNuevo: "",
                    evidencia2: v.evidencia2 || null,
                  });
                }}
                onEnviar={(v) =>
                  setSendConfirmModal({ isOpen: true, venta: v })
                }
                moduleType="ventas"
              />
            </div>
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filtered.length}
              showingStart={filtered.length > 0 ? (currentPage - 1) * 7 + 1 : 0}
              endIndex={Math.min(currentPage * 7, filtered.length)}
              itemsName="ventas"
            />
          </div>
        ) : modoVista === "formulario" ? (
          <div className="ventas-form-wrapper yellow-scrollbar">
            {/* PRIMERA FILA: DATOS Y COMPROBANTE */}
            <div className="sales-top-row">
              {/* CARD 1: DATOS DE VENTA */}
              <div className="venta-form-card">
                <div className="section-title" style={{ color: "#8F9DB1" }}>
                  <FaUser size={14} /> Datos de venta
                </div>
                <div className="form-data-grid">
                  <div
                    className="form-field-group full-width"
                    style={{ marginBottom: "8px" }}
                  >
                    <label
                      className="form-label"
                      style={{ color: "#8F9DB1", fontWeight: "800" }}
                    >
                      Cliente : <span className="required">*</span>
                    </label>
                    <SearchSelect
                      options={availableCustomers}
                      selectedItem={availableCustomers.find(
                        (c) => String(c.id) === String(nuevaVenta.idCliente),
                      )}
                      onSelect={(client) => {
                        const id = client?.id || "";
                        actualizarProducto(-1, "idCliente", id);
                        if (client?.direccion) {
                          actualizarProducto(
                            -1,
                            "direccionEnvio",
                            client.direccion,
                          );
                        }
                      }}
                      placeholder="Buscar por nombre, documento o correo..."
                      error={errors.idCliente}
                      filterFn={(c, term) => {
                        const t = term.toLowerCase();
                        return (
                          (c.nombre || "").toLowerCase().includes(t) ||
                          (c.num_documento || "").toLowerCase().includes(t) ||
                          (c.correo || "").toLowerCase().includes(t)
                        );
                      }}
                      renderOption={(c) => (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 700,
                              color: "#fff",
                              fontSize: "14px",
                            }}
                          >
                            {c.nombre || "Sin nombre"}
                          </span>
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                            Doc: {c.num_documento || "N/A"} •{" "}
                            {c.correo || "S/C"}
                          </span>
                        </div>
                      )}
                    />
                  </div>

                  <div className="form-data-grid three-columns">
                    <div className="form-field-group">
                      <label
                        className="form-label"
                        style={{ color: "#8F9DB1", fontWeight: "800" }}
                      >
                        Método de pago : <span className="required">*</span>
                      </label>
                      <select
                        value={nuevaVenta.metodoPago || ""}
                        onChange={(e) =>
                          actualizarProducto(-1, "metodoPago", e.target.value)
                        }
                        className={`form-input-main ${errors.metodoPago ? "has-error" : ""}`}
                      >
                        <option value="" disabled hidden>
                          Seleccionar...
                        </option>
                        {["Efectivo", "Bancolombia", "Nequi", "Bold"].map(
                          (m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label
                        className="form-label"
                        style={{ color: "#8F9DB1", fontWeight: "800" }}
                      >
                        Tipo de entrega : <span className="required">*</span>
                      </label>
                      <select
                        value={nuevaVenta.tipoEntrega || ""}
                        onChange={(e) =>
                          actualizarProducto(-1, "tipoEntrega", e.target.value)
                        }
                        className={`form-input-main ${errors.tipoEntrega ? "has-error" : ""}`}
                      >
                        <option value="" disabled hidden>
                          Seleccionar...
                        </option>
                        <option value="envio">🚚 Envío a domicilio</option>
                        <option value="recoger">🏪 Recoger en local</option>
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label
                        className="form-label"
                        style={{ color: "#8F9DB1", fontWeight: "800" }}
                      >
                        Fecha : <span className="required">*</span>
                      </label>
                      <DateInputWithCalendar
                        value={nuevaVenta.fecha}
                        onChange={(d) => actualizarProducto(-1, "fecha", d)}
                        className={`ventas-date-input ${errors.fecha ? "has-error" : ""}`}
                      />
                      {errors.fecha && typeof errors.fecha === 'string' && (
                        <div className="error-text" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>
                          {errors.fecha}
                        </div>
                      )}
                    </div>
                  </div>

                  {nuevaVenta.tipoEntrega === "envio" && (
                    <div className="form-field-group full-width">
                      <label
                        className="form-label"
                        style={{ color: "#8F9DB1", fontWeight: "800" }}
                      >
                        Dirección de envío : <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        value={nuevaVenta.direccionEnvio || ""}
                        onChange={(e) =>
                          actualizarProducto(
                            -1,
                            "direccionEnvio",
                            e.target.value,
                          )
                        }
                        placeholder="Calle 123 # 45-67..."
                        className={`form-input-main ${errors.direccionEnvio ? "has-error" : ""}`}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 2: comprobante de pago */}
              <div className="venta-form-card">
                <div className="section-title" style={{ color: "#8F9DB1" }}>
                  <FaCamera size={14} /> Comprobante de pago
                  {requiresReceipt(nuevaVenta.metodoPago) && (
                    <span className="required"> *</span>
                  )}
                </div>
                <div
                  className={`evidence-dropzone ${errors.evidencia ? "has-error" : ""}`}
                >
                  {nuevaVenta.evidencia ? (
                    <>
                      <img
                        src={nuevaVenta.evidencia}
                        alt="Comprobante"
                        className="evidence-preview-img"
                      />
                      <button
                        onClick={() =>
                          actualizarProducto(-1, "evidencia", null)
                        }
                        className="btn-remove-evidence"
                      >
                        <FaTrash size={12} />
                      </button>
                    </>
                  ) : (
                    <div className="evidence-empty-v">
                      <FaImage size={48} color="#334155" className="mb-10" />
                      <p
                        className="evidence-desc"
                        style={{ marginTop: "15px" }}
                      >
                        {requiresReceipt(nuevaVenta.metodoPago)
                          ? "Ingrese el formato de la imagen aquí"
                          : "No se requiere comprobante para este método de pago"}
                      </p>
                      {requiresReceipt(nuevaVenta.metodoPago) && (
                        <label className="btn-select-evidence">
                          SELECCIONAR ARCHIVO
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="display-none"
                          />
                        </label>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SEGUNDA FILA: PRODUCTOS (FULL WIDTH) */}
            <div className="venta-form-card full-width-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "20px",
                }}
              >
                <div
                  className="section-title"
                  style={{
                    marginBottom: 0,
                    color: "#8F9DB1",
                    fontWeight: "800",
                  }}
                >
                  <FaBoxOpen size={14} /> Productos
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "15px",
                  }}
                >
                  <button
                    onClick={agregarProducto}
                    className="btn-add-row-yellow"
                  >
                    <FaPlus size={10} /> AGREGAR
                  </button>
                  <div className="total-summary" style={{ marginTop: 0 }}>
                    <span className="total-label" style={{ fontSize: "12px" }}>
                      Subtotal:
                    </span>
                    <span
                      className="total-value"
                      style={{ fontSize: "18px", color: "#F5C81B" }}
                    >
                      ${calcularTotal().toLocaleString("es-CO")}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="products-table-header"
                style={{
                  gridTemplateColumns: "22px 1fr 110px 110px 40px",
                  gap: "12px",
                }}
              >
                <span className="header-label">#</span>
                <span className="header-label">Producto / Variantes</span>
                <span className="header-label" style={{ textAlign: "center" }}>
                  Precio
                </span>
                <span
                  className="header-label"
                  style={{ textAlign: "center", color: "#00f2ff" }}
                >
                  Subtotal
                </span>
                <span></span>
              </div>

              <div className="products-list-scroll">
                {nuevaVenta.productos.map((p, i) => (
                  <ProductoForm
                    key={p._tempKey}
                    producto={p}
                    index={i}
                    onChange={actualizarProducto}
                    onRemove={eliminarProducto}
                    isFirst={i === 0}
                    availableProducts={availableProducts}
                    availableSizes={availableSizes}
                    errors={errors}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* DETALLE */
          <div className="ventas-detail-wrapper yellow-scrollbar">
            <div className="sales-top-row">
              {/* CARD 1: DATOS DE VENTA (Detalle) */}
              <div className="venta-form-card">
                <div className="section-title" style={{ color: "#8F9DB1" }}>
                  <FaUser size={14} /> Datos de venta
                </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: "15px",
                      marginBottom: "15px",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label className="form-label" style={{ color: "#8F9DB1", fontWeight: "800", fontSize: "0.85rem" }}>
                        No. de venta
                      </label>
                      <div className="product-input disabled important">
                        {ventaViendo?.noVenta || ventaViendo?.id}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label className="form-label" style={{ color: "#8F9DB1", fontWeight: "800", fontSize: "0.85rem" }}>
                        Cliente
                      </label>
                      <div className="product-input disabled">
                        {typeof ventaViendo?.cliente === "object" ? ventaViendo?.cliente?.nombre : ventaViendo?.cliente}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label className="form-label" style={{ color: "#8F9DB1", fontWeight: "800", fontSize: "0.85rem" }}>
                        Método de pago
                      </label>
                      <div className="product-input disabled">
                        {ventaViendo?.metodoPago}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label className="form-label" style={{ color: "#8F9DB1", fontWeight: "800", fontSize: "0.85rem" }}>
                        Método de entrega
                      </label>
                      <div className="product-input disabled">
                        {ventaViendo?.tipoEntrega === "recoger" ? "🏪 Recogida local" : "🚚 Domicilio"}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label className="form-label" style={{ color: "#8F9DB1", fontWeight: "800", fontSize: "0.85rem" }}>
                        Fecha
                      </label>
                      <div className="product-input disabled">
                        {ventaViendo?.fecha}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label className="form-label" style={{ color: "#8F9DB1", fontWeight: "800", fontSize: "0.85rem" }}>
                        Total
                      </label>
                      <div className="product-input disabled success" style={{ fontWeight: 800, textShadow: "none", boxShadow: "none" }}>
                        ${Number(ventaViendo?.total || 0).toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label className="form-label" style={{ color: "#8F9DB1", fontWeight: "800", fontSize: "0.85rem" }}>
                        Estado Envío
                      </label>
                      <div className="product-input disabled" style={{ color: "#38bdf8", fontWeight: "800" }}>
                        {ventaViendo?.statusenvio || "Por enviar"}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label className="form-label" style={{ color: "#8F9DB1", fontWeight: "800", fontSize: "0.85rem" }}>
                      Dirección de envío
                    </label>
                    <div className="product-input disabled address-highlight" style={{ textAlign: "left", padding: "10px 16px" }}>
                      {ventaViendo?.direccionEnvio || "N/A"}
                    </div>
                  </div>
              </div>

              {/* CARD 2: COMPROBANTE DE PAGO (Detalle) */}
              <div className="venta-form-card">
                <div className="section-title" style={{ color: "#8F9DB1" }}>
                  <FaCamera size={14} /> Comprobante(s) de pago
                </div>

                {ventaViendo?.estado === "Pago Incompleto" && (
                  <div className="partial-balance-banner">
                    <FaExclamationTriangle />
                    <span>
                      FALTAN $
                      {(
                        ventaViendo.total - ventaViendo.montoPagado
                      ).toLocaleString("es-CO")}
                    </span>
                  </div>
                )}

                <div className="gm-receipt-container-premium-admin multiple">
                  {ventaViendo?.evidencia ? (
                    <div
                      className="gm-receipt-wrapper-premium-admin"
                      onClick={() => openImage(ventaViendo.evidencia)}
                    >
                      <img
                        src={ventaViendo.evidencia}
                        alt="Comprobante 1"
                        className="gm-receipt-img-premium-admin"
                      />
                      <div className="gm-receipt-overlay-premium-admin">
                        Pago 1
                      </div>
                    </div>
                  ) : null}

                  {ventaViendo?.evidencia2 ? (
                    <div
                      className="gm-receipt-wrapper-premium-admin"
                      onClick={() => openImage(ventaViendo.evidencia2)}
                    >
                      <img
                        src={ventaViendo.evidencia2}
                        alt="Comprobante 2"
                        className="gm-receipt-img-premium-admin"
                      />
                      <div className="gm-receipt-overlay-premium-admin">
                        Pago 2
                      </div>
                    </div>
                  ) : null}

                  {!ventaViendo?.evidencia && !ventaViendo?.evidencia2 && (
                    <div className="evidence-empty-v-admin">
                      <FaCamera
                        size={32}
                        style={{ marginBottom: "10px", opacity: 0.3 }}
                      />
                      <span>Sin comprobantes</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fila inferior: PRODUCTOS (Detalle) */}
            <div
              className="venta-form-card full-width-card"
              style={{ marginTop: "8px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <div
                  className="section-title"
                  style={{
                    marginBottom: 0,
                    color: "#8F9DB1",
                    fontWeight: "800",
                  }}
                >
                  <FaBoxOpen size={14} /> Productos adquiridos
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "20px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                      }}
                    >
                      ESTADO:
                    </span>
                    <StatusPill status={ventaViendo?.estado} />
                  </div>

                  <div style={{ width: "250px" }}>
                    <SearchInput
                      value={detailSearch}
                      onChange={setDetailSearch}
                      placeholder="Buscar producto..."
                      onClear={() => setDetailSearch("")}
                    />
                  </div>
                </div>
              </div>
              <div
                className="products-table-header products-table-header-view"
                style={{
                  gridTemplateColumns: "40px 1fr 140px 140px",
                  gap: "12px",
                }}
              >
                <span className="header-label" style={{ textAlign: "center" }}>
                  #
                </span>
                <span className="header-label">PRODUCTO / TALLAS</span>
                <span className="header-label" style={{ textAlign: "center" }}>
                  PRECIO UNI.
                </span>
                <span
                  className="header-label important"
                  style={{ textAlign: "center", color: "#FFC107" }}
                >
                  SUBTOTAL
                </span>
              </div>
              <div className="products-list-scroll">
                {(groupedProductsViendo || [])
                  .filter((p) =>
                    p.nombre
                      ?.toLowerCase()
                      .includes(detailSearch.toLowerCase()),
                  )
                  .map((p, i) => (
                    <ProductoForm
                      key={i}
                      index={i}
                      producto={p}
                      isViewMode={true}
                    />
                  ))}
              </div>

              {/* SUMA TOTAL DE LA VENTA REMOVIDA PARA EVITAR REDUNDANCIA */}
              <div
                className="detail-footer-actions"
                style={{ marginTop: "10px", borderTop: "none" }}
              >
                {/* Motivo de Rechazo (si ya está rechazada) */}
                {(ventaViendo?.estado === availableStatuses[2] ||
                  ventaViendo?.estado?.toLowerCase().includes("rechaz")) && (
                  <div className="status-motivo-banner">
                    <span className="motivo-label">MOTIVO DE RECHAZO:</span>
                    <p className="motivo-text">
                      {ventaViendo?.motivoRechazo || "No especificado."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VentasPage;
