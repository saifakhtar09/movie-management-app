import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me')
};

export const movieAPI = {
  getAllMovies: (page = 1, limit = 12) => 
    api.get(`/movies?page=${page}&limit=${limit}`),
  getSortedMovies: (sortBy, order, page = 1, limit = 12) => 
    api.get(`/movies/sorted?sortBy=${sortBy}&order=${order}&page=${page}&limit=${limit}`),
 searchMovies: (q, page = 1, limit = 20) =>
  api.get('/movies/search', {
    params: {
      q,
      page,
      limit
    }
  }),

  getMovieById: (id) => 
    api.get(`/movies/${id}`),
  getMovie: (id) =>
    api.get(`/movies/${id}`),
  createMovie: (movieData) => 
    api.post('/movies', movieData),
  updateMovie: (id, movieData) => 
    api.put(`/movies/${id}`, movieData),
  deleteMovie: (id) => 
    api.delete(`/movies/${id}`),
  importMovie: (imdbID) => 
    api.post('/movies/import', { imdbID })
  
};

export default api;