# Movie Management Application

A full-stack web application for browsing and managing movies, built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

# Live Demo

Frontend (Render): [https://movie-management-app-1-i58d.onrender.com/]
Backend (Render): [https://movie-management-app-pqcy.onrender.com/health]
GitHub Repository: [https://github.com/saifakhtar09/movie-management-app/tree/main]

## What This Project Does

This is a movie database application where users can browse, search, and view movie details. Admins have additional features to add, edit, and delete movies. I've also integrated the OMDb API so admins can import movie data directly from IMDb instead of entering everything manually.

## Main Features

**For Regular Users:**
- Browse through a collection of movies with pagination
- Search for movies by title, genre, or director
- Sort movies by rating, title, or release date
- View detailed information about each movie
- Responsive design that works on mobile and desktop

**For Admin Users:**
- Add new movies manually
- Import movies from IMDb using their ID
- Edit existing movie information
- Delete movies from the database
- Everything regular users can do

## Tech Stack

**Frontend:**
- React.js for the user interface
- Material-UI for styling and components
- Axios for API requests
- Context API for state management

**Backend:**
- Node.js and Express.js for the server
- MongoDB for the database
- JWT for authentication
- Bull Queue with Redis for background tasks
- OMDb API integration for IMDb data

## How to Run This Project

### What You'll Need

- Node.js installed on your computer
- MongoDB Atlas account (free tier works fine)
- OMDb API key (also free, get it from omdbapi.com)
- Redis installed locally or use a free cloud service

### Setup Steps

1. **Clone the project**
```bash
git clone <https://github.com/saifakhtar09/movie-management-app.git>
cd movie-app
```

2. **Set up the backend**
```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=any_random_secret_string
JWT_EXPIRE=30d
REDIS_URL=redis://localhost:6379
CLIENT_URL=http://localhost:3000
OMDB_API_KEY=your_omdb_api_key
```

Start the backend:
```bash
npm run dev
```

3. **Set up the frontend**

Open a new terminal:
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend folder:
```
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm start
```

The app should open automatically at `http://localhost:3000`

## How the App Works

### User Registration and Login

When you first visit the app, you'll need to create an account. You can register as either a regular user or an admin. The password is encrypted before storing it in the database, and after login, you get a JWT token that's used to authenticate your requests.

### Browsing Movies

The home page shows all movies in a grid layout with pagination. Each movie card displays the poster, title, rating, and genre. You can click on any movie to see more details like the description, cast, director, and duration.

### Searching and Sorting

There's a search bar at the top where you can search for movies by title, genre, or director. You can also sort the results by rating, title, or release date in ascending or descending order.

### Admin Features

If you log in as an admin, you'll see additional options:

**Adding Movies Manually:** Fill out a form with the movie details like title, description, rating, genre, etc.

**Importing from IMDb:** Instead of typing everything, you can just enter the IMDb ID (like "tt1375666" for Inception) and the app will fetch all the details from the OMDb API and save it to your database.

**Editing and Deleting:** Click the edit or delete buttons on any movie card to modify or remove movies.

## API Endpoints I Built

### Authentication
- `POST /api/auth/register` - Create a new account
- `POST /api/auth/login` - Log in and get a token
- `GET /api/auth/me` - Get current user info (requires token)

### Movies
- `GET /api/movies` - Get all movies with pagination
- `GET /api/movies/search?query=inception` - Search movies
- `GET /api/movies/sorted?sortBy=rating&order=desc` - Get sorted movies
- `GET /api/movies/:id` - Get a single movie's details
- `POST /api/movies` - Add a new movie (admin only)
- `POST /api/movies/import` - Import from IMDb (admin only)
- `PUT /api/movies/:id` - Update a movie (admin only)
- `DELETE /api/movies/:id` - Delete a movie (admin only)

## Database Design

I used MongoDB with two main collections:

**Users Collection:**
- Stores user information (name, email, hashed password, role)
- Role can be either "user" or "admin"

**Movies Collection:**
- Stores all movie data (title, description, rating, release date, duration, genre, director, cast, poster URL)
- Has indexes on title and genre for faster search queries

## Security Measures

- Passwords are hashed using bcrypt before storing
- JWT tokens expire after 30 days
- Protected routes check for valid tokens
- Admin routes have an additional role check
- Rate limiting to prevent abuse
- CORS configured to only allow requests from the frontend
- Input validation on all forms

## Challenges I Faced

**MongoDB Connection:** Initially had trouble connecting to MongoDB Atlas because I didn't whitelist my IP address. Fixed it by adding 0.0.0.0/0 to the whitelist.

**CORS Issues:** The frontend couldn't communicate with the backend at first. Solved this by properly configuring CORS middleware and setting the CLIENT_URL environment variable.

**OMDb API Integration:** Had to figure out how to map the OMDb response to my database schema since some field names were different. Also had to handle cases where certain data wasn't available.

**Authentication Flow:** Making sure the JWT token persists across page refreshes and is included in every protected API request required setting up context properly.

## What I Learned

This project helped me understand how to build a complete full-stack application from scratch. I learned how to implement JWT authentication, work with third-party APIs, optimize database queries with indexing, and create a responsive UI with Material-UI. I also got experience with async operations using Bull Queue and managing different user roles.

## Future Improvements

If I had more time, I would add:
- User ratings and reviews for movies
- A personal watchlist feature
- Movie recommendations based on viewing history
- Email notifications for new releases
- Integration with YouTube API to show trailers

## Testing the App

You can create test accounts:

**Admin Account:**
- Email: admin@test.com
- Password: Admin@123
- Role: admin

**Regular User:**
 Singup  and login
- Email:*************
- Password: User@123
- Role: user

To test the IMDb import, try these IDs:
- Inception: tt1375666
- The Dark Knight: tt0468569
- Interstellar: tt0816692

tt4154796  → Avengers: Endgame
tt7286456  → Joker (2019)
tt9362722  → Spider-Man: Across the Spider-Verse
tt6751668  → Parasite
tt15398776 → Oppenheimer
tt6710474  → Everything Everywhere All at Once

## Folder Structure

```
movie-app/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth and error handling
│   ├── models/          # Database schemas
│   ├── node_modules/    # Dependencies
│   ├── queue/           # Bull queue setup
│   ├── routes/          # API routes
│   ├── services/        # OMDb API integration
│   ├── utils/           # Helper functions
│   ├── .env             # Environment variables
│   ├── package-lock.json
│   ├── package.json
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Auth context
│   │   └── services/    # API calls
│   └── package.json
└── README.md
```

## Conclusion

This project demonstrates my ability to build a full-stack web application with user authentication, role-based access control, third-party API integration, and a responsive user interface. All the features work as intended and the code is organized following best practices.

