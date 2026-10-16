const jwt = require("jsonwebtoken");
const logSecurityEvent = require("./logger");

const auth = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      logSecurityEvent(
        "AUTH_FAILED",
        `reason=no_token method=${req.method} path=${req.originalUrl}`
      );

      return res.status(401).json({
        message: "Access denied. No token provided",
      });
    }

    // Check Bearer token format
    if (!authHeader.startsWith("Bearer ")) {
      logSecurityEvent(
        "AUTH_FAILED",
        `reason=invalid_format method=${req.method} path=${req.originalUrl}`
      );

      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }

    // Get token
    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Save logged-in user's ID in the request
    req.userId = decoded.userId;

    next();

  } catch (error) {
    logSecurityEvent(
      "AUTH_FAILED",
      `reason=invalid_or_expired_token method=${req.method} path=${req.originalUrl}`
    );

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = auth;