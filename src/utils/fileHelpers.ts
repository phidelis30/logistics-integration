import fs from "fs-extra";
import path from "path";
import moment from "moment";
import logger from "./logger";
import { config } from "../config";

/**
 * Creates a filename for CMDCLI files with store prefix
 */
export const createCmdcliFileName = (storePrefix: string): string => {
  const timestamp = moment().format("YYYYMMDDHHmmss");
  // return `${storePrefix}_CMDCLI${timestamp}.xml`;
  return `CMDCLI${timestamp}.xml`;
};

/**
 * Extracts store prefix from CRPCMD filename
 */
export const extractStorePrefixFromFilename = (
  filename: string
): string | null => {
  const match = filename.match(/^([A-Z]+)_CRPCMD/);
  return match ? match[1] : null;
};

/**
 * Saves XML content to a file
 */
export const saveXmlFile = async (
  content: string,
  filename: string,
  dirPath: string
): Promise<string> => {
  try {
    // Ensure directory exists
    await fs.ensureDir(dirPath);

    const filePath = path.join(dirPath, filename);
    await fs.writeFile(filePath, content, "utf8");
    logger.info(`File saved successfully: ${filePath}`);

    return filePath;
  } catch (error) {
    logger.error(`Error saving file ${filename}:`, error);
    throw error;
  }
};

/**
 * Moves a file to backup directory with timestamp
 */
export const backupFile = async (filePath: string): Promise<string> => {
  try {
    const filename = path.basename(filePath);
    const timestamp = moment().format("YYYYMMDDHHmmss");
    const backupFilename = `${timestamp}_${filename}`;
    const backupPath = path.join(config.paths.backups, backupFilename);

    // Ensure backup directory exists
    await fs.ensureDir(config.paths.backups);

    await fs.copy(filePath, backupPath);
    logger.info(`File backed up: ${backupPath}`);

    return backupPath;
  } catch (error) {
    logger.error(`Error backing up file ${filePath}:`, error);
    throw error;
  }
};

/**
 * Reads and returns the content of a file
 */
export const readFile = async (filePath: string): Promise<string> => {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    logger.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
};
