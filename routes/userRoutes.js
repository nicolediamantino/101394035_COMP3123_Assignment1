const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const logSecurityEvent = require("../middleware/logger");

const router = express.Router();


// ========================================
// POST - User Signup
// ========================================

router.post(
  "/signup",
  [
    body("username")
      .notEmpty()
      .withMessage("Username is required"),

    body("email")
      .isEmail()
      .withMessage("Valid email is required"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        logSecurityEvent(
          "VALIDATION_FAILED",
          `route=signup errors=${errors
            .array()
            .map((error) => error.msg)
            .join(", ")}`
        );

        return res.status(400).json({
          errors: errors.array(),
        });
      }

      const { username, email, password } = req.body;

      // Check if username or email already exists
      const existingUser = await User.findOne({
        $or: [
          { username: username },
          { email: email },
        ],
      });

      if (existingUser) {
        return res.status(400).json({
          message: "Username or email already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = new User({
        username: username,
        email: email,
        password: hashedPassword,
      });

      // Save user to MongoDB
      await newUser.save();

      res.status(201).json({
        message: "User created successfully",
      });

    } catch (error) {
      console.log(error);

      if (error.code === 11000) {
        return res.status(400).json({
          message: "Username or email already exists",
        });
      }

      logSecurityEvent(
        "ERROR",
        `route=signup message=${error.message}`
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// ========================================
// POST - User Login
// ========================================

router.post(
  "/login",
  [
    body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        logSecurityEvent(
          "VALIDATION_FAILED",
          `route=login errors=${errors
            .array()
            .map((error) => error.msg)
            .join(", ")}`
        );

        return res.status(400).json({
          errors: errors.array(),
        });
      }

      const { username, email, password } = req.body;

      // User must provide username or email
      if (!username && !email) {
        logSecurityEvent(
          "VALIDATION_FAILED",
          "route=login errors=Username or email is required"
        );

        return res.status(400).json({
          message: "Username or email is required",
        });
      }

      // Find user using username OR email
      let user;

      if (email) {
        user = await User.findOne({ email: email });
      } else {
        user = await User.findOne({ username: username });
      }

      if (!user) {
        logSecurityEvent(
          "LOGIN_FAILED",
          `username/email=${username || email}`
        );

        return res.status(401).json({
          message: "Invalid username/email or password",
        });
      }

      // Compare password with hashed password
      const passwordMatch = await bcrypt.compare(
        password,
        user.password
      );

      if (!passwordMatch) {
        logSecurityEvent(
          "LOGIN_FAILED",
          `username/email=${username || email}`
        );

        return res.status(401).json({
          message: "Invalid username/email or password",
        });
      }

      // Create JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      logSecurityEvent(
        "LOGIN_SUCCESS",
        `userId=${user._id}`
      );

      res.status(200).json({
        message: "Login successful",
        token: token,
      });

    } catch (error) {
      console.log(error);

      logSecurityEvent(
        "ERROR",
        `route=login message=${error.message}`
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


module.exports = router;