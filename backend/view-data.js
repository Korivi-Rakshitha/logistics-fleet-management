const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'logistics_fleet.db');
const db = new Database(dbPath, { readonly: true });

console.log('📊 LOGISTICS FLEET DATABASE VIEWER\n');
console.log('=' .repeat(80));

// View Users
console.log('\n👥 USERS:');
console.log('-'.repeat(80));
const users = db.prepare('SELECT id, name, email, role, phone FROM users').all();
console.table(users);

// View Vehicles
console.log('\n🚗 VEHICLES:');
console.log('-'.repeat(80));
const vehicles = db.prepare('SELECT id, vehicle_number, vehicle_type, capacity, status FROM vehicles').all();
console.table(vehicles);

// View Routes
console.log('\n🛣️ ROUTES:');
console.log('-'.repeat(80));
const routes = db.prepare('SELECT id, name, start_location, end_location, distance, estimated_duration FROM routes').all();
console.table(routes);

// View Deliveries with details
console.log('\n📦 DELIVERIES:');
console.log('-'.repeat(80));
const deliveries = db.prepare(`
  SELECT 
    d.id,
    d.status,
    d.priority,
    u.name as customer,
    d.pickup_location,
    d.drop_location,
    d.scheduled_pickup_time,
    driver.name as driver_name,
    v.vehicle_number
  FROM deliveries d
  LEFT JOIN users u ON d.customer_id = u.id
  LEFT JOIN users driver ON d.driver_id = driver.id
  LEFT JOIN vehicles v ON d.vehicle_id = v.id
  ORDER BY d.created_at DESC
`).all();
console.table(deliveries);

// View Tracking data
console.log('\n📍 RECENT TRACKING DATA:');
console.log('-'.repeat(80));
const tracking = db.prepare(`
  SELECT 
    t.id,
    t.delivery_id,
    u.name as driver,
    t.current_lat,
    t.current_lng,
    t.speed,
    t.timestamp
  FROM tracking t
  LEFT JOIN users u ON t.driver_id = u.id
  ORDER BY t.timestamp DESC
  LIMIT 10
`).all();
console.table(tracking);

// Statistics
console.log('\n📊 STATISTICS:');
console.log('-'.repeat(80));
const stats = {
  'Total Users': db.prepare('SELECT COUNT(*) as count FROM users').get().count,
  'Total Vehicles': db.prepare('SELECT COUNT(*) as count FROM vehicles').get().count,
  'Total Deliveries': db.prepare('SELECT COUNT(*) as count FROM deliveries').get().count,
  'Active Deliveries': db.prepare("SELECT COUNT(*) as count FROM deliveries WHERE status IN ('assigned', 'on_route', 'picked_up')").get().count,
  'Completed Deliveries': db.prepare("SELECT COUNT(*) as count FROM deliveries WHERE status = 'delivered'").get().count,
  'Total Routes': db.prepare('SELECT COUNT(*) as count FROM routes').get().count,
  'Tracking Records': db.prepare('SELECT COUNT(*) as count FROM tracking').get().count
};
console.table(stats);

db.close();
console.log('\n✅ Database closed successfully\n');
