import cron from "node-cron";
import { config } from "../config";
import logger from "../utils/logger";
import { CrpcmdService } from "../services/logistics/crpcmd.service";

// Create a singleton instance
const crpcmdService = new CrpcmdService();

/**
 * Retrieve and process CRPCMD files from L4
 */
export const processShippingReports = async () => {
  try {
    logger.info("Starting scheduled job: Process shipping reports");

    // Download and process files from L4
    const downloadedCount = await crpcmdService.retrieveAndProcessFiles();
    logger.info(`Downloaded and processed ${downloadedCount} files from L4`);

    // Also process any files that might be in the local directory
    const localCount = await crpcmdService.processLocalFiles();
    logger.info(`Processed ${localCount} local files`);

    logger.info("Finished processing shipping reports");
  } catch (error) {
    logger.error("Error in cron job: Process shipping reports", error);
  }
};

// If this file is run directly
if (require.main === module) {
  // Run the job immediately
  processShippingReports();
}

/**
 * Schedule the cron job based on configuration
 */
export const scheduleProcessReportsJob = () => {
  logger.info(
    `Scheduling process reports job with cron pattern: ${config.cron.processReports}`
  );

  cron.schedule(config.cron.processReports, processShippingReports, {
    timezone: "Europe/Paris", // Adjust timezone as needed
  });

  logger.info("Process reports cron job scheduled successfully");
};

export default scheduleProcessReportsJob;
