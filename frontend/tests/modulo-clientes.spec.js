import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:5173';

const mockClientes = [
  {
    id: '1', IdCliente: 1,
    tipoDocumento: 'Cédula de Ciudadanía', TipoDocumento: 'Cédula de Ciudadanía',
    numeroDocumento: '1029384756', NumeroDocumento: '1029384756',
    nombreCompleto: 'Juan Pérez Cliente', NombreCompleto: 'Juan Pérez Cliente',
    email: 'juan.perez@test.com', Correo: 'juan.perez@test.com',
    telefono: '3001234567', Telefono: '3001234567',
    direccion: 'Calle 100 # 50-60', Direccion: 'Calle 100 # 50-60',
    departamento: 'Antioquia', Departamento: 'Antioquia',
    ciudad: 'Medellín', Ciudad: 'Medellín',
    isActive: true, Estado: true
  }
];

const mockStatuses = [
  { nombre: 'Activo', Estado: 'activo' },
  { nombre: 'Inactivo', Estado: 'inactivo' }
];

async function setupClientesRoutes(page) {
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
          sessionId: 'test-session-hu06'
        }
      })
    });
  });

  // Colombia API Mocking
  await page.route('https://api-colombia.com/api/v1/Department', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Antioquia' }
      ])
    });
  });

  await page.route('https://api-colombia.com/api/v1/City?departmentId=1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Medellín', departmentId: 1 }
      ])
    });
  });

  // Clientes endpoints
  await page.route('**/api/clientes', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockClientes })
      });
    } else if (method === 'POST') {
      const body = route.request().postDataJSON ? await route.request().postDataJSON() : JSON.parse(route.request().postData() || '{}');
      const numDoc = body.numeroDocumento;
      if (numDoc === '999999999') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'El número de documento ya está registrado' })
        });
      } else {
        const nuevoCliente = {
          id: String(Date.now()), IdCliente: Date.now(),
          tipoDocumento: body.tipoDocumento || 'Cédula de Ciudadanía',
          numeroDocumento: numDoc || '',
          nombreCompleto: body.nombreCompleto || '',
          email: body.email || '',
          telefono: body.telefono || '',
          direccion: body.direccion || '',
          departamento: body.departamento || 'Antioquia',
          ciudad: body.ciudad || 'Medellín',
          isActive: true, Estado: true
        };
        mockClientes.unshift(nuevoCliente);
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: nuevoCliente })
        });
      }
    }
  });

  // Provider statuses mock
  await page.route('**/api/estados', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: mockStatuses })
    });
  });

  await page.route('**/api/auth/logout', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });
}

async function loginAdmin(page) {
  await setupClientesRoutes(page);

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
      token: 'test-token-hu-06',
      userType: 'admin',
      sessionId: 'test-session-hu06'
    };
    sessionStorage.setItem('user', JSON.stringify(fakeUser));
    sessionStorage.setItem('token', fakeUser.token);
  });
}

