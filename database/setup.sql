-- FilmRecension database: builds everything from scratch.
-- WARNING: deletes the old database and all its data first.
DROP DATABASE IF EXISTS filmrecension;
CREATE DATABASE filmrecension;
USE filmrecension;

-- Users: email must be unique, password is stored only as a bcrypt hash
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Movies: inserted as sample data, no admin interface needed
CREATE TABLE movies (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  genre        VARCHAR(100) NOT NULL,
  release_year INT NOT NULL
);

-- Reviews: belong to one user and one movie.
-- Rule: ONE review per user per movie (UNIQUE pair). To change it, edit it with PUT.
CREATE TABLE reviews (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  movie_id   INT NOT NULL,
  rating     TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 10),
  comment    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (user_id, movie_id),
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

-- Watchlist: the pair (user_id, movie_id) is the primary key,
-- so the same movie can't be saved twice by the same user.
CREATE TABLE watchlist (
  user_id  INT NOT NULL,
  movie_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, movie_id),
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

-- Sample movies (the assignment needs at least 3).
-- Users are NOT inserted here: they're registered through the API so passwords get hashed.
INSERT INTO movies (title, genre, release_year) VALUES
  ('Inception',        'Sci-Fi', 2010),
  ('The Dark Knight',  'Action', 2008),
  ('Parasite',         'Thriller', 2019),
  ('Spirited Away',    'Animation', 2001),
  ('The Shawshank Redemption', 'Drama', 1994);