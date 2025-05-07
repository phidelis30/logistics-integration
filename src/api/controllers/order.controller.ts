import { NextFunction, Request, Response } from "express";
import { stores } from "../../config/stores";
import logger from "../../utils/logger";
import { CmdcliService } from "../../services/logistics/cmdcli.service";
import { CrpcmdService } from "../../services/logistics/crpcmd.service";

// Create service instances
const cmdcliService = new CmdcliService();
const crpcmdService = new CrpcmdService();

/**
 * Process pending order for a specific store with webhook
 */

export const processPendingOrderWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { storeId } = req.params;
    const order = req.body;

    // Validate storeId
    if (!storeId || !stores[storeId]) {
      return res.status(400).json({ error: `Invalid store ID: ${storeId}` });
    }

    logger.info(`API request to process pending order for store: ${storeId}`);

    // Process orders for specific store
    const files = await cmdcliService.processPendingOrders(storeId, order);

    return res.status(200).json({
      success: true,
      storeId,
      filesProcessed: files.length,
      files,
    });
  } catch (error: any) {
    logger.error(`Error processing pending order webhook:`, error);
    next(error);
  }
};

/**
 * Process pending orders for a specific store
 */
export const processPendingOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { storeId } = req.params;

    // Validate storeId
    if (!storeId || !stores[storeId]) {
      return res.status(400).json({ error: `Invalid store ID: ${storeId}` });
    }

    logger.info(`API request to process pending orders for store: ${storeId}`);

    // Process orders for specific store
    const files = await cmdcliService.processPendingOrders(storeId);

    return res.status(200).json({
      success: true,
      storeId,
      filesProcessed: files.length,
      files,
    });
  } catch (error: any) {
    logger.error(`Error processing pending orders:`, error);
    next(error);
  }
};

/**
 * Process pending orders for all stores
 */
export const processAllPendingOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    logger.info("API request to process all pending orders");

    // Process orders for all stores
    const results = await cmdcliService.processAllPendingOrders();

    // Calculate total files processed
    const totalFiles = Object.values(results).reduce(
      (sum, files) => sum + files.length,
      0
    );

    return res.status(200).json({
      success: true,
      totalFilesProcessed: totalFiles,
      storeResults: results,
    });
  } catch (error: any) {
    logger.error(`Error processing all pending orders:`, error);
    next(error);
  }
};

/**
 * Process shipping reports (CRPCMD files)
 */
export const processShippingReports = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    logger.info("API request to process shipping reports");

    // Download and process reports from L4
    const downloadedCount = await crpcmdService.retrieveAndProcessFiles();

    // Process any local files
    const localCount = await crpcmdService.processLocalFiles();

    return res.status(200).json({
      success: true,
      filesProcessed: {
        downloaded: downloadedCount,
        local: localCount,
        total: downloadedCount + localCount,
      },
    });
  } catch (error: any) {
    logger.error(`Error processing shipping reports:`, error);
    next(error);
  }
};
