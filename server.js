require('dotenv').config(); // must be first: loads .env into process.env

const express = require('express');
const movieRoutes = require('./routes/movies');
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/review');
const watchlistRoutes = require('./routes/watchlist');

const app = express();
app.use(express.json()); // lets us read JSON request bodies (req.body)

app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', reviewRoutes);
app.use('/api/watchlist', watchlistRoutes);

// Any URL we don't have
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler: log the real error for us, but never send
// SQL details or secrets to the client
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FilmRecension API running on http://localhost:${PORT}`);
});