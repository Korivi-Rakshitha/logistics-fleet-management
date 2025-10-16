const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'logistics_fleet.db');
console.log(`📁 Database path: ${dbPath}\n`);

try {
  const db = new Database(dbPath, { readonly: true });
  
  // Get all tables
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
  `).all();
  
  console.log('📊 TABLES IN DATABASE:');
  console.log('='.repeat(50));
  
  if (tables.length === 0) {
    console.log('❌ No tables found! Database needs to be initialized.');
    console.log('\nRun: npm run init-db');
  } else {
    tables.forEach(table => {
      console.log(`✅ ${table.name}`);
      
      // Count rows in each table
      try {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
        console.log(`   └─ ${count.count} rows`);
      } catch (err) {
        console.log(`   └─ Error counting rows`);
      }
    });
  }
  
  db.close();
  console.log('\n✅ Done!\n');
} catch (error) {
  console.error('❌ Error:', error.message);
}
