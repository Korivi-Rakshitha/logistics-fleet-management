const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

// Create database file in backend directory
const dbPath = path.join(__dirname, '..', 'logistics_fleet.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log(`✅ SQLite database initialized at: ${dbPath}`);

// Wrapper to make SQLite work like mysql2/promise
const dbWrapper = {
  query: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      try {
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
          const stmt = db.prepare(sql);
          const rows = params.length > 0 ? stmt.all(...params) : stmt.all();
          resolve([rows]);
        } else if (sql.trim().toUpperCase().startsWith('INSERT')) {
          const stmt = db.prepare(sql);
          const result = params.length > 0 ? stmt.run(...params) : stmt.run();
          resolve([{ insertId: result.lastInsertRowid, affectedRows: result.changes }]);
        } else if (sql.trim().toUpperCase().startsWith('UPDATE') || 
                   sql.trim().toUpperCase().startsWith('DELETE')) {
          const stmt = db.prepare(sql);
          const result = params.length > 0 ? stmt.run(...params) : stmt.run();
          resolve([{ affectedRows: result.changes }]);
        } else {
          // For CREATE TABLE, etc.
          db.exec(sql);
          resolve([{ affectedRows: 0 }]);
        }
      } catch (error) {
        reject(error);
      }
    });
  },
  
  execute: function(sql, params = []) {
    return this.query(sql, params);
  },
  
  // For raw database access if needed
  raw: db
};

module.exports = dbWrapper;
