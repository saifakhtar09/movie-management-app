import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack,
  Save,
  AddCircle,
  CloudDownload
} from '@mui/icons-material';
import { movieAPI } from '../services/api';

function AddMovie() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [genreInput, setGenreInput] = useState('');
  const [castInput, setCastInput] = useState('');
  
  // OMDb Import State
  const [imdbID, setImdbID] = useState('');
  const [importing, setImporting] = useState(false);
  
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

  // OMDb Import Handler
  const handleImportFromOMDb = async () => {
    if (!imdbID.trim()) {
      setError('Please enter an IMDb ID');
      return;
    }

    if (!imdbID.startsWith('tt')) {
      setError('IMDb ID must start with "tt" (e.g., tt3896198)');
      return;
    }

    setImporting(true);
    setError('');
    setSuccess('');

    try {
      await movieAPI.importMovie(imdbID);
      setSuccess('Movie imported successfully from OMDb!');
      setImdbID('');
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to import movie from OMDb');
    } finally {
      setImporting(false);
    }
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

    setLoading(true);

    try {
      const movieData = {
        ...formData,
        rating: parseFloat(formData.rating),
        duration: parseInt(formData.duration),
      };

      await movieAPI.createMovie(movieData);
      setSuccess('Movie added successfully!');
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add movie');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Back to Home
        </Button>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Add New Movie
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Fill in the details below to add a new movie to the database
        </Typography>
      </Box>

      {/* OMDb Import Section */}
      <Card sx={{ mb: 3, bgcolor: '' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold" color="text.secondary">
            🎬 Quick Import from OMDb
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Import movie data directly using IMDb ID (faster and more accurate)
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="IMDb ID"
                placeholder="tt3896198"
                value={imdbID}
                onChange={(e) => setImdbID(e.target.value)}
                disabled={importing}
                helperText='Find IMDb ID from movie URL: imdb.com/title/tt3896198'
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                startIcon={<CloudDownload />}
                onClick={handleImportFromOMDb}
                disabled={importing || !imdbID.trim()}
              >
                {importing ? 'Importing...' : 'Import'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Divider sx={{ mb: 3 }}>
        <Chip label="OR ADD MANUALLY" />
      </Divider>

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
                helperText="Press Enter or click Add to add a genre"
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
                helperText="Press Enter or click Add to add a cast member"
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
                label="Poster URL (Optional)"
                name="posterUrl"
                value={formData.posterUrl}
                onChange={handleChange}
                helperText="Leave empty for default placeholder"
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
                disabled={loading}
              >
                {loading ? 'Adding Movie...' : 'Add Movie'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default AddMovie;