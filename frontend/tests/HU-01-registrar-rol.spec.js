import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:5173';

test.describe('HU-01: Registrar un rol', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const fakeUser = {
        id: 1,
        IdUsuario: 1,
        IdCliente: 1,
        nombre: 'Administrador Test',
        Correo: 'duvann1991@gmail.com',
        IdRol: 1,
        Rol: 'Administrador',
        rol: 'Administrador',
        Estado: 'activo',
        permisos: ['perm_roles', 'perm_usuarios', 'perm_dashboard'],
        mustChangePassword: false,
        token: 'test-token-hu-01',
        userType: 'admin',
        sessionId: 'test-session-hu01'
      };
      sessionStorage.setItem('user', JSON.stringify(fakeUser));
      sessionStorage.setItem('token', fakeUser.token);
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
            permisos: ['perm_roles', 'perm_usuarios', 'perm_dashboard'],
            sessionId: 'test-session-hu01'
          }
        })
      });
    });

    await page.route('**/api/roles*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              { id: 1, name: 'Administrador', description: 'Acceso total', isActive: true, permissions: [] },
              { id: 2, name: 'Cliente', description: 'Cliente', isActive: true, permissions: [] }
            ]
          })
        });
      } else if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON ? await route.request().postDataJSON() : {};
        const nombre = (body.Nombre || body.nombre || body.name || '').toLowerCase();
        if (nombre === 'administrador' || nombre === 'cliente') {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({ success: false, message: 'El rol ya existe' })
          });
        } else {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                IdRol: Date.now(),
                Nombre: body.Nombre || body.nombre || body.name || 'Nuevo Rol',
                Descripcion: body.Descripcion || body.descripcion || body.description || '',
                Estado: true,
                Permisos: body.Permisos || body.permisos || body.permissions || []
              }
            })
          });
        }
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
    });

    await page.route('**/api/auth/logout', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    });

    await page.goto(`${BASE_URL}/admin/roles`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('button.roles-btn-add')).toBeVisible({ timeout: 20000 });
  });

  test('CA_01_01: Debe visualizar botón para registrar un nuevo rol', async ({ page }) => {
    const botonRegistrar = page.locator('button.roles-btn-add');
    await expect(botonRegistrar).toBeVisible();
    await expect(botonRegistrar).toHaveText('Registrar rol');
  });

  test('CA_01_02: Debe registrar un rol exitosamente', async ({ page }) => {
    await page.locator('button.roles-btn-add').click();
    await page.locator('input[placeholder="Ej: Vendedor"]').fill('Rol Test QA ' + Date.now());
    await page.locator('input[placeholder="Breve descripción"]').fill('Rol creado por automatización');
    const primerPermiso = page.locator('input.permission-checkbox').first();
    await expect(primerPermiso).toBeVisible();
    await primerPermiso.check();
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.locator('text=Rol creado correctamente')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button.roles-btn-add')).toBeVisible({ timeout: 5000 });
  });

  test('CA_01_03: Debe mostrar error al dejar campos vacíos', async ({ page }) => {
    await page.locator('button.roles-btn-add').click();
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.locator('text=Complete todos los campos requeridos')).toBeVisible({ timeout: 5000 });
  });

  test('CA_01_04: Debe validar nombre de rol duplicado', async ({ page }) => {
    await page.locator('button.roles-btn-add').click();
    await page.locator('input[placeholder="Ej: Vendedor"]').fill('Cliente');
    const descInput = page.locator('input[placeholder="Breve descripción"]');
    await expect(descInput).toBeDisabled({ timeout: 5000 });
  });
});
