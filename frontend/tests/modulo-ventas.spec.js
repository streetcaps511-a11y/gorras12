import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

// ===== MOCKS COMPARTIDOS =====
const mockClientes = [
  {
    id: '1', IdCliente: 1,
    nombre: 'Cliente Test 1', nombreCompleto: 'Cliente Test 1', NombreCompleto: 'Cliente Test 1',
    num_documento: '1029384756', numeroDocumento: '1029384756',
    email: 'cliente1@test.com', correo: 'cliente1@test.com',
    telefono: '3001234567', direccion: 'Calle 123', isActive: true
  },
  {
    id: '2', IdCliente: 2,
    nombre: 'Cliente Test 2', nombreCompleto: 'Cliente Test 2', NombreCompleto: 'Cliente Test 2',
    num_documento: '9876543210', numeroDocumento: '9876543210',
    email: 'cliente2@test.com', correo: 'cliente2@test.com',
    telefono: '3009876543', direccion: 'Calle 456', isActive: true
  }
];

const mockProducts = [
  {
    id: 1, IdProducto: 1,
    nombre: 'Gorra Deportiva', Nombre: 'Gorra Deportiva',
    tallasStock: [{ talla: 'Ajustable', cantidad: 10 }, { talla: '7', cantidad: 5 }],
    precioVenta: 25000, PrecioVenta: 25000,
    precioMayorista6: 18000, PrecioMayorista6: 18000,
    precioMayorista80: 16000, PrecioMayorista80: 16000,
    isActive: true
  }
];

const mockPaymentMethods = ['Efectivo', 'Bancolombia', 'Nequi', 'Bold'];
const mockStatuses = ['Pendiente', 'Completada', 'Rechazada'];
const mockSizes = ['Ajustable', '7', '7/1/4', '7/1/8'];

const mockSales = [
  {
    id: 1, IdVenta: 1,
    noVenta: '1001', NoVenta: '1001',
    cliente: { nombre: 'Cliente Test 1', num_documento: '1029384756', correo: 'cliente1@test.com', telefono: '3001234567' },
    idCliente: 1, fecha: '2026-06-20', Fecha: '2026-06-20',
    total: 25000, Total: 25000, montoPagado: 25000, MontoPagado: 25000,
    metodoPago: 'Efectivo', MetodoPago: 'Efectivo',
    estado: 'Pendiente', Estado: 'Pendiente',
    statusenvio: 'Por enviar', StatusEnvio: 'Por enviar',
    tipoEntrega: 'recoger', TipoEntrega: 'recoger',
    direccionEnvio: 'N/A', DireccionEnvio: 'N/A',
    productos: [{ id: 1, idProducto: 1, nombre: 'Gorra Deportiva', talla: 'Ajustable', cantidad: 1, precio: 25000 }]
  },
  {
    id: 2, IdVenta: 2,
    noVenta: '1002', NoVenta: '1002',
    cliente: { nombre: 'Cliente Test 2', num_documento: '9876543210', correo: 'cliente2@test.com', telefono: '3009876543' },
    idCliente: 2, fecha: '2026-06-21',
    total: 50000, montoPagado: 50000,
    metodoPago: 'Transferencia',
    estado: 'Pago Incompleto', Estado: 'Pago Incompleto',
    statusenvio: 'Por enviar',
    tipoEntrega: 'domicilio', direccionEnvio: 'Calle 456',
    evidencia: null,
    productos: [{ id: 2, idProducto: 1, nombre: 'Gorra Deportiva', talla: '7', cantidad: 2, precio: 25000 }]
  },
  {
    id: 3, IdVenta: 3,
    noVenta: '1003', NoVenta: '1003',
    cliente: { nombre: 'Cliente Test 1' },
    idCliente: 1, fecha: '2026-06-22',
    total: 25000, montoPagado: 25000,
    metodoPago: 'Transferencia',
    estado: 'Completada', Estado: 'Completada',
    statusenvio: 'Por enviar',
    tipoEntrega: 'domicilio',
    evidencia: 'http://example.com/comprobante.jpg',
    productos: [{ id: 3, idProducto: 1, nombre: 'Gorra Deportiva', talla: 'Ajustable', cantidad: 1, precio: 25000 }]
  },
  {
    id: 4, IdVenta: 4,
    noVenta: '1004', NoVenta: '1004',
    cliente: { nombre: 'Cliente Test 2' },
    idCliente: 2, fecha: '2026-06-23',
    total: 25000, montoPagado: 25000,
    metodoPago: 'Efectivo',
    estado: 'Anulada', Estado: 'Anulada',
    statusenvio: 'Por enviar',
    tipoEntrega: 'recoger',
    productos: [{ id: 4, idProducto: 1, nombre: 'Gorra Deportiva', talla: '7', cantidad: 1, precio: 25000 }]
  }
];

