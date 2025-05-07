export interface CrpcmdProductDetails {
  NOSERIE?: string; // Serial number
  DLVARTI?: string; // Expiration date
  NOSLOTS?: string; // Batch number
}

export interface CrpcmdLineInPackage {
  CODARTI: string; // Product SKU
  QTTEEXP: number; // Quantity shipped
  PRODUIT?: CrpcmdProductDetails[];
}

export interface CrpcmdPackage {
  IDCOLIS: string; // Package ID
  IDPALET?: string; // Pallet ID
  TRACKEX?: string; // Tracking number
  REFEXPE?: string; // Shipment reference
  SSCCPAL?: string; // SSCC code for pallet
  SSCCCOL?: string; // SSCC code for package
  DATECON?: string; // Preparation date
  DATECHG?: string; // Shipment date
  POIDCOL?: number; // Package weight
  VOLUCOL?: number; // Package volume
  EMBLCOL?: string; // Packaging type
  LIGNECOLIS: CrpcmdLineInPackage[];
}

export interface CrpcmdOrderLine {
  IDLIGNE: string; // Line ID (matches CMDCLI)
  IDLNGL4?: string; // Internal line ID (L4)
  QTTECDE: number; // Quantity ordered
  QTTEPRP: number; // Quantity prepared
}

export interface CrpcmdOrder {
  CODACTI: string; // Activity code
  CODSACT?: string; // Sub-activity code
  IDORDER: string; // Order ID (matches CMDCLI)
  CLORDER?: string; // Internal order ID (L4)
  ETAPREP: string; // Preparation status (10=Complete, 15=In Progress, 20=Canceled)
  DATETRT?: string; // First package preparation date
  DATEEXP?: string; // Last package shipment date
  IDCANAL?: string; // Sales channel
  TYPECDE?: string; // Order type
  QUANTUM?: number; // Number of shipping units
  TYPEEXP?: string; // Type of shipping unit (PAL, COL)
  NBCOLIS?: number; // Number of packages
  NBPALET?: number; // Number of pallets
  POIDTOT?: number; // Total weight
  VOLUTOT?: number; // Total volume
  LIGNE: CrpcmdOrderLine[];
  COLIS?: CrpcmdPackage[];
}

export interface CrpcmdFile {
  CRORDERS: {
    CRORDER: CrpcmdOrder[];
  };
}
