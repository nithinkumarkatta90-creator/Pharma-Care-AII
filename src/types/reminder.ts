export type MedicineType = 'Tablet' | 'Syrup' | 'Capsule' | 'Injection';
export type Frequency = 'Once' | 'Twice' | 'Thrice' | 'Custom';
export type BeforeAfterFood = 'Before' | 'After';
export type RepeatType = 'Daily' | 'Weekly' | 'Monthly';
export type ReminderStatus = 'Taken' | 'Missed' | 'Snoozed';

export interface Reminder {
  id?: string;
  uid: string;
  medicineName: string;
  dosage: string;
  medicineType: MedicineType;
  frequency: Frequency;
  times: string[]; // ISO time strings or HH:mm
  startDate: string;
  endDate: string;
  beforeAfterFood: BeforeAfterFood;
  repeatType: RepeatType;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderLog {
  id?: string;
  uid: string;
  reminderId: string;
  medicineName: string;
  scheduledTime: string;
  takenTime?: string;
  status: ReminderStatus;
  date: string; // YYYY-MM-DD
  createdAt: string;
}
