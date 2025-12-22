const Movie = require('../models/Movie');
const ErrorResponse = require('../utils/errorResponse');
const { addMovieToQueue, updateMovieInQueue } = require('../queue/movieQueue');

// @desc    Get all movies with pagination and filtering
// @route   GET /api/movies
// @access  Public
exports.getMovies = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    if (req.query.genre) {
      filter.genre = { $in: req.query.genre.split(',') };
    }

    if (req.query.minRating) {
      filter.rating = { $gte: parseFloat(req.query.minRating) };
    }

    if (req.query.year) {
      const year = parseInt(req.query.year);
      filter.releaseDate = {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      };
    }

    const [movies, total] = await Promise.all([
      Movie.find(filter)
        .populate('addedBy', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Movie.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: movies.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: movies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sorted movies
// @route   GET /api/movies/sorted
// @access  Public
exports.getSortedMovies = async (req, res, next) => {
  try {
    const { sortBy = 'rating', order = 'desc', page = 1, limit = 20 } = req.query;

    const validSortFields = ['title', 'rating', 'releaseDate', 'duration', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'rating';
    const sortOrder = order === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [movies, total] = await Promise.all([
      Movie.find({ isActive: true })
        .populate('addedBy', 'name email')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit)),
      Movie.countDocuments({ isActive: true })
    ]);

    res.status(200).json({
      success: true,
      count: movies.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      sortBy: sortField,
      order,
      data: movies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search movies
// @route   GET /api/movies/search
// @access  Public
exports.searchMovies = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20, sortBy = 'rating', order = 'desc' } = req.query;

    if (!q || q.trim().length < 2) {
      return next(new ErrorResponse('Please provide at least 2 characters for search', 400));
    }

    const result = await Movie.searchMovies(q, {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: order
    });

    res.status(200).json({
      success: true,
      count: result.movies.length,
      pagination: result.pagination,
      query: q,
      data: result.movies
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get single movie
// @route   GET /api/movies/:id
// @access  Public
exports.getMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id)
      .populate('addedBy', 'name email');

    if (!movie || !movie.isActive) {
      return next(
        new ErrorResponse(`Movie not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: movie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new movie
// @route   POST /api/movies
// @access  Private/Admin
exports.createMovie = async (req, res, next) => {
  try {
    req.body.addedBy = req.user.id;

    const useQueue = req.query.useQueue === 'true';

    if (useQueue) {
      const job = await addMovieToQueue(req.body);

      res.status(202).json({
        success: true,
        message: 'Movie added to queue for processing',
        jobId: job.id
      });
    } else {
      const movie = await Movie.create(req.body);

      res.status(201).json({
        success: true,
        data: movie
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
exports.updateMovie = async (req, res, next) => {
  try {
    let movie = await Movie.findById(req.params.id);

    if (!movie) {
      return next(
        new ErrorResponse(`Movie not found with id of ${req.params.id}`, 404)
      );
    }

    const useQueue = req.query.useQueue === 'true';

    if (useQueue) {
      const job = await updateMovieInQueue(req.params.id, req.body);

      res.status(202).json({
        success: true,
        message: 'Movie update added to queue',
        jobId: job.id
      });
    } else {
      movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });

      res.status(200).json({
        success: true,
        data: movie
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
exports.deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return next(
        new ErrorResponse(`Movie not found with id of ${req.params.id}`, 404)
      );
    }

    movie.isActive = false;
    await movie.save();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Movie deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Import movie from OMDb by IMDb ID
// @route   POST /api/movies/import
// @access  Private/Admin
exports.importMovie = async (req, res, next) => {
  try {
    const { imdbID } = req.body;

    if (!imdbID) {
      return next(new ErrorResponse('Please provide an IMDb ID', 400));
    }

    const existingMovie = await Movie.findOne({ imdbId: imdbID });
    if (existingMovie) {
      return next(
        new ErrorResponse('Movie with this IMDb ID already exists', 409)
      );
    }

    const omdbService = require('../services/omdb.service');
    const movieData = await omdbService.fetchMovieByImdbId(imdbID);

    movieData.addedBy = req.user.id;

    const movie = await Movie.create(movieData);

    res.status(201).json({
      success: true,
      message: 'Movie imported successfully from OMDb',
      data: movie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get movie statistics
// @route   GET /api/movies/stats
// @access  Public
exports.getMovieStats = async (req, res, next) => {
  try {
    const stats = await Movie.getStatistics();

    res.status(200).json({
      success: true,
      data: stats[0] || {}
    });
  } catch (error) {
    next(error);
  }
};
