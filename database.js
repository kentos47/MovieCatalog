const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'movies.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='movies'", (err, tableExists) => {
    if (err) return console.error(err);
    if (!tableExists) {
      db.run(`
        CREATE TABLE movies (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          year INTEGER,
          year_start INTEGER,
          year_end INTEGER,
          genre TEXT NOT NULL,
          rating INTEGER CHECK(rating BETWEEN 1 AND 10 OR rating IS NULL),
          status TEXT NOT NULL CHECK(status IN ('Просмотрено', 'В планах')),
          watch_date TEXT,
          type TEXT NOT NULL CHECK(type IN ('film', 'serial')) DEFAULT 'film'
        )
      `);
      return;
    }
    // Добавляем недостающие колонки
    db.all("PRAGMA table_info(movies)", (err, columns) => {
      if (err) return console.error(err);
      const columnNames = columns.map(c => c.name);
      if (!columnNames.includes('type')) {
        db.run("ALTER TABLE movies ADD COLUMN type TEXT DEFAULT 'film'");
        db.run("ALTER TABLE movies ADD COLUMN year_start INTEGER");
        db.run("ALTER TABLE movies ADD COLUMN year_end INTEGER");
        db.run("UPDATE movies SET type = 'film' WHERE type IS NULL");
        db.run("UPDATE movies SET year_start = year WHERE type = 'film' AND year_start IS NULL");
      }
    });
  });
});

module.exports = db;
