const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'logistics_fleet.db');
const db = new Database(dbPath);

console.log('🔄 Updating database schema...\n');

try {
  // Add requested_vehicle_type column to deliveries table
  db.exec(`
    ALTER TABLE deliveries ADD COLUMN requested_vehicle_type TEXT;
  `);
  console.log('✅ Added requested_vehicle_type column to deliveries table');
  
  console.log('\n✅ Database schema updated successfully!');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('ℹ️  Column already exists, skipping...');
  } else {
    console.error('❌ Error:', error.message);
  }
}

db.close();
