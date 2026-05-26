import { test, expect } from '@playwright/test';

test.describe('Products E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('load product list -> waitForResponse(/\/api\/products/), assert items rendered', async ({ page }) => {
    await page.goto('/catlogodeproductos');

    const productsResponse = page.waitForResponse(
      response => response.url().includes('/api/products') && response.status() === 200
    );

    await page.waitForTimeout(500);

    const response = await productsResponse;
    expect(response.status()).toBe(200);

    const products = await response.json();
    expect(Array.isArray(products)).toBeTruthy();

    const productCards = page.locator('[data-testid="product-card"], .product-card, [class*="productCard"]');
    await page.waitForTimeout(1000);

    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('click product card -> waitForResponse(/\/api\/products\/.+/), assert detail shown', async ({ page }) => {
    await page.goto('/catlogodeproductos');

    await page.waitForResponse(
      response => response.url().includes('/api/products') && response.status() === 200
    );

    await page.waitForTimeout(1000);

    const productCard = page.locator('[data-testid="product-card"], .product-card, [class*="productCard"]').first();
    const productName = await productCard.locator('h3, [class*="name"]').first().textContent();

    const detailResponse = productCard.click().then(async () => {
      return page.waitForResponse(
        response => /\/api\/products\/.+/.test(response.url()) && response.status() === 200
      );
    });

    const response = await detailResponse;
    expect(response.status()).toBe(200);

    await page.waitForTimeout(500);

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(product|detalle|producto)/);
  });

  test('search/filter -> assert query params sent', async ({ page }) => {
    await page.goto('/catlogodeproductos');

    await page.waitForResponse(
      response => response.url().includes('/api/products') && response.status() === 200
    );

    const categoryButton = page.locator('button:has-text("Alimentos"), button:has-text("Juguetes"), button:has-text("Descanso"), button:has-text("Higiene")').first();
    if (await categoryButton.count() > 0) {
      let requestWithQueryParams: any;
      page.on('request', req => {
        if (req.url().includes('/api/products') && req.url().includes('category=')) {
          requestWithQueryParams = req;
        }
      });

      await categoryButton.click();

      await page.waitForTimeout(500);

      expect(requestWithQueryParams).toBeDefined();
      const url = requestWithQueryParams.url();
      expect(url).toContain('category=');
    }
  });

  test('product detail page shows correct product data from API', async ({ page }) => {
    await page.goto('/catlogodeproductos');

    const productsResponse = await page.waitForResponse(
      response => response.url().includes('/api/products') && response.status() === 200
    );

    const products = await productsResponse.json();
    expect(products.length).toBeGreaterThan(0);

    const firstProduct = products[0];

    await page.goto(`/detalledeproducto/${firstProduct.id}`);

    const detailResponse = await page.waitForResponse(
      response => response.url().includes(`/api/products/${firstProduct.id}`) && response.status() === 200
    );

    expect(detailResponse.status()).toBe(200);

    await page.waitForTimeout(500);

    const nameElement = page.locator('h1, h2, [class*="name"]').first();
    const nameText = await nameElement.textContent();
    expect(nameText).toContain(firstProduct.name);

    const priceElement = page.locator('[class*="price"], [class*="Price"]').first();
    const priceText = await priceElement.textContent();
    expect(priceText).toContain((firstProduct.price / 100).toFixed(2));
  });
});