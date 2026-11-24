const express = require('express');
const Movie = require('../models/Movie');

const router = express.Router();

// GET /api/movies – list all movies (public)
router.get('/', async (req, res, next) => {
  try {
    const movies = await Movie.findAll();
    res.json(movies);
  } catch (err) {
    next(err); // send the error to the error handler in server.js
  }
});

// GET /api/movies/:id – one movie (public)
router.get('/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Movie id must be a positive whole number' });
  }
  try {
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json(movie);
  } catch (err) {
    next(err);
  }
});

module.exports = router;