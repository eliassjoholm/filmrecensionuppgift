const db = require('../db');

class Movie {
  constructor({ id, title, genre, release_year }) {
    this.id = id;
    this.title = title;
    this.genre = genre;
    this.releaseYear = release_year;
  }

  // static = called on the class itself: Movie.findAll()
  static async findAll() {
    const [rows] = await db.query(
      'SELECT id, title, genre, release_year FROM movies ORDER BY title'
    );
    return rows.map((row) => new Movie(row));
  }

  static async findById(id) {
    // ? is a placeholder: mysql2 sends the id separately,
    // so it can never be run as SQL (prevents SQL injection)
    const [rows] = await db.query(
      'SELECT id, title, genre, release_year FROM movies WHERE id = ?',
      [id]
    );
    return rows.length ? new Movie(rows[0]) : null;
  }
}

module.exports = Movie;