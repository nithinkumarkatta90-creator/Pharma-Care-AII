import { db } from '../lib/firebase';
import { collection, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore';

export interface IPDrug {
  id?: string;
  name: string;
  category: string;
  description: string;
  dosage: string;
  sideEffects: string[];
  updatedAt?: any;
}

export const ipDatabaseService = {
  async getDrugs(): Promise<IPDrug[]> {
    const querySnapshot = await getDocs(collection(db, 'ip_drugs'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IPDrug));
  },

  async updateDatabase(drugs: IPDrug[]) {
    // This function simulates a self-update mechanism
    // In a real app, this would fetch from an API or file
    const promises = drugs.map(drug => {
      const drugRef = doc(collection(db, 'ip_drugs'));
      return setDoc(drugRef, {
        ...drug,
        updatedAt: serverTimestamp()
      });
    });
    await Promise.all(promises);
  },

  async syncFromSource() {
    const response = await fetch('/api/sync-ip-drugs');
    const drugs = await response.json();
    await this.updateDatabase(drugs);
  }
};
