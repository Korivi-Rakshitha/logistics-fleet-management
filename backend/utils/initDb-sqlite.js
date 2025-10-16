const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const initDatabase = async () => {
  try {
    const dbPath = path.join(__dirname, '..', 'logistics_fleet.db');
    const db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    console.log(`📁 Database file: ${dbPath}`);

    // Create Users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'driver', 'customer')) NOT NULL,
        phone TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create Vehicles table
    db.exec(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_number TEXT UNIQUE NOT NULL,
        vehicle_type TEXT NOT NULL,
        capacity REAL,
        status TEXT CHECK(status IN ('available', 'in_use', 'maintenance')) DEFAULT 'available',
        current_location_lat REAL,
        current_location_lng REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Vehicles table created');

    // Create Routes table
    db.exec(`
      CREATE TABLE IF NOT EXISTS routes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        start_location TEXT NOT NULL,
        end_location TEXT NOT NULL,
        start_lat REAL,
        start_lng REAL,
        end_lat REAL,
        end_lng REAL,
        distance REAL,
        estimated_duration INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Routes table created');

    // Create Deliveries table
    db.exec(`
      CREATE TABLE IF NOT EXISTS deliveries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        driver_id INTEGER,
        vehicle_id INTEGER,
        route_id INTEGER,
        pickup_location TEXT NOT NULL,
        pickup_lat REAL NOT NULL,
        pickup_lng REAL NOT NULL,
        drop_location TEXT NOT NULL,
        drop_lat REAL NOT NULL,
        drop_lng REAL NOT NULL,
        status TEXT CHECK(status IN ('pending', 'assigned', 'on_route', 'picked_up', 'delivered', 'cancelled')) DEFAULT 'pending',
        scheduled_pickup_time DATETIME,
        scheduled_delivery_time DATETIME,
        actual_pickup_time DATETIME,
        actual_delivery_time DATETIME,
        package_details TEXT,
        priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
        FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Deliveries table created');

    // Create Tracking table for real-time location updates
    db.exec(`
      CREATE TABLE IF NOT EXISTS tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        delivery_id INTEGER NOT NULL,
        driver_id INTEGER NOT NULL,
        vehicle_id INTEGER NOT NULL,
        current_lat REAL NOT NULL,
        current_lng REAL NOT NULL,
        speed REAL,
        heading REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
        FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
      )
    `);
    
    // Create index for tracking
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_delivery_timestamp ON tracking(delivery_id, timestamp)
    `);
    console.log('✅ Tracking table created');

    // Create Delivery History table for analytics
    db.exec(`
      CREATE TABLE IF NOT EXISTS delivery_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        delivery_id INTEGER NOT NULL,
        driver_id INTEGER NOT NULL,
        vehicle_id INTEGER NOT NULL,
        total_distance REAL,
        total_duration INTEGER,
        average_speed REAL,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
        FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Delivery History table created');

    // Create trigger for updated_at on users
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
      AFTER UPDATE ON users
      BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);

    // Create trigger for updated_at on vehicles
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_vehicles_timestamp 
      AFTER UPDATE ON vehicles
      BEGIN
        UPDATE vehicles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);

    // Create trigger for updated_at on deliveries
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_deliveries_timestamp 
      AFTER UPDATE ON deliveries
      BEGIN
        UPDATE deliveries SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);

    console.log('✅ Triggers created');

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const insertAdmin = db.prepare(`
      INSERT OR IGNORE INTO users (name, email, password, role, phone)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    insertAdmin.run('Admin User', 'admin@logistics.com', hashedPassword, 'admin', '1234567890');
    console.log('✅ Default admin user created');
    console.log('   📧 Email: admin@logistics.com');
    console.log('   🔑 Password: admin123');

    db.close();
    console.log('\n🎉 Database initialization completed successfully!');
    console.log(`📍 Database location: ${dbPath}`);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
};

initDatabase();
