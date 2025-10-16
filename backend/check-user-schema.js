const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'logistics_fleet.db');
const db = new Database(dbPath);

console.log('📊 Checking users table schema...\n');

try {
  const tableInfo = db.prepare('PRAGMA table_info(users)').all();
  
  console.log('Current columns in users table:');
  console.log('='.repeat(50));
  
  tableInfo.forEach(col => {
    console.log(`✓ ${col.name.padEnd(25)} (${col.type})`);
  });
  
  console.log('\n' + '='.repeat(50));
  
  // Check for required columns
  const requiredColumns = ['pan_card', 'aadhaar_card', 'driving_license', 'verification_status'];
  const existingColumns = tableInfo.map(col => col.name);
  
  console.log('\nRequired columns for driver verification:');
  requiredColumns.forEach(col => {
    if (existingColumns.includes(col)) {
      console.log(`✅ ${col} - EXISTS`);
    } else {
      console.log(`❌ ${col} - MISSING`);
    }
  });
  
  const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
  
  if (missingColumns.length > 0) {
    console.log('\n⚠️  Missing columns detected!');
    console.log('Run: node utils/updateDb-driver-verification.js');
  } else {
    console.log('\n✅ All required columns exist!');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
}

db.close();
