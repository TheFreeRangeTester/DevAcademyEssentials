import { Locator, Page } from "@playwright/test";

const baseURL = 'https://react-shopping-cart-67954.firebaseapp.com';

export class ReactShoppingPage {
    readonly page: Page;
    readonly addToCartButtons: Locator;
    readonly closeCheckoutButton: Locator;
    readonly cartAmount: Locator;
    readonly checkOutButton: Locator;
    readonly sizeFilter: (size: string) => Locator;


    constructor(page: Page) {
        this.page = page;
        this.addToCartButtons = page.getByRole('button', { name: 'Add to cart' });
        this.closeCheckoutButton = page.getByRole('button', { name: 'X' });
        this.checkOutButton = page.getByRole('button', { name: 'Checkout' });
        this.cartAmount = page.locator('#root > div > div.sc-1h98xa9-1.fMOJZp > button > div > div');
        this.sizeFilter = (size: string) => page.getByText(`${size}`, { exact: true });

    };

    async navigateToEshop() {
        await this.page.goto(baseURL);
        await this.page.waitForTimeout(1000);
    };

    async clickCheckoutButton() {
        await this.checkOutButton.waitFor({ state: 'visible' });
        await this.checkOutButton.click();
    };

    async clickAddToCartButton(index: number) {
        await this.page.waitForLoadState('domcontentloaded');
        await this.addToCartButtons.nth(index).waitFor({ state: 'visible' });
        await this.addToCartButtons.nth(index).click();
    };

    async clickCloseCheckoutButton() {
        await this.closeCheckoutButton.waitFor({ state: 'visible' });
        await this.closeCheckoutButton.click();

    };

    async getItemsAmount() {
        return await this.addToCartButtons.count();
    };

    async addMultipleItemsToCart(count: number) {
        const itemsCount = await this.getItemsAmount();
        console.log(`Total items available: ${itemsCount}`);
        for (let i = 0; i < Math.min(count, itemsCount); i++) {
            console.log(`Adding item ${i + 1} to the cart`);
            await this.clickAddToCartButton(i);
            await this.clickCloseCheckoutButton();
        }
    };

    async clickFilterBySize(size: string) {
        await this.page.waitForSelector(`text=${size}`, { state: 'visible' });
        await this.sizeFilter(size).click();
    };

    async fetchCartAmount() {
        return await this.cartAmount.textContent();
    };
}