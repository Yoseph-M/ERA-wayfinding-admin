const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../era.db');
const csvPath = path.resolve(__dirname, '../feedback.csv');

const db = new Database(dbPath);

// Custom CSV parser function
function parseCsv(csvString) {
    const lines = csvString.split(/\r?\n/).filter(line => line.trim() !== '');
    const records = [];

    // Assuming the first line is the header, which we will skip for data parsing
    const dataLines = lines.slice(1);

    for (const line of dataLines) {
        let inQuote = false;
        let field = '';
        const fields = [];

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuote) {
                    // Check if it's an escaped quote (double quote)
                    if (i + 1 < line.length && line[i + 1] === '"') {
                        field += '"';
                        i++; // Skip the next quote
                    } else {
                        // End of a quoted field
                        inQuote = false;
                    }
                } else {
                    // Start of a quoted field
                    inQuote = true;
                }
            } else if (char === ',' && !inQuote) {
                // End of a field
                fields.push(field); // Don't trim here yet
                field = '';
            } else {
                field += char;
            }
        }
        fields.push(field); // Push the last field

        // Post-process fields to trim and remove outer quotes
        const processedFields = fields.map(f => {
            let trimmedField = f.trim();
            if (trimmedField.startsWith('"') && trimmedField.endsWith('"')) {
                trimmedField = trimmedField.substring(1, trimmedField.length - 1);
            }
            return trimmedField;
        });
        records.push(processedFields);
    }
    return records;
}

function importPersonnelComm() {
    try {
        // Drop table if it exists to ensure a clean import
        db.exec(`DROP TABLE IF EXISTS personnel_comm;`);
        console.log('Table personnel_comm dropped if it existed.');

        const createTableSql = `
            CREATE TABLE IF NOT EXISTS personnel_comm (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                department TEXT,
                title TEXT,
                name TEXT,
                feedback_date TEXT,
                feedback_text TEXT
            );
        `;
        db.exec(createTableSql);
        console.log('Table personnel_comm ensured to exist.');

        const csvContent = fs.readFileSync(csvPath, 'utf8');
        const parsedData = parseCsv(csvContent);

        const stmt = db.prepare $(
            INSERT INTO personnel_comm (department, title, name, feedback_date, feedback_text)
            VALUES (?, ?, ?, ?, ?)
        ");

        const insertMany = db.transaction((rows) => {
            for (const row of rows) {
                // Ensure we have enough fields
                if (row.length >= 5) {
                    stmt.run(
                        row[0],
                        row[1],
                        row[2],
                        row[3],
                        row[4]
                    );
                } else {
                    console.warn('Skipping malformed row:', row);
                }
            }
        });

        insertMany(parsedData);
        console.log(`Successfully imported ${parsedData.length} records into personnel_comm.`);

    } catch (error) {
        console.error('Error importing personnel_comm:', error.message);
    } finally {
        db.close();
    }
}

importPersonnelComm();