async function setupVentasRoutes(page) {
  await page.route('**/api/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
  });

  await page.route('**/api/mi/perfil', async (route) => {
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: 1, email: 'duvann1991@gmail.com', idRol: 1, rol: 'Administrador',
          nombre: 'Administrador', estado: 'activo',
          permisos: ['perm_roles', 'perm_usuarios', 'perm_dashboard', 'perm_productos', 'perm_clientes', 'perm_ventas', 'perm_compras', 'perm_proveedores', 'perm_categorias', 'perm_devoluciones']
        }
      })
    });
  });

  await page.route('**/api/auth/verify', async (route) => {
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        usuario: {
          id: 1, email: 'duvann1991@gmail.com', idRol: 1, rol: 'Administrador',
          rolData: { nombre: 'Administrador' }, estado: 'activo',
          permisos: ['perm_roles', 'perm_usuarios', 'perm_dashboard', 'perm_productos', 'perm_clientes', 'perm_ventas', 'perm_compras', 'perm_proveedores', 'perm_categorias', 'perm_devoluciones'],
          sessionId: 'test-session-hu07'
        }
      })
    });
  });

  await page.route('**/api/clientes', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockClientes }) });
  });

  await page.route('**/api/productos*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockProducts }) });
  });

  await page.route('**/api/estados/tipo/metodo_pago', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockPaymentMethods }) });
  });

  await page.route('**/api/estados', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockStatuses.map(s => ({ Nombre: s })) }) });
  });

  await page.route('**/api/tallas', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockSizes }) });
  });

  await page.route('**/api/ventas', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockSales }) });
    } else if (method === 'POST') {
      const body = route.request().postDataJSON ? await route.request().postDataJSON() : JSON.parse(route.request().postData() || '{}');
      const newVenta = {
        id: Date.now(), IdVenta: Date.now(),
        noVenta: String(mockSales.length + 1001),
        cliente: mockClientes.find(c => String(c.id) === String(body.idCliente)) || { nombre: 'Cliente Test 1' },
        idCliente: body.idCliente,
        fecha: new Date().toLocaleDateString('es-CO'),
        total: body.total || 25000, montoPagado: body.total || 25000,
        metodoPago: body.metodoPago || 'Efectivo',
        estado: 'Pendiente', statusenvio: 'Por enviar',
        tipoEntrega: body.tipoEntrega || 'recoger',
        direccionEnvio: body.direccionEnvio || 'N/A',
        productos: (body.productos || []).map(p => ({
          idProducto: p.idProducto, nombre: 'Gorra Deportiva',
          talla: p.talla, cantidad: p.cantidad, precio: p.precio, subtotal: p.cantidad * p.precio
        }))
      };
      mockSales.unshift(newVenta);
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ success: true, data: newVenta }) });
    }
  });

  await page.route('**/api/ventas/*/estado', async (route) => {
    const body = route.request().postDataJSON ? await route.request().postDataJSON() : JSON.parse(route.request().postData() || '{}');
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { id: 1, estado: body.nuevoEstado || body.estado || 'Completada', total: 25000, montoPagado: body.montoPagado || 25000 } })
    });
  });

  await page.route('**/api/ventas/*/envio', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { statusenvio: 'Enviado' } }) });
  });

  await page.route('**/api/auth/logout', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });
}

