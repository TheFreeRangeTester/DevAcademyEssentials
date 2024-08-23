import { test, expect } from '@playwright/test';
import { ReactShoppingPage } from '../tests/Pages/ReactShoppingPage';

test.describe('E-Commerce site', () => {

  const baseURL = 'https://react-shopping-cart-67954.firebaseapp.com';

  test.beforeEach(async ({ page }) => {
    await page.goto("https://react-shopping-cart-67954.firebaseapp.com/");
  })



  test('Adding 5 items to the Cart', async ({ page }) => {
    await page.waitForSelector('text=Add to cart', { state: 'visible' });
    let itemsList = await page.$$('text=Add to cart');
    console.log(itemsList.length);
    for (let i = 0; i < 5; i++) {
      await itemsList[i].click();
      await page.getByRole('button', { name: 'X' }).click();
    };

  });

  test('The checkout works as expected', async ({ page }) => {
    await page.waitForSelector('text=Add to cart', { state: 'visible' });
    await page.click('text=Add to cart');
    await page.waitForSelector('text=Checkout', { state: 'visible' });
    await page.click('text=Checkout');

  });


  test('There are two shirt with size XS', async ({ page }) => {
    await page.getByText('S', { exact: true }).click();
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

  test('POM - Adding 5 items to the cart', async ({ page }) => {
    const shoppingPage = new ReactShoppingPage(page);
    await page.waitForSelector('text=Add to cart', { state: 'visible' });
    await shoppingPage.addMultipleItemsToCart(5);
    let cartAmount = await shoppingPage.fetchCartAmount();
    expect(cartAmount).toBe('5');
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
});
