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
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Reminder, ReminderLog, ReminderStatus } from '../types/reminder';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

const REMINDERS_COLLECTION = 'reminders';
const LOGS_COLLECTION = 'reminder_logs';

export const reminderService = {
  async addReminder(reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, REMINDERS_COLLECTION), {
        ...reminder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, REMINDERS_COLLECTION);
      throw error;
    }
  },

  async updateReminder(id: string, reminder: Partial<Reminder>): Promise<void> {
    try {
      const docRef = doc(db, REMINDERS_COLLECTION, id);
      await updateDoc(docRef, {
        ...reminder,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${REMINDERS_COLLECTION}/${id}`);
      throw error;
    }
  },

  async deleteReminder(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, REMINDERS_COLLECTION, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${REMINDERS_COLLECTION}/${id}`);
      throw error;
    }
  },

  async fetchReminders(uid: string): Promise<Reminder[]> {
    try {
      const q = query(
        collection(db, REMINDERS_COLLECTION), 
        where('uid', '==', uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, REMINDERS_COLLECTION);
      throw error;
    }
  },

  subscribeToReminders(uid: string, callback: (reminders: Reminder[]) => void) {
    const q = query(
      collection(db, REMINDERS_COLLECTION), 
      where('uid', '==', uid),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const reminders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder));
      callback(reminders);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, REMINDERS_COLLECTION);
    });
  },

  async logAdherence(log: Omit<ReminderLog, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, LOGS_COLLECTION), {
        ...log,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, LOGS_COLLECTION);
      throw error;
    }
  },

  async fetchLogs(uid: string, date?: string): Promise<ReminderLog[]> {
    try {
      let q = query(
        collection(db, LOGS_COLLECTION), 
        where('uid', '==', uid),
        orderBy('createdAt', 'desc')
      );
      
      if (date) {
        q = query(q, where('date', '==', date));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReminderLog));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, LOGS_COLLECTION);
      throw error;
    }
  },

  async calculateAdherencePercentage(uid: string, days: number = 7): Promise<number> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];

      const q = query(
        collection(db, LOGS_COLLECTION),
        where('uid', '==', uid),
        where('date', '>=', startDateStr)
      );

      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map(doc => doc.data() as ReminderLog);
      
      if (logs.length === 0) return 100;

      const taken = logs.filter(l => l.status === 'Taken').length;
      return Math.round((taken / logs.length) * 100);
    } catch (error) {
      console.error('Failed to calculate adherence:', error);
      return 0;
    }
  }
};
