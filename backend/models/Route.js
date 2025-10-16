const db = require('../utils/db');

class Route {
  static async create(routeData) {
    const {
      name, start_location, end_location,
      start_lat, start_lng, end_lat, end_lng,
      distance, estimated_duration
    } = routeData;

    const [result] = await db.query(
      `INSERT INTO routes (name, start_location, end_location, start_lat, start_lng, end_lat, end_lng, distance, estimated_duration)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, start_location, end_location, start_lat, start_lng, end_lat, end_lng, distance, estimated_duration]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM routes WHERE id = ?', [id]);
    return rows[0];
  }

  static async getAll() {
    const [rows] = await db.query('SELECT * FROM routes ORDER BY created_at DESC');
    return rows;
  }

  static async update(id, routeData) {
    const fields = [];
    const values = [];

    Object.keys(routeData).forEach(key => {
      if (routeData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(routeData[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await db.query(
      `UPDATE routes SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM routes WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Route;
