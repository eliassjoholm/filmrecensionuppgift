const express = require('express');
const Movie = require('../models/Movie');
const Review = require('../models/Review');
const requireAuth = require('../middleware/requireAuth');
const { parseId, validateReviewInput } = require('../utils/validate');

const router = express.Router();

// GET /api/movies/:movieId/reviews – public
router.get('/movies/:movieId/reviews', async (req, res, next) => {
  const movieId = parseId(req.params.movieId);
  if (!movieId) {
    return res.status(400).json({ error: 'Movie id must be a positive whole number' });
  }
  try {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    const reviews = await Review.findByMovie(movieId);
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

// POST /api/movies/:movieId/reviews – signed in
// requireAuth runs first; if the token is OK we get req.user.id
router.post('/movies/:movieId/reviews', requireAuth, async (req, res, next) => {
  const movieId = parseId(req.params.movieId);
  if (!movieId) {
    return res.status(400).json({ error: 'Movie id must be a positive whole number' });
  }
  const input = validateReviewInput(req.body);
  if (input.error) {
    return res.status(400).json({ error: input.error });
  }
  try {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    // user id comes from the verified token, NEVER from req.body
    const review = await Review.create(req.user.id, movieId, input.rating, input.comment);
    res.status(201).json(review);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'You have already reviewed this movie. Edit your review instead.' });
    }
    next(err);
  }
});

// PUT /api/reviews/:id – only the owner
router.put('/reviews/:id', requireAuth, async (req, res, next) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Review id must be a positive whole number' });
  }
  const input = validateReviewInput(req.body);
  if (input.error) {
    return res.status(400).json({ error: input.error });
  }
  try {
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    if (!review.isOwnedBy(req.user.id)) {
      // 403 = we know who you are, but you're not allowed
      return res.status(403).json({ error: 'You can only edit your own reviews' });
    }
    await review.update(input.rating, input.comment);
    res.json(review);
  } catch (err) {
    next(err);
  }
});

module.exports = router;