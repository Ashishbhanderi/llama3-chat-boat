const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, 'data', 'chat.db');
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS threads (
        id TEXT PRIMARY KEY,
        username TEXT,
        name TEXT NOT NULL,
        room_id TEXT DEFAULT 'general',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (username) REFERENCES users(username)
      )`,
      
      `CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        thread_id TEXT,
        username TEXT,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'user',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (thread_id) REFERENCES threads(id)
      )`,
      
      `CREATE INDEX IF NOT EXISTS idx_threads_username ON threads(username)`,
      `CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id)`,
      `CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)`
    ];

    for (const query of queries) {
      await this.run(query);
    }
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // User methods
  async createUser(username) {
    await this.run('INSERT OR IGNORE INTO users (username) VALUES (?)', [username]);
  }

  // Thread methods
  async createThread(threadId, username, name, roomId = 'general') {
    await this.createUser(username);
    await this.run(
      'INSERT INTO threads (id, username, name, room_id) VALUES (?, ?, ?, ?)',
      [threadId, username, name, roomId]
    );
  }

  async getUserThreads(username) {
    const rows = await this.all(
      'SELECT * FROM threads WHERE username = ? ORDER BY last_activity DESC',
      [username]
    );
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      createdAt: new Date(row.created_at),
      lastActivity: new Date(row.last_activity)
    }));
  }

  async updateThreadName(threadId, newName) {
    await this.run(
      'UPDATE threads SET name = ?, last_activity = CURRENT_TIMESTAMP WHERE id = ?',
      [newName, threadId]
    );
  }

  async deleteThread(threadId) {
    await this.run('DELETE FROM messages WHERE thread_id = ?', [threadId]);
    await this.run('DELETE FROM threads WHERE id = ?', [threadId]);
  }

  // Message methods
  async addMessage(messageId, threadId, username, message, type = 'user') {
    await this.run(
      'INSERT INTO messages (id, thread_id, username, message, type) VALUES (?, ?, ?, ?, ?)',
      [messageId, threadId, username, message, type]
    );
    
    // Update thread last activity
    await this.run(
      'UPDATE threads SET last_activity = CURRENT_TIMESTAMP WHERE id = ?',
      [threadId]
    );
  }

  async getThreadMessages(threadId, limit = 50) {
    const rows = await this.all(
      'SELECT * FROM messages WHERE thread_id = ? ORDER BY timestamp ASC LIMIT ?',
      [threadId, limit]
    );
    return rows.map(row => ({
      id: row.id,
      username: row.username,
      message: row.message,
      type: row.type,
      timestamp: new Date(row.timestamp)
    }));
  }

  async close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = Database;