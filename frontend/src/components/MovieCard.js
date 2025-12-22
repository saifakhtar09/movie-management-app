import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

function MovieCard({ movie, onDelete, onEdit }) {
  const { isAdmin } = useAuth();

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).getFullYear();
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Admin Actions */}
      {isAdmin() && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            display: 'flex',
            gap: 0.5,
          }}
        >
          <Tooltip title="Edit Movie">
            <IconButton
              size="small"
              onClick={() => onEdit(movie._id)}
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                '&:hover': { bgcolor: 'primary.main' },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Movie">
            <IconButton
              size="small"
              onClick={() => onDelete(movie._id)}
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                '&:hover': { bgcolor: 'error.main' },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Movie Poster */}
      <CardMedia
        component={Link}
        to={`/movies/${movie._id}`}
        sx={{
          height: 360,
          cursor: 'pointer',
          textDecoration: 'none',
        }}
        image={movie.posterUrl}
        title={movie.title}
      />

      {/* Rating Badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 320,
          left: 16,
          bgcolor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: 2,
          px: 1,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <StarIcon sx={{ color: 'secondary.main', fontSize: 18 }} />
        <Typography variant="body2" fontWeight="bold">
          {movie.rating.toFixed(1)}
        </Typography>
      </Box>

      <CardContent sx={{ flexGrow: 1, pt: 2 }}>
        {/* Movie Title */}
        <Typography
          gutterBottom
          variant="h6"
          component={Link}
          to={`/movies/${movie._id}`}
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontWeight: 600,
            '&:hover': {
              color: 'primary.main',
            },
          }}
        >
          {movie.title}
        </Typography>

        {/* Movie Info */}
        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {formatDate(movie.releaseDate)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {formatDuration(movie.duration)}
            </Typography>
          </Box>
        </Box>

        {/* Genres */}
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
          {movie.genre.slice(0, 3).map((genre, index) => (
            <Chip
              key={index}
              label={genre}
              size="small"
              sx={{
                bgcolor: 'rgba(229, 9, 20, 0.1)',
                color: 'primary.main',
                fontWeight: 500,
              }}
            />
          ))}
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {movie.description}
        </Typography>

        {/* Director */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 1 }}
        >
          Director: {movie.director}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default MovieCard;