export interface MedicineQRData {
  medicineName: string;
  brandName: string;
  genericName: string;
  manufacturer: string;
  licenseNo: string;
  approvalNo: string;
  batchNo: string;
  mfgDate: string;
  expDate: string;
  mrp: string;
  dosageForm: string;
  strength: string;
  storage: string;
  schedule: string;
  serialNo: string;
  country: string;
}

export type ScanResult = 'Genuine' | 'Not Verified' | 'Expired' | 'Fake';

export interface QRScanRecord {
  id?: string;
  userId: string;
  qrRawData: string;
  medicineName: string;
  approvalNo: string;
  batchNo: string;
  manufacturer: string;
  expDate: string;
  scanResult: ScanResult;
  scannedAt: any; // Firestore Timestamp
}

export interface FakeReport {
  id?: string;
  userId: string;
  medicineName: string;
  batchNo: string;
  approvalNo: string;
  manufacturer: string;
  qrRawData: string;
  reportReason: string;
  reportedAt: any; // Firestore Timestamp
}

export interface VerifiedMedicine {
  id?: string;
  medicineName: string;
  approvalNo: string;
  batchNo: string;
  manufacturer: string;
  expDate: string;
  status: 'Genuine' | 'Fake';
}
