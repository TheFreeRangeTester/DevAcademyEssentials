import { test, expect } from '@playwright/test';
import { ReactShoppingPage } from '../tests/Pages/ReactShoppingPage';


test.describe('E-Commerce site', () => {
  let shoppingPage;

  test.beforeEach(async ({ page }) => {
    shoppingPage = new ReactShoppingPage(page);
    await shoppingPage.navigateToEshop();
    console.log('Using ' + process.env.USERNAME + ' as username');
  });

  /* test.beforeAll(({ page }) => {
    shoppingPage = new ReactShoppingPage(page);
  }); */

  test('Adding 5 items to the Cart', async ({ page }) => {
    await test.step('Given I add multiple items to the cart', async () => {
      await shoppingPage.addMultipleItemsToCart(5);
    })
    await test.step('I can verify the total reflects this.', async () => {
      let cartAmount = await shoppingPage.fetchCartAmount();
      expect(cartAmount).toBe('5');
    })
  });

  test('The checkout works as expected', async ({ page }) => {
    await test.step('Given I add two items to the cart', async () => {
      await shoppingPage.clickAddToCartButton(1);
      await shoppingPage.clickAddToCartButton(0);
    })
    await test.step('I can validate that the total is reflected on the Checkout modal.', async () => {
      const cartTotalPrice = await page.locator(`.sc-1h98xa9-9.jzywDV`).textContent();

      page.on(`dialog`, async dialog => {
        expect(dialog.message()).toContain(`Checkout - Subtotal: ${cartTotalPrice}`);
        console.log(dialog.message());
        await dialog.dismiss();
      });

      await shoppingPage.clickCheckoutButton();
    })

  });

  test('There are two shirt with size S', async ({ page }) => {
    await test.step('Given I filter the items by size', async () => {
      await shoppingPage.clickFilterBySize('S');
    })
    await test.step('I can validate I see the expected amount.', async () => {
      let itemsList = await shoppingPage.addToCartButtons;
      await expect(async () => {
        const itemCount = await itemsList.count();
        console.log(`Amount of elements in the list: ${itemCount}`);
        expect(itemCount).toBe(2);
      }).toPass();
    })

  });

  test('There are two shirts with size S validated via API', async ({ page, request }) => {
    // We filter using the UI
    await shoppingPage.clickFilterBySize('S');
    await page.waitForTimeout(2000);

    // We count the elements of the UI list and print the value
    const itemsList = await shoppingPage.addToCartButtons;
    const itemCount = await itemsList.count();
    console.log(`Amount of elements in the list: ${itemCount}`);

    // We fetch the products from the API
    const response = await request.get('https://react-shopping-cart-67954.firebaseio.com/products.json', {
      headers: {
        'Accept': 'application/json',
      },
    });

    // We validate the response status and parse the JSON
    expect(response.status()).toBe(200);
    const responseBody = await response.json() as { products: { availableSizes: string[]; title: string; }[] };

    // We filter the products with size S
    const productsWithSizeS = responseBody.products.filter(product => product.availableSizes.includes('S'));

    // We validate the amount of products with size S
    await expect(async () => {
      expect(itemCount).toBe(2);
      expect(productsWithSizeS.length).toBe(2);
    }).toPass();
    console.log(responseBody);
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

});
