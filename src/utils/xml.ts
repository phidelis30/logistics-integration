import { parseString, Builder } from "xml2js";
import { CmdcliFile } from "../types/cmdcli.types";
import { CrpcmdFile } from "../types/crpcmd.types";

/**
 * Converts JS object to XML string
 */
export const objectToXml = (obj: any): string => {
  const builder = new Builder({
    xmldec: { version: "1.0", encoding: "ISO-8859-1" },
    renderOpts: { pretty: true, indent: "  " },
  });
  return builder.buildObject(obj);
};

/**
 * Parses XML string to JS object
 */
export const xmlToObject = async <T>(xml: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    parseString(xml, { explicitArray: false }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result as T);
      }
    });
  });
};

/**
 * Creates CMDCLI XML file content from order data
 */
export const createCmdcliXml = (data: CmdcliFile): string => {
  return objectToXml(data);
};

/**
 * Parse CRPCMD XML file content to object
 */
export const parseCrpcmdXml = async (xml: string): Promise<CrpcmdFile> => {
  return await xmlToObject<CrpcmdFile>(xml);
};
