const Queue = require('bull');
const Movie = require('../models/Movie');

// Create a new queue for movie operations
const movieQueue = new Queue('movie-operations', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});

// Process movie creation jobs
movieQueue.process('createMovie', async (job) => {
  const { movieData } = job.data;
  
  try {
    const movie = await Movie.create(movieData);
    console.log(`Movie created successfully: ${movie.title}`);
    return { success: true, movie };
  } catch (error) {
    console.error(`Error creating movie: ${error.message}`);
    throw error;
  }
});

// Process movie update jobs
movieQueue.process('updateMovie', async (job) => {
  const { movieId, updateData } = job.data;
  
  try {
    const movie = await Movie.findByIdAndUpdate(
      movieId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!movie) {
      throw new Error('Movie not found');
    }
    
    console.log(`Movie updated successfully: ${movie.title}`);
    return { success: true, movie };
  } catch (error) {
    console.error(`Error updating movie: ${error.message}`);
    throw error;
  }
});

// Process bulk movie creation jobs
movieQueue.process('bulkCreateMovies', async (job) => {
  const { movies } = job.data;
  
  try {
    const createdMovies = await Movie.insertMany(movies, {
      ordered: false // Continue on error
    });
    
    console.log(`Bulk created ${createdMovies.length} movies`);
    return { success: true, count: createdMovies.length };
  } catch (error) {
    console.error(`Error bulk creating movies: ${error.message}`);
    throw error;
  }
});

// Event listeners
movieQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

movieQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error:`, err.message);
});

movieQueue.on('stalled', (job) => {
  console.warn(`Job ${job.id} stalled`);
});

// Helper functions
const addMovieToQueue = async (movieData) => {
  return await movieQueue.add('createMovie', { movieData }, {
    priority: 1
  });
};

const updateMovieInQueue = async (movieId, updateData) => {
  return await movieQueue.add('updateMovie', { movieId, updateData }, {
    priority: 2
  });
};

const bulkAddMoviesToQueue = async (movies) => {
  return await movieQueue.add('bulkCreateMovies', { movies }, {
    priority: 3
  });
};

// Graceful shutdown
const closeQueue = async () => {
  await movieQueue.close();
  console.log('Movie queue closed');
};

process.on('SIGTERM', closeQueue);
process.on('SIGINT', closeQueue);

module.exports = {
  movieQueue,
  addMovieToQueue,
  updateMovieInQueue,
  bulkAddMoviesToQueue,
  closeQueue
};