const fs = require('fs');
const Database = require('better-sqlite3');

const csvFilePath = '/Users/zube/Downloads/era-wayfinding-admin/feedback.csv';
const dbFilePath = '/Users/zube/Downloads/era-wayfinding-admin/era.db';

try {
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    const lines = csvContent.split('\r\n').filter(line => line.trim() !== '');

    if (lines.length === 0) {
        console.log('CSV file is empty or could not be read.');
        process.exit(0);
    }

    // Assuming the first line is the header
    const headers = lines[0].split(',').map(header => header.trim());
    const dataLines = lines.slice(1);

    const db = new Database(dbFilePath);

    // Check if personnel_comm table exists and has the required columns
    const tableInfo = db.prepare("PRAGMA table_info(personnel_comm)").all();
    const columnNames = tableInfo.map(col => col.name);

    const requiredColumns = ['department', 'title', 'name', 'feedback_date', 'feedback_text'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));

    if (missingColumns.length > 0) {
        console.error(`Error: Missing columns in personnel_comm table: ${missingColumns.join(', ')}. Please ensure the table has these columns.`);
        db.close();
        process.exit(1);
    }

    const insertStmt = db.prepare(`INSERT INTO personnel_comm (department, title, name, feedback_date, feedback_text) VALUES (?, ?, ?, ?, ?)`);

    db.transaction(() => {
        dataLines.forEach((line, index) => {
            // Robust CSV parsing for fields that might contain commas and are quoted
            const parts = [];
            let inQuote = false;
            let currentPart = '';
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuote = !inQuote;
                    // If it's an escaped quote, add it to currentPart
                    if (inQuote && line[i + 1] === '"') {
                        currentPart += '"';
                        i++; // Skip the next quote
                    }
                } else if (char === ',' && !inQuote) {
                    parts.push(currentPart.trim());
                    currentPart = '';
                } else {
                    currentPart += char;
                }
            }
            parts.push(currentPart.trim()); // Add the last part

            // Find the indices of the desired columns from the header
            const departmentIndex = headers.indexOf('department');
            const titleIndex = headers.indexOf('title');
            const nameIndex = headers.indexOf('name');
            const feedbackDateIndex = headers.indexOf('feedback_date');
            const feedbackTextIndex = headers.indexOf('feedback_text');

            if (departmentIndex === -1 || titleIndex === -1 || nameIndex === -1 || feedbackDateIndex === -1 || feedbackTextIndex === -1) {
                console.warn(`Skipping row ${index + 2} due to missing expected headers in CSV.`);
                return;
            }

            const department = parts[departmentIndex] || '';
            const title = parts[titleIndex] || '';
            const name = parts[nameIndex] || '';
            const feedback_date = parts[feedbackDateIndex] || '';
            const feedback_text = parts[feedbackTextIndex] || '';

            if (department && title && name && feedback_date && feedback_text) {
                insertStmt.run(department, title, name, feedback_date, feedback_text);
            } else {
                console.warn(`Skipping row ${index + 2} due to incomplete data: ${line}`);
            }
        });
    })(); // Immediately invoke the transaction

    console.log('Data imported successfully from feedback.csv to personnel_comm table.');
    db.close();

} catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
}
