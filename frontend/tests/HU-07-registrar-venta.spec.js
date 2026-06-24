import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:5173';

const mockClientes = [
  {
    id: '1', IdCliente: 1,
    nombre: 'Cliente Test 1', nombreCompleto: 'Cliente Test 1', NombreCompleto: 'Cliente Test 1',
    num_documento: '1029384756', numeroDocumento: '1029384756',
    email: 'cliente1@test.com', correo: 'cliente1@test.com',
    telefono: '3001234567',
    direccion: 'Calle 123',
    isActive: true
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
    idCliente: 1,
    fecha: '2026-06-20', Fecha: '2026-06-20',
    total: 25000, Total: 25000,
    montoPagado: 25000, MontoPagado: 25000,
    metodoPago: 'Efectivo', MetodoPago: 'Efectivo',
    estado: 'Pendiente', Estado: 'Pendiente',
    statusenvio: 'Por enviar', StatusEnvio: 'Por enviar',
    tipoEntrega: 'recoger', TipoEntrega: 'recoger',
    direccionEnvio: 'N/A', DireccionEnvio: 'N/A',
    productos: [
      { id: 1, idProducto: 1, nombre: 'Gorra Deportiva', talla: 'Ajustable', cantidad: 1, precio: 25000 }
    ]
  }
];

async function setupVentasRoutes(page) {
  // Catch-all API route returning standard empty/success format
  await page.route('**/api/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] })
    });
  });

  // Mock mi perfil/session validation
  await page.route('**/api/mi/perfil', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: 1, email: 'duvann1991@gmail.com',
          idRol: 1, rol: 'Administrador',
          nombre: 'Administrador', estado: 'activo',
          permisos: ['perm_roles', 'perm_usuarios', 'perm_dashboard', 'perm_productos', 'perm_clientes', 'perm_ventas', 'perm_compras', 'perm_proveedores', 'perm_categorias', 'perm_devoluciones']
        }
      })
    });
  });

  await page.route('**/api/auth/verify', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        usuario: {
          id: 1,
          email: 'duvann1991@gmail.com',
          idRol: 1,
          rol: 'Administrador',
          rolData: { nombre: 'Administrador' },
          estado: 'activo',
          permisos: ['perm_roles', 'perm_usuarios', 'perm_dashboard', 'perm_productos', 'perm_clientes', 'perm_ventas', 'perm_compras', 'perm_proveedores', 'perm_categorias', 'perm_devoluciones'],
          sessionId: 'test-session-hu07'
        }
      })
    });
  });

  // Clientes mock
  await page.route('**/api/clientes', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: mockClientes })
    });
  });

  // Productos mock
  await page.route('**/api/productos*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: mockProducts })
    });
  });

  // Payment methods mock
  await page.route('**/api/estados/tipo/metodo_pago', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: mockPaymentMethods })
    });
  });

  // Statuses mock
  await page.route('**/api/estados', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: mockStatuses.map(s => ({ Nombre: s })) })
    });
  });

  // Sizes mock
  await page.route('**/api/tallas', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: mockSizes })
    });
  });

  // Ventas GET & POST mock
  await page.route('**/api/ventas', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockSales })
      });
    } else if (method === 'POST') {
      const body = route.request().postDataJSON ? await route.request().postDataJSON() : JSON.parse(route.request().postData() || '{}');
      const newVenta = {
        id: Date.now(),
        IdVenta: Date.now(),
        noVenta: String(mockSales.length + 1001),
        cliente: mockClientes.find(c => String(c.id) === String(body.idCliente)) || { nombre: 'Cliente Test 1' },
        idCliente: body.idCliente,
        fecha: new Date().toLocaleDateString('es-CO'),
        total: body.total || 25000,
        montoPagado: body.total || 25000,
        metodoPago: body.metodoPago || 'Efectivo',
        estado: 'Pendiente',
        statusenvio: 'Por enviar',
        tipoEntrega: body.tipoEntrega || 'recoger',
        direccionEnvio: body.direccionEnvio || 'N/A',
        productos: (body.productos || []).map(p => ({
          idProducto: p.idProducto,
          nombre: 'Gorra Deportiva',
          talla: p.talla,
          cantidad: p.cantidad,
          precio: p.precio,
          subtotal: p.cantidad * p.precio
        }))
      };
      mockSales.unshift(newVenta);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: newVenta })
      });
    }
  });

  // Status updates PATCH
  await page.route('**/api/ventas/*/estado', async (route) => {
    const body = route.request().postDataJSON ? await route.request().postDataJSON() : JSON.parse(route.request().postData() || '{}');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { id: 1, estado: body.nuevoEstado || 'Completada', total: 25000, montoPagado: body.montoPagado || 25000 } })
    });
  });

  await page.route('**/api/auth/logout', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });
}

