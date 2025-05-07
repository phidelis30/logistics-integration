import cron from "node-cron";
import { config } from "../config";
import logger from "../utils/logger";
import { CmdcliService } from "../services/logistics/cmdcli.service";

// Create a singleton instance
const cmdcliService = new CmdcliService();

/**
 * Process and send all pending orders for all stores
 */
export const processPendingOrders = async () => {
  try {
    logger.info("Starting scheduled job: Process pending orders");

    const results = await cmdcliService.processAllPendingOrders();

    // Log results for each store
    Object.entries(results).forEach(([storeId, files]) => {
      logger.info(`Processed ${files.length} files for ${storeId}`);
    });

    logger.info("Finished processing pending orders");
  } catch (error) {
    logger.error("Error in cron job: Process pending orders", error);
  }
};

// If this file is run directly
if (require.main === module) {
  // Run the job immediately
  processPendingOrders();
}

/**
 * Schedule the cron job based on configuration
 */
export const scheduleSendOrdersJob = () => {
  logger.info(
    `Scheduling send orders job with cron pattern: ${config.cron.sendOrders}`
  );

  cron.schedule(config.cron.sendOrders, processPendingOrders, {
    timezone: "Europe/Paris", // Adjust timezone as needed
  });

  logger.info("Send orders cron job scheduled successfully");
};

export default scheduleSendOrdersJob;
