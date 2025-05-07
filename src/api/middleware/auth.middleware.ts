import { Request, Response, NextFunction } from "express";
import { config } from "../../config";
import logger from "../../utils/logger";

/**
 * Middleware to authenticate API requests using API key
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey || apiKey !== config.api.secret) {
      logger.warn(`Unauthorized API access attempt from ${req.ip}`);
      return res.status(401).json({ error: "Unauthorized" });
    }

    next();
  } catch (error) {
    logger.error("Authentication error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
