import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Chip,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Save, AddCircle } from '@mui/icons-material';
import { movieAPI } from '../services/api';

function EditMovie() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [genreInput, setGenreInput] = useState('');
  const [castInput, setCastInput] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rating: '',
    releaseDate: '',
    duration: '',
    genre: [],
    director: '',
    cast: [],
    posterUrl: '',
  });

  useEffect(() => {
    fetchMovie();
    // eslint-disable-next-line
  }, [id]);

  const fetchMovie = async () => {
    try {
     const response = await movieAPI.getMovieById(id);

      const movie = response.data.data;
      
      setFormData({
        title: movie.title,
        description: movie.description,
        rating: movie.rating,
        releaseDate: new Date(movie.releaseDate).toISOString().split('T')[0],
        duration: movie.duration,
        genre: movie.genre,
        director: movie.director,
        cast: movie.cast || [],
        posterUrl: movie.posterUrl || '',
      });
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch movie');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleAddGenre = () => {
    if (genreInput.trim() && !formData.genre.includes(genreInput.trim())) {
      setFormData({
        ...formData,
        genre: [...formData.genre, genreInput.trim()],
      });
      setGenreInput('');
    }
  };

  const handleDeleteGenre = (genreToDelete) => {
    setFormData({
      ...formData,
      genre: formData.genre.filter((genre) => genre !== genreToDelete),
    });
  };

  const handleAddCast = () => {
    if (castInput.trim() && !formData.cast.includes(castInput.trim())) {
      setFormData({
        ...formData,
        cast: [...formData.cast, castInput.trim()],
      });
      setCastInput('');
    }
  };

  const handleDeleteCast = (castToDelete) => {
    setFormData({
      ...formData,
      cast: formData.cast.filter((member) => member !== castToDelete),
    });
  };

  const validateForm = () => {
    if (!formData.title || !formData.description || !formData.director) {
      setError('Please fill in all required fields');
      return false;
    }

    if (!formData.rating || formData.rating < 0 || formData.rating > 10) {
      setError('Rating must be between 0 and 10');
      return false;
    }

    if (!formData.duration || formData.duration < 1) {
      setError('Duration must be at least 1 minute');
      return false;
    }

    if (!formData.releaseDate) {
      setError('Please provide a release date');
      return false;
    }

    if (formData.genre.length === 0) {
      setError('Please add at least one genre');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const movieData = {
        ...formData,
        rating: parseFloat(formData.rating),
        duration: parseInt(formData.duration),
      };

      await movieAPI.updateMovie(id, movieData);
      setSuccess('Movie updated successfully!');
      
      setTimeout(() => {
        navigate(`/movies/${id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update movie');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/movies/${id}`)}
          sx={{ mb: 2 }}
        >
          Back to Movie
        </Button>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Edit Movie
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Update the movie details below
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Success/Error Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Movie Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>

            {/* Rating and Duration */}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="Rating"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                inputProps={{ min: 0, max: 10, step: 0.1 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">/ 10</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="Duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                inputProps={{ min: 1 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                }}
              />
            </Grid>

            {/* Release Date and Director */}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="date"
                label="Release Date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Director"
                name="director"
                value={formData.director}
                onChange={handleChange}
              />
            </Grid>

            {/* Genres */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Add Genre"
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddGenre();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <Button
                      size="small"
                      onClick={handleAddGenre}
                      startIcon={<AddCircle />}
                    >
                      Add
                    </Button>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                {formData.genre.map((genre, index) => (
                  <Chip
                    key={index}
                    label={genre}
                    onDelete={() => handleDeleteGenre(genre)}
                    color="primary"
                  />
                ))}
              </Box>
            </Grid>

            {/* Cast */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Add Cast Member"
                value={castInput}
                onChange={(e) => setCastInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCast();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <Button
                      size="small"
                      onClick={handleAddCast}
                      startIcon={<AddCircle />}
                    >
                      Add
                    </Button>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                {formData.cast.map((member, index) => (
                  <Chip
                    key={index}
                    label={member}
                    onDelete={() => handleDeleteCast(member)}
                    color="secondary"
                  />
                ))}
              </Box>
            </Grid>

            {/* Poster URL */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Poster URL"
                name="posterUrl"
                value={formData.posterUrl}
                onChange={handleChange}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Save />}
                disabled={submitting}
              >
                {submitting ? 'Updating Movie...' : 'Update Movie'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default EditMovie;