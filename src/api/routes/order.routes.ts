import express from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  processAllPendingOrders,
  processPendingOrders,
  processPendingOrderWebhook,
  processShippingReports,
} from "../controllers/order.controller";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Routes for processing orders
router.post("/process/webhook/:storeId", processPendingOrderWebhook);
router.post("/process/:storeId", processPendingOrders);
router.post("/process-all", processAllPendingOrders);
router.post("/shipping-reports", processShippingReports);

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

export default router;
