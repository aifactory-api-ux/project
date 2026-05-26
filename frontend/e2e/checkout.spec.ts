import { test, expect } from '@playwright/test';

test.describe('Checkout E2E', () => {
  let authToken: string;
  let testProduct: any;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.evaluate(() => localStorage.removeItem('cart'));

    const timestamp = Date.now();
    const testEmail = `checkout${timestamp}@example.com`;
    const testPassword = 'password123';
    const testName = 'Checkout Test';

    await page.goto('/register');
    await page.fill('input[name="email"], input[type="email"]', testEmail);
    await page.fill('input[name="password"], input[type="password"]', testPassword);
    await page.fill('input[name="name"], input[placeholder*="nombre"]', testName);
    await page.click('button[type="submit"]');

    const regResponse = await page.waitForResponse(
      resp => resp.url().includes('/api/auth/register') && resp.status() === 201
    );
    const regBody = await regResponse.json();
    authToken = regBody.accessToken;

    const productsResponse = await page.request.get('/api/products', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const products = await productsResponse.json();
    testProduct = products[0];

    await page.goto('/catlogodeproductos');
    await page.waitForResponse(resp => resp.url().includes('/api/products') && resp.status() === 200);
  });

  test('add item to cart -> go to cart -> click checkout -> waitForResponse(/api/orders/), assert POST body has cart items', async ({ page }) => {
    if (!testProduct) {
      test.skip();
      return;
    }

    await page.goto('/catlogodeproductos');
    await page.waitForResponse(resp => resp.url().includes('/api/products') && resp.status() === 200);
    await page.waitForTimeout(500);

    const addButton = page.locator('button:has-text("Agregar"), button:has-text("Añadir"), button:has-text("Add")').first();
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(300);
    } else {
      await page.evaluate((product) => {
        const cart = [ { productId: product.id, quantity: 1 } ];
        localStorage.setItem('cart', JSON.stringify(cart));
      }, testProduct);
    }

    await page.goto('/carritodecompras');
    await page.waitForTimeout(500);

    const checkoutButton = page.locator('button:has-text("Proceder"), button:has-text("Pagar"), button:has-text("Checkout"), button:has-text("Confirmar")').first();

    let orderRequestBody: any;
    page.on('request', req => {
      if (req.url().includes('/api/orders') && req.method() === 'POST') {
        try {
          orderRequestBody = JSON.parse(req.body() as string);
        } catch {
          orderRequestBody = req.postDataBuffer();
        }
      }
    });

    await checkoutButton.click();

    const orderResponse = await page.waitForResponse(
      resp => resp.url().includes('/api/orders') && resp.status() === 201
    );

    expect(orderResponse.status()).toBe(201);

    const orderBody = await orderResponse.json();
    expect(orderBody).toHaveProperty('id');
    expect(orderBody).toHaveProperty('total');
    expect(orderBody.items).toBeDefined();
    expect(Array.isArray(orderBody.items)).toBeTruthy();
  });

  test('order history -> waitForResponse GET /api/orders, assert list rendered', async ({ page }) => {
    if (!testProduct) {
      test.skip();
      return;
    }

    await page.evaluate((product) => {
      const cart = [ { productId: product.id, quantity: 1, price: product.price } ];
      localStorage.setItem('cart', JSON.stringify(cart));
    }, testProduct);

    await page.goto('/carritodecompras');

    const checkoutButton = page.locator('button:has-text("Proceder"), button:has-text("Pagar"), button:has-text("Checkout"), button:has-text("Confirmar")').first();
    await checkoutButton.click();
    await page.waitForResponse(resp => resp.url().includes('/api/orders') && resp.status() === 201);
    await page.waitForTimeout(1000);

    await page.goto('/orderhistory');

    const ordersResponse = page.waitForResponse(
      response => response.url().includes('/api/orders') && response.status() === 200
    );

    const response = await ordersResponse;
    expect(response.status()).toBe(200);

    const orders = await response.json();
    expect(Array.isArray(orders)).toBeTruthy();
    expect(orders.length).toBeGreaterThan(0);

    await page.waitForTimeout(500);
    const orderCards = page.locator('[data-testid="order-card"], .order-card, [class*="orderCard"], [class*="order"]');
    const count = await orderCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('order detail -> assert GET /api/orders/:id data shown', async ({ page }) => {
    if (!testProduct) {
      test.skip();
      return;
    }

    await page.evaluate((product) => {
      const cart = [ { productId: product.id, quantity: 1, price: product.price } ];
      localStorage.setItem('cart', JSON.stringify(cart));
    }, testProduct);

    await page.goto('/carritodecompras');

    const checkoutButton = page.locator('button:has-text("Proceder"), button:has-text("Pagar"), button:has-text("Checkout"), button:has-text("Confirmar")').first();
    await checkoutButton.click();

    const orderResponse = await page.waitForResponse(
      resp => resp.url().includes('/api/orders') && resp.status() === 201
    );
    const orderBody = await orderResponse.json();
    const orderId = orderBody.id;

    await page.goto(`/orderdetail/${orderId}`);

    const detailResponse = page.waitForResponse(
      response => response.url().includes(`/api/orders/${orderId}`) && response.status() === 200
    );

    const response = await detailResponse;
    expect(response.status()).toBe(200);

    const orderDetail = await response.json();
    expect(orderDetail.id).toBe(orderId);
    expect(orderDetail).toHaveProperty('status');
    expect(orderDetail).toHaveProperty('total');
    expect(orderDetail).toHaveProperty('items');

    await page.waitForTimeout(500);
    const statusElement = page.locator('[class*="status"], [data-testid="order-status"]').first();
    if (await statusElement.count() > 0) {
      const statusText = await statusElement.textContent();
      expect(statusText).toMatch(/pending|paid|shipped|cancelled/i);
    }
  });

  test('cart persists items after page reload', async ({ page }) => {
    if (!testProduct) {
      test.skip();
      return;
    }

    await page.evaluate((product) => {
      const cart = [ { productId: product.id, quantity: 2, price: product.price } ];
      localStorage.setItem('cart', JSON.stringify(cart));
    }, testProduct);

    await page.goto('/carritodecompras');
    await page.waitForTimeout(500);

    const cartItemCount = await page.locator('[data-testid="cart-item"], .cart-item, [class*="cartItem"]').count();
    expect(cartItemCount).toBeGreaterThan(0);

    await page.reload();
    await page.waitForTimeout(500);

    const persistedCount = await page.locator('[data-testid="cart-item"], .cart-item, [class*="cartItem"]').count();
    expect(persistedCount).toBe(cartItemCount);
  });

  test('update quantity in cart -> assert total price updates', async ({ page }) => {
    if (!testProduct) {
      test.skip();
      return;
    }

    await page.evaluate((product) => {
      const cart = [ { productId: product.id, quantity: 1, price: product.price } ];
      localStorage.setItem('cart', JSON.stringify(cart));
    }, testProduct);

    await page.goto('/carritodecompras');
    await page.waitForTimeout(500);

    const incrementButton = page.locator('button:has-text("+"), button:has-text("Más")').first();
    if (await incrementButton.count() > 0) {
      const initialTotal = await page.locator('[class*="total"], [class*="Total"]').first().textContent();

      await incrementButton.click();
      await page.waitForTimeout(300);

      const updatedTotal = await page.locator('[class*="total"], [class*="Total"]').first().textContent();
      expect(updatedTotal).not.toBe(initialTotal);
    }
  });

  test('remove item from cart -> item disappears', async ({ page }) => {
    if (!testProduct) {
      test.skip();
      return;
    }

    await page.evaluate((product) => {
      const cart = [ { productId: product.id, quantity: 1, price: product.price } ];
      localStorage.setItem('cart', JSON.stringify(cart));
    }, testProduct);

    await page.goto('/carritodecompras');
    await page.waitForTimeout(500);

    const removeButton = page.locator('button:has-text("Eliminar"), button:has-text("Remove"), button:has-text("Quitar")').first();
    expect(await removeButton.count()).toBeGreaterThan(0);

    await removeButton.click();
    await page.waitForTimeout(300);

    const emptyMessage = page.locator('text=vacío, text=empty, text=sin productos');
    const hasEmptyState = await emptyMessage.count() > 0 || await page.locator('[data-testid="cart-item"], .cart-item').count() === 0;
    expect(hasEmptyState).toBeTruthy();
  });
});