import winston from "winston";
import { config } from "../config";

const { combine, timestamp, printf, colorize } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} [${level}]: ${message} ${
    Object.keys(meta).length ? JSON.stringify(meta) : ""
  }`;
});

// Create the logger
const logger = winston.createLogger({
  level: config.environment === "production" ? "info" : "debug",
  format: combine(timestamp(), logFormat),
  transports: [
    // Write logs to console
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), logFormat),
    }),
    // Write to log files
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

export default logger;
