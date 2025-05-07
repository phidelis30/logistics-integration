import { stores } from "../../config/stores";
import { config } from "../../config";
import logger from "../../utils/logger";
import { createCmdcliFileName, saveXmlFile } from "../../utils/fileHelpers";
import { createCmdcliXml } from "../../utils/xml";
import { CmdcliFile, CmdcliOrder } from "../../types/cmdcli.types";
import { FileTransferService } from "../l4/l4.service";
import { ShopifyService } from "../shopify/shopify.service";

export class CmdcliService {
  private shopifyService: ShopifyService;
  private fileTransferService: FileTransferService;

  constructor() {
    this.shopifyService = new ShopifyService();
    this.fileTransferService = new FileTransferService();
  }

  /**
   * Process pending orders for a specific store
   */
  async processPendingOrders(storeId: string, order?: any): Promise<string[]> {
    try {
      const storeConfig = stores[storeId];
      if (!storeConfig) {
        throw new Error(`Store configuration not found for: ${storeId}`);
      }

      let cmdcliOrders: CmdcliOrder[];

      if (!order) {
        // Get pending orders from Shopify
        const pendingOrders = await this.shopifyService.getPendingOrders(
          storeId
        );

        if (pendingOrders.length === 0) {
          logger.info(`No pending orders found for ${storeId}`);
          return [];
        }

        logger.info(`Processing ${pendingOrders.length} orders for ${storeId}`);

        // Convert Shopify orders to CMDCLI format
        cmdcliOrders = pendingOrders.map((order) =>
          this.shopifyService.convertToCmdcliOrder(order, storeConfig)
        );
      } else {
        // Convert a single order to CMDCLI format
        cmdcliOrders = [
          this.shopifyService.convertToCmdcliOrder(order, storeConfig),
        ];
      }

      // Create CMDCLI file content
      const cmdcliFile: CmdcliFile = {
        ORDERS: {
          ORDER: cmdcliOrders,
        },
      };

      const xmlContent = createCmdcliXml(cmdcliFile);

      // Save file locally
      const filename = createCmdcliFileName(storeConfig.prefix);
      const filePath = await saveXmlFile(
        xmlContent,
        filename,
        config.paths.cmdcliOutgoing
      );

      // Send file to L4
      await this.fileTransferService.sendCmdcliFile(filePath);
      logger.info(`Successfully processed and sent CMDCLI file for ${storeId}`);

      return [filePath];
    } catch (error) {
      logger.error(`Error processing pending orders for ${storeId}:`, error);
      throw error;
    }
  }

  /**
   * Process pending orders for all stores
   */
  async processAllPendingOrders(): Promise<Record<string, string[]>> {
    const results: Record<string, string[]> = {};

    for (const storeId of Object.keys(stores)) {
      try {
        results[storeId] = await this.processPendingOrders(storeId);
      } catch (error) {
        logger.error(`Failed to process orders for ${storeId}:`, error);
        results[storeId] = [];
      }
    }

    return results;
  }
}
