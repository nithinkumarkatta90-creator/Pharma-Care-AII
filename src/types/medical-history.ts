export interface MedicalDocument {
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  fileType: string;
}

export interface PatientMedicalHistory {
  id?: string;
  uid: string;
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  height: number;
  weight: number;
  bmi: number;
  bloodGroup: string;
  allergies: string;
  chronicDiseases: string[];
  currentMedications: string[];
  pastSurgeries: string;
  hospitalizations: string;
  familyHistory: string;
  lifestyleSmoking: 'Yes' | 'No';
  lifestyleAlcohol: 'Yes' | 'No';
  dietType: 'Veg' | 'Non-Veg' | 'Mixed';
  emergencyContactName: string;
  emergencyContactNumber: string;
  vaccinationHistory: string;
  doctorNotes: string;
  documents: MedicalDocument[];
  createdAt: string;
  updatedAt: string;
}
