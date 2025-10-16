const db = require('../utils/db');

class User {
  static async create(userData) {
    const { name, email, password, role, phone, address, pan_card, aadhaar_card, driving_license, verification_status } = userData;
    const [result] = await db.query(
      `INSERT INTO users (name, email, password, role, phone, address, pan_card, aadhaar_card, driving_license, verification_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, password, role, phone, address, pan_card, aadhaar_card, driving_license, verification_status || 'approved']
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT id, name, email, role, phone, address, verification_status, pan_card, aadhaar_card, driving_license, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByRole(role) {
    const [rows] = await db.query('SELECT id, name, email, role, phone, address, verification_status, pan_card, aadhaar_card, driving_license FROM users WHERE role = ?', [role]);
    return rows;
  }

  static async getAll() {
    const [rows] = await db.query('SELECT id, name, email, role, phone, address, verification_status, pan_card, aadhaar_card, driving_license, created_at FROM users');
    return rows;
  }
  
  static async getPendingDrivers() {
    const [rows] = await db.query(
      `SELECT id, name, email, phone, address, pan_card, aadhaar_card, driving_license, created_at 
       FROM users 
       WHERE role = 'driver' AND verification_status = 'pending'
       ORDER BY created_at DESC`
    );
    return rows;
  }
  
  static async verifyDriver(id, status, rejection_reason = null) {
    const verified_at = status === 'approved' ? new Date().toISOString() : null;
    const [result] = await db.query(
      'UPDATE users SET verification_status = ?, rejection_reason = ?, verified_at = ? WHERE id = ? AND role = \'driver\'',
      [status, rejection_reason, verified_at, id]
    );
    return result.affectedRows > 0;
  }

  static async update(id, userData) {
    const fields = [];
    const values = [];

    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(userData[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getDriversAvailableForTimeSlot(startTime, endTime) {
    const [rows] = await db.query(`
      SELECT u.id, u.name, u.email, u.phone
      FROM users u
      WHERE u.role = 'driver'
      AND u.id NOT IN (
        SELECT DISTINCT driver_id
        FROM deliveries
        WHERE driver_id IS NOT NULL
        AND status IN ('assigned', 'on_route', 'picked_up')
        AND (
          (scheduled_pickup_time <= ? AND scheduled_delivery_time >= ?)
          OR (scheduled_pickup_time <= ? AND scheduled_delivery_time >= ?)
          OR (scheduled_pickup_time >= ? AND scheduled_delivery_time <= ?)
        )
      )
    `, [endTime, startTime, endTime, endTime, startTime, endTime]);
    return rows;
  }
}

module.exports = User;
