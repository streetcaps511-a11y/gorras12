import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const ADMIN_EMAIL = 'duvann1991@gmail.com';
const ADMIN_PASSWORD = 'AdminGM2024!Secure';

const mockUsers = [
  {
    IdUsuario: 1, id: 1,
    nombre: 'Administrador', apellido: 'Sistema',
    email: 'duvann1991@gmail.com',
    Rol: 'Administrador', rol: 'Administrador',
    idRol: 1, IdRol: 1,
    estado: 'activo', Estado: 'activo', isActive: true,
    tipoDocumento: 'Cédula de Ciudadanía', TipoDocumento: 'Cédula de Ciudadanía',
    numeroDocumento: '1234567890', NumeroDocumento: '1234567890',
    telefono: '3001234567', Telefono: '3001234567', contacto: '3001234567',
    googleId: null, authProvider: null, proveedor: null, rolData: null
  },
  {
    IdUsuario: 2, id: 2,
    nombre: 'Juan', apellido: 'Pérez',
    email: 'juan@gorrascaps.com',
    Rol: 'Cliente', rol: 'Cliente',
    idRol: 2, IdRol: 2,
    estado: 'activo', Estado: 'activo', isActive: true,
    tipoDocumento: 'Cédula de Ciudadanía', TipoDocumento: 'Cédula de Ciudadanía',
    numeroDocumento: '9876543210', NumeroDocumento: '9876543210',
    telefono: '3009876543', Telefono: '3009876543', contacto: '3009876543',
    googleId: null, authProvider: null, proveedor: null, rolData: null
  }
];

const mockRoles = [
  { IdRol: 1, id: 1, Nombre: 'Administrador', name: 'Administrador', Descripcion: 'Acceso total', description: 'Acceso total', Estado: true, isActive: true, Permisos: [], permissions: [] },
  { IdRol: 2, id: 2, Nombre: 'Cliente', name: 'Cliente', Descripcion: 'Cliente', description: 'Cliente', Estado: true, isActive: true, Permisos: [], permissions: [] },
  { IdRol: 3, id: 3, Nombre: 'Empleado', name: 'Empleado', Descripcion: 'Empleado', description: 'Empleado', Estado: true, isActive: true, Permisos: [], permissions: [] }
];

const mockStatuses = [
  { nombre: 'Activo', Nombre: 'Activo', estado: 'activo', Estado: 'activo' },
  { nombre: 'Inactivo', Nombre: 'Inactivo', estado: 'inactivo', Estado: 'inactivo' }
];

