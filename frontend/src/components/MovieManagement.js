// src/components/MovieManagement.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Grid,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import useWebSocket from '../hooks/useWebSocket';

const API_URL = 'http://localhost:5000/api';

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller',
  'Animation', 'Documentary', 'Crime', 'Family', 'Musical'
];

const MovieManagement = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { isConnected, lastMessage, connectionStatus } = useWebSocket();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    genre: [],
    rating: '',
    duration: '',
    releaseDate: '',
    poster: ''
  });

  // Load movies on mount
  useEffect(() => {
    fetchMovies();
  }, []);

  // Listen for WebSocket updates
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'movie_created':
        setSuccess(`New movie "${lastMessage.data.name}" was added!`);
        fetchMovies();
        setTimeout(() => setSuccess(''), 5000);
        break;
      
      case 'movie_updated':
        setSuccess(`Movie "${lastMessage.data.name}" was updated!`);
        fetchMovies();
        setTimeout(() => setSuccess(''), 5000);
        break;
      
      case 'movie_deleted':
        setSuccess('A movie was deleted');
        fetchMovies();
        setTimeout(() => setSuccess(''), 5000);
        break;
    }
  }, [lastMessage]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/movies`);
      const data = await response.json();
      
      if (data.success) {
        setMovies(data.data);
      }
    } catch (err) {
      setError('Failed to fetch movies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate required fields
    if (!formData.name || !formData.description || !formData.genre.length || 
        !formData.rating || !formData.duration || !formData.releaseDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create movie');
      }

      setSuccess('Movie created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        genre: [],
        rating: '',
        duration: '',
        releaseDate: '',
        poster: ''
      });
      
      fetchMovies();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenreChange = (event) => {
    setFormData(prev => ({
      ...prev,
      genre: event.target.value
    }));
  };

  const deleteMovie = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;

    try {
      const response = await fetch(`${API_URL}/movies/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Movie deleted successfully!');
        fetchMovies();
      }
    } catch (err) {
      setError('Failed to delete movie');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header with WebSocket Status */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Movie Management System
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Chip 
            label={`WebSocket: ${connectionStatus.toUpperCase()}`}
            color={isConnected ? 'success' : 'error'}
            icon={isConnected ? <span>✅</span> : <span>❌</span>}
          />
          <Tooltip title="Refresh Movies">
            <IconButton onClick={fetchMovies} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Add Movie Form */}
      <Card sx={{ mb: 4, p: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon /> Add New Movie
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Movie Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={4}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Genres</InputLabel>
                  <Select
                    multiple
                    value={formData.genre}
                    onChange={handleGenreChange}
                    input={<OutlinedInput label="Genres" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {GENRES.map((genre) => (
                      <MenuItem key={genre} value={genre}>
                        {genre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Poster URL"
                  name="poster"
                  value={formData.poster}
                  onChange={handleInputChange}
                  type="url"
                  variant="outlined"
                  placeholder="https://example.com/poster.jpg"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Rating (0-10)"
                  name="rating"
                  type="number"
                  value={formData.rating}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0, max: 10, step: 0.1 }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 1 }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Release Date"
                  name="releaseDate"
                  type="date"
                  value={formData.releaseDate}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                  fullWidth
                >
                  {loading ? 'Creating...' : 'Create Movie'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Movies List */}
      <Typography variant="h5" gutterBottom>
        All Movies ({movies.length})
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      <Grid container spacing={3}>
        {movies.map((movie) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={movie._id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}>
              <CardMedia
                component="img"
                height="400"
                image={movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'}
                alt={movie.name}
                sx={{ objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster';
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {movie.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {movie.description}
                </Typography>
                
                <Box sx={{ mb: 1 }}>
                  {movie.genre.map((g) => (
                    <Chip 
                      key={g} 
                      label={g} 
                      size="small" 
                      sx={{ mr: 0.5, mb: 0.5 }} 
                    />
                  ))}
                </Box>

                <Typography variant="body2" color="text.secondary">
                  ⭐ Rating: {movie.rating}/10
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ⏱️ Duration: {movie.duration} mins
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  📅 Release: {new Date(movie.releaseDate).toLocaleDateString()}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => deleteMovie(movie._id)}
                  fullWidth
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {movies.length === 0 && !loading && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8, 
          bgcolor: 'background.paper',
          borderRadius: 2
        }}>
          <Typography variant="h6" color="text.secondary">
            No movies found. Add your first movie above!
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default MovieManagement;