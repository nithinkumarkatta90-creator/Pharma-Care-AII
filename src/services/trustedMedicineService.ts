import {
  collection,
  endAt,
  getDocs,
  limit,
  orderBy,
  query,
  startAt,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TrustedMedicineRecord } from '../types/trusted-medicine';

export const TRUSTED_MEDICINE_COLLECTIONS = [
  'ip_drugs',
  'drug_labels',
  'drug_names',
  'drug_classes',
  'regulatory_alerts',
  'verified_medicines',
] as const;

const normalize = (value: string) => value.trim().toLowerCase();

async function searchCollection(collectionName: string, term: string) {
  const normalized = normalize(term);
  const q = query(
    collection(db, collectionName),
    where('sourceStatus', '==', 'verified'),
    orderBy('nameLower'),
    startAt(normalized),
    endAt(`${normalized}\uf8ff`),
    limit(10),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    collectionName,
    ...doc.data(),
  })) as TrustedMedicineRecord[];
}

export const trustedMedicineService = {
  async search(term: string) {
    if (normalize(term).length < 2) {
      return [];
    }

    const results = await Promise.all(
      TRUSTED_MEDICINE_COLLECTIONS.map((collectionName) => searchCollection(collectionName, term)),
    );

    return results.flat();
  },

  async getBestVerifiedRecord(term: string) {
    const results = await this.search(term);
    const normalized = normalize(term);

    return (
      results.find((record) => record.nameLower === normalized) ||
      results.find((record) => record.genericName?.toLowerCase() === normalized) ||
      results[0] ||
      null
    );
  },
};
