import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Pagination,
  CircularProgress,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import MovieCard from '../components/MovieCard';
import { movieAPI } from '../services/api';

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searched, setSearched] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const navigate = useNavigate();
  const limit = parseInt(process.env.REACT_APP_MOVIES_PER_PAGE) || 20;

  // Debounce function
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const searchMovies = useCallback(
    async (searchQuery, currentPage) => {
      if (!searchQuery || searchQuery.trim().length < 3) {
        setMovies([]);
        setSearched(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        setSearched(true);

        const response = await movieAPI.searchMovies(searchQuery, currentPage, limit);
        setMovies(response.data.data);
        setTotalPages(response.data.pagination.pages);
      } catch (err) {
        setError(err.response?.data?.error || 'Search failed');
        setMovies([]);
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  const debouncedSearch = useCallback(
    debounce((searchQuery, currentPage) => {
      searchMovies(searchQuery, currentPage);
    }, 500),
    [searchMovies]
  );

  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam) {
      setQuery(queryParam);
      searchMovies(queryParam, page);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (query) {
      setSearchParams({ q: query });
      debouncedSearch(query, page);
    } else {
      setSearchParams({});
      setMovies([]);
      setSearched(false);
    }
    // eslint-disable-next-line
  }, [query, page]);

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (id) => {
    navigate(`/admin/edit-movie/${id}`);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDelete(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await movieAPI.deleteMovie(deleteId);
      if (query) {
        searchMovies(query, page); // refresh search results after deletion
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete movie');
    } finally {
      setOpenDelete(false);
      setDeleteId(null);
    }
  };

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Search Movies
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find movies by title, description, director, or cast
        </Typography>
      </Box>

      {/* Search Input */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search for movies..."
          value={query}
          onChange={handleQueryChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          autoFocus
        />
      </Paper>

      {query.length > 0 && query.length < 3 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Type at least 3 characters to search
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Error Message */}
      {error && !loading && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Search Results */}
      {!loading && searched && (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" color="text.secondary">
              {movies.length > 0
                ? `Found ${movies.length} result${movies.length !== 1 ? 's' : ''} for "${query}"`
                : `No results found for "${query}"`}
            </Typography>
          </Box>

          {movies.length > 0 && (
            <>
              <Grid container spacing={3}>
                {movies.map((movie) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={movie._id}>
                    <MovieCard
                      movie={movie}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                    />
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
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
              )}
            </>
          )}
        </>
      )}

      {/* Initial State */}
      {!loading && !searched && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <SearchIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Start typing to search for movies
          </Typography>
        </Box>
      )}

      {/* Confirmation Dialog */}
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

export default Search;
