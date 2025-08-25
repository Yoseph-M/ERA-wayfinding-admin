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
        DROP TABLE IF EXISTS era_data;
        CREATE TABLE IF NOT EXISTS era_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            block TEXT,
            department TEXT,
            departmentamh TEXT,
            floor INTEGER,
            officeno TEXT,
            wcontact TEXT,
            wname TEXT,
            wnameamh TEXT,
            wtitle TEXT,
            wtitleamh TEXT
        );
    `);
    console.log('Table era_data created or already exists.');

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
                    block, department, departmentamh, floor, officeno,
                    wcontact, wname, wnameamh, wtitle, wtitleamh
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
            `);

            // Insert data
            db.transaction((rows) => {
                for (const row of rows) {
                    // Helper to convert blank/empty string to null
                    const toNull = (val) => (val === undefined || val === null || String(val).trim() === '' ? null : val);
                    const floor = row.floor ? parseInt(row.floor, 10) : null;

                    insert.run(
                        toNull(row.block),
                        toNull(row.department),
                        toNull(row.departmentamh),
                        floor,
                        toNull(row.officeno),
                        toNull(row.wcontact),
                        toNull(row.wname),
                        toNull(row.wnameamh),
                        toNull(row.wtitle),
                        toNull(row.wtitleamh)
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