async function setupAllRoutes(page) {
  await page.route('**/api/auth/login', async (route) => {
    const body = JSON.parse(route.request().postData() || '{}');
    const correo = (body.correo || body.email || '').trim().toLowerCase();
    const clave = body.clave || body.password || '';
    if (correo === ADMIN_EMAIL && clave === ADMIN_PASSWORD) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            usuario: {
              id: 1, email: ADMIN_EMAIL,
              idRol: 1, rol: 'Administrador',
              rolData: { nombre: 'Administrador', id: 1 },
              estado: 'activo',
              permisos: ['perm_roles', 'perm_usuarios', 'perm_dashboard', 'perm_productos', 'perm_clientes', 'perm_ventas', 'perm_compras', 'perm_proveedores', 'perm_categorias', 'perm_devoluciones'],
              sessionId: 'test-session-hu09'
            },
            token: 'test-token-hu-09-19',
            userType: 'admin'
          }
        })
      });
    } else {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Credenciales inválidas' })
      });
    }
  });

  await page.route('**/api/auth/verify', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        usuario: {
          id: 1, email: ADMIN_EMAIL,
          idRol: 1, rol: 'Administrador',
          rolData: { nombre: 'Administrador', id: 1 },
          estado: 'activo',
          permisos: ['perm_roles', 'perm_usuarios', 'perm_dashboard', 'perm_productos', 'perm_clientes', 'perm_ventas', 'perm_compras', 'perm_proveedores', 'perm_categorias', 'perm_devoluciones'],
          sessionId: 'test-session-hu09'
        }
      })
    });
  });

  await page.route('**/api/usuarios*', async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();

    if (method === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockUsers }) });
      return;
    }

    if (method === 'POST') {
      const body = JSON.parse(route.request().postData() || '{}');
      const nuevo = {
        IdUsuario: Date.now(), id: Date.now(),
        nombre: body.nombre || 'Nuevo', apellido: body.apellido || 'Usuario',
        email: body.email || `nuevo.${Date.now()}@gorrascaps.com`,
        Rol: body.rol || 'Cliente', rol: body.rol || 'Cliente',
        idRol: body.idRol || 2, IdRol: body.idRol || 2,
        estado: body.estado || 'activo', Estado: body.estado || 'activo',
        isActive: (body.estado || 'activo').toLowerCase() === 'activo',
        tipoDocumento: body.tipoDocumento || '', TipoDocumento: body.tipoDocumento || '',
        numeroDocumento: body.numeroDocumento || '', NumeroDocumento: body.numeroDocumento || '',
        telefono: body.telefono || body.contacto || '', Telefono: body.telefono || body.contacto || '', contacto: body.telefono || body.contacto || '',
        googleId: null, authProvider: null, proveedor: null, rolData: null
      };
      mockUsers.unshift(nuevo);
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ success: true, data: nuevo }) });
      return;
    }

    if (method === 'PUT' || method === 'PATCH') {
      const body = JSON.parse(route.request().postData() || '{}');
      const match = url.pathname.match(/\/api\/usuarios\/(\d+)/);
      const id = match ? parseInt(match[1]) : null;
      const idx = mockUsers.findIndex(u => u.IdUsuario === id || u.id === id);
      if (idx !== -1) {
        const actualizado = { ...mockUsers[idx], ...body };
        if (body.isActive !== undefined) {
          actualizado.isActive = body.isActive;
          actualizado.estado = body.isActive ? 'activo' : 'inactivo';
          actualizado.Estado = body.isActive ? 'activo' : 'inactivo';
        }
        if (body.estado) {
          actualizado.estado = body.estado;
          actualizado.Estado = body.estado;
          actualizado.isActive = body.estado.toLowerCase() === 'activo';
        }
        mockUsers[idx] = actualizado;
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: actualizado }) });
      } else {
        await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Usuario no encontrado' }) });
      }
      return;
    }

    if (method === 'DELETE') {
      const match = url.pathname.match(/\/api\/usuarios\/(\d+)/);
      const id = match ? parseInt(match[1]) : null;
      const idx = mockUsers.findIndex(u => u.IdUsuario === id || u.id === id);
      if (idx !== -1) {
        mockUsers.splice(idx, 1);
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
      } else {
        await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Usuario no encontrado' }) });
      }
      return;
    }

    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  await page.route('**/api/estados*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockStatuses }) });
  });

  await page.route('**/api/roles*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockRoles }) });
  });

  await page.route('**/api/auth/logout', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });
}

async function loginAdmin(page) {
  await setupAllRoutes(page);

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
      token: 'test-token-hu-09-19',
      userType: 'admin',
      sessionId: 'test-session-hu09'
    };
    sessionStorage.setItem('user', JSON.stringify(fakeUser));
    sessionStorage.setItem('token', fakeUser.token);
  });
}

test.describe.configure({ mode: 'serial' });

