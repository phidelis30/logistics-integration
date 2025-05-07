import dotenv from "dotenv";
import path from "path";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  environment: process.env.NODE_ENV || "development",

  // File paths
  paths: {
    cmdcliOutgoing:
      process.env.CMDCLI_OUTGOING_PATH ||
      path.join(__dirname, "../../files/cmdcli/outgoing"),
    crpcmdIncoming:
      process.env.CRPCMD_INCOMING_PATH ||
      path.join(__dirname, "../../files/crpcmd/incoming"),
    backups:
      process.env.BACKUP_PATH || path.join(__dirname, "../../files/backups"),
  },

  // L4 SFTP configuration
  l4: {
    host: process.env.L4_SFTP_HOST || "",
    port: parseInt(process.env.L4_SFTP_PORT || "22", 10),
    username: process.env.L4_SFTP_USERNAME || "",
    password: process.env.L4_SFTP_PASSWORD || "",
    cmdcliRemotePath: process.env.L4_CMDCLI_REMOTE_PATH || "/IN",
    crpcmdRemotePath: process.env.L4_CRPCMD_REMOTE_PATH || "/OUT",
    crpcmdArchivePath: process.env.L4_CRPCMD_ARCHIVE_PATH || "/OUT/ARCHIVES",
  },

  // API configuration
  api: {
    secret: process.env.API_SECRET || "default-secret-key",
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },

  // Cron schedules
  cron: {
    sendOrders: process.env.CRON_SEND_ORDERS || "0 */1 * * *", // Every hour
    processReports: process.env.CRON_PROCESS_REPORTS || "*/30 * * * *", // Every 30 minutes
  },
};
