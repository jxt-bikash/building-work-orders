// scraper.js

/**
 * @module scraper
 * Handles scraping the NSW Building Work Orders register using Puppeteer.
 */

const puppeteer = require('puppeteer');

/**
 * Scrapes the first page of "Stop Work Orders" from the NSW register.
 * It navigates to the page, applies the necessary filters, and extracts
 * the details for each order listed.
 * @returns {Promise<Array|null>} A promise that resolves to an array of order objects, or null if an error occurs.
 */
async function scrapeOrders() {
    console.log(`Scraping the first page for 'Stop Work Orders'...`);

    const browser = await puppeteer.launch({
        headless: "new",
        defaultViewport: { width: 1280, height: 800 }
    });

    const page = await browser.newPage();
    try {
        await page.goto('https://www.nsw.gov.au/departments-and-agencies/building-commission/register-of-building-work-orders', { waitUntil: 'networkidle2' });

        const checkboxLocator = page.locator('#category-stop-work-orders');
        await checkboxLocator.click();
        const applyButtonLocator = page.locator('input[data-test="finder-submit"]');
        await applyButtonLocator.click();

        const resultsSelector = 'div.nsw-list-item';
        await page.waitForSelector(resultsSelector, { timeout: 10000 });

        const orders = await page.$$eval(resultsSelector, (items) => {
            return items.map(item => {
                const titleEl = item.querySelector('.nsw-list-item__title a');
                const fullTitle = titleEl ? titleEl.innerText.trim() : 'Not Found';
                const companyName = fullTitle.replace(/stop work order for /i, '');

                const dateEl = item.querySelector('.nsw-list-item__info');
                const dateText = dateEl ? dateEl.innerText.trim() : 'Not Found';

                const companyNumber = null;

                const addressEl = item.querySelector('.nsw-list-item__copy p');
                let companyAddress = addressEl ? addressEl.innerText.trim() : null;
                if (companyAddress && companyAddress.includes('(')) {
                    companyAddress = companyAddress.split('(')[0].trim();
                }

                // Properties are now in the desired order.
                return {
                    companyName,
                    companyNumber,
                    companyAddress,
                    orderType: 'Stop Work Order',
                    dateAdded: dateText,
                };
            });
        });
        return orders;
    } catch (error) {
        console.error("AN ERROR OCCURRED DURING SCRAPING:", error);
        return null;
    } finally {
        await browser.close();
    }
}

module.exports = { scrapeOrders };