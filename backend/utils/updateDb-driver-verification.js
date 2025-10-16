const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'logistics_fleet.db');
const db = new Database(dbPath);

console.log('🔄 Updating database schema for driver verification...\n');

try {
  // Add verification fields to users table
  db.exec(`
    ALTER TABLE users ADD COLUMN pan_card TEXT;
  `);
  console.log('✅ Added pan_card column');
  
  db.exec(`
    ALTER TABLE users ADD COLUMN aadhaar_card TEXT;
  `);
  console.log('✅ Added aadhaar_card column');
  
  db.exec(`
    ALTER TABLE users ADD COLUMN driving_license TEXT;
  `);
  console.log('✅ Added driving_license column');
  
  db.exec(`
    ALTER TABLE users ADD COLUMN verification_status TEXT DEFAULT 'pending';
  `);
  console.log('✅ Added verification_status column');
  
  db.exec(`
    ALTER TABLE users ADD COLUMN rejection_reason TEXT;
  `);
  console.log('✅ Added rejection_reason column');
  
  db.exec(`
    ALTER TABLE users ADD COLUMN verified_at DATETIME;
  `);
  console.log('✅ Added verified_at column');
  
  // Update existing non-driver users to 'approved' status
  db.exec(`
    UPDATE users SET verification_status = 'approved' WHERE role != 'driver';
  `);
  console.log('✅ Updated existing non-driver users to approved status');
  
  console.log('\n✅ Database schema updated successfully!');
  console.log('\nVerification Status Options:');
  console.log('  - pending: Driver submitted documents, waiting for admin review');
  console.log('  - approved: Admin approved, driver can access dashboard');
  console.log('  - rejected: Admin rejected, driver needs to resubmit');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('ℹ️  Columns already exist, skipping...');
  } else {
    console.error('❌ Error:', error.message);
  }
}

db.close();
