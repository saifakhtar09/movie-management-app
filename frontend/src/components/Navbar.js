import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Movie as MovieIcon,
  Search as SearchIcon,
  AccountCircle,
  ExitToApp,
  AddCircle,
  Home,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    logout();
    setAnchorElUser(null);
    navigate('/login');
  };

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Search', icon: <SearchIcon />, path: '/search' },
  ];

  if (user && isAdmin()) {
    menuItems.push({
      text: 'Add Movie',
      icon: <AddCircle />,
      path: '/admin/add-movie',
    });
  }

  const drawer = (
    <Box onClick={() => setMobileOpen(false)} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        <MovieIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        MovieApp
      </Typography>
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            button
            component={Link}
            to={item.path}
            sx={{ justifyContent: 'center' }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" elevation={4}>
      <Container maxWidth="xl">
        <Toolbar
  disableGutters
  sx={{
    minHeight: 64,
    display: 'flex',
    justifyContent: 'space-between', // <-- make left and right spaced
    alignItems: 'center',
  }}
>
  {/* Left side: Menu icon + Logo */}
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    {isMobile && (
      <IconButton
        color="inherit"
        onClick={() => setMobileOpen(true)}
        sx={{ mr: 1 }}
      >
        <MenuIcon />
      </IconButton>
    )}

    <Box
      component={Link}
      to="/"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        color: 'inherit',
        textDecoration: 'none',
      }}
    >
      <MovieIcon />
      <Typography variant="h6" fontWeight={700}>
        MovieApp
      </Typography>
    </Box>
  </Box>

  {/* Right side: Desktop menu or user/auth buttons */}
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    {!isMobile && (
      <Box sx={{ flexGrow: 1, display: 'flex' }}>
        {menuItems.map((item) => (
          <Button
            key={item.text}
            component={Link}
            to={item.path}
            startIcon={item.icon}
            sx={{
              color: 'white',
              height: 64,
              display: 'flex',
              alignItems: 'center',
              textTransform: 'none',
              '& .MuiButton-startIcon': {
                marginRight: 0.5,
              },
            }}
          >
            {item.text}
          </Button>
        ))}
      </Box>
    )}

    {user ? (
      <>
        <Tooltip title="Account">
          <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              {user.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorElUser}
          open={Boolean(anchorElUser)}
          onClose={() => setAnchorElUser(null)}
        >
          <MenuItem disabled>
            {user.name} ({user.role})
          </MenuItem>
          <MenuItem component={Link} to="/profile">
            <AccountCircle sx={{ mr: 1 }} /> Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ExitToApp sx={{ mr: 1 }} /> Logout
          </MenuItem>
        </Menu>
      </>
    ) : (
      <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
  component={Link}
  to="/login"
  color="inherit"
  sx={{
    border: '1px solid white',     
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderColor: 'white',                     
    },
    color: 'white',                
    textTransform: 'none',
  }}
>
  Login
</Button>

        <Button component={Link} to="/register" variant="contained" color="secondary">
          Register
        </Button>
      </Box>
    )}
  </Box>
</Toolbar>

      </Container>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
}

export default Navbar;
