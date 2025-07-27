// test/test-full-flow.js
// Change this line to import 'scrapeOrders'
const { scrapeOrders } = require('../src/services/scraper.js');
const { checkIfOrderExists, insertOrder } = require('../src/services/database.js');

async function runFullTest() {
    console.log('--- Starting Full Scraper-to-Database Test ---');

    // Change this line to call 'scrapeOrders'
    const scrapedData = await scrapeOrders();

    if (scrapedData && scrapedData.length > 0) {
        console.log(`Scraper found ${scrapedData.length} items. Now attempting to save to database...`);

        for (const order of scrapedData) {
            const exists = await checkIfOrderExists(order);

            if (!exists) {
                console.log(`Inserting new order for: ${order.companyName}`);
                await insertOrder(order);
            } else {
                console.log(`Skipping existing order for: ${order.companyName}`);
            }
        }
        console.log('--- Database processing complete. ---');
    } else {
        console.log('Scraper did not return any data to process.');
    }
}

runFullTest();