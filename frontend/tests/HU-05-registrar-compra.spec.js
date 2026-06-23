import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:5173';

const mockProviders = [
  { IdProveedor: 1, id: 1, Nombre: 'Proveedor Test 1', companyName: 'Proveedor Test 1', Estado: true },
  { IdProveedor: 2, id: 2, Nombre: 'Proveedor Test 2', companyName: 'Proveedor Test 2', Estado: true }
];

const mockProducts = [
  {
    IdProducto: 1, id: 1,
    Nombre: 'Gorra Deportiva', nombre: 'Gorra Deportiva',
    tallasStock: [{ talla: 'Ajustable', cantidad: 10 }, { talla: '7', cantidad: 5 }],
    precioCompra: 12000, PrecioCompra: 12000,
    precioVenta: 25000, PrecioVenta: 25000,
    precioMayorista6: 18000, PrecioMayorista6: 18000,
    precioMayorista80: 16000, PrecioMayorista80: 16000,
    isActive: true, IsActive: true,
    imagenes: []
  }
];

const mockPaymentMethods = ['Efectivo', 'Transferencia'];

const mockPurchases = [
  {
    IdCompra: 1, id: 1,
    idProveedor: 1,
    proveedorData: { companyName: 'Proveedor Test 1' },
    proveedor: 'Proveedor Test 1',
    fecha: '20/06/2026',
    total: 36000,
    metodoPago: 'Efectivo',
    estado: 'Completada',
    numeroRecibo: 'FAC-10001',
    fechaRegistro: '20/06/2026',
    detalles: [
      {
        idProducto: 1,
        nombreProducto: 'Gorra Deportiva',
        talla: 'Ajustable',
        cantidad: 3,
        precioCompra: '12000',
        precioVenta: '25000',
        precioMayorista6: '18000',
        precioMayorista80: '16000',
        variantes: [{ talla: 'Ajustable', cantidad: 3 }]
      }
    ]
  }
];

async function setupComprasRoutes(page) {
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
          sessionId: 'test-session-hu05'
        }
      })
    });
  });

  // Providers list mock
  await page.route('**/api/proveedores', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: mockProviders })
    });
  });

  // Products list mock
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

  // Compras endpoints (GET list and POST register)
  await page.route('**/api/compras', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockPurchases })
      });
    } else if (method === 'POST') {
      const body = route.request().postDataJSON ? await route.request().postDataJSON() : JSON.parse(route.request().postData() || '{}');
      const numRecibo = body.numeroRecibo;
      if (numRecibo === 'FAC-DUP') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'El número de factura ya existe' })
        });
      } else {
        const newCompra = {
          IdCompra: Date.now(),
          idProveedor: body.idProveedor,
          proveedorData: { companyName: 'Proveedor Test 1' },
          proveedor: 'Proveedor Test 1',
          fecha: body.fecha,
          total: body.total,
          metodoPago: body.metodoPago || 'Efectivo',
          estado: 'Completada',
          numeroRecibo: numRecibo,
          fechaRegistro: body.fechaRegistro || new Date().toISOString(),
          detalles: (body.productos || []).map(p => ({
            ...p,
            nombreProducto: p.nombre,
            variantes: p.variantes
          }))
        };
        mockPurchases.unshift(newCompra);
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: newCompra })
        });
      }
    }
  });

  await page.route('**/api/auth/logout', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });
}

async function loginAdmin(page) {
  await setupComprasRoutes(page);

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
      token: 'test-token-hu-05',
      userType: 'admin',
      sessionId: 'test-session-hu05'
    };
    sessionStorage.setItem('user', JSON.stringify(fakeUser));
    sessionStorage.setItem('token', fakeUser.token);
  });
}

