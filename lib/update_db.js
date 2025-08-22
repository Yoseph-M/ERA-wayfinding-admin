const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../era.db');
const db = new Database(dbPath);

try {
  // Add category column to general_comm table
  try {
    db.exec(`
      ALTER TABLE general_comm ADD COLUMN category TEXT;
    `);
    console.log('Column "category" added to table "general_comm".');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('Column "category" already exists in "general_comm".');
    } else {
      console.error('Error adding category column:', error);
    }
  }

  // Update existing rows to have a default category
  try {
    db.exec(`
      UPDATE general_comm SET category = 'general';
    `);
    console.log('Existing rows updated with default category.');
  } catch (error) {
    console.error('Error updating existing rows with default category:', error);
  }


  // Add photo column to era_data table
  try {
    db.exec(`
      ALTER TABLE era_data ADD COLUMN photo TEXT;
    `);
    console.log('Column "photo" added to table "era_data".');
  } catch (error) {
    if (error.message.includes('duplicate column name: photo')) {
      console.log('Column "photo" already exists in "era_data".');
    } else {
      console.error('Error adding photo column:', error);
    }
  }

  // Remove photo column from era_data table
  try {
    db.exec(`
      ALTER TABLE era_data DROP COLUMN photo;
    `);
    console.log('Column "photo" removed from table "era_data".');
  } catch (error) {
    if (error.message.includes('no such column: photo')) {
      console.log('Column "photo" does not exist in "era_data".');
    } else {
      console.error('Error removing photo column:', error);
    }
  }

  // Drop blocks table
  try {
    db.exec(`
      DROP TABLE IF EXISTS blocks;
    `);
    console.log('Table "blocks" dropped.');
  } catch (error) {
    console.error('Error dropping blocks table:', error);
  }

} finally {
  db.close();
  console.log('Database connection closed.');
}