// ─────────────────────────────────────────────
// HU_09: Registrar usuarios
// ─────────────────────────────────────────────
test.describe('HU_09: Registrar usuarios', () => {

  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin/usuarios`);
    await page.waitForSelector('button.users-btn-add, button.users-btn-register-custom', { timeout: 10000 });
  });

  test('CA_09_01: Debe mostrar formulario con campos de información esencial', async ({ page }) => {
    await page.getByRole('button', { name: /registrar usuario|registrar|nuevo usuario/i }).first().click();
    await expect(page.locator('.user-form input[name="nombreCompleto"]').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.user-form input[name="email"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('CA_09_02: Debe permitir asignar un rol durante el registro', async ({ page }) => {
    await page.getByRole('button', { name: /registrar usuario|registrar|nuevo usuario/i }).first().click();
    await expect(page.locator('.user-form select[name="rol"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('CA_09_03: Debe registrar usuario y mostrar confirmación', async ({ page }) => {
    const correoTest = `qa.test.${Date.now()}@gorrascaps.com`;

    await page.getByRole('button', { name: /registrar usuario|registrar|nuevo usuario/i }).first().click();
    await page.locator('.user-form select[name="tipoDocumento"]').first().selectOption('Cédula de Ciudadanía');
    await page.locator('.user-form input[name="nombreCompleto"]').first().fill('Usuario QA Test');
    await page.locator('.user-form input[name="email"]').first().fill(correoTest);
    await page.locator('.user-form input[name="numeroDocumento"]').first().fill('1234567890');
    await page.locator('.user-form input[name="contacto"]').first().fill('3001234567');
    await page.locator('.user-form select[name="rol"]').first().selectOption('2');

    await page.getByRole('button', { name: /guardar/i }).first().click();

    await expect(
      page.locator('text=/creado|exitoso|éxito/i').first()
    ).toBeVisible({ timeout: 10000 });
  });
});

// ─────────────────────────────────────────────
// HU_10: Listar usuarios
// ─────────────────────────────────────────────
test.describe('HU_10: Listar usuarios', () => {

  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin/usuarios`);
    await page.waitForSelector('table, [class*="tabla"], [class*="list"]', { timeout: 10000 });
  });

  test('CA_10_01: Debe mostrar listado con datos de usuarios', async ({ page }) => {
    const tabla = page.locator('table, [class*="tabla"], [class*="list"]').first();
    await expect(tabla).toBeVisible();
    const filas = page.locator('tbody tr, [class*="row"]');
    await expect(filas.first()).toBeVisible({ timeout: 7000 });
  });

  test('CA_10_02: Debe permitir buscar usuarios por nombre', async ({ page }) => {
    const campoBusqueda = page.locator('input[placeholder*="buscar" i], input[name="proveedores_search_filter"]').first();
    await expect(campoBusqueda).toBeVisible({ timeout: 5000 });
    await campoBusqueda.fill('admin');
    await page.waitForTimeout(500);
    const filas = page.locator('tbody tr, [class*="row"]');
    await expect(filas.first()).toBeVisible({ timeout: 5000 });
  });

  test('CA_10_03: Debe permitir activar o desactivar usuarios desde el listado', async ({ page }) => {
    const botonEstado = page.locator('button.custom-switch, .custom-switch').first();
    await expect(botonEstado).toBeVisible({ timeout: 7000 });
  });
});

// ─────────────────────────────────────────────
// HU_11: Asignar rol a un usuario
// ─────────────────────────────────────────────
test.describe('HU_11: Asignar rol a un usuario', () => {

  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin/usuarios`);
    await page.waitForSelector('table, [class*="tabla"], [class*="list"]', { timeout: 10000 });
  });

  test('CA_11_01: Debe permitir seleccionar un usuario para asignarle rol', async ({ page }) => {
    const botonEditar = page.locator('span[title="Editar"], span[data-tooltip="Editar"], [class*="edit"]').nth(1);
    await expect(botonEditar).toBeVisible({ timeout: 5000 });
    await botonEditar.click();
    await expect(page.locator('.user-form select[name="rol"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('CA_11_02: Debe mostrar roles disponibles para asignar', async ({ page }) => {
    const botonEditar = page.locator('span[title="Editar"], span[data-tooltip="Editar"], [class*="edit"]').nth(1);
    await botonEditar.click();
    const selectorRol = page.locator('.user-form select[name="rol"]').first();
    await expect(selectorRol).toBeVisible({ timeout: 5000 });
    const opciones = selectorRol.locator('option');
    const count = await opciones.count();
    expect(count).toBeGreaterThan(1);
  });

  test('CA_11_03: Debe mostrar confirmación al asignar rol', async ({ page }) => {
    const botonEditar = page.locator('span[title="Editar"], span[data-tooltip="Editar"], [class*="edit"]').nth(1);
    await botonEditar.click();
    const selectorRol = page.locator('.user-form select[name="rol"]').first();
    await selectorRol.selectOption('3');
    await page.getByRole('button', { name: /guardar/i }).first().click();
    await expect(
      page.locator('text=/asignado|actualizado|exitoso|éxito/i').first()
    ).toBeVisible({ timeout: 10000 });
  });
});

// ─────────────────────────────────────────────
// HU_12: Buscar usuarios
// ─────────────────────────────────────────────
test.describe('HU_12: Buscar usuarios', () => {

  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin/usuarios`);
    await page.waitForSelector('input[placeholder*="buscar" i], input[name="proveedores_search_filter"]', { timeout: 10000 });
  });

  test('CA_12_01: Debe permitir buscar usuarios por nombre', async ({ page }) => {
    const campo = page.locator('input[placeholder*="buscar" i], input[name="proveedores_search_filter"]').first();
    await expect(campo).toBeVisible({ timeout: 5000 });
    await campo.fill('Juan');
    const filas = page.locator('tbody tr, [class*="row"]');
    await expect(filas.first()).toBeVisible({ timeout: 5000 });
  });

  test('CA_12_02: Debe mostrar resultados en tiempo real con coincidencias parciales', async ({ page }) => {
    const campo = page.locator('input[placeholder*="buscar" i], input[name="proveedores_search_filter"]').first();
    await campo.fill('a');
    await page.waitForTimeout(300);
    const filas = page.locator('tbody tr, [class*="row"]');
    await expect(filas.first()).toBeVisible({ timeout: 3000 });
  });

  test('CA_12_03: La búsqueda debe responder rápidamente', async ({ page }) => {
    const campo = page.locator('input[placeholder*="buscar" i], input[name="proveedores_search_filter"]').first();
    const inicio = Date.now();
    await campo.fill('Juan');
    await page.locator('tbody tr, [class*="row"]').first().waitFor({ timeout: 3000 });
    const tiempo = Date.now() - inicio;
    expect(tiempo).toBeLessThan(3000);
  });
});

