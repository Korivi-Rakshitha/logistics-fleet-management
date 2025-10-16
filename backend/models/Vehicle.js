const db = require('../utils/db');

class Vehicle {
  static async create(vehicleData) {
    const { vehicle_number, vehicle_type, capacity, status } = vehicleData;
    const [result] = await db.query(
      'INSERT INTO vehicles (vehicle_number, vehicle_type, capacity, status) VALUES (?, ?, ?, ?)',
      [vehicle_number, vehicle_type, capacity, status || 'available']
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByNumber(vehicle_number) {
    const [rows] = await db.query('SELECT * FROM vehicles WHERE vehicle_number = ?', [vehicle_number]);
    return rows[0];
  }

  static async getAll() {
    const [rows] = await db.query('SELECT * FROM vehicles ORDER BY created_at DESC');
    return rows;
  }

  static async getByStatus(status) {
    const [rows] = await db.query('SELECT * FROM vehicles WHERE status = ?', [status]);
    return rows;
  }

  static async update(id, vehicleData) {
    const fields = [];
    const values = [];

    Object.keys(vehicleData).forEach(key => {
      if (vehicleData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(vehicleData[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await db.query(
      `UPDATE vehicles SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async updateLocation(id, lat, lng) {
    const [result] = await db.query(
      'UPDATE vehicles SET current_location_lat = ?, current_location_lng = ? WHERE id = ?',
      [lat, lng, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM vehicles WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getAvailableForTimeSlot(startTime, endTime) {
    const [rows] = await db.query(`
      SELECT v.*
      FROM vehicles v
      WHERE v.status = 'available'
      AND v.id NOT IN (
        SELECT DISTINCT vehicle_id
        FROM deliveries
        WHERE vehicle_id IS NOT NULL
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

  static async getUtilizationStats() {
    const [rows] = await db.query(`
      SELECT 
        v.id,
        v.vehicle_number,
        v.vehicle_type,
        COUNT(dh.id) as total_deliveries,
        COALESCE(SUM(dh.total_distance), 0) as total_distance,
        COALESCE(AVG(dh.total_duration), 0) as avg_duration,
        COALESCE(AVG(dh.average_speed), 0) as avg_speed
      FROM vehicles v
      LEFT JOIN delivery_history dh ON v.id = dh.vehicle_id
      GROUP BY v.id, v.vehicle_number, v.vehicle_type
      ORDER BY total_deliveries DESC
    `);
    return rows;
  }
}

module.exports = Vehicle;
