const axios = require('axios');
const ErrorResponse = require('../utils/errorResponse');

class OMDbService {
  constructor() {
    this.apiKey = process.env.OMDB_API_KEY;
    this.baseURL = 'http://www.omdbapi.com/';
    
    if (!this.apiKey) {
      console.warn('⚠️  OMDB_API_KEY not found in environment variables');
    }
  }

  /**
   * Fetch movie data from OMDb API by IMDb ID
   * @param {string} imdbID - IMDb ID (e.g., tt3896198)
   * @returns {Promise<Object>} Normalized movie data
   */
  async fetchMovieByImdbId(imdbID) {
    if (!this.apiKey) {
      throw new ErrorResponse('OMDb API key not configured', 500);
    }

    if (!imdbID || !imdbID.startsWith('tt')) {
      throw new ErrorResponse('Invalid IMDb ID format. Must start with "tt"', 400);
    }

    try {
      const response = await axios.get(this.baseURL, {
        params: {
          apikey: this.apiKey,
          i: imdbID,
          plot: 'full'
        },
        timeout: 10000
      });

      const data = response.data;

      if (data.Response === 'False') {
        throw new ErrorResponse(data.Error || 'Movie not found on OMDb', 404);
      }

      return this.normalizeOMDbData(data);
    } catch (error) {
      if (error instanceof ErrorResponse) {
        throw error;
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new ErrorResponse('OMDb API request timeout', 504);
      }

      throw new ErrorResponse(
        `Failed to fetch movie from OMDb: ${error.message}`,
        error.response?.status || 500
      );
    }
  }

  /**
   * Normalize OMDb response to match Movie schema
   * @param {Object} omdbData - Raw OMDb API response
   * @returns {Object} Normalized movie data
   */
  normalizeOMDbData(omdbData) {
    return {
      title: omdbData.Title,
      description: omdbData.Plot !== 'N/A' ? omdbData.Plot : '',
      rating: this.parseRating(omdbData.imdbRating),
      releaseDate: this.parseDate(omdbData.Released),
      duration: this.parseDuration(omdbData.Runtime),
      genre: this.parseArray(omdbData.Genre),
      director: omdbData.Director !== 'N/A' ? omdbData.Director : 'Unknown',
      cast: this.parseArray(omdbData.Actors),
      posterUrl: omdbData.Poster !== 'N/A' ? omdbData.Poster : undefined,
      imdbId: omdbData.imdbID,
      year: omdbData.Year,
      rated: omdbData.Rated !== 'N/A' ? omdbData.Rated : undefined,
      writer: omdbData.Writer !== 'N/A' ? omdbData.Writer : undefined,
      imdbRating: omdbData.imdbRating !== 'N/A' ? parseFloat(omdbData.imdbRating) : undefined,
      imdbVotes: omdbData.imdbVotes !== 'N/A' ? omdbData.imdbVotes.replace(/,/g, '') : undefined,
      boxOffice: omdbData.BoxOffice !== 'N/A' ? omdbData.BoxOffice : undefined,
      awards: omdbData.Awards !== 'N/A' ? omdbData.Awards : undefined
    };
  }

  /**
   * Parse rating from OMDb format to number
   */
  parseRating(ratingStr) {
    if (!ratingStr || ratingStr === 'N/A') {
      return 0;
    }
    const rating = parseFloat(ratingStr);
    return isNaN(rating) ? 0 : rating;
  }

  /**
   * Parse date string to Date object
   */
  parseDate(dateStr) {
    if (!dateStr || dateStr === 'N/A') {
      return new Date();
    }
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date() : date;
  }

  /**
   * Parse duration from "120 min" format to number
   */
  parseDuration(durationStr) {
    if (!durationStr || durationStr === 'N/A') {
      return 0;
    }
    const match = durationStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Parse comma-separated string to array
   */
  parseArray(str) {
    if (!str || str === 'N/A') {
      return [];
    }
    return str.split(',').map(item => item.trim()).filter(Boolean);
  }
}

module.exports = new OMDbService();