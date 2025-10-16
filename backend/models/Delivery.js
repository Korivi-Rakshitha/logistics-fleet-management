const db = require('../utils/db');

class Delivery {
  static async create(deliveryData) {
    const {
      customer_id, driver_id, vehicle_id, route_id,
      pickup_location, pickup_lat, pickup_lng,
      drop_location, drop_lat, drop_lng,
      scheduled_pickup_time, scheduled_delivery_time,
      package_details, priority, requested_vehicle_type
    } = deliveryData;

    const [result] = await db.query(
      `INSERT INTO deliveries (
        customer_id, driver_id, vehicle_id, route_id,
        pickup_location, pickup_lat, pickup_lng,
        drop_location, drop_lat, drop_lng,
        scheduled_pickup_time, scheduled_delivery_time,
        package_details, priority, requested_vehicle_type, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customer_id, driver_id, vehicle_id, route_id,
        pickup_location, pickup_lat, pickup_lng,
        drop_location, drop_lat, drop_lng,
        scheduled_pickup_time, scheduled_delivery_time,
        package_details, priority || 'medium',
        requested_vehicle_type,
        driver_id ? 'assigned' : 'pending'
      ]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.query(`
      SELECT 
        d.*,
        c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
        dr.name as driver_name, dr.email as driver_email, dr.phone as driver_phone,
        v.vehicle_number, v.vehicle_type,
        r.name as route_name
      FROM deliveries d
      LEFT JOIN users c ON d.customer_id = c.id
      LEFT JOIN users dr ON d.driver_id = dr.id
      LEFT JOIN vehicles v ON d.vehicle_id = v.id
      LEFT JOIN routes r ON d.route_id = r.id
      WHERE d.id = ?
    `, [id]);
    return rows[0];
  }

  static async getAll(filters = {}) {
    let query = `
      SELECT 
        d.*,
        c.name as customer_name,
        dr.name as driver_name,
        v.vehicle_number
      FROM deliveries d
      LEFT JOIN users c ON d.customer_id = c.id
      LEFT JOIN users dr ON d.driver_id = dr.id
      LEFT JOIN vehicles v ON d.vehicle_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ' AND d.status = ?';
      params.push(filters.status);
    }

    if (filters.customer_id) {
      query += ' AND d.customer_id = ?';
      params.push(filters.customer_id);
    }

    if (filters.driver_id) {
      query += ' AND d.driver_id = ?';
      params.push(filters.driver_id);
    }

    if (filters.priority) {
      query += ' AND d.priority = ?';
      params.push(filters.priority);
    }

    query += ' ORDER BY d.created_at DESC';

    const [rows] = await db.query(query, params);
    return rows;
  }

  static async getByCustomer(customerId) {
    const [rows] = await db.query(`
      SELECT 
        d.*,
        dr.name as driver_name, dr.phone as driver_phone,
        v.vehicle_number, v.vehicle_type
      FROM deliveries d
      LEFT JOIN users dr ON d.driver_id = dr.id
      LEFT JOIN vehicles v ON d.vehicle_id = v.id
      WHERE d.customer_id = ?
      ORDER BY d.created_at DESC
    `, [customerId]);
    return rows;
  }

  static async getByDriver(driverId) {
    const [rows] = await db.query(`
      SELECT 
        d.*,
        c.name as customer_name, c.phone as customer_phone,
        v.vehicle_number, v.vehicle_type
      FROM deliveries d
      LEFT JOIN users c ON d.customer_id = c.id
      LEFT JOIN vehicles v ON d.vehicle_id = v.id
      WHERE d.driver_id = ?
      ORDER BY d.scheduled_pickup_time ASC
    `, [driverId]);
    return rows;
  }

  static async updateStatus(id, status, additionalData = {}) {
    const fields = ['status = ?'];
    const values = [status];

    // Auto-set timestamps based on status (SQLite compatible)
    if (status === 'picked_up' && !additionalData.actual_pickup_time) {
      fields.push('actual_pickup_time = CURRENT_TIMESTAMP');
    }
    if (status === 'delivered' && !additionalData.actual_delivery_time) {
      fields.push('actual_delivery_time = CURRENT_TIMESTAMP');
    }

    Object.keys(additionalData).forEach(key => {
      if (additionalData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(additionalData[key]);
      }
    });

    values.push(id);
    const [result] = await db.query(
      `UPDATE deliveries SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async assignDriver(id, driverId, vehicleId) {
    const [result] = await db.query(
      'UPDATE deliveries SET driver_id = ?, vehicle_id = ?, status = ? WHERE id = ?',
      [driverId, vehicleId, 'assigned', id]
    );
    return result.affectedRows > 0;
  }

  static async update(id, deliveryData) {
    const fields = [];
    const values = [];

    Object.keys(deliveryData).forEach(key => {
      if (deliveryData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(deliveryData[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await db.query(
      `UPDATE deliveries SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM deliveries WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async checkConflicts(driverId, vehicleId, startTime, endTime, excludeDeliveryId = null) {
    // If no times provided, no conflict check needed
    if (!startTime || !endTime) {
      return [];
    }

    let query = `
      SELECT id, pickup_location, drop_location, scheduled_pickup_time, scheduled_delivery_time
      FROM deliveries
      WHERE status IN ('assigned', 'on_route', 'picked_up')
      AND (driver_id = ? OR vehicle_id = ?)
      AND scheduled_pickup_time IS NOT NULL
      AND scheduled_delivery_time IS NOT NULL
      AND (
        (scheduled_pickup_time <= ? AND scheduled_delivery_time >= ?)
        OR (scheduled_pickup_time <= ? AND scheduled_delivery_time >= ?)
        OR (scheduled_pickup_time >= ? AND scheduled_delivery_time <= ?)
      )
    `;
    const params = [driverId, vehicleId, endTime, startTime, endTime, endTime, startTime, endTime];

    if (excludeDeliveryId) {
      query += ' AND id != ?';
      params.push(excludeDeliveryId);
    }

    const [rows] = await db.query(query, params);
    return rows;
  }

  static async getActiveDeliveries() {
    const [rows] = await db.query(`
      SELECT 
        d.*,
        c.name as customer_name, c.phone as customer_phone,
        dr.name as driver_name, dr.phone as driver_phone,
        v.vehicle_number, v.vehicle_type, v.current_location_lat, v.current_location_lng
      FROM deliveries d
      LEFT JOIN users c ON d.customer_id = c.id
      LEFT JOIN users dr ON d.driver_id = dr.id
      LEFT JOIN vehicles v ON d.vehicle_id = v.id
      WHERE d.status IN ('assigned', 'on_route', 'picked_up')
      ORDER BY d.scheduled_pickup_time ASC
    `);
    return rows;
  }

  static async getDeliveryStats(driverId = null) {
    let query = `
      SELECT 
        COUNT(*) as total_deliveries,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status IN ('assigned', 'on_route', 'picked_up') THEN 1 ELSE 0 END) as active,
        AVG(CASE 
          WHEN status = 'delivered' AND actual_pickup_time IS NOT NULL AND actual_delivery_time IS NOT NULL
          THEN (julianday(actual_delivery_time) - julianday(actual_pickup_time)) * 24 * 60
          ELSE NULL
        END) as avg_delivery_time_minutes
      FROM deliveries
    `;
    const params = [];

    if (driverId) {
      query += ' WHERE driver_id = ?';
      params.push(driverId);
    }

    const [rows] = await db.query(query, params);
    return rows[0];
  }
}

module.exports = Delivery;
