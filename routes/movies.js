const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { isLoggedIn, isOwner } = require('../middleware/auth');

// Add movie form
router.get('/add', isLoggedIn, (req, res) => {
  res.render('add_movie', { error: null });
});

// Add movie
router.post('/add', isLoggedIn, async (req, res) => {
  const { name, description, year, genres, rating } = req.body;
  try {
    const movie = new Movie({
      name,
      description,
      year,
      genres: genres.split(',').map(g => g.trim()),
      rating,
      createdBy: req.session.user._id
    });
    await movie.save();
    res.redirect('/');
  } catch (err) {
    res.render('add_movie', { error: 'Failed to add movie' });
  }
});

// Show movie details
router.get('/:id', async (req, res) => {
  const movie = await Movie.findById(req.params.id).populate('createdBy', 'username');
  if (!movie) return res.status(404).send('Movie not found');
  res.render('movie_detail', { movie, user: req.session.user });
});

// Edit form
router.get('/:id/edit', isLoggedIn, isOwner(Movie), async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  res.render('edit_movie', { movie, error: null });
});

// Update movie
router.put('/:id', isLoggedIn, isOwner(Movie), async (req, res) => {
  const { name, description, year, genres, rating } = req.body;
  try {
    await Movie.findByIdAndUpdate(req.params.id, {
      name,
      description,
      year,
      genres: genres.split(',').map(g => g.trim()),
      rating
    });
    res.redirect(`/movies/${req.params.id}`);
  } catch {
    res.render('edit_movie', { movie: req.body, error: 'Update failed' });
  }
});

// Delete movie
router.delete('/:id', isLoggedIn, isOwner(Movie), async (req, res) => {
  await Movie.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

module.exports = router;