test.describe('HU-05: Registrar compra', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin/compras`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('button.compras-btn-register')).toBeVisible({ timeout: 15000 });
  });

  test('CA_05_01: Debe visualizar botón para registrar una nueva compra', async ({ page }) => {
    const btnRegister = page.locator('button.compras-btn-register');
    await expect(btnRegister).toBeVisible();
    await expect(btnRegister).toHaveText('Registrar Compra');
  });

  test('CA_05_02: Debe registrar una compra exitosamente', async ({ page }) => {
    await page.locator('button.compras-btn-register').click();
    
    // Rellenar datos generales
    await page.locator('select.compras-form-select').first().selectOption('Proveedor Test 1');
    await page.locator('input.compras-form-input').fill('FAC-10002');
    
    // Llenar Fecha de compra (FechaCompraContainer es el primer date-input-container)
    const fechaCompraContainer = page.locator('.compras-totals-dates .date-input-container').first();
    await fechaCompraContainer.locator('select').first().selectOption('15'); // día
    await fechaCompraContainer.locator('select').nth(1).selectOption('06'); // mes
    await fechaCompraContainer.locator('input').fill('2026'); // año

    // Llenar Fecha de registro (segundo date-input-container)
    const fechaRegistroContainer = page.locator('.compras-totals-dates .date-input-container').nth(1);
    await fechaRegistroContainer.locator('select').first().selectOption('15');
    await fechaRegistroContainer.locator('select').nth(1).selectOption('06');
    await fechaRegistroContainer.locator('input').fill('2026');

    // Datos del producto
    const prodForm = page.locator('.producto-item-form').first();
    await prodForm.locator('input.producto-item-form__input').first().fill('Gorra Deportiva');
    await prodForm.locator('select.producto-item-form__variant-select').first().selectOption('Ajustable');
    await prodForm.locator('input.producto-item-form__input--price').fill('15000');
    await prodForm.locator('input.producto-item-form__input--sell').fill('30000');

    // Registrar compra (el botón en la cabecera cuando modoVista === "formulario")
    await page.locator('button.compras-btn-submit').click();

    // Validar mensaje de confirmación
    await expect(page.locator('text=Compra registrada correctamente')).toBeVisible({ timeout: 10000 });
    // Debe regresar a la lista de compras
    await expect(page.locator('button.compras-btn-register')).toBeVisible({ timeout: 10000 });
  });

  test('CA_05_03: Debe mostrar error al dejar campos vacíos', async ({ page }) => {
    await page.locator('button.compras-btn-register').click();
    
    // Intentar enviar sin llenar nada
    await page.locator('button.compras-btn-submit').click();
    
    // Debería validar la fecha como obligatoria
    await expect(page.locator('text=La fecha es obligatoria').first()).toBeVisible({ timeout: 5000 });
  });

  test('CA_05_04: Debe validar número de factura duplicado', async ({ page }) => {
    await page.locator('button.compras-btn-register').click();
    
    // Rellenar datos
    await page.locator('select.compras-form-select').first().selectOption('Proveedor Test 1');
    await page.locator('input.compras-form-input').fill('FAC-DUP'); // Número duplicado configurado en el mock
    
    const fechaCompraContainer = page.locator('.compras-totals-dates .date-input-container').first();
    await fechaCompraContainer.locator('select').first().selectOption('15');
    await fechaCompraContainer.locator('select').nth(1).selectOption('06');
    await fechaCompraContainer.locator('input').fill('2026');

    const prodForm = page.locator('.producto-item-form').first();
    await prodForm.locator('input.producto-item-form__input').first().fill('Gorra Deportiva');
    await prodForm.locator('select.producto-item-form__variant-select').first().selectOption('Ajustable');
    await prodForm.locator('input.producto-item-form__input--price').fill('15000');
    await prodForm.locator('input.producto-item-form__input--sell').fill('30000');

    await page.locator('button.compras-btn-submit').click();

    // Debe mostrar error de procesamiento de compra
    await expect(page.locator('text=Error al procesar la compra')).toBeVisible({ timeout: 10000 });
  });

  test('CA_05_05: Debe validar fecha de compra futura', async ({ page }) => {
    await page.locator('button.compras-btn-register').click();
    
    await page.locator('select.compras-form-select').first().selectOption('Proveedor Test 1');
    await page.locator('input.compras-form-input').fill('FAC-10003');
    
    // Ingresar fecha futura (año 2030)
    const fechaCompraContainer = page.locator('.compras-totals-dates .date-input-container').first();
    await fechaCompraContainer.locator('select').first().selectOption('25');
    await fechaCompraContainer.locator('select').nth(1).selectOption('12');
    await fechaCompraContainer.locator('input').fill('2030');

    const prodForm = page.locator('.producto-item-form').first();
    await prodForm.locator('input.producto-item-form__input').first().fill('Gorra Deportiva');
    await prodForm.locator('select.producto-item-form__variant-select').first().selectOption('Ajustable');
    await prodForm.locator('input.producto-item-form__input--price').fill('15000');
    await prodForm.locator('input.producto-item-form__input--sell').fill('30000');

    await page.locator('button.compras-btn-submit').click();

    // Validar mensaje de error
    await expect(page.locator('text=Fecha de compra no puede ser futura').first()).toBeVisible({ timeout: 10000 });
  });
});
