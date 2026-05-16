import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MedicineQRData, ScanResult, QRScanRecord, FakeReport, VerifiedMedicine } from '../types/qr';

export const qrService = {
  async verifyMedicine(data: MedicineQRData): Promise<ScanResult> {
    // Check if expired
    const expDate = new Date(data.expDate);
    const now = new Date();
    if (expDate < now) {
      return 'Expired';
    }

    // Check in verifiedMedicines collection
    const q = query(
      collection(db, 'verifiedMedicines'),
      where('approvalNo', '==', data.approvalNo),
      where('batchNo', '==', data.batchNo)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return 'Not Verified';
    }

    const verifiedData = querySnapshot.docs[0].data() as VerifiedMedicine;
    return verifiedData.status === 'Genuine' ? 'Genuine' : 'Fake';
  },

  async saveScanHistory(userId: string, data: MedicineQRData, rawData: string, result: ScanResult) {
    const record: QRScanRecord = {
      userId,
      qrRawData: rawData,
      medicineName: data.medicineName,
      approvalNo: data.approvalNo,
      batchNo: data.batchNo,
      manufacturer: data.manufacturer,
      expDate: data.expDate,
      scanResult: result,
      scannedAt: serverTimestamp()
    };

    return await addDoc(collection(db, 'qrScans'), record);
  },

  async reportFake(report: Omit<FakeReport, 'id' | 'reportedAt'>) {
    const fullReport: FakeReport = {
      ...report,
      reportedAt: serverTimestamp()
    };

    return await addDoc(collection(db, 'fakeReports'), fullReport);
  }
};
