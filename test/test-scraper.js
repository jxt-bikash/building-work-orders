// scraper.js - Corrected Version
const puppeteer = require('puppeteer');

// Renamed function to match what the test file expects
async function scrapeOrders() {
    console.log(`Scraping the first page for 'Stop Work Orders'...`);

    const browser = await puppeteer.launch({
        headless: "new", // Changed back to headless for speed
        defaultViewport: { width: 1280, height: 800 }
    });

    const page = await browser.newPage();

    try {
        await page.goto('https://www.nsw.gov.au/departments-and-agencies/building-commission/register-of-building-work-orders', { waitUntil: 'networkidle2' });

        console.log("Page loaded. Applying filters...");

        const checkboxLocator = page.locator('#category-stop-work-orders');
        await checkboxLocator.click();

        const applyButtonLocator = page.locator('input[data-test="finder-submit"]');
        await applyButtonLocator.click();

        const resultsSelector = 'div.nsw-list-item';
        await page.waitForSelector(resultsSelector, { timeout: 10000 });
        console.log("Filters applied. Scraping first page...");

        const orders = await page.$$eval(resultsSelector, (items) => {
            return items.map(item => {
                const titleEl = item.querySelector('.nsw-list-item__title a');
                const fullTitle = titleEl ? titleEl.innerText.trim() : 'Not Found';
                const companyName = fullTitle.replace(/stop work order for /i, '');
                const dateEl = item.querySelector('.nsw-list-item__info');
                const dateText = dateEl ? dateEl.innerText.trim() : 'Not Found';
                const companyNumber = 'Not Found on list page';
                return { companyName, companyNumber, dateAdded: dateText, orderType: 'Stop Work Order' };
            });
        });

        console.log('Scraping successful!');
        return orders;

    } catch (error) {
        console.error("AN ERROR OCCURRED:", error);
        return null;
    } finally {
        await browser.close();
    }
}

// --- THIS IS THE CRITICAL FIX ---
// We must export the function to make it available to other files.
module.exports = {
    scrapeOrders
};

// The run() function has been removed so this file acts only as a module.