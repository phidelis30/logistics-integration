export interface CmdcliDeliveryInfo {
  LIVCIVI?: string; // Title (Mr., Mrs.)
  LIVRNOM: string; // Last name
  LIVPNOM: string; // First name
  LIVSCTE?: string; // Company name
  LIVADR1: string; // Address line 1
  LIVADR2?: string; // Address line 2
  LIVADR3?: string; // Address line 3
  LIVCPOS: string; // Postal code
  LIVVILL: string; // City
  LIVPAYS: string; // Country code ISO 3166-1 alpha-2
  LIVRTEL?: string; // Phone number
  LIVMAIL: string; // Email address
  LIVMAGA?: string; // Store code (B2B)
  LIVOPTN?: string; // Delivery instructions
}

export interface CmdcliBillingInfo {
  FACCIVI?: string; // Title
  FACTNOM: string; // Last name
  FACPNOM: string; // First name
  FACSCTE?: string; // Company name
  FACADR1: string; // Address line 1
  FACADR2?: string; // Address line 2
  FACADR3?: string; // Address line 3
  FACCPOS: string; // Postal code
  FACVILL: string; // City
  FACPAYS: string; // Country code
  FACRTEL?: string; // Phone number
  FACMAIL?: string; // Email
  IDFACTU?: string; // Invoice number
  DATEFAC?: string; // Invoice date
  MODPAIE?: string; // Payment method
  DEVPAIE?: string; // Currency ISO-4217
  TOTALHT?: number; // Total excluding tax
  TOTALTC?: number; // Total including tax
  MTFPORT?: number; // Shipping costs
}

export interface CmdcliTransportInfo {
  TRPCONT?: string; // Carrier code
  TRPGEST?: string; // Service/product code
  IDPOINT?: string; // Relay point ID
  CPPOINT?: string; // Country code of relay point
  TRPINST?: string; // Special instructions
  IMPELIV?: string; // Saturday delivery flag (O/N)
  TRPCRBT?: string; // COD flag (O/N)
  MOTCRBT?: number; // COD amount
}

export interface CmdcliProcessingInfo {
  PRIORIT?: number; // Priority level
  ASILECDE?: string; // Parcel cage requirement (O/N)
  TYPEKDO?: string; // Gift wrapping flag (O/N)
  MESGCDE?: string; // Packing slip message
  MESGKDO?: string; // Gift message
}

export interface CmdcliLineItem {
  IDLIGNE: string; // Line ID
  CODARTI: string; // Product SKU
  QTTECDE: number; // Quantity ordered
  QTTREST?: number; // Remaining quantity
  PRXUTHT?: number; // Unit price excl. tax
  PRXUTTC?: number; // Unit price incl. tax
  DESARTI?: string; // Product description
  MESGART?: string; // Product comments
}

export interface CmdcliOrder {
  CODACTI: string; // Activity code
  LIBACTI?: string; // Activity name
  IDORDER: string; // Order ID
  CLORDER?: string; // Internal order ID
  TYPTRAI?: string; // Processing type
  ETATCDE?: string; // Order status
  DATECDE: string; // Order date (YYYYMMDD)
  DATEPRP?: string; // Preparation date
  IDCANAL?: string; // Sales channel
  TYPECDE?: string; // Order type
  LIVRAISON: CmdcliDeliveryInfo;
  FACTURE: CmdcliBillingInfo;
  TRANSPORT?: CmdcliTransportInfo;
  TRAITEMENT?: CmdcliProcessingInfo;
  LIGNE: CmdcliLineItem[];
}

export interface CmdcliFile {
  ORDERS: {
    ORDER: CmdcliOrder[];
  };
}
