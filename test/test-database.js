// test-database.js
const { insertOrder, checkIfOrderExists } = require('../src/services/database.js');

// Create a fake order object with the same structure as our scraper's output.
const fakeOrder = {
    companyName: 'Database Test Company',
    companyNumber: '999888777',
    orderType: 'Stop Work Order',
    dateAdded: '27 July 2025' // Use the text date format
};

async function runTest() {
    console.log('--- Starting Database Test ---');

    // 1. Try to insert the fake order into the database.
    await insertOrder(fakeOrder);

    // 2. Check if the order we just inserted now exists.
    const exists = await checkIfOrderExists(fakeOrder);

    console.log('--- Database Result ---');
    console.log(`Does the test order exist? --> ${exists}`); // This should print 'true'
}

runTest();