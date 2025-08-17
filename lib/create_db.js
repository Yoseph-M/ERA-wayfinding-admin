const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const dbPath = path.resolve(__dirname, '../era.db');
const csvFilePath = path.resolve(__dirname, '../era.csv');

// Initialize the database
const db = new Database(dbPath, { verbose: console.log });

try {
    // Create table
    db.exec(`
        CREATE TABLE IF NOT EXISTS era_data (
            id INTEGER PRIMARY KEY,
            block TEXT,
            decat INTEGER,
            department TEXT,
            departmentamh TEXT,
            floor INTEGER,
            officeno TEXT,
            wcontact TEXT,
            wid TEXT,
            wname TEXT,
            wnameamh TEXT,
            wtitle TEXT,
            wtitleamh TEXT
        );
    `);
    console.log('Table era_data created or already exists.');

    // Create blocks table
    db.exec(`
        CREATE TABLE IF NOT EXISTS blocks (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            fields TEXT,
            departments TEXT
        );
    `);
    console.log('Table blocks created or already exists.');

    // Read and parse CSV
    const csvFile = fs.readFileSync(csvFilePath, 'utf8');
    Papa.parse(csvFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            const data = results.data;

            // Prepare insert statement
            const insert = db.prepare(`
                INSERT INTO era_data (
                    id, block, decat, department, departmentamh, floor, officeno,
                    wcontact, wid, wname, wnameamh, wtitle, wtitleamh
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
            `);

            // Insert data
            db.transaction((rows) => {
                for (const row of rows) {
                    // Ensure 'id' is an integer, and handle potential empty strings for numbers
                    const id = parseInt(row.id, 10);
                    const decat = row.decat ? parseInt(row.decat, 10) : null;
                    const floor = row.floor ? parseInt(row.floor, 10) : null;

                    insert.run(
                        id,
                        row.block,
                        decat,
                        row.department,
                        row.departmentamh,
                        floor,
                        row.officeno,
                        row.wcontact,
                        row.wid,
                        row.wname,
                        row.wnameamh,
                        row.wtitle,
                        row.wtitleamh
                    );
                }
            })(data);
            console.log(`Successfully inserted ${data.length} rows into era_data.`);
        }
    });

} catch (error) {
    console.error('Error during database setup or data import:', error);
} finally {
    db.close();
    console.log('Database connection closed.');
}