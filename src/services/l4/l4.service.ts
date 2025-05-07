import path from "path";
import { config } from "../../config";
import logger from "../../utils/logger";
import { backupFile } from "../../utils/fileHelpers";
import SftpClient from "ssh2-sftp-client";

export class FileTransferService {
  /**
   * Send CMDCLI file to L4 via SFTP
   */
  async sendCmdcliFile(filePath: string): Promise<void> {
    try {
      // In a real implementation, you would use an SFTP client:
      const sftp = new SftpClient();
      await sftp.connect({
        host: config.l4.host,
        port: config.l4.port,
        username: config.l4.username,
        password: config.l4.password,
      });

      logger.info(`Sending file to L4: ${filePath}`);

      // Simulate file transfer with a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real implementation:
      const remotePath = path.join(
        config.l4.cmdcliRemotePath,
        path.basename(filePath)
      );
      await sftp.put(filePath, remotePath);
      await sftp.end();

      // Create backup of sent file
      await backupFile(filePath);

      logger.info(`Successfully sent file to L4: ${filePath}`);
    } catch (error) {
      logger.error(`Error sending file to L4: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Download CRPCMD files from L4 via SFTP
   */
  async downloadCrpcmdFiles(): Promise<string[]> {
    try {
      // In a real implementation, you would use an SFTP client:
      const sftp = new SftpClient();
      await sftp.connect({
        host: config.l4.host,
        port: config.l4.port,
        username: config.l4.username,
        password: config.l4.password,
      });

      logger.info("Downloading CRPCMD files from L4");

      // Simulate file listing with a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real implementation:
      const remoteFiles = await sftp.list(config.l4.crpcmdRemotePath);
      const crpcmdFiles = remoteFiles.filter(
        (file) => file.name.includes("CRPCMD") && file.name.endsWith(".xml")
      );

      // For demonstration, we'll assume no files are found
      const downloadedFiles: string[] = [];

      // In a real implementation:
      for (const file of crpcmdFiles) {
        const remotePath = path.join(config.l4.crpcmdRemotePath, file.name);
        const localPath = path.join(config.paths.crpcmdIncoming, file.name);

        await sftp.get(remotePath, localPath);
        downloadedFiles.push(localPath);
      }

      await sftp.end();

      logger.info(`Downloaded ${downloadedFiles.length} CRPCMD files from L4`);
      return downloadedFiles;
    } catch (error) {
      logger.error("Error downloading CRPCMD files from L4:", error);
      throw error;
    }
  }

  /**
   * Process move crpcmd file to archive folder in l4
   */
  async processMoveCrpcmdFileToArchive(fileName: string): Promise<void> {
    let sftp: SftpClient | null = null;
    try {
      // Initialize SFTP client
      sftp = new SftpClient();
      await sftp.connect({
        host: config.l4.host,
        port: config.l4.port,
        username: config.l4.username,
        password: config.l4.password,
      });

      logger.info(`Moving CRPCMD file to archive: ${fileName}`);

      const sourcePath = path.join(config.l4.crpcmdRemotePath, fileName);
      const archivePath = path.join(config.l4.crpcmdArchivePath, fileName);

      // Check if file exists in source directory
      const exists = await sftp.exists(sourcePath);
      if (!exists) {
        throw new Error(`Source file not found: ${sourcePath}`);
      }

      // Ensure archive directory exists
      await sftp.mkdir(config.l4.crpcmdArchivePath, true);

      // Move file to archive
      await sftp.rename(sourcePath, archivePath);

      logger.info(`Successfully archived file ${fileName} in L4`);
    } catch (error) {
      logger.error(`Error archiving file ${fileName} in L4:`, error);
      throw error;
    } finally {
      if (sftp) {
        await sftp.end();
      }
    }
  }
}
