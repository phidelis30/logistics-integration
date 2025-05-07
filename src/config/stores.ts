export interface ShopifyStoreConfig {
  name: string;
  prefix: string;
  apiKey: string;
  apiSecretKey: string;
  shopName: string;
  apiVersion: string;
  webhookUrl?: string;
}

export const stores: Record<string, ShopifyStoreConfig> = {
  finger: {
    name: "Finger",
    prefix: "FINGER",
    apiKey: process.env.FINGER_API_KEY || "",
    apiSecretKey: process.env.FINGER_API_SECRET_KEY || "",
    shopName: process.env.FINGER_SHOP_NAME || "",
    apiVersion: "2025-01",
    webhookUrl: process.env.FINGER_WEBHOOK_URL,
  },
  smallable: {
    name: "Smallable",
    prefix: "SMALLABLE",
    apiKey: process.env.SMALLABLE_API_KEY || "",
    apiSecretKey: process.env.SMALLABLE_API_SECRET_KEY || "",
    shopName: process.env.SMALLABLE_SHOP_NAME || "",
    apiVersion: "2025-01",
    webhookUrl: process.env.SMALLABLE_WEBHOOK_URL,
  },
  lexception: {
    name: "L'Exception",
    prefix: "LEXCEPTION",
    apiKey: process.env.LEXCEPTION_API_KEY || "",
    apiSecretKey: process.env.LEXCEPTION_API_SECRET_KEY || "",
    shopName: process.env.LEXCEPTION_SHOP_NAME || "",
    apiVersion: "2025-01",
    webhookUrl: process.env.LEXCEPTION_WEBHOOK_URL,
  },
};
