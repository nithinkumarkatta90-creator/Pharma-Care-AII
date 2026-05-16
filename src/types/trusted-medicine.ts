export type TrustedSourceKey =
  | 'IPC_IP'
  | 'DAILYMED_OPENFDA'
  | 'RXNORM'
  | 'WHO_ATC'
  | 'CDSCO_FDA_ALERT'
  | 'MANUAL_VERIFIED';

export interface TrustedCitation {
  sourceKey: TrustedSourceKey;
  sourceName: string;
  sourceUrl?: string;
  retrievedAt: string;
  documentId?: string;
  revisionDate?: string;
}

export interface TrustedMedicineRecord {
  id?: string;
  collectionName: string;
  sourceStatus: 'verified' | 'draft' | 'retired';
  name: string;
  nameLower: string;
  genericName?: string;
  brandNames?: string[];
  category?: string;
  summary?: string;
  uses?: string[];
  dosageForms?: string[];
  warnings?: string[];
  contraindications?: string[];
  sideEffects?: string[];
  storage?: string;
  sourceText?: string;
  citations: TrustedCitation[];
  updatedAt?: unknown;
}
