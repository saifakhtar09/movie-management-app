import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Star,
  Schedule,
  CalendarToday,
  Edit,
  Delete,
  ArrowBack,
} from '@mui/icons-material';
import { movieAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);

  useEffect(() => {
    fetchMovie();
    // eslint-disable-next-line
  }, [id]);

  const fetchMovie = async () => {
    try {
      setLoading(true);
      setError(null);
     const response = await movieAPI.getMovieById(id);

      setMovie(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch movie details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/edit-movie/${id}`);
  };

  const handleDeleteClick = () => {
    setOpenDelete(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await movieAPI.deleteMovie(id);
      navigate('/'); // Redirect to home or movie list after deletion
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete movie');
    } finally {
      setOpenDelete(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !movie) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Movie not found'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Back Button */}
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        Back
      </Button>

      <Paper elevation={3} sx={{ overflow: 'hidden' }}>
        <Grid container>
          {/* Movie Poster */}
          <Grid item xs={12} md={4}>
            <Box
              component="img"
              src={movie.posterUrl}
              alt={movie.title}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Grid>

          {/* Movie Details */}
          <Grid item xs={12} md={8}>
            <Box sx={{ p: 4 }}>
              {/* Title and Rating */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                <Typography variant="h3" component="h1" sx={{ flexGrow: 1 }}>
                  {movie.title}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    bgcolor: 'secondary.main',
                    color: 'background.paper',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                  }}
                >
                  <Star />
                  <Typography variant="h5" fontWeight="bold">
                    {movie.rating.toFixed(1)}
                  </Typography>
                </Box>
              </Box>

              {/* Movie Info */}
              <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday sx={{ color: 'text.secondary' }} />
                  <Typography variant="body1">{formatDate(movie.releaseDate)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule sx={{ color: 'text.secondary' }} />
                  <Typography variant="body1">{formatDuration(movie.duration)}</Typography>
                </Box>
              </Box>

              {/* Genres */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {movie.genre.map((genre, index) => (
                  <Chip key={index} label={genre} color="primary" variant="outlined" />
                ))}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Description */}
              <Typography variant="h6" gutterBottom>
                Synopsis
              </Typography>
              <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                {movie.description}
              </Typography>

              <Divider sx={{ my: 3 }} />

              {/* Director and Cast */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" gutterBottom>
                    Director
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {movie.director}
                  </Typography>
                </Grid>
                {movie.cast && movie.cast.length > 0 && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom>
                      Cast
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {movie.cast.join(', ')}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {/* Admin Actions */}
              {isAdmin() && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="contained" startIcon={<Edit />} onClick={handleEdit}>
                      Edit Movie
                    </Button>
                    <Button variant="outlined" color="error" startIcon={<Delete />} onClick={handleDeleteClick}>
                      Delete Movie
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Delete Confirmation Dialog */}
     <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
  <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
    Delete Movie
  </DialogTitle>
  <DialogContent sx={{ pb: 2 }}>
    <DialogContentText sx={{ fontSize: '1rem', color: 'text.primary' }}>
      Are you sure you want to delete this movie? This action cannot be undone.
    </DialogContentText>
  </DialogContent>
  <DialogActions sx={{ px: 3, pb: 2 }}>
    <Button 
      onClick={() => setOpenDelete(false)} 
      variant="outlined" 
      color="inherit"
      sx={{
        textTransform: 'none',
        fontWeight: 600,
        color: 'text.secondary',
        '&:hover': { backgroundColor: 'action.hover' },
      }}
    >
      Cancel
    </Button>
    <Button
      color="error"
      variant="contained"
      onClick={handleConfirmDelete}
      sx={{
        textTransform: 'none',
        fontWeight: 600,
        px: 3,
      }}
    >
      Delete
    </Button>
  </DialogActions>
</Dialog>

    </Container>
  );
}

export default MovieDetail;
