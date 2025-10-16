const bcrypt = require('bcryptjs');
const db = require('./db');

const createTestData = async () => {
  try {
    console.log('🚀 Creating test data...\n');

    // 1. Create Driver User
    console.log('👤 Creating driver user...');
    const driverPassword = await bcrypt.hash('driver123', 10);
    const insertDriver = db.raw.prepare(`
      INSERT OR IGNORE INTO users (name, email, password, role, phone, address)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertDriver.run('John Driver', 'driver@test.com', driverPassword, 'driver', '9876543210', '123 Main Street, Chennai');
    
    const getDriver = db.raw.prepare('SELECT id FROM users WHERE email = ?');
    const driver = getDriver.get('driver@test.com');
    console.log(`✅ Driver created: ID ${driver.id}`);

    // 2. Create Customer User
    console.log('\n👤 Creating customer user...');
    const customerPassword = await bcrypt.hash('customer123', 10);
    const insertCustomer = db.raw.prepare(`
      INSERT OR IGNORE INTO users (name, email, password, role, phone, address)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertCustomer.run('Jane Customer', 'customer@test.com', customerPassword, 'customer', '9876543211', '456 Oak Avenue, Chennai');
    
    const getCustomer = db.raw.prepare('SELECT id FROM users WHERE email = ?');
    const customer = getCustomer.get('customer@test.com');
    console.log(`✅ Customer created: ID ${customer.id}`);

    // 3. Create Vehicles
    console.log('\n🚗 Creating vehicles...');
    const vehicles = [
      { number: 'TN-01-AB-1234', type: 'Truck', capacity: 1000 },
      { number: 'TN-02-CD-5678', type: 'Van', capacity: 500 },
      { number: 'TN-03-EF-9012', type: 'Bike', capacity: 50 }
    ];

    const insertVehicle = db.raw.prepare(`
      INSERT OR IGNORE INTO vehicles (vehicle_number, vehicle_type, capacity, status)
      VALUES (?, ?, ?, 'available')
    `);

    const vehicleIds = [];
    for (const vehicle of vehicles) {
      insertVehicle.run(vehicle.number, vehicle.type, vehicle.capacity);
      const getVehicle = db.raw.prepare('SELECT id FROM vehicles WHERE vehicle_number = ?');
      const v = getVehicle.get(vehicle.number);
      vehicleIds.push(v.id);
      console.log(`✅ Vehicle created: ${vehicle.number} (ID ${v.id})`);
    }

    // 4. Create Deliveries
    console.log('\n📦 Creating deliveries...');
    const deliveries = [
      {
        pickup: 'Chennai Central Station',
        pickup_lat: 13.0827,
        pickup_lng: 80.2707,
        drop: 'Anna Nagar, Chennai',
        drop_lat: 13.0850,
        drop_lng: 80.2101,
        package: 'Electronics - Laptop and accessories',
        priority: 'high'
      },
      {
        pickup: 'T Nagar, Chennai',
        pickup_lat: 13.0418,
        pickup_lng: 80.2341,
        drop: 'Velachery, Chennai',
        drop_lat: 12.9750,
        drop_lng: 80.2212,
        package: 'Documents - Important files',
        priority: 'medium'
      },
      {
        pickup: 'Egmore, Chennai',
        pickup_lat: 13.0732,
        pickup_lng: 80.2609,
        drop: 'Adyar, Chennai',
        drop_lat: 13.0067,
        drop_lng: 80.2206,
        package: 'Food items - Groceries',
        priority: 'low'
      }
    ];

    const insertDelivery = db.raw.prepare(`
      INSERT INTO deliveries (
        customer_id, driver_id, vehicle_id,
        pickup_location, pickup_lat, pickup_lng,
        drop_location, drop_lat, drop_lng,
        package_details, priority, status,
        scheduled_pickup_time, scheduled_delivery_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'assigned', datetime('now', '+1 hour'), datetime('now', '+3 hours'))
    `);

    for (let i = 0; i < deliveries.length; i++) {
      const d = deliveries[i];
      const result = insertDelivery.run(
        customer.id,
        driver.id,
        vehicleIds[i],
        d.pickup, d.pickup_lat, d.pickup_lng,
        d.drop, d.drop_lat, d.drop_lng,
        d.package, d.priority
      );
      console.log(`✅ Delivery created: ${d.pickup} → ${d.drop} (ID ${result.lastInsertRowid})`);
    }

    // Update vehicle status
    console.log('\n🔄 Updating vehicle status...');
    const updateVehicle = db.raw.prepare(`UPDATE vehicles SET status = 'in_use' WHERE id = ?`);
    for (const vid of vehicleIds) {
      updateVehicle.run(vid);
    }
    console.log('✅ Vehicles marked as in_use');

    console.log('\n🎉 Test data created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('📋 ACCOUNT CREDENTIALS:');
    console.log('═══════════════════════════════════════');
    console.log('\n👨‍💼 Admin:');
    console.log('   Email: admin@logistics.com');
    console.log('   Password: admin123');
    console.log('\n🚗 Driver:');
    console.log('   Email: driver@test.com');
    console.log('   Password: driver123');
    console.log('\n👤 Customer:');
    console.log('   Email: customer@test.com');
    console.log('   Password: customer123');
    console.log('\n═══════════════════════════════════════');
    console.log('📊 DATA CREATED:');
    console.log('═══════════════════════════════════════');
    console.log(`✅ ${vehicles.length} Vehicles`);
    console.log(`✅ ${deliveries.length} Deliveries (assigned to driver)`);
    console.log('\n🎯 NEXT STEPS:');
    console.log('═══════════════════════════════════════');
    console.log('1. Login as Driver: http://localhost:3000/login');
    console.log('2. You will see 3 assigned deliveries');
    console.log('3. Click "Start Delivery" to begin tracking');
    console.log('4. Allow location access when prompted');
    console.log('5. Update status: On Route → Picked Up → Delivered');
    console.log('\n✨ Ready to test the Driver Dashboard!\n');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
    process.exit(1);
  }
};

createTestData();