async function loginAdmin(page) {
  await setupVentasRoutes(page);

  await page.addInitScript(() => {
    const fakeUser = {
      id: 1,
      IdUsuario: 1,
      idRol: 1,
      Rol: 'Administrador',
      rol: 'Administrador',
      nombre: 'Administrador',
      email: 'duvann1991@gmail.com',
      estado: 'activo',
      Estado: 'activo',
      permisos: ['perm_roles', 'perm_usuarios', 'perm_dashboard', 'perm_productos', 'perm_clientes', 'perm_ventas', 'perm_compras', 'perm_proveedores', 'perm_categorias', 'perm_devoluciones'],
      token: 'test-token-hu-07',
      userType: 'admin',
      sessionId: 'test-session-hu07'
    };
    sessionStorage.setItem('user', JSON.stringify(fakeUser));
    sessionStorage.setItem('token', fakeUser.token);
  });
}

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

    // Validar título de página en modo formulario
    await expect(page.locator('.ventas-title')).toHaveText('Registrar Venta');

    // Seleccionar Cliente usando SearchSelect
    const clientSelect = page.locator('.form-field-group:has-text("Cliente :")');
    await clientSelect.locator('.search-select-header').click();
    await clientSelect.locator('.header-search-input').fill('Cliente Test 1');
    await page.locator('.option-item:has-text("Cliente Test 1")').first().click();

    // Seleccionar Método de pago y Tipo de entrega
    await page.locator('label:has-text("Método de pago :") + select').selectOption('Efectivo');
    await page.locator('label:has-text("Tipo de entrega :") + select').selectOption('recoger');

    // Rellenar Fecha
    const dateContainer = page.locator('.ventas-date-input');
    await dateContainer.locator('select').first().selectOption('15');
    await dateContainer.locator('select').nth(1).selectOption('06');
    await dateContainer.locator('input').fill('2026');

    // Datos del producto (ProductoForm)
    const prodForm = page.locator('.product-form-row').first();
    await prodForm.locator('.search-select-header').click();
    await prodForm.locator('.header-search-input').fill('Gorra Deportiva');
    await page.locator('.option-item:has-text("Gorra Deportiva")').first().click();

    // Seleccionar Talla
    await prodForm.locator('select.variant-select-mini').selectOption('Ajustable');

    // Registrar venta
    await page.locator('button.ventas-btn-submit').click();

    // Validar mensaje de éxito
    await expect(page.locator('text=Venta registrada exitosamente').first()).toBeVisible({ timeout: 10000 });
    
    // Regresar a la lista de ventas
    await expect(page.locator('button.ventas-btn-add')).toBeVisible({ timeout: 10000 });
  });

  test('CA_07_03: Debe mostrar error al dejar campos vacíos', async ({ page }) => {
    await page.locator('button.ventas-btn-add').click();

    // Guardar de inmediato sin llenar nada
    await page.locator('button.ventas-btn-submit').click();

    // Validar alerta de error
    await expect(page.locator('text=Por favor complete todos los campos obligatorios').first()).toBeVisible({ timeout: 5000 });
  });

  test('CA_07_04: Debe validar que excede stock disponible', async ({ page }) => {
    await page.locator('button.ventas-btn-add').click();

    // Seleccionar Cliente usando SearchSelect
    const clientSelect = page.locator('.form-field-group:has-text("Cliente :")');
    await clientSelect.locator('.search-select-header').click();
    await clientSelect.locator('.header-search-input').fill('Cliente Test 1');
    await page.locator('.option-item:has-text("Cliente Test 1")').first().click();

    // Seleccionar Método de pago y Tipo de entrega
    await page.locator('label:has-text("Método de pago :") + select').selectOption('Efectivo');
    await page.locator('label:has-text("Tipo de entrega :") + select').selectOption('recoger');

    // Rellenar Fecha
    const dateContainer = page.locator('.ventas-date-input');
    await dateContainer.locator('select').first().selectOption('15');
    await dateContainer.locator('select').nth(1).selectOption('06');
    await dateContainer.locator('input').fill('2026');

    // Datos del producto (ProductoForm)
    const prodForm = page.locator('.product-form-row').first();
    await prodForm.locator('.search-select-header').click();
    await prodForm.locator('.header-search-input').fill('Gorra Deportiva');
    await page.locator('.option-item:has-text("Gorra Deportiva")').first().click();

    // Seleccionar Talla
    await prodForm.locator('select.variant-select-mini').selectOption('Ajustable');

    // Llenar cantidad que excede el stock (stock ajustable es 10, ingresamos 15)
    await prodForm.locator('input[placeholder="0"]').fill('15');

    // Intentar Guardar
    await page.locator('button.ventas-btn-submit').click();

    // Validar mensaje de error de stock
    await expect(page.locator('text=Uno o más productos exceden el stock disponible').first()).toBeVisible({ timeout: 10000 });
  });

  test('CA_07_05: Debe validar obligatoriedad de comprobante de pago para transferencias', async ({ page }) => {
    await page.locator('button.ventas-btn-add').click();

    // Seleccionar Cliente usando SearchSelect
    const clientSelect = page.locator('.form-field-group:has-text("Cliente :")');
    await clientSelect.locator('.search-select-header').click();
    await clientSelect.locator('.header-search-input').fill('Cliente Test 1');
    await page.locator('.option-item:has-text("Cliente Test 1")').first().click();

    // Seleccionar Método de pago de transferencia y Tipo de entrega
    await page.locator('label:has-text("Método de pago :") + select').selectOption('Bancolombia');
    await page.locator('label:has-text("Tipo de entrega :") + select').selectOption('recoger');

    // Rellenar Fecha
    const dateContainer = page.locator('.ventas-date-input');
    await dateContainer.locator('select').first().selectOption('15');
    await dateContainer.locator('select').nth(1).selectOption('06');
    await dateContainer.locator('input').fill('2026');

    // Datos del producto (ProductoForm)
    const prodForm = page.locator('.product-form-row').first();
    await prodForm.locator('.search-select-header').click();
    await prodForm.locator('.header-search-input').fill('Gorra Deportiva');
    await page.locator('.option-item:has-text("Gorra Deportiva")').first().click();

    // Seleccionar Talla
    await prodForm.locator('select.variant-select-mini').selectOption('Ajustable');

    // Intentar Guardar sin subir comprobante
    await page.locator('button.ventas-btn-submit').click();

    // Validar mensaje de error de comprobante
    await expect(page.locator('text=Debe adjuntar el comprobante de Bancolombia').first()).toBeVisible({ timeout: 10000 });
  });
});
