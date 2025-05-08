import express from "express";
import cors from "cors";
import helmet from "helmet";
import fs from "fs-extra";
import { config } from "./config";
import logger from "./utils/logger";
import orderRoutes from "./api/routes/order.routes";
import webhookRoutes from "./api/routes/webhook.route";
import scheduleSendOrdersJob from "./cron/sendOrdersJob";
import scheduleProcessReportsJob from "./cron/processReportsJob";

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Ensure required directories exist
const initDirectories = async () => {
  try {
    await fs.ensureDir(config.paths.cmdcliOutgoing);
    await fs.ensureDir(config.paths.crpcmdIncoming);
    await fs.ensureDir(config.paths.backups);
    logger.info("Required directories created");
  } catch (error) {
    logger.error("Error creating directories:", error);
    process.exit(1);
  }
};

// Routes
app.use("/api/logistics", orderRoutes);
app.use("/api", webhookRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    service: "Logistics Integration Service",
    version: "1.0.0",
    status: "running",
  });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

// Start the server
const startServer = async () => {
  try {
    // Initialize directories
    await initDirectories();

    // Start Express server
    app.listen(config.port, () => {
      logger.info(`Server running on port http://localhost:${config.port}`);
    });

    // Schedule cron jobs
    // scheduleSendOrdersJob();
    // scheduleProcessReportsJob();

    logger.info("Application started successfully");
  } catch (error) {
    logger.error("Failed to start application:", error);
    process.exit(1);
  }
};

// If this file is run directly
if (require.main === module) {
  startServer();
}

export default app;
