import { test, expect } from '@playwright/test';
import { ReactShoppingPage } from '../tests/Pages/ReactShoppingPage';


test.describe('E-Commerce site', () => {
  let shoppingPage;
  const baseURL = 'https://react-shopping-cart-67954.firebaseapp.com';

  test.beforeEach(async ({ page }) => {
    shoppingPage = new ReactShoppingPage(page);
  });

  /*  beforeAll(() => {
     shoppingPage = new ReactShoppingPage(page);
   }); */



  test('Adding 5 items to the Cart', async ({ page }) => {
    await page.waitForSelector('text=Add to cart', { state: 'visible' });
    await shoppingPage.addMultipleItemsToCart(5);
    let cartAmount = await shoppingPage.fetchCartAmount();

    expect(cartAmount).toBe('5');
  });

  test('The checkout works as expected', async ({ page }) => {
    await page.waitForSelector('text=Add to cart', { state: 'visible' });
    await page.click('text=Add to cart');
    await page.waitForSelector('text=Checkout', { state: 'visible' });
    await page.click('text=Checkout');

  });

  test('There are two shirt with size XS', async ({ page }) => {
    await page.waitForTimeout(1000);
    await shoppingPage.clickFilterBySize('XXL');
    await page.waitForSelector('text=Add to cart', { state: 'visible' });
    let itemsList = page.getByRole('button', { name: 'Add to cart' });
    const itemCount = await itemsList.count();
    console.log(`Amount of elements in the list: ${itemCount}`);
    await expect(async () => {
      expect(itemCount).toBe(2);
    }).toPass();
  });

  test('There are two shirt with size XS validated via API', async ({ page, request }) => {
    await page.getByText('S', { exact: true }).click();
    await page.waitForSelector('text=Add to cart', { state: 'visible' });
    let itemsList = page.getByRole('button', { name: 'Add to cart' });
    const itemCount = await itemsList.count();
    console.log(`Amount of elements in the list: ${itemCount}`);
    const response = await request.get('https://react-shopping-cart-67954.firebaseio.com/products.json', {
      headers: {
        'Accept': 'application/json'
      }
    });
    await expect(async () => {
      expect(itemCount).toBe(2);
    }).toPass();

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    const desiredProduct = responseBody.products.find(product => product.title === "Black Batman T-shirt");
    expect(desiredProduct).toBeDefined();
    expect(desiredProduct.availableSizes.includes('S')).toBeTruthy();

    console.log(await responseBody);
  });

  test('should fetch products.json and validate its structure and content', async ({ request }) => {
    const response = await request.get('https://react-shopping-cart-67954.firebaseio.com/products.json', {
      headers: {
        'Accept': 'application/json'
      }
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    console.log(await responseBody);
  });

  test('DINI, should fetch products.json and validate its structure and content', async ({ request }) => {
    const response = await request.get('https://react-shopping-cart-67954.firebaseio.com/products.json', {
      headers: {
        'Accept': 'application/json, text/plain, /'
      }
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    console.log(await responseBody);
    expect(responseBody).toBeInstanceOf(Object);
  });

  test(`VONZI - Complete the purchase`, async ({ page }) => {
    await page.goto(baseURL);
    await expect(page.getByRole(`heading`, { name: "Sizes:" })).toBeVisible();
    await page.locator(`.checkmark`).getByText('S', { exact: true }).click();
    await page.getByRole(`button`, { name: "Add to cart" }).first().click();
    await expect(page.getByText(`Cart`, { exact: true })).toBeVisible();
    const cartTotalPrice = await page.locator(`.sc-1h98xa9-9.jzywDV`).textContent();

    // Clicking checkout button and getting alert tests are behaving different in Playwright UI window tests vs headless mode
    // await page.getByRole(`button`, {name: "Checkout" }).click({ force: true }); // doesn’t go to event

    // below passes in npx playwright test --ui
    const checkoutButton = page.locator(`.sc-1h98xa9-11.gnXVNU`);
    checkoutButton.dispatchEvent(`click`); // also works in Playwright UI tests but not in extention tests
    checkoutButton.evaluate((node: HTMLElement) => { node.click() }) // also works in Playwright UI tests but not in extension tests
    checkoutButton.evaluate((element: HTMLElement) => element.click()); //also works in Playwright UI tests but not in extension tests

    page.on(`dialog`, async dialog => {
      expect(dialog.message()).toContain(`Checkout - Subtotal: ${cartTotalPrice}`);
      console.log(dialog.message());
      await dialog.dismiss();
    });
  });



});
