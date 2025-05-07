import fs from "fs-extra";
import path from "path";
import { stores } from "../../config/stores";
import { config } from "../../config";
import logger from "../../utils/logger";
import {
  extractStorePrefixFromFilename,
  backupFile,
  readFile,
} from "../../utils/fileHelpers";
import { parseCrpcmdXml } from "../../utils/xml";
import { CrpcmdFile, CrpcmdOrder } from "../../types/crpcmd.types";
import { ShopifyService } from "../shopify/shopify.service";
import { FileTransferService } from "../l4/l4.service";

export class CrpcmdService {
  private shopifyService: ShopifyService;
  private fileTransferService: FileTransferService;

  constructor() {
    this.shopifyService = new ShopifyService();
    this.fileTransferService = new FileTransferService();
  }

  /**
   * Process a single CRPCMD file
   */
  async processCrpcmdFile(filePath: string): Promise<void> {
    try {
      logger.info(`Processing CRPCMD file: ${filePath}`);

      const filename = path.basename(filePath);
      const storePrefix = extractStorePrefixFromFilename(filename);

      if (!storePrefix) {
        throw new Error(
          `Could not extract store prefix from filename: ${filename}`
        );
      }

      // Find store ID by prefix
      const storeId = Object.keys(stores).find(
        (id) => stores[id].prefix === storePrefix
      );

      if (!storeId) {
        throw new Error(`No store found for prefix: ${storePrefix}`);
      }

      // Read and parse XML file
      const xmlContent = await readFile(filePath);
      const crpcmdData = await parseCrpcmdXml(xmlContent);

      // Process each order in the file
      const processResults = await this.processOrders(crpcmdData, storeId);

      // If all orders were processed successfully
      if (processResults.every((result) => result.success)) {
        // Move the file to archive in L4
        await this.fileTransferService.processMoveCrpcmdFileToArchive(filename);

        // Delete the local file
        await fs.remove(filePath);

        logger.info(
          `Successfully processed and archived CRPCMD file: ${filename}`
        );
      } else {
        logger.warn(`Some orders failed to process in file: ${filename}`);
        throw new Error("Not all orders were processed successfully");
      }
    } catch (error) {
      logger.error(`Error processing CRPCMD file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Process all CRPCMD orders in the file
   */
  private async processOrders(
    crpcmdData: CrpcmdFile,
    storeId: string
  ): Promise<Array<{ orderId: string; success: boolean }>> {
    if (!crpcmdData.CRORDERS || !crpcmdData.CRORDERS.CRORDER) {
      logger.warn("No orders found in CRPCMD file");
      return [];
    }

    const orders = Array.isArray(crpcmdData.CRORDERS.CRORDER)
      ? crpcmdData.CRORDERS.CRORDER
      : [crpcmdData.CRORDERS.CRORDER];

    const results = await Promise.all(
      orders.map((order) => this.processOrder(order, storeId))
    );

    return results;
  }

  /**
   * Process a single order from CRPCMD
   */
  private async processOrder(
    order: CrpcmdOrder,
    storeId: string
  ): Promise<{ orderId: string; success: boolean }> {
    try {
      logger.info(
        `Processing order ${order.IDORDER} with status ${order.ETAPREP}`
      );

      // Get tracking number if available
      let trackingNumber = "";
      if (order.COLIS && order.COLIS.length > 0) {
        trackingNumber = order.COLIS[0].TRACKEX || "";
      }

      // Update order status in Shopify
      await this.shopifyService.updateOrderStatus(
        storeId,
        order.IDORDER,
        trackingNumber,
        order.ETAPREP
      );

      logger.info(
        `Successfully updated order ${order.IDORDER} status in Shopify`
      );

      return { orderId: order.IDORDER, success: true };
    } catch (error) {
      logger.error(`Error processing order ${order.IDORDER}:`, error);
      return { orderId: order.IDORDER, success: false };
    }
  }

  /**
   * Retrieve and process CRPCMD files from L4
   */
  async retrieveAndProcessFiles(): Promise<number> {
    try {
      // Download files from L4
      const downloadedFiles =
        await this.fileTransferService.downloadCrpcmdFiles();

      if (downloadedFiles.length === 0) {
        logger.info("No new CRPCMD files found");
        return 0;
      }

      // Process each downloaded file
      for (const filePath of downloadedFiles) {
        try {
          await this.processCrpcmdFile(filePath);
        } catch (error) {
          logger.error(`Failed to process file ${filePath}:`, error);
          // Continue with other files even if one fails
        }
      }

      return downloadedFiles.length;
    } catch (error) {
      logger.error("Error retrieving and processing CRPCMD files:", error);
      throw error;
    }
  }

  /**
   * Process local CRPCMD files (for manual testing or recovery)
   */
  async processLocalFiles(): Promise<number> {
    try {
      // Get all XML files in the CRPCMD incoming directory
      const files = await fs.readdir(config.paths.crpcmdIncoming);
      const xmlFiles = files.filter(
        (file) => file.includes("CRPCMD") && file.endsWith(".xml")
      );

      if (xmlFiles.length === 0) {
        logger.info("No CRPCMD files found in local directory");
        return 0;
      }

      // Process each file
      for (const filename of xmlFiles) {
        const filePath = path.join(config.paths.crpcmdIncoming, filename);

        try {
          await this.processCrpcmdFile(filePath);
        } catch (error) {
          logger.error(`Failed to process local file ${filename}:`, error);
          // Continue with other files even if one fails
        }
      }

      return xmlFiles.length;
    } catch (error) {
      logger.error("Error processing local CRPCMD files:", error);
      throw error;
    }
  }
}
