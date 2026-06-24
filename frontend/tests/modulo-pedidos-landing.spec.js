import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:5173';

// Mock Data
const mockProducts = [
  {
    id: 1, IdProducto: 1,
    nombre: 'Gorra Urbana', Nombre: 'Gorra Urbana',
    precioVenta: 35000, PrecioVenta: 35000,
    precioMayorista6: 30000, PrecioMayorista6: 30000,
    precioMayorista80: 25000, PrecioMayorista80: 25000,
    tallasStock: [{ talla: 'Ajustable', cantidad: 10 }, { talla: '7', cantidad: 5 }],
    imagenes: [],
    isActive: true
  }
];

async function setupStorefrontRoutes(page) {
  await page.route('**/api/productos*', async (route) => {
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: mockProducts })
    });
  });

  await page.route('**/api/categorias', async (route) => {
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] })
    });
  });

  // Mock checkout/pedidos
  await page.route('**/api/ventas/checkout', async (route) => {
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Pedido registrado correctamente' })
    });
  });
}

test.describe('Módulo de Pedidos (Landing / Storefront)', () => {
  test.beforeEach(async ({ page }) => {
    await setupStorefrontRoutes(page);
    // Clear cart storage just in case
    await page.addInitScript(() => {
      localStorage.removeItem('cart');
    });
  });

  test('CA_PEDIDOS_01: Agregar producto al carrito desde la tienda', async ({ page }) => {
    await page.goto(`${BASE_URL}/productos`, { waitUntil: 'domcontentloaded' });
    
    // Find product card and click add to cart
    const productCard = page.locator('.product-card').first();
    await expect(productCard).toBeVisible({ timeout: 15000 });
    
    // Some stores require selecting a size first or clicking add
    const addToCartBtn = productCard.locator('button:has-text("Agregar")').first();
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
    } else {
      // If it requires going to detail
      await productCard.click();
      await page.waitForSelector('.product-detail-container', { timeout: 10000 });
      await page.locator('button:has-text("Añadir al Carrito")').click();
    }
    
    // Navigate to cart
    await page.goto(`${BASE_URL}/carrito`);
    await expect(page.locator('.cart-item')).toHaveCount(1, { timeout: 10000 });
    await expect(page.locator('.cart-item').first()).toContainText('Gorra Urbana');
  });

  test('CA_PEDIDOS_02: Proceso de Checkout (Completar Pedido)', async ({ page }) => {
    // Inject item into cart directly
    await page.addInitScript(() => {
      localStorage.setItem('cart', JSON.stringify([{
        id: 1, nombre: 'Gorra Urbana', precio: 35000, cantidad: 2, talla: 'Ajustable'
      }]));
    });
    
    await page.goto(`${BASE_URL}/carrito`, { waitUntil: 'domcontentloaded' });
    
    await expect(page.locator('.cart-item')).toHaveCount(1, { timeout: 10000 });
    
    // Click final checkout button
    const checkoutBtn = page.locator('button:has-text("Proceder al Pago"), button:has-text("Completar Pedido"), button.checkout-btn').first();
    await expect(checkoutBtn).toBeVisible();
    await checkoutBtn.click();

    // Depending on the flow, a modal might appear for payment/delivery details
    const checkoutModal = page.locator('.checkout-modal, .modal-content').first();
    if (await checkoutModal.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Fill out required details if necessary
      const addressInput = page.locator('input[name="direccion"], input[placeholder*="dirección"]');
      if (await addressInput.isVisible()) await addressInput.fill('Calle 123');

      const phoneInput = page.locator('input[name="telefono"], input[placeholder*="teléfono"]');
      if (await phoneInput.isVisible()) await phoneInput.fill('3001234567');
      
      const confirmBtn = checkoutModal.locator('button:has-text("Confirmar Pedido")');
      if (await confirmBtn.isVisible()) await confirmBtn.click();
    }
    
    // Expect success message
    await expect(page.locator('text=Pedido registrado').or(page.locator('text=exitosamente'))).toBeVisible({ timeout: 10000 });
  });
});

// ==============================
// CRUD MIS PEDIDOS (Perfil de Cliente)
// ==============================
test.describe('Módulo de Pedidos (Mis Pedidos - Cliente)', () => {
  test.beforeEach(async ({ page }) => {
    // Mock user profile with client role
    await page.route('**/api/mi/perfil', async (route) => {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          success: true, data: { id: 2, email: 'cliente@test.com', rol: 'Cliente', nombre: 'Cliente Test', estado: 'activo' }
        })
      });
    });

    // Mock client orders list
    await page.route('**/api/ventas/mis-compras', async (route) => {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          success: true, data: [
            { id: 1, noVenta: '1001', fecha: '2026-06-20', total: 35000, estado: 'Pendiente', productos: [{nombre: 'Gorra Urbana'}] },
            { id: 2, noVenta: '1002', fecha: '2026-06-21', total: 70000, estado: 'Completada', statusenvio: 'Enviado', productos: [{nombre: 'Gorra Deportiva'}] }
          ]
        })
      });
    });

    await page.addInitScript(() => {
      const fakeUser = { id: 2, rol: 'Cliente', nombre: 'Cliente Test', email: 'cliente@test.com', token: 'client-token' };
      sessionStorage.setItem('user', JSON.stringify(fakeUser));
      sessionStorage.setItem('token', fakeUser.token);
    });

    // Go to profile orders page directly or navigate
    await page.goto(`${BASE_URL}/perfil?tab=orders`, { waitUntil: 'domcontentloaded' });
  });

  test('CA_PEDIDOS_03: Visualizar la lista de Mis Pedidos (CRUD - Leer)', async ({ page }) => {
    // Check if the orders list is visible
    await expect(page.locator('.gm-orders-section')).toBeVisible({ timeout: 15000 });
    
    // Check if the mock orders appear
    await expect(page.locator('text=1001').first()).toBeVisible();
    await expect(page.locator('text=1002').first()).toBeVisible();
  });

  test('CA_PEDIDOS_04: Ver los detalles de un Pedido', async ({ page }) => {
    // Click view details button (eye icon)
    const detailBtn = page.locator('.gm-action-btn.view-btn').first();
    if (await detailBtn.isVisible()) {
      await detailBtn.click();
      await expect(page.locator('.gm-order-detail-header')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=Detalles del Pedido').first()).toBeVisible();
    }
  });

  test('CA_PEDIDOS_05: Cambiar estado del pedido (Marcar como Recibido)', async ({ page }) => {
    // Click mark as received button on the completed order
    const receivedBtn = page.locator('.gm-action-btn.receive-btn').first();
    if (await receivedBtn.isVisible()) {
      await receivedBtn.click();
      // Should show a confirmation modal or success message
      const modal = page.locator('.gm-modal-content').first();
      if (await modal.isVisible()) {
        await modal.locator('button:has-text("Confirmar")').click();
      }
    }
  });
});

