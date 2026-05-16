import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { PatientMedicalHistory, MedicalDocument } from '../types/medical-history';

const COLLECTION_NAME = 'patient_medical_history';

export const medicalHistoryService = {
  async saveMedicalHistory(history: Omit<PatientMedicalHistory, 'id' | 'createdAt' | 'updatedAt'>) {
    const path = COLLECTION_NAME;
    try {
      const docRef = await addDoc(collection(db, path), {
        ...history,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async fetchMedicalHistory(uid: string) {
    const path = COLLECTION_NAME;
    try {
      const q = query(
        collection(db, path), 
        where('uid', '==', uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PatientMedicalHistory[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async updateMedicalHistory(id: string, history: Partial<PatientMedicalHistory>) {
    const path = `${COLLECTION_NAME}/${id}`;
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...history,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteMedicalHistory(id: string) {
    const path = `${COLLECTION_NAME}/${id}`;
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async uploadMedicalDocument(file: File, uid: string): Promise<MedicalDocument> {
    const storagePath = `medicalDocuments/${uid}/${Date.now()}_${file.name}`;
    try {
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);
      
      return {
        fileName: file.name,
        fileUrl,
        uploadedAt: new Date().toISOString(),
        fileType: file.type.includes('pdf') ? 'pdf' : 'image'
      };
    } catch (error) {
      console.error('Storage Upload Error:', error);
      throw error;
    }
  },

  async deleteMedicalDocument(fileUrl: string) {
    try {
      const storageRef = ref(storage, fileUrl);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Storage Delete Error:', error);
      throw error;
    }
  }
};