async function loginAdmin(page) {
  await setupVentasRoutes(page);
  await page.addInitScript(() => {
    const fakeUser = {
      id: 1, IdUsuario: 1, idRol: 1, Rol: 'Administrador', rol: 'Administrador',
      nombre: 'Administrador', email: 'duvann1991@gmail.com',
      estado: 'activo', Estado: 'activo',
      permisos: ['perm_roles', 'perm_usuarios', 'perm_dashboard', 'perm_productos', 'perm_clientes', 'perm_ventas', 'perm_compras', 'perm_proveedores', 'perm_categorias', 'perm_devoluciones'],
      token: 'test-token-hu-07', userType: 'admin', sessionId: 'test-session-hu07'
    };
    sessionStorage.setItem('user', JSON.stringify(fakeUser));
    sessionStorage.setItem('token', fakeUser.token);
  });
}

// ===========================
// HU-07: REGISTRAR VENTA
// ===========================
test.describe('HU-07: Registrar venta', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin/ventas`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('button.ventas-btn-add', { timeout: 15000 });
  });

  test('CA_07_01: Debe visualizar botón para registrar una nueva venta', async ({ page }) => {
    const btnAdd = page.locator('button.ventas-btn-add');
    await expect(btnAdd).toBeVisible();
    await expect(btnAdd).toHaveText('Registrar Venta');
  });

  test('CA_07_02: Debe registrar una venta exitosamente', async ({ page }) => {
    await page.locator('button.ventas-btn-add').click();
    await expect(page.locator('.ventas-title')).toHaveText('Registrar Venta');

    const clientSelect = page.locator('.form-field-group:has-text("Cliente :")');
    await clientSelect.locator('.search-select-header').click();
    await clientSelect.locator('.header-search-input').fill('Cliente Test 1');
    await page.locator('.option-item:has-text("Cliente Test 1")').first().click();

    await page.locator('label:has-text("Método de pago :") + select').selectOption('Efectivo');
    await page.locator('label:has-text("Tipo de entrega :") + select').selectOption('recoger');

    const dateContainer = page.locator('.ventas-date-input');
    await dateContainer.locator('select').first().selectOption('15');
    await dateContainer.locator('select').nth(1).selectOption('06');
    await dateContainer.locator('input').fill('2026');

    const prodForm = page.locator('.product-form-row').first();
    await prodForm.locator('.search-select-header').click();
    await prodForm.locator('.header-search-input').fill('Gorra Deportiva');
    await page.locator('.option-item:has-text("Gorra Deportiva")').first().click();
    await prodForm.locator('select.variant-select-mini').selectOption('Ajustable');

    await page.locator('button.ventas-btn-submit').click();
    await expect(page.locator('text=Venta registrada exitosamente').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button.ventas-btn-add')).toBeVisible({ timeout: 10000 });
  });

  test('CA_07_03: Debe mostrar error al dejar campos vacíos', async ({ page }) => {
    await page.locator('button.ventas-btn-add').click();
    await page.locator('button.ventas-btn-submit').click();
    await expect(page.locator('text=Por favor complete todos los campos obligatorios').first()).toBeVisible({ timeout: 5000 });
  });

  test('CA_07_04: Debe validar que excede stock disponible', async ({ page }) => {
    await page.locator('button.ventas-btn-add').click();

    const clientSelect = page.locator('.form-field-group:has-text("Cliente :")');
    await clientSelect.locator('.search-select-header').click();
    await clientSelect.locator('.header-search-input').fill('Cliente Test 1');
    await page.locator('.option-item:has-text("Cliente Test 1")').first().click();

    await page.locator('label:has-text("Método de pago :") + select').selectOption('Efectivo');
    await page.locator('label:has-text("Tipo de entrega :") + select').selectOption('recoger');

    const dateContainer = page.locator('.ventas-date-input');
    await dateContainer.locator('select').first().selectOption('15');
    await dateContainer.locator('select').nth(1).selectOption('06');
    await dateContainer.locator('input').fill('2026');

    const prodForm = page.locator('.product-form-row').first();
    await prodForm.locator('.search-select-header').click();
    await prodForm.locator('.header-search-input').fill('Gorra Deportiva');
    await page.locator('.option-item:has-text("Gorra Deportiva")').first().click();
    await prodForm.locator('select.variant-select-mini').selectOption('Ajustable');
    await prodForm.locator('input[placeholder="0"]').fill('15');

    await page.locator('button.ventas-btn-submit').click();
    await expect(page.locator('text=Uno o más productos exceden el stock disponible').first()).toBeVisible({ timeout: 10000 });
  });

  test('CA_07_05: Debe validar obligatoriedad de comprobante de pago para transferencias', async ({ page }) => {
    await page.locator('button.ventas-btn-add').click();

    const clientSelect = page.locator('.form-field-group:has-text("Cliente :")');
    await clientSelect.locator('.search-select-header').click();
    await clientSelect.locator('.header-search-input').fill('Cliente Test 1');
    await page.locator('.option-item:has-text("Cliente Test 1")').first().click();

    await page.locator('label:has-text("Método de pago :") + select').selectOption('Bancolombia');
    await page.locator('label:has-text("Tipo de entrega :") + select').selectOption('recoger');

    const dateContainer = page.locator('.ventas-date-input');
    await dateContainer.locator('select').first().selectOption('15');
    await dateContainer.locator('select').nth(1).selectOption('06');
    await dateContainer.locator('input').fill('2026');

    const prodForm = page.locator('.product-form-row').first();
    await prodForm.locator('.search-select-header').click();
    await prodForm.locator('.header-search-input').fill('Gorra Deportiva');
    await page.locator('.option-item:has-text("Gorra Deportiva")').first().click();
    await prodForm.locator('select.variant-select-mini').selectOption('Ajustable');

    await page.locator('button.ventas-btn-submit').click();
    await expect(page.locator('text=Debe adjuntar el comprobante de Bancolombia').first()).toBeVisible({ timeout: 10000 });
  });
});

// ===========================
// HU-08: VISUALIZAR Y DETALLE
// ===========================
test.describe('HU-08: Visualizar y detalle de venta', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin/ventas`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('table.entity-table', { timeout: 15000 });
  });

  test('CA_08_01: Debe visualizar la lista de ventas registradas', async ({ page }) => {
    const tableRows = page.locator('table.entity-table tbody tr');
    await expect(tableRows).toHaveCount(4);
    await expect(page.locator('table.entity-table tbody').locator('text=1001')).toBeVisible();
    await expect(page.locator('table.entity-table tbody').locator('text=1002')).toBeVisible();
  });

  test('CA_08_02: Debe buscar ventas por número de venta o cliente', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Buscar por cliente o número de venta..."]');

    await searchInput.fill('1001');
    await expect(page.locator('table.entity-table tbody tr')).toHaveCount(1);

    await searchInput.fill('');
    await searchInput.fill('Cliente Test 2');
    await expect(page.locator('table.entity-table tbody tr')).toHaveCount(2);
  });

  test('CA_08_03: Debe filtrar ventas por estado de venta', async ({ page }) => {
    const statusBtns = page.locator('.status-filter-btn');
    const completedBtn = statusBtns.filter({ hasText: 'Completada' });
    await completedBtn.click();
    await expect(page.locator('table.entity-table tbody tr')).toHaveCount(1);

    const pendienteBtn = statusBtns.filter({ hasText: 'Pendiente' });
    await pendienteBtn.click();
    await expect(page.locator('table.entity-table tbody tr')).toHaveCount(1);
  });

  test('CA_08_04: Debe ver el detalle de una venta', async ({ page }) => {
    const firstRow = page.locator('table.entity-table tbody tr').first();
    await firstRow.locator('[title="Ver detalles"]').click();

    await expect(page.locator('h1.ventas-title')).toHaveText('Detalles Venta');
    await expect(page.locator('text=1001').first()).toBeVisible();
    await expect(page.locator('text=Cliente Test 1').first()).toBeVisible();
  });

  test('CA_08_05: Debe visualizar el comprobante de pago en el detalle de la venta', async ({ page }) => {
    // Buscar venta con comprobante (venta 1003, índice 2 en la lista)
    const row3 = page.locator('table.entity-table tbody tr').nth(2);
    await row3.locator('[title="Ver detalles"]').click();

    await expect(page.locator('h1.ventas-title')).toHaveText('Detalles Venta');
    // Debe haber imagen de comprobante visible
    await expect(page.locator('.gm-receipt-img-premium-admin').first()).toBeVisible();
  });
});

