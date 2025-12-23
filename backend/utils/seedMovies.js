const mongoose = require("mongoose");
const dotenv = require("dotenv");
const axios = require("axios");
const Movie = require("../models/Movie");
const User = require("../models/User");

require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env")
});
console.log("OMDB_API_KEY =", process.env.OMDB_API_KEY);

dotenv.config();



const OMDB_API_KEY = process.env.OMDB_API_KEY;

// Movies to fetch from OMDb
const movieTitles = [
  "The Shawshank Redemption",
  "The Godfather",
  "The Dark Knight",
  "Pulp Fiction",
  "Forrest Gump",
  "Inception",
  "Fight Club",
  "The Matrix",
  "Goodfellas",
  "Interstellar"
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");

    await Movie.deleteMany();
    console.log(" Existing movies cleared");

    // Create / Find admin
    let adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (!adminUser) {
      adminUser = await User.create({
        name: "Admin User",
        email: process.env.ADMIN_EMAIL || "admin@movieapp.com",
        password: process.env.ADMIN_PASSWORD || "Admin@123456",
        role: "admin"
      });
      console.log(" Admin user created");
    }

    const movies = [];

    for (const title of movieTitles) {
      const { data } = await axios.get(
        `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`
      );

      if (data.Response === "True") {
        movies.push({
          title: data.Title,
          description: data.Plot,
          rating: Number(data.imdbRating),
          releaseDate: new Date(data.Released),
          duration: parseInt(data.Runtime),
          genre: data.Genre.split(", "),
          director: data.Director,
          cast: data.Actors.split(", "),
          posterUrl: data.Poster,
          addedBy: adminUser._id
        });

        console.log(`🎬 Added: ${data.Title}`);
      }
    }

    await Movie.insertMany(movies);
    console.log(` ${movies.length} movies seeded from OMDb`);

    console.log("\nAdmin Login:");
    console.log("Email:", adminUser.email);
    console.log("Password:", process.env.ADMIN_PASSWORD || "Admin@123456");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error.message);
    process.exit(1);
  }
};

seedDatabase();
