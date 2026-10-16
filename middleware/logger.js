const fs = require("fs");
const path = require("path");

const securityLogPath = path.join(
  __dirname,
  "../logs/security.log"
);

const logSecurityEvent = (event, details = "") => {
  const timestamp = new Date().toISOString();

  const logMessage =
    `[${timestamp}] ${event} ${details}\n`;

  fs.appendFileSync(securityLogPath, logMessage);
};

module.exports = logSecurityEvent;