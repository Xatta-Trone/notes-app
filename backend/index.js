const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();
const corsOptions = require("./src/config/cors");

// Import routes
const authRoutes = require("./src/routes/authRoutes");
const homeRoutes = require("./src/routes/homeRoutes");
const noteRoutes = require("./src/routes/noteRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", homeRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/categories", categoryRoutes);

// Error handling
app.use((req, res) => {
  res.status(404).json({
    success: false,
    errors: {
      route: "Route not found",
    },
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    errors: {
      server: "Something went wrong!",
    },
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
