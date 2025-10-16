const bcrypt = require('bcryptjs');
const db = require('./utils/db');

async function createAdmin() {
  try {
    const adminData = {
      name: 'Admin User',
      email: 'admin@logistics.com',
      password: 'admin123',
      role: 'admin',
      phone: '9999999999',
      address: 'Admin Office'
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Check if admin already exists
    const [existing] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [adminData.email]
    );

    if (existing.length > 0) {
      console.log('❌ Admin user already exists with email:', adminData.email);
      console.log('✅ You can login with:');
      console.log('   Email:', adminData.email);
      console.log('   Password: admin123');
      process.exit(0);
    }

    // Insert admin user
    const [result] = await db.query(
      `INSERT INTO users (name, email, password, role, phone, address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [adminData.name, adminData.email, hashedPassword, adminData.role, adminData.phone, adminData.address]
    );

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📧 Login Credentials:');
    console.log('   Email:', adminData.email);
    console.log('   Password:', adminData.password);
    console.log('');
    console.log('🚀 You can now login at: http://localhost:3000/login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();