// ===========================
// HU-09: CAMBIAR ESTADO
// ===========================
test.describe('HU-09: Cambiar Estado de Venta', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin/ventas`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('table.entity-table', { timeout: 15000 });
  });

  test('CA_09_01: Debe permitir cambiar el estado de la venta (Aprobar)', async ({ page }) => {
    const row = page.locator('table.entity-table tbody tr').filter({ hasText: '1001' });
    const approveBtn = row.locator('.action-approve');
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();

    await expect(page.locator('h3:has-text("Aprobar Venta")')).toBeVisible({ timeout: 5000 });
    await page.locator('button:has-text("Aprobar")').click();
    await expect(page.locator('h3:has-text("Aprobar Venta")')).toBeHidden({ timeout: 5000 });
  });

  test('CA_09_02: Debe registrar comprobante de pago al completar la venta (pago parcial/incompleto)', async ({ page }) => {
    const row = page.locator('table.entity-table tbody tr').filter({ hasText: '1002' });
    const partialBtn = row.locator('.action-partial');
    await expect(partialBtn).toBeVisible();
    await partialBtn.click();

    await expect(page.locator('h3:has-text("Pago Incompleto")')).toBeVisible({ timeout: 5000 });
    const montoInput = page.locator('input[placeholder="Ej: 25000"]');
    await expect(montoInput).toBeVisible();
  });

  test('CA_09_03: Debe permitir cambiar el estado de envío (Por enviar -> Enviado)', async ({ page }) => {
    const row = page.locator('table.entity-table tbody tr').filter({ hasText: '1003' });
    const enviarBtn = row.locator('.action-enviar');
    await expect(enviarBtn).toBeVisible();
    await enviarBtn.click();

    await expect(page.locator('h3:has-text("Confirmar Envío")')).toBeVisible({ timeout: 5000 });
    await page.locator('button:has-text("Confirmar Envío")').click();
    await expect(page.locator('h3:has-text("Confirmar Envío")')).toBeHidden({ timeout: 5000 });
  });

  test('CA_09_05: Debe validar que venta anulada no permite cambiar estado', async ({ page }) => {
    const row = page.locator('table.entity-table tbody tr').filter({ hasText: '1004' });
    await expect(row.locator('.action-approve')).toBeHidden();
    await expect(row.locator('.action-reject')).toBeHidden();
    await expect(row.locator('.action-partial')).toBeHidden();
  });
});

// ===========================
// HU-10: ANULAR VENTA
// ===========================
test.describe('HU-10: Anular Venta', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin/ventas`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('table.entity-table', { timeout: 15000 });
  });

  test('CA_10_01: Debe permitir anular una venta registrada', async ({ page }) => {
    const row = page.locator('table.entity-table tbody tr').filter({ hasText: '1001' });
    const anularBtn = row.locator('[title="Anular venta"]');
    await expect(anularBtn).toBeVisible();
    await anularBtn.click();

    await expect(page.locator('h3:has-text("Anular Venta")')).toBeVisible({ timeout: 5000 });
    await page.locator('button:has-text("Anular")').click();
    await expect(page.locator('h3:has-text("Anular Venta")')).toBeHidden({ timeout: 5000 });
  });

  test('CA_10_03: Validar que una venta anulada no permita cambiar de estado ni volver a anular', async ({ page }) => {
    const row = page.locator('table.entity-table tbody tr').filter({ hasText: '1004' });
    await expect(row.locator('[title="Anular venta"]')).toBeHidden();
    await expect(row.locator('.action-approve')).toBeHidden();
    await expect(row.locator('.action-reject')).toBeHidden();
  });

  test('CA_10_04: Visualizar el estado "Anulada" en la tabla y detalle', async ({ page }) => {
    const row = page.locator('table.entity-table tbody tr').filter({ hasText: '1004' });
    await expect(row.locator('text=Anulada')).toBeVisible();

    await row.locator('[title="Ver detalles"]').click();
    await expect(page.locator('h1.ventas-title')).toHaveText('Detalles Venta');
    await expect(page.locator('.ventas-detail-wrapper').locator('text=Anulada').first()).toBeVisible();
  });
});
