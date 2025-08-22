const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../era.db');
const imagesDir = path.resolve(__dirname, '../public/era_Images');
const db = new Database(dbPath);

try {
    const imageFiles = fs.readdirSync(imagesDir).filter(file => file.endsWith('.jpg') || file.endsWith('.png'));
    console.log('Found image files:', imageFiles);

    const updateStmt = db.prepare('UPDATE era_data SET photo = ? WHERE wname = ?');
    const selectAllStmt = db.prepare('SELECT id, wname FROM era_data');
    const allPersonnel = selectAllStmt.all();

    let updatedCount = 0;

    db.transaction(() => {
        for (const person of allPersonnel) {
            const personName = person.wname;
            if (!personName) continue;

            // Normalize personName and fileName for matching
            const normalizedPersonName = personName.toLowerCase().replace(/[^a-z0-9]/g, '');
            const matchingImage = imageFiles.find(file => {
                const fileNameWithoutExt = path.parse(file).name;
                const normalizedFileName = fileNameWithoutExt.toLowerCase().replace(/[^a-z0-9]/g, '');
                return normalizedFileName === normalizedPersonName;
            });

            if (matchingImage) {
                const photoPath = `/era_Images/${matchingImage}`;
                updateStmt.run(photoPath, personName);
                updatedCount++;
            }
        }
    })();

    console.log(`Successfully updated ${updatedCount} records with photo paths.`);

} catch (error) {
    console.error('Error populating photo paths:', error);
} finally {
    db.close();
    console.log('Database connection closed.');
}