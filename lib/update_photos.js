const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../era.db');
const imagesDir = path.resolve(__dirname, '../public/era_Images');

const db = new Database(dbPath, { verbose: console.log });

try {
    // Get all image filenames
    const imageFiles = fs.readdirSync(imagesDir).filter(file => {
        return file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg') || file.endsWith('.gif');
    });

    // Get all personnel from era_data
    const personnel = db.prepare('SELECT id, wname FROM era_data').all();

    const updateStmt = db.prepare('UPDATE era_data SET photo = ? WHERE id = ?');

    db.transaction(() => {
        for (const person of personnel) {
            const fullNameEn = person.wname ? person.wname.toLowerCase() : '';
            const matchingImage = imageFiles.find(fileName => 
                fullNameEn && fileName.toLowerCase().includes(fullNameEn)
            );

            if (matchingImage) {
                const photo = `/era_Images/${matchingImage}`;
                updateStmt.run(photo, person.id);
                console.log(`Updated ${person.wname} with photo: ${photo}`);
            } else {
                console.log(`No matching image found for ${person.wname}`);
            }
        }
    })();

    console.log('Photos updated successfully.');

} catch (error) {
    console.error('Error updating photos:', error);
} finally {
    db.close();
    console.log('Database connection closed.');
}
