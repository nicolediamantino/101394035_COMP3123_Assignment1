
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const path = require("path");

const errorHandler = require("./middleware/errorHandler");
const userRoutes = require("./routes/userRoutes");
const employeeRoutes = require("./routes/employeeRoutes");

// Environment Variables
dotenv.config();

const app = express();

// ========================================
// Environment Configuration
// ========================================

const isVercel = process.env.VERCEL === "1";

// ========================================
// Access Logging
// ========================================

// Use console logs on Vercel.
// Use logs/access.log when running locally.

const accessLogStream = isVercel
  ? process.stdout
  : fs.createWriteStream(
      path.join(__dirname, "logs", "access.log"),
      { flags: "a" }
    );

// ========================================
// Rate Limiter
// ========================================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: "Too many requests, please try again later",
  },
});

// ========================================
// Middleware
// ========================================

// Security headers
app.use(helmet());

// Display requests in terminal
app.use(morgan("dev"));

// Save access logs locally or send to Vercel logs
app.use(
  morgan("combined", {
    stream: accessLogStream,
  })
);

// Rate limiting
app.use(limiter);

// Parse JSON request bodies
app.use(express.json());

// ========================================
// API Routes
// ========================================

// User signup and login
app.use("/api/v1/user", userRoutes);

// Employee CRUD operations
app.use("/api/v1/emp", employeeRoutes);

// ========================================
// Health Check
// ========================================

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Health check successful",
  });
});

// ========================================
// Handle Unsupported Routes
// ========================================

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// ========================================
// Global Error Handler
// ========================================

app.use(errorHandler);

// ========================================
// MongoDB Connection
// ========================================

mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "comp3123_assignment1",
  })
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// ========================================
// Start Server
// ========================================

// Start the server locally.
// Vercel manages the HTTP server automatically.

if (!isVercel) {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export Express app for Vercel
module.exports = app;
