// emailer.js

/**
 * @module emailer
 * Handles the sending of email notifications using Nodemailer.
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

// The Nodemailer transporter object, configured to use the email service
// credentials from the .env file.
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    // Allows the use of self-signed certificates, often needed for
    // local testing or networks with SSL inspection.
    tls: {
        rejectUnauthorized: false
    }
});

/**
 * Sends a formatted email notification for a new work order.
 * @param {object} order - The order object containing details to include in the email.
 */
async function sendNewOrderEmail(order) {
    const mailOptions = {
        from: '"Work Order Monitor" <monitor@example.com>',
        to: 'recipient@example.com', // The destination address for notifications
        subject: `New Stop Work Order Alert: ${order.companyName}`,
        html: `
      <h2>A new Stop Work Order has been issued.</h2>
      <p><strong>Company Name:</strong> ${order.companyName}</p>
      <p><strong>Company Number (ACN/ABN):</strong> ${order.companyNumber ? order.companyNumber : 'N/A'}</p>
      <p><strong>Address:</strong> ${order.companyAddress ? order.companyAddress : 'N/A'}</p>
      <p><strong>Date Issued:</strong> ${order.dateAdded}</p>
    `,
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log(`Email notification sent for ${order.companyName}.`);
        // When using Ethereal, this logs a URL to preview the sent email.
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

module.exports = { sendNewOrderEmail };