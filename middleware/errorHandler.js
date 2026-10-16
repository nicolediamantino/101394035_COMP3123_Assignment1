const logSecurityEvent = require("./logger");

const errorHandler = (err, req, res, next) => {
  console.error(err);

  logSecurityEvent(
    "SERVER_ERROR",
    `method=${req.method} path=${req.originalUrl} message=${err.message}`
  );

  res.status(500).json({
    message: "Internal server error",
  });
};

module.exports = errorHandler;