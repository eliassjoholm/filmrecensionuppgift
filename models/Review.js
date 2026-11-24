const db = require('../db');

class Review {
  constructor({ id, user_id, movie_id, rating, comment, created_at, updated_at }) {
    this.id = id;
    this.userId = user_id;
    this.movieId = movie_id;
    this.rating = rating;
    this.comment = comment;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }

  static async findByMovie(movieId) {
    const [rows] = await db.query(
      'SELECT * FROM reviews WHERE movie_id = ? ORDER BY created_at DESC',
      [movieId]
    );
    return rows.map((row) => new Review(row));
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM reviews WHERE id = ?', [id]);
    return rows.length ? new Review(rows[0]) : null;
  }

  static async create(userId, movieId, rating, comment) {
    const [result] = await db.query(
      'INSERT INTO reviews (user_id, movie_id, rating, comment) VALUES (?, ?, ?, ?)',
      [userId, movieId, rating, comment]
    );
    return Review.findById(result.insertId);
  }

  // Instance method: works on ONE review object
  isOwnedBy(userId) {
    return this.userId === userId;
  }

  async update(rating, comment) {
    await db.query(
      'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
      [rating, comment, this.id]
    );
    this.rating = rating;
    this.comment = comment;
  }
}

module.exports = Review;