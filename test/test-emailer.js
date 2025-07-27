// test-emailer.js
const { sendNewOrderEmail } = require('../src/services/emailer.js');

// Create a fake order object for the test
const fakeOrder = {
    companyName: 'Final Email Test Inc.',
    companyNumber: '111222333',
    orderType: 'Stop Work Order',
    dateAdded: '27 July 2025'
};

console.log('--- Testing Email Sender ---');
sendNewOrderEmail(fakeOrder);