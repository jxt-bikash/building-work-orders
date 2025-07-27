// database.js

/**
 * @module database
 * Handles all database connections and queries for the application.
 */

const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: { encrypt: false, trustServerCertificate: true }
};

/**
 * Converts a date string into 'YYYY-MM-DD' format for SQL Server.
 * @param {string} dateString - The date string from the scraper (e.g., '27 July 2025').
 * @returns {string} The formatted date string.
 */
function formatDateForSQL(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Checks if an order already exists in the database.
 * Uniqueness is determined by a combination of company name, date, and address.
 * @param {object} order - The order object scraped from the website.
 * @returns {Promise<boolean>} True if the order exists, otherwise false.
 */
async function checkIfOrderExists(order) {
    const sqlDate = formatDateForSQL(order.dateAdded);
    try {
        await sql.connect(dbConfig);
        const result = await sql.query `
        SELECT COUNT(*) as count 
        FROM BuildingWorkOrders 
        WHERE company_name = ${order.companyName}
        AND date_added = ${sqlDate}
        AND company_address = ${order.companyAddress}`;
        return result.recordset[0].count > 0;
    } catch (err) {
        console.error('Database check error:', err);
        return false;
    }
}

/**
 * Inserts a new order record into the database.
 * @param {object} order - The order object scraped from the website.
 */
async function insertOrder(order) {
    try {
        const sqlDate = formatDateForSQL(order.dateAdded);
        await sql.connect(dbConfig);
        // Columns in the INSERT statement are now in the new order.
        await sql.query `
        INSERT INTO BuildingWorkOrders (company_name, company_number, company_address, order_type, date_added) 
        VALUES (${order.companyName}, ${order.companyNumber}, ${order.companyAddress}, ${order.orderType}, ${sqlDate})`;
        console.log(`Successfully inserted '${order.companyName}' into the database.`);
    } catch (err) {
        if (!err.message.includes('Violation of UNIQUE KEY constraint')) {
            console.error('Database insert error:', err);
        }
    }
}

module.exports = { checkIfOrderExists, insertOrder };