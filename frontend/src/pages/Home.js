import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Pagination,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import {
  SortByAlpha,
  Star,
  CalendarToday,
  Schedule,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import MovieCard from '../components/MovieCard';
import { movieAPI } from '../services/api';

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('desc');
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const limit = parseInt(process.env.REACT_APP_MOVIES_PER_PAGE) || 20;

  useEffect(() => {
    fetchMovies();
    // eslint-disable-next-line
  }, [page, sortBy, sortOrder]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await movieAPI.getSortedMovies(sortBy, sortOrder, page, limit);
      setMovies(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPage(1);
  };

  const handleOrderChange = (event, newOrder) => {
    if (newOrder !== null) {
      setSortOrder(newOrder);
      setPage(1);
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/edit-movie/${id}`);
  };

  // ✅ Updated Delete Handlers
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDelete(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await movieAPI.deleteMovie(deleteId);
      fetchMovies();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete movie');
    } finally {
      setOpenDelete(false);
      setDeleteId(null);
    }
  };

  if (loading && movies.length === 0) {
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
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Discover Movies
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore our collection of top-rated movies
        </Typography>
      </Box>

      {/* Sorting Controls */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="sort-by-label">Sort By</InputLabel>
          <Select
            labelId="sort-by-label"
            value={sortBy}
            label="Sort By"
            onChange={handleSortChange}
          >
            <MenuItem value="rating">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Star fontSize="small" /> Rating
              </Box>
            </MenuItem>
            <MenuItem value="title">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SortByAlpha fontSize="small" /> Title
              </Box>
            </MenuItem>
            <MenuItem value="releaseDate">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday fontSize="small" /> Release Date
              </Box>
            </MenuItem>
            <MenuItem value="duration">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule fontSize="small" /> Duration
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        <ToggleButtonGroup
          value={sortOrder}
          exclusive
          onChange={handleOrderChange}
          aria-label="sort order"
        >
          <ToggleButton value="desc" aria-label="descending">
            <TrendingDown sx={{ mr: 1 }} />
            Descending
          </ToggleButton>
          <ToggleButton value="asc" aria-label="ascending">
            <TrendingUp sx={{ mr: 1 }} />
            Ascending
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Movies Grid */}
      {movies.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {movies.map((movie) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={movie._id}>
                <MovieCard
                  movie={movie}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick} // pass updated function
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No movies found
          </Typography>
        </Box>
      )}

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

export default Home;
