const express = require('express');
const {
  getMovies,
  getSortedMovies,
  searchMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  getMovieStats,
  importMovie  // Add this
} = require('../controllers/movieController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getMovies);
router.get('/sorted', getSortedMovies);
router.get('/search', searchMovies);
router.get('/stats', getMovieStats);
router.get('/:id', getMovie);

// Protected routes (Admin only)
router.post('/import', protect, authorize('admin'), importMovie); 
router.post('/', protect, authorize('admin'), createMovie);
router.put('/:id', protect, authorize('admin'), updateMovie);
router.delete('/:id', protect, authorize('admin'), deleteMovie);

module.exports = router;