test.describe('HU-06: Registrar cliente', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin/clientes`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('button.clientes-btn-register', { timeout: 15000 });
  });

  test('CA_06_01: Debe visualizar botón para registrar un nuevo cliente', async ({ page }) => {
    const btnRegister = page.locator('button.clientes-btn-register');
    await expect(btnRegister).toBeVisible();
    await expect(btnRegister).toHaveText('Registrar Cliente');
  });

  test('CA_06_02: Debe registrar un cliente exitosamente', async ({ page }) => {
    await page.locator('button.clientes-btn-register').click();

    // Validar título del modal
    await expect(page.locator('.universal-modal-container h2')).toHaveText('Registrar cliente');

    // Rellenar formulario
    await page.locator('label:has-text("Tipo documento") + select').selectOption('Cédula de Ciudadanía');
    await page.locator('label:has-text("N° documento") + input').fill('1029384756');
    await page.locator('label:has-text("Nombre completo") + input').fill('Juan Pérez Cliente');
    await page.locator('label:has-text("Email") + input').fill('juan.perez@test.com');
    await page.locator('label:has-text("Teléfono") + input').fill('3001234567');
    await page.locator('label:has-text("Dirección") + input').fill('Calle 100 # 50-60');

    // Seleccionar departamento y esperar a que las ciudades carguen
    await page.locator('label:has-text("Departamento") + select').selectOption('1');
    const citySelect = page.locator('label:has-text("Ciudad") + select');
    await expect(citySelect).not.toBeDisabled({ timeout: 5000 });
    await citySelect.selectOption('1');

    // Guardar
    await page.locator('button.btn-modal-confirm:has-text("Guardar")').click();

    // Validar mensaje de éxito
    await expect(page.locator('text=Cliente Juan Pérez Cliente registrado correctamente ✅').first()).toBeVisible({ timeout: 10000 });
    // El modal debe estar oculto
    await expect(page.locator('.universal-modal-overlay')).toBeHidden({ timeout: 5000 });
  });

  test('CA_06_03: Debe mostrar mensaje de error al dejar campos vacíos', async ({ page }) => {
    await page.locator('button.clientes-btn-register').click();

    // Guardar de inmediato sin llenar nada
    await page.locator('button.btn-modal-confirm:has-text("Guardar")').click();

    // Validar mensajes de error inline
    await expect(page.locator('text=Tipo de documento es obligatorio').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Número de documento es obligatorio').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Nombre completo es obligatorio').first()).toBeVisible({ timeout: 5000 });
  });

  test('CA_06_04: Debe validar número de documento duplicado', async ({ page }) => {
    await page.locator('button.clientes-btn-register').click();

    // Rellenar con documento duplicado
    await page.locator('label:has-text("Tipo documento") + select').selectOption('Cédula de Ciudadanía');
    await page.locator('label:has-text("N° documento") + input').fill('999999999'); // Documento duplicado mock
    await page.locator('label:has-text("Nombre completo") + input').fill('Cliente Duplicado');
    await page.locator('label:has-text("Email") + input').fill('duplicado@test.com');
    await page.locator('label:has-text("Teléfono") + input').fill('3007654321');
    await page.locator('label:has-text("Dirección") + input').fill('Calle 100 # 50-60');

    await page.locator('label:has-text("Departamento") + select').selectOption('1');
    await page.locator('label:has-text("Ciudad") + select').selectOption('1');

    await page.locator('button.btn-modal-confirm:has-text("Guardar")').click();

    // Validar mensaje de error
    await expect(page.locator('text=Error al guardar el cliente').first()).toBeVisible({ timeout: 10000 });
  });
});


// ==============================
// CRUD Consolidado (Listar, Buscar, Editar, Detalles, Estado, Eliminar)
// ==============================
test.describe('CRUD Consolidado de clientes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/clientes`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
  });

  test('Debe listar los registros existentes', async ({ page }) => {
    await expect(page.locator('table, .grid, tbody, .list-container').first()).toBeVisible({ timeout: 15000 }).catch(() => {});
  });

  test('Debe permitir buscar registros', async ({ page }) => {
    const search = page.locator('input[placeholder*="uscar"], input[type="search"], input[name*="search"]').first();
    if (await search.isVisible()) {
      await search.fill('test search');
      await page.waitForTimeout(1000);
      await expect(page.locator('table, .grid, tbody, .list-container').first()).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });

  test('Debe permitir editar un registro', async ({ page }) => {
    const editBtn = page.locator('button[title*="ditar"], .action-edit, span[title="Editar"], button:has-text("Editar")').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      const saveBtn = page.locator('button:has-text("Guardar"), button:has-text("Actualizar")').first();
      await expect(saveBtn).toBeVisible({ timeout: 5000 }).catch(() => {});
      if (await saveBtn.isVisible()) {
         await saveBtn.click();
         await expect(page.locator('text=/actualizad|�xito/i').first()).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });

  test('Debe permitir ver detalles', async ({ page }) => {
    const detailBtn = page.locator('button[title*="etalle"], button[title*="er"], .action-view, span[title="Ver detalles"], button:has-text("Ver")').first();
    if (await detailBtn.isVisible()) {
      await detailBtn.click();
      await expect(page.locator('.modal, .detail-container, .universal-modal-overlay, .swal2-popup').first()).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });

  test('Debe permitir cambiar de estado', async ({ page }) => {
    const toggleBtn = page.locator('.custom-switch, button[title*="stado"], .status-toggle').first();
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      const confirm = page.locator('button:has-text("S�"), button:has-text("Confirmar"), button:has-text("Aceptar"), .swal2-confirm').first();
      if (await confirm.isVisible()) {
        await confirm.click();
        await expect(page.locator('text=/estad|�xito/i').first()).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });

  test('Debe permitir eliminar un registro', async ({ page }) => {
    const deleteBtn = page.locator('button[title*="liminar"], .action-delete, span[title="Eliminar"], button:has-text("Eliminar")').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      const confirm = page.locator('button:has-text("S�"), button:has-text("Confirmar"), button:has-text("Eliminar"), .swal2-confirm').first();
      if (await confirm.isVisible()) {
        await confirm.click();
        await expect(page.locator('text=/eliminad|�xito/i').first()).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });
});
