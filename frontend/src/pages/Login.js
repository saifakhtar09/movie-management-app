import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, Movie as MovieIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await login(formData);

    if (result.success) {
      toast.success('Login successful!');
      navigate(from, { replace: true });
    } else {
      toast.error(result.error || 'Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Video Background */}
      {/* Video Background */}
<Box
  component="div"
  sx={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -2,
    '@media (max-width: 768px)': {
      display: 'none', // hide video on tablets & mobile
    },
  }}
>
  <video
    autoPlay
    loop
    muted
    playsInline
    preload="auto"
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    }}
  >
    <source src="/assets/movie-bg.mp4" type="video/mp4" />
  </video>
</Box>


      {/* Dark Overlay */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: -1 }} />

      {/* Content */}
      <Container component="main" maxWidth="sm">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <MovieIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography component="h1" variant="h4" fontWeight="bold">MovieApp</Typography>
            </Box>

            <Typography component="h2" variant="h5" gutterBottom>Sign In</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Welcome back! Please login to your account.
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, mb: 2 }} disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <Divider sx={{ my: 2 }}>OR</Divider>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link to="/register" style={{ color: '#e50914', textDecoration: 'none', fontWeight: 600 }}>
                    Sign Up
                  </Link>
                </Typography>
              </Box>

              <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Demo Credentials:
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>Admin:</strong> admin@movieapp.com / Admin@123456
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

export default Login;
