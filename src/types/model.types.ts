export default interface ModelTypes {
  id: number;
  nameFile: string; // Name of the file
  status: string; // e.g., 'success', 'error'
  storeId: string; // Store ID associated with the record
  dateFile: Date; // Date when the file was processed or created
}
