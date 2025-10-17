const db = require('../utils/database');

class Rating {
  // Create a new rating
  static async create(ratingData) {
    const { delivery_id, customer_id, driver_id, rating, feedback } = ratingData;

    const stmt = db.prepare(`
      INSERT INTO ratings (delivery_id, customer_id, driver_id, rating, feedback)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(delivery_id, customer_id, driver_id, rating, feedback);
    return result.lastInsertRowid;
  }

  // Get rating by ID
  static async findById(id) {
    const stmt = db.prepare(`
      SELECT r.*, u.name as customer_name, d.name as driver_name
      FROM ratings r
      JOIN users u ON r.customer_id = u.id
      JOIN users d ON r.driver_id = d.id
      WHERE r.id = ?
    `);
    return stmt.get(id);
  }

  // Get rating by delivery ID
  static async findByDeliveryId(deliveryId) {
    const stmt = db.prepare(`
      SELECT r.*, u.name as customer_name, d.name as driver_name
      FROM ratings r
      JOIN users u ON r.customer_id = u.id
      JOIN users d ON r.driver_id = d.id
      WHERE r.delivery_id = ?
    `);
    return stmt.get(deliveryId);
  }

  // Get all ratings for a driver
  static async findByDriverId(driverId) {
    const stmt = db.prepare(`
      SELECT r.*, u.name as customer_name, d.name as driver_name
      FROM ratings r
      JOIN users u ON r.customer_id = u.id
      JOIN users d ON r.driver_id = d.id
      WHERE r.driver_id = ?
      ORDER BY r.created_at DESC
    `);
    return stmt.all(driverId);
  }

  // Get all ratings for a customer
  static async findByCustomerId(customerId) {
    const stmt = db.prepare(`
      SELECT r.*, u.name as customer_name, d.name as driver_name
      FROM ratings r
      JOIN users u ON r.customer_id = u.id
      JOIN users d ON r.driver_id = d.id
      WHERE r.customer_id = ?
      ORDER BY r.created_at DESC
    `);
    return stmt.all(customerId);
  }

  // Get average rating for a driver
  static async getDriverAverageRating(driverId) {
    const stmt = db.prepare(`
      SELECT
        COUNT(*) as total_ratings,
        AVG(rating) as average_rating,
        SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) as positive_ratings
      FROM ratings
      WHERE driver_id = ?
    `);
    return stmt.get(driverId);
  }

  // Get all ratings with pagination
  static async findAll(limit = 10, offset = 0) {
    const stmt = db.prepare(`
      SELECT r.*, u.name as customer_name, d.name as driver_name
      FROM ratings r
      JOIN users u ON r.customer_id = u.id
      JOIN users d ON r.driver_id = d.id
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(limit, offset);
  }

  // Update rating
  static async update(id, ratingData) {
    const { rating, feedback } = ratingData;

    const stmt = db.prepare(`
      UPDATE ratings
      SET rating = ?, feedback = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(rating, feedback, id);
    return result.changes > 0;
  }

  // Delete rating
  static async delete(id) {
    const stmt = db.prepare('DELETE FROM ratings WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Check if customer has already rated this delivery
  static async hasCustomerRatedDelivery(customerId, deliveryId) {
    const stmt = db.prepare(`
      SELECT id FROM ratings
      WHERE customer_id = ? AND delivery_id = ?
    `);
    const result = stmt.get(customerId, deliveryId);
    return !!result;
  }
}

module.exports = Rating;
