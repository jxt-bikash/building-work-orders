// index.js

/**
 * @file The main entry point for the Building Work Orders Monitor application.
 * This script orchestrates the web scraping, database interaction, and email notifications.
 * It runs on a schedule defined by a cron job.
 */

const cron = require('node-cron');
const { scrapeOrders } = require('./services/scraper.js');
const { checkIfOrderExists, insertOrder } = require('./services/database.js');
const { sendNewOrderEmail } = require('./services/emailer.js');

console.log('Starting Stop Work Order Monitor...');

/**
 * The main application logic. It scrapes the website for new orders,
 * compares them against the database, and triggers notifications for new entries.
 */
async function runCheck() {
    console.log('------------------------------------');
    console.log(`Running check at: ${new Date().toLocaleString()}`);
    try {
        // Step 1: Scrape the website to get the current list of orders.
        const currentOrders = await scrapeOrders();
        if (!currentOrders) {
            console.log("Scraper returned no data. Ending check.");
            return;
        }
        console.log(`Scraper found ${currentOrders.length} orders. Comparing with database...`);

        // Step 2: Process each scraped order.
        for (const order of currentOrders) {
            // Skip any records with incomplete essential data.
            if (order.companyName === 'Not Found' || order.dateAdded === 'Not Found') continue;

            // Step 3: Check if the order already exists in the database.
            const exists = await checkIfOrderExists(order);

            // Step 4: If the order is new, save it and send a notification.
            if (!exists) {
                console.log(`NEW ORDER FOUND: ${order.companyName}`);
                await insertOrder(order);
                await sendNewOrderEmail(order);
            }
        }
        console.log('All scraped orders have been processed.');
    } catch (error) {
        console.error('An error occurred during the main check process:', error);
    }
    console.log('Check finished. Waiting for next scheduled run...');
    console.log('------------------------------------');
}

// Use node-cron to schedule the runCheck function.
// This cron expression ('30 * * * *') runs the job at 30 minutes past every hour.
cron.schedule('30 * * * *', () => {
    console.log("Scheduled cron job starting...");
    runCheck();
});

// Run the check once immediately when the application starts.
runCheck();