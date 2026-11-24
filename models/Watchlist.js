const db = require('../db');
const Movie = require('./Movie');

// One Watchlist object = ONE user's list.
// The userId comes from the verified token, so this object
// can only ever read or change that user's own rows.
class Watchlist {
  constructor(userId) {
    this.userId = userId;
  }

  async getMovies() {
    // JOIN: get the movie details for every movie_id in this user's list
    const [rows] = await db.query(
      `SELECT m.id, m.title, m.genre, m.release_year, w.added_at
       FROM watchlist w
       JOIN movies m ON m.id = w.movie_id
       WHERE w.user_id = ?
       ORDER BY w.added_at DESC`,
      [this.userId]
    );
    return rows.map((row) => ({ ...new Movie(row), addedAt: row.added_at }));
  }

  async add(movieId) {
    await db.query(
      'INSERT INTO watchlist (user_id, movie_id) VALUES (?, ?)',
      [this.userId, movieId]
    );
  }

  // Returns true if a row was deleted, false if the movie wasn't in the list
  async remove(movieId) {
    const [result] = await db.query(
      'DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?',
      [this.userId, movieId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Watchlist;