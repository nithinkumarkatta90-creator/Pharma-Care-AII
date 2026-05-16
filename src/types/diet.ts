export interface Disease {
  id: string;
  name: string;
  category: string;
}

export interface MedicalProfile {
  uid: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  foodPreference: 'Veg' | 'Non-Veg';
  allergies: string;
  selectedDiseases: string[];
  weightGoal: 'Loss' | 'Gain' | 'Maintain';
  updatedAt: any;
}

export interface DetailedDietPlan {
  id?: string;
  uid: string;
  diseases: string[];
  bmi: number;
  caloriesEstimate: string;
  foodsToEat: string[];
  foodsToAvoid: string[];
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
  };
  weeklyPlan: {
    day: string;
    breakfast: string;
    lunch: string;
    dinner: string;
  }[];
  lifestyleAdvice: string;
  waterIntake: string;
  exercise: string;
  warnings: string;
  createdAt: any;
}
