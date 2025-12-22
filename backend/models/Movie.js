const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a movie title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a movie description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: [0, 'Rating must be at least 0'],
      max: [10, 'Rating cannot exceed 10']
    },
    releaseDate: {
      type: Date,
      required: [true, 'Please provide a release date']
    },
    duration: {
      type: Number,
      required: [true, 'Please provide duration in minutes'],
      min: [1, 'Duration must be at least 1 minute']
    },
    genre: {
      type: [String],
      required: [true, 'Please provide at least one genre']
    },
    director: {
      type: String,
      required: [true, 'Please provide director name'],
      trim: true
    },
    cast: {
      type: [String],
      default: []
    },
    posterUrl: {
      type: String,
      default: 'https://via.placeholder.com/300x450?text=No+Poster'
    },

    // OMDb / IMDb fields
    imdbId: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    year: String,
    rated: String,
    writer: String,
    imdbRating: {
      type: Number,
      min: 0,
      max: 10
    },
    imdbVotes: String,
    boxOffice: String,
    awards: String,

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/* ================= Indexes ================= */
MovieSchema.index({ title: 'text', description: 'text' });
MovieSchema.index({ rating: -1 });
MovieSchema.index({ releaseDate: -1 });
MovieSchema.index({ duration: 1 });
MovieSchema.index({ genre: 1 });
MovieSchema.index({ isActive: 1 });

/* ================= Virtuals ================= */

// Release year
MovieSchema.virtual('releaseYear').get(function () {
  return this.releaseDate ? this.releaseDate.getFullYear() : null;
});

// Formatted duration
MovieSchema.virtual('formattedDuration').get(function () {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
});

/* ================= Statics ================= */

// Movie statistics
MovieSchema.statics.getStatistics = async function () {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalMovies: { $sum: 1 },
        avgRating: { $avg: '$rating' },
        avgDuration: { $avg: '$duration' },
        minRating: { $min: '$rating' },
        maxRating: { $max: '$rating' }
      }
    }
  ]);
};

// Search movies
MovieSchema.statics.searchMovies = async function (query, options = {}) {
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const searchQuery = {
    isActive: true,
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { director: { $regex: query, $options: 'i' } },
      { cast: { $regex: query, $options: 'i' } }
    ]
  };

  const [movies, total] = await Promise.all([
    this.find(searchQuery)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('addedBy', 'name email'),
    this.countDocuments(searchQuery)
  ]);

  return {
    movies,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

module.exports = mongoose.model('Movie', MovieSchema);
