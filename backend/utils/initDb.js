const mysql = require('mysql2/promise');
require('dotenv').config();

const initDatabase = async () => {
  try {
    // Connect without database first
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Database ${process.env.DB_NAME} created or already exists`);

    await connection.query(`USE ${process.env.DB_NAME}`);

    // Create Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'driver', 'customer') NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created');

    // Create Vehicles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_number VARCHAR(50) UNIQUE NOT NULL,
        vehicle_type VARCHAR(100) NOT NULL,
        capacity DECIMAL(10, 2),
        status ENUM('available', 'in_use', 'maintenance') DEFAULT 'available',
        current_location_lat DECIMAL(10, 8),
        current_location_lng DECIMAL(11, 8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Vehicles table created');

    // Create Routes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS routes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        start_location VARCHAR(255) NOT NULL,
        end_location VARCHAR(255) NOT NULL,
        start_lat DECIMAL(10, 8),
        start_lng DECIMAL(11, 8),
        end_lat DECIMAL(10, 8),
        end_lng DECIMAL(11, 8),
        distance DECIMAL(10, 2),
        estimated_duration INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Routes table created');

    // Create Deliveries table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS deliveries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        driver_id INT,
        vehicle_id INT,
        route_id INT,
        pickup_location VARCHAR(255) NOT NULL,
        pickup_lat DECIMAL(10, 8) NOT NULL,
        pickup_lng DECIMAL(11, 8) NOT NULL,
        drop_location VARCHAR(255) NOT NULL,
        drop_lat DECIMAL(10, 8) NOT NULL,
        drop_lng DECIMAL(11, 8) NOT NULL,
        status ENUM('pending', 'assigned', 'on_route', 'picked_up', 'delivered', 'cancelled') DEFAULT 'pending',
        scheduled_pickup_time DATETIME,
        scheduled_delivery_time DATETIME,
        actual_pickup_time DATETIME,
        actual_delivery_time DATETIME,
        package_details TEXT,
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
        FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL
      )
    `);
    console.log('Deliveries table created');

    // Create Tracking table for real-time location updates
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tracking (
        id INT AUTO_INCREMENT PRIMARY KEY,
        delivery_id INT NOT NULL,
        driver_id INT NOT NULL,
        vehicle_id INT NOT NULL,
        current_lat DECIMAL(10, 8) NOT NULL,
        current_lng DECIMAL(11, 8) NOT NULL,
        speed DECIMAL(5, 2),
        heading DECIMAL(5, 2),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
        FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
        INDEX idx_delivery_timestamp (delivery_id, timestamp)
      )
    `);
    console.log('Tracking table created');

    // Create Delivery History table for analytics
    await connection.query(`
      CREATE TABLE IF NOT EXISTS delivery_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        delivery_id INT NOT NULL,
        driver_id INT NOT NULL,
        vehicle_id INT NOT NULL,
        total_distance DECIMAL(10, 2),
        total_duration INT,
        average_speed DECIMAL(5, 2),
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
        FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
      )
    `);
    console.log('Delivery History table created');

    // Create default admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await connection.query(`
      INSERT IGNORE INTO users (name, email, password, role, phone)
      VALUES ('Admin User', 'admin@logistics.com', ?, 'admin', '1234567890')
    `, [hashedPassword]);
    console.log('Default admin user created (email: admin@logistics.com, password: admin123)');

    await connection.end();
    console.log('\n✅ Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initDatabase();
