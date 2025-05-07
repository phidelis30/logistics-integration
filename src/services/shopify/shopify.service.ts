import Shopify from "shopify-api-node";
import { ShopifyStoreConfig, stores } from "../../config/stores";
import logger from "../../utils/logger";
import { CmdcliOrder, CmdcliLineItem } from "../../types/cmdcli.types";

export class ShopifyService {
  private clients: Record<string, Shopify> = {};

  constructor() {
    // Initialize Shopify clients for each store
    Object.entries(stores).forEach(([id, config]) => {
      this.clients[id] = new Shopify({
        shopName: config.shopName,
        apiKey: config.apiKey,
        password: config.apiSecretKey,
        apiVersion: config.apiVersion,
      });
    });
  }

  /**
   * Get pending orders for a specific store
   */
  async getPendingOrders(storeId: string, limit = 250): Promise<any[]> {
    try {
      const client = this.clients[storeId];
      if (!client) {
        throw new Error(`No Shopify client found for store: ${storeId}`);
      }

      // Get orders with financial_status: paid and fulfillment_status: null (unfulfilled)
      const orders = await client.order.list({
        limit,
        financial_status: "paid",
        // fulfillment_status: "null",
        status: "open",
      });

      logger.info(`Retrieved ${orders.length} pending orders from ${storeId}`);
      return orders;
    } catch (error) {
      logger.error(`Error getting pending orders from ${storeId}:`, error);
      throw error;
    }
  }

  /**
   * Convert Shopify order to CMDCLI order format
   */
  convertToCmdcliOrder(
    shopifyOrder: any,
    storeConfig: ShopifyStoreConfig
  ): CmdcliOrder {
    const { shipping_address, billing_address, line_items } = shopifyOrder;

    // Format date to YYYYMMDD
    const orderDate = new Date(shopifyOrder.created_at);
    const formattedDate = `${orderDate.getFullYear()}${String(
      orderDate.getMonth() + 1
    ).padStart(2, "0")}${String(orderDate.getDate()).padStart(2, "0")}`;

    // Create line items
    const lineItems: CmdcliLineItem[] = line_items.map(
      (item: any, index: number) => ({
        IDLIGNE: `${shopifyOrder.id}-${index}`,
        CODARTI: item.sku || item.product_id.toString(),
        QTTECDE: item.quantity,
        DESARTI: item.title,
        PRXUTHT: item.price,
        PRXUTTC:
          parseFloat(item.price) *
          (1 + parseFloat(item.tax_lines?.[0]?.rate || "0")),
      })
    );

    // Build CMDCLI order object
    const cmdcliOrder: CmdcliOrder = {
      CODACTI: storeConfig.name,
      IDORDER: shopifyOrder.order_number.toString(),
      DATECDE: formattedDate,
      LIVRAISON: {
        LIVRNOM: shipping_address?.last_name || "",
        LIVPNOM: shipping_address?.first_name || "",
        LIVADR1: shipping_address?.address1 || "",
        LIVADR2: shipping_address?.address2 || "",
        LIVCPOS: shipping_address?.zip || "",
        LIVVILL: shipping_address?.city || "",
        LIVPAYS: shipping_address?.country_code || "",
        LIVRTEL: shipping_address?.phone || "",
        LIVMAIL: shopifyOrder.email || "",
      },
      FACTURE: {
        FACTNOM: billing_address?.last_name || "",
        FACPNOM: billing_address?.first_name || "",
        FACADR1: billing_address?.address1 || "",
        FACADR2: billing_address?.address2 || "",
        FACCPOS: billing_address?.zip || "",
        FACVILL: billing_address?.city || "",
        FACPAYS: billing_address?.country_code || "",
        FACRTEL: billing_address?.phone || "",
        FACMAIL: shopifyOrder.email || "",
        MODPAIE: shopifyOrder.gateway || "",
        TOTALTC: parseFloat(shopifyOrder.total_price),
        TOTALHT: parseFloat(shopifyOrder.subtotal_price),
        MTFPORT: parseFloat(shopifyOrder.shipping_lines?.[0]?.price || "0"),
      },
      LIGNE: lineItems,
    };

    // Add transport information if available
    if (shopifyOrder.shipping_lines && shopifyOrder.shipping_lines.length > 0) {
      cmdcliOrder.TRANSPORT = {
        TRPCONT: shopifyOrder.shipping_lines[0].title || "",
        TRPINST: shopifyOrder.note || "",
      };
    }

    return cmdcliOrder;
  }

  /**
   * Update order status based on CRPCMD report
   */
  async updateOrderStatus(
    storeId: string,
    orderId: string,
    trackingNumber: string,
    status: string
  ): Promise<void> {
    try {
      const client = this.clients[storeId];
      if (!client) {
        throw new Error(`No Shopify client found for store: ${storeId}`);
      }

      // Find the order by order number
      const orders = await client.order.list({
        status: "any",
        name: orderId,
      });

      if (orders.length === 0) {
        throw new Error(`Order not found: ${orderId}`);
      }

      const order = orders[0];

      // Create fulfillment with tracking info
      if (status === "10") {
        // Preparation completed
        await client.fulfillment.create(order.id, {
          tracking_number: trackingNumber,
          notify_customer: true,
        });
        logger.info(
          `Updated order ${orderId} status to fulfilled with tracking: ${trackingNumber}`
        );
      } else if (status === "15") {
        // Preparation in progress
        // Update order note or tag as needed
        await client.order.update(order.id, {
          note: "Preparation in progress",
          tags: "In Progress",
        });
        logger.info(`Updated order ${orderId} status to in progress`);
      } else if (status === "20") {
        // Preparation canceled
        // Cancel the order
        await client.order.cancel(order.id);
        logger.info(`Cancelled order ${orderId}`);
      }
    } catch (error) {
      logger.error(`Error updating status for order ${orderId}:`, error);
      throw error;
    }
  }
}
