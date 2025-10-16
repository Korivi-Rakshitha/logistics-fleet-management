const db = require('../utils/db');

class Tracking {
  static async create(trackingData) {
    const { delivery_id, driver_id, vehicle_id, current_lat, current_lng, speed, heading } = trackingData;
    const [result] = await db.query(
      `INSERT INTO tracking (delivery_id, driver_id, vehicle_id, current_lat, current_lng, speed, heading)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [delivery_id, driver_id, vehicle_id, current_lat, current_lng, speed, heading]
    );
    return result.insertId;
  }

  static async getLatestByDelivery(deliveryId) {
    const [rows] = await db.query(`
      SELECT t.*, u.name as driver_name, v.vehicle_number
      FROM tracking t
      LEFT JOIN users u ON t.driver_id = u.id
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      WHERE t.delivery_id = ?
      ORDER BY t.timestamp DESC
      LIMIT 1
    `, [deliveryId]);
    return rows[0];
  }

  static async getTrackingHistory(deliveryId, limit = 50) {
    const [rows] = await db.query(`
      SELECT * FROM tracking
      WHERE delivery_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `, [deliveryId, limit]);
    return rows;
  }

  static async getRecentTracking(minutes = 5) {
    const [rows] = await db.query(`
      SELECT t.*, d.pickup_location, d.drop_location, d.status as delivery_status
      FROM tracking t
      LEFT JOIN deliveries d ON t.delivery_id = d.id
      WHERE t.timestamp >= datetime('now', '-' || ? || ' minutes')
      ORDER BY t.timestamp DESC
    `, [minutes]);
    return rows;
  }

  static async deleteOldTracking(days = 30) {
    const [result] = await db.query(
      "DELETE FROM tracking WHERE timestamp < datetime('now', '-' || ? || ' days')",
      [days]
    );
    return result.affectedRows;
  }
}

module.exports = Tracking;
