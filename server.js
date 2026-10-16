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

dotenv.config();

const app = express();

// Access Log Stream

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "logs", "access.log"),
  { flags: "a" }
);

// Rate Limiter

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: "Too many requests, please try again later",
  },
});

// Middleware

app.use(helmet());

// Show logs in terminal
app.use(morgan("dev"));

// Save logs to logs/access.log
app.use(
  morgan("combined", {
    stream: accessLogStream,
  })
);

app.use(limiter);
app.use(express.json());

// Routes

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/emp", employeeRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Health check successful",
  });
});

// Handle Unsupported Routes
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Global Error Handler
app.use(errorHandler);

// MongoDB Connection

mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "comp3123_assignment1",
  })
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });


// ========================================
// Start Server
// ========================================

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});