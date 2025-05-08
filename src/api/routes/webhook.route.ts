import express from "express";
import { processPendingOrderWebhook } from "../controllers/order.controller";

const router = express.Router();

// Routes for processing orders
router.post("/webhook/:storeId", processPendingOrderWebhook);

export default router;
