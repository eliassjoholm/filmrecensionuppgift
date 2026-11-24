const express = require('express');
const Movie = require('../models/Movie');
const Watchlist = require('../models/Watchlist');
const requireAuth = require('../middleware/requireAuth');
const { parseId } = require('../utils/validate');

const router = express.Router();

// Every route in this file needs a login
router.use(requireAuth);

// GET /api/watchlist – my saved movies
router.get('/', async (req, res, next) => {
  try {
    const watchlist = new Watchlist(req.user.id);
    res.json(await watchlist.getMovies());
  } catch (err) {
    next(err);
  }
});

// POST /api/watchlist/:movieId – save a movie
router.post('/:movieId', async (req, res, next) => {
  const movieId = parseId(req.params.movieId);
  if (!movieId) {
    return res.status(400).json({ error: 'Movie id must be a positive whole number' });
  }
  try {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    const watchlist = new Watchlist(req.user.id);
    await watchlist.add(movieId);
    res.status(201).json({ message: 'Movie added to your watchlist', movie });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'This movie is already in your watchlist' });
    }
    next(err);
  }
});

// DELETE /api/watchlist/:movieId – remove a saved movie
router.delete('/:movieId', async (req, res, next) => {
  const movieId = parseId(req.params.movieId);
  if (!movieId) {
    return res.status(400).json({ error: 'Movie id must be a positive whole number' });
  }
  try {
    const watchlist = new Watchlist(req.user.id);
    const removed = await watchlist.remove(movieId);
    if (!removed) {
      return res.status(404).json({ error: 'This movie is not in your watchlist' });
    }
    res.json({ message: 'Movie removed from your watchlist' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;