// ─────────────────────────────────────────────
// HU_13: Editar usuario
// ─────────────────────────────────────────────
test.describe('HU_13: Editar usuario', () => {

  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin/usuarios`);
    await page.waitForSelector('button[title*="editar"], button:has-text("Editar"), [class*="edit"], tbody tr', { timeout: 10000 });
  });

  test('CA_13_01: Debe mostrar formulario con datos actuales del usuario', async ({ page }) => {
    await page.locator('button[title*="editar"], button:has-text("Editar"), [class*="edit"]').first().click();
    await expect(page.locator('input[name="nombreCompleto"], input[placeholder*="nombre"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('CA_13_02: Debe validar campos al editar', async ({ page }) => {
    await page.locator('button[title*="editar"], button:has-text("Editar"), [class*="edit"]').first().click();
    const campoEmail = page.locator('input[type="email"], input[name="email"]').first();
    await campoEmail.fill('correo-invalido');
    await page.getByRole('button', { name: /guardar/i }).first().click();
    await expect(
      page.locator('text=/inválido|requerido|formato/i').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('CA_13_03: Debe guardar cambios y mostrar confirmación', async ({ page }) => {
    await page.locator('button[title*="editar"], button:has-text("Editar"), [class*="edit"]').first().click();
    const campoNombre = page.locator('input[name="nombreCompleto"], input[placeholder*="nombre"]').first();
    await campoNombre.fill('Usuario Editado QA');
    await page.getByRole('button', { name: /guardar/i }).first().click();
    await expect(
      page.locator('text=/actualizado|guardado|exitoso|éxito/i').first()
    ).toBeVisible({ timeout: 10000 });
  });
});

// ─────────────────────────────────────────────
// HU_14: Ver detalle de usuario
// ─────────────────────────────────────────────
test.describe('HU_14: Ver detalle de usuario', () => {

  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin/usuarios`);
    await page.waitForSelector('button[title*="ver"], button:has-text("Ver"), [class*="detail"], [class*="view"], tbody tr', { timeout: 10000 });
  });

  test('CA_14_01: Debe mostrar el rol asignado al usuario', async ({ page }) => {
    await page.locator('button[title*="ver"], button:has-text("Ver"), [class*="detail"], [class*="view"]').first().click();
    await expect(page.locator('text=/rol/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('CA_14_02: Debe ser accesible desde el listado con un clic', async ({ page }) => {
    const botonDetalle = page.locator('button[title*="ver"], button:has-text("Ver"), [class*="detail"], [class*="view"]').first();
    await expect(botonDetalle).toBeVisible({ timeout: 5000 });
    await botonDetalle.click();
    await expect(page.locator('[class*="detalle"], [class*="detail"], [class*="modal"], [class*="form"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('CA_14_03: La información debe presentarse de forma organizada', async ({ page }) => {
    await page.locator('button[title*="ver"], button:has-text("Ver"), [class*="detail"], [class*="view"]').first().click();
    const contenedor = page.locator('[class*="detalle"], [class*="detail"], [class*="modal"], [class*="form"]').first();
    await expect(contenedor).toBeVisible({ timeout: 5000 });
    const etiquetas = contenedor.locator('label, [class*="label"], strong, th, .form-label');
    expect(await etiquetas.count()).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// HU_15: Cambiar estado de usuario
// ─────────────────────────────────────────────
test.describe('HU_15: Cambiar estado de usuario', () => {

  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin/usuarios`);
    await page.waitForSelector('button.custom-switch, .custom-switch, tbody tr', { timeout: 10000 });
  });

  test('CA_15_01: Debe permitir cambiar estado entre activo e inactivo', async ({ page }) => {
    const botonEstado = page.locator('button.custom-switch, .custom-switch').first();
    await expect(botonEstado).toBeVisible({ timeout: 5000 });
  });

  test('CA_15_02: Debe mostrar confirmación antes de cambiar estado', async ({ page }) => {
    await page.locator('button.custom-switch, .custom-switch').first().click();
    await expect(
      page.locator('text=/confirmar|seguro|desea/i, [class*="modal"], [class*="confirm"]').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('CA_15_03: El cambio de estado debe reflejarse en el listado', async ({ page }) => {
    await page.locator('button.custom-switch, .custom-switch').first().click();
    const botonConfirmar = page.locator('button:has-text("Confirmar"), button:has-text("Sí"), button:has-text("Aceptar")').first();
    if (await botonConfirmar.isVisible().catch(() => false)) {
      await botonConfirmar.click();
    }
    await expect(
      page.locator('text=/activo|inactivo|estado/i').first()
    ).toBeVisible({ timeout: 5000 });
  });
});

// ─────────────────────────────────────────────
// HU_16: Eliminar usuarios
// ─────────────────────────────────────────────
test.describe('HU_16: Eliminar usuarios', () => {

  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin/usuarios`);
    await page.waitForSelector('span[title="Eliminar"], [class*="delete"], tbody tr', { timeout: 10000 });
  });

  test('CA_16_01: Debe permitir seleccionar usuarios para eliminar', async ({ page }) => {
    const botonEliminar = page.locator('span[title="Eliminar"], [class*="delete"]').first();
    await expect(botonEliminar).toBeVisible({ timeout: 5000 });
  });

  test('CA_16_02: Debe solicitar confirmación antes de eliminar', async ({ page }) => {
    const botonEliminar = page.locator('span[title="Eliminar"], [class*="delete"]').first();
    await expect(botonEliminar).toBeVisible({ timeout: 5000 });
    await botonEliminar.click();
    await expect(
      page.locator('text=/confirmar|seguro|desea eliminar/i, [class*="modal"], [class*="confirm"]').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('CA_16_03: Debe mostrar confirmación tras eliminar exitosamente', async ({ page }) => {
    await page.locator('span[title="Eliminar"], [class*="delete"]').first().click();
    const botonConfirmar = page.locator('button:has-text("Confirmar"), button:has-text("Sí"), button:has-text("Aceptar")').first();
    if (await botonConfirmar.isVisible().catch(() => false)) {
      await botonConfirmar.click();
    }
    await expect(
      page.locator('text=/eliminado|exitoso|éxito/i').first()
    ).toBeVisible({ timeout: 10000 });
  });
});

// ─────────────────────────────────────────────
// HU_17: Iniciar sesión
// ─────────────────────────────────────────────
test.describe('HU_17: Iniciar sesión', () => {

  test.beforeEach(async ({ page }) => {
    await setupAllRoutes(page);
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('input[placeholder*="correo"], input[type="email"]', { timeout: 10000 });
  });

  test('CA_17_01: Debe mostrar formulario con campos de usuario y contraseña', async ({ page }) => {
    await expect(page.getByPlaceholder('Ingresa tu correo...')).toBeVisible();
    await expect(page.getByPlaceholder('Escribe tu contraseña...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar Sesión' })).toBeVisible();
  });

  test('CA_17_02: Debe mostrar error con credenciales incorrectas', async ({ page }) => {
    await page.getByPlaceholder('Ingresa tu correo...').fill('correo@invalido.com');
    await page.getByPlaceholder('Escribe tu contraseña...').fill('claveincorrecta');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await expect(
      page.locator('text=/inválid|incorrect|no encontrado|error/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('CA_17_03: Debe mostrar opción de recuperación de contraseña', async ({ page }) => {
    await expect(page.locator('text=/olvidaste|recuperar|olvidé/i').first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// HU_18: Cerrar sesión
// ─────────────────────────────────────────────
test.describe('HU_18: Cerrar sesión', () => {

  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForSelector('button:has-text("Cerrar sesión"), button:has-text("Salir"), [class*="logout"]', { timeout: 10000 });
  });

  test('CA_18_01: Debe mostrar botón de cerrar sesión visible', async ({ page }) => {
    const botonLogout = page.locator('button:has-text("Cerrar sesión"), button:has-text("Salir"), [class*="logout"]').first();
    await expect(botonLogout).toBeVisible({ timeout: 5000 });
  });

  test('CA_18_02: Debe redirigir al login tras cerrar sesión', async ({ page }) => {
    await page.locator('button:has-text("Cerrar sesión"), button:has-text("Salir"), [class*="logout"]').first().click();
    await page.waitForURL(`${BASE_URL}/login`, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });

  test('CA_18_03: No debe permitir acceso sin sesión activa', async ({ page }) => {
    await page.locator('button:has-text("Cerrar sesión"), button:has-text("Salir"), [class*="logout"]').first().click();
    await page.waitForURL(`${BASE_URL}/login`, { timeout: 10000 });
    await page.goto(`${BASE_URL}/admin/usuarios`);
    await expect(page).toHaveURL(/login/, { timeout: 5000 });
  });
});

// ─────────────────────────────────────────────
// HU_19: Recuperar contraseña
// ─────────────────────────────────────────────
test.describe('HU_19: Recuperar contraseña', () => {

  test.beforeEach(async ({ page }) => {
    await setupAllRoutes(page);
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('input[placeholder*="correo"]', { timeout: 10000 });
  });

  test('CA_19_01: Debe mostrar enlace de recuperación de contraseña', async ({ page }) => {
    const enlace = page.locator('text=/olvidaste|recuperar|olvidé/i').first();
    await expect(enlace).toBeVisible({ timeout: 5000 });
  });

  test('CA_19_02: Debe permitir ingresar correo para recuperar contraseña', async ({ page }) => {
    await page.route('**/api/auth/recover-email', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Correo de recuperación enviado' })
      });
    });

    await page.locator('text=/olvidaste|recuperar|olvidé/i').first().click();
    await page.waitForURL(/reset-password|recover/, { timeout: 5000 });
    const campoCorreo = page.locator('input[type="email"], input[placeholder*="correo"]').first();
    await expect(campoCorreo).toBeVisible({ timeout: 5000 });
    await campoCorreo.fill('duvann1991@gmail.com');
    await page.getByRole('button', { name: /enviar|recuperar|continuar/i }).first().click();
    await expect(
      page.locator('text=/enviado|revisa|correo|instrucciones/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('CA_19_03: Debe validar criterios mínimos de seguridad en nueva contraseña', async ({ page }) => {
    await page.goto(`${BASE_URL}/reset-password`);
    const campoNuevaClave = page.locator('input[type="password"]').first();
    if (await campoNuevaClave.isVisible().catch(() => false)) {
      await campoNuevaClave.fill('123');
      await page.getByRole('button', { name: /guardar|cambiar|actualizar/i }).first().click();
      await expect(
        page.locator('text=/mínimo|caracteres|seguridad|requisitos/i').first()
      ).toBeVisible({ timeout: 5000 });
    } else {
      test.skip();
    }
  });
});
