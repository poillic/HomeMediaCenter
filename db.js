const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'media-center.db');
const dbExists = fs.existsSync(DB_PATH);

// Connect to SQLite (will create file if not exists)
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

db.addArtist = function ( name, callback ){
  db.get("SELECT id FROM Artists WHERE name = ?", [name], (err, row) => {
    if (err) return callback(err);
    if (row) return callback(null, row.id); // Artist already exists

    db.run("INSERT INTO Artists (name) VALUES (?)", [name], function(err) {
      if (err) return callback(err);
      callback(null, this.lastID); // Return new artist ID
    });
  });
}

db.linkArtistToAlbum = function ( albumId, artistId, role, callback ){
  db.run("INSERT INTO AlbumArtists (album_id, artist_id, role) VALUES (?, ?, ?)", 
    [albumId, artistId, role], function(err) {
    if (err) return callback(err);
    });
}

db.linkArtistToTrack = function ( trackId, artistId, role, callback ){
  db.run("INSERT INTO TrackArtists (track_id, artist_id, role) VALUES (?, ?, ?)", 
    [trackId, artistId, role], function(err) {
    if (err) return callback(err);
    });
}

db.addAlbum = function ( title, cover, year, callback ){
  db.get("SELECT id FROM Albums WHERE title = ?", [title], (err, row) => {
    if (err) return callback(err);
    if (row) return callback(null, row.id); // Album already exists

    db.run("INSERT INTO Albums (title, cover, year) VALUES (?, ?, ?)", 
      [title, cover, year], function(err) {
      if (err) return callback(err);
      callback(null, this.lastID); // Return new album ID
    });
  });
}

db.addTrack = function ( title, albumId, duration, filePath, genre, callback ){
  db.get("SELECT id FROM Tracks WHERE file_path = ?", [filePath], (err, row) => {
    if (err) return callback(err);
    if (row) return callback(null, row.id); // Track already exists

      db.run("INSERT INTO Tracks (title, album_id, duration, file_path, genre) VALUES (?, ?, ?, ?, ?)", [title, albumId, duration, filePath, genre], function(err) {
        if (err) return callback(err);
        callback(null, this.lastID); // Return new track ID
    });
  });
}

// If DB is new, create tables
if (!dbExists) {
  db.serialize(() => {
    console.log('Creating database schema...');

    db.run(`
      CREATE TABLE IF NOT EXISTS Artists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        bio TEXT,
        image_path TEXT
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Albums (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        cover TEXT,
        year INTEGER
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS AlbumArtists (
        album_id INTEGER NOT NULL,
        artist_id INTEGER NOT NULL,
        role TEXT CHECK(role IN ('main', 'featured', 'producer')),
        PRIMARY KEY (album_id, artist_id),
        FOREIGN KEY (album_id) REFERENCES Albums(id) ON DELETE CASCADE,
        FOREIGN KEY (artist_id) REFERENCES Artists(id) ON DELETE CASCADE
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Tracks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        album_id INTEGER,
        duration INTEGER,
        file_path TEXT NOT NULL,
        genre TEXT,
        FOREIGN KEY (album_id) REFERENCES Albums(id) ON DELETE SET NULL
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS TrackArtists (
        track_id INTEGER NOT NULL,
        artist_id INTEGER NOT NULL,
        role TEXT CHECK(role IN ('main', 'featured', 'producer')),
        PRIMARY KEY (track_id, artist_id),
        FOREIGN KEY (track_id) REFERENCES Tracks(id) ON DELETE CASCADE,
        FOREIGN KEY (artist_id) REFERENCES Artists(id) ON DELETE CASCADE
      );
    `);

    console.log('Database initialized');
  });
}

module.exports = db;
