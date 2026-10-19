const fs = require("fs");
const path = require("path");

const securityLogPath = path.join(
  __dirname,
  "../logs/security.log"
);

const logSecurityEvent = (event, details = "") => {
  const timestamp = new Date().toISOString();

  const logMessage = `[${timestamp}] ${event} ${details}`;

  // On Vercel, write security events to the function logs.
  if (process.env.VERCEL) {
    console.log(logMessage);
    return;
  }

  // Locally, keep saving security events to the log file.
  try {
    fs.mkdirSync(path.dirname(securityLogPath), {
      recursive: true,
    });

    fs.appendFileSync(securityLogPath, logMessage + "\n");
  } catch (error) {
    console.error("Security logging error:", error.message);
    console.log(logMessage);
  }
};

module.exports = logSecurityEvent;