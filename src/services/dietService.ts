import { GoogleGenAI, Type } from "@google/genai";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MedicalProfile, DetailedDietPlan } from '../types/diet';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const dietService = {
  async getMedicalProfile(uid: string): Promise<MedicalProfile | null> {
    const docRef = doc(db, 'medical_profiles', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as MedicalProfile;
    }
    return null;
  },

  async saveMedicalProfile(profile: MedicalProfile) {
    const docRef = doc(db, 'medical_profiles', profile.uid);
    return await setDoc(docRef, {
      ...profile,
      updatedAt: serverTimestamp()
    });
  },

  async generateDietPlan(profile: MedicalProfile): Promise<DetailedDietPlan> {
    const bmi = profile.weight / ((profile.height / 100) ** 2);
    
    const prompt = `Generate a comprehensive medical diet plan for a patient with the following profile:
    Diseases: ${profile.selectedDiseases.join(', ')}
    Age: ${profile.age}
    Gender: ${profile.gender}
    BMI: ${bmi.toFixed(1)}
    Weight Goal: ${profile.weightGoal}
    Food Preference: ${profile.foodPreference}
    Allergies: ${profile.allergies || 'None'}

    The response must be a structured JSON object.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            caloriesEstimate: { type: Type.STRING },
            foodsToEat: { type: Type.ARRAY, items: { type: Type.STRING } },
            foodsToAvoid: { type: Type.ARRAY, items: { type: Type.STRING } },
            meals: {
              type: Type.OBJECT,
              properties: {
                breakfast: { type: Type.STRING },
                lunch: { type: Type.STRING },
                dinner: { type: Type.STRING },
                snack: { type: Type.STRING }
              }
            },
            weeklyPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  breakfast: { type: Type.STRING },
                  lunch: { type: Type.STRING },
                  dinner: { type: Type.STRING }
                }
              }
            },
            lifestyleAdvice: { type: Type.STRING },
            waterIntake: { type: Type.STRING },
            exercise: { type: Type.STRING },
            warnings: { type: Type.STRING }
          },
          required: ["caloriesEstimate", "foodsToEat", "foodsToAvoid", "meals", "weeklyPlan", "lifestyleAdvice", "waterIntake", "exercise", "warnings"]
        }
      }
    });

    const result = JSON.parse(response.text);
    
    const dietPlan: DetailedDietPlan = {
      uid: profile.uid,
      diseases: profile.selectedDiseases,
      bmi: Number(bmi.toFixed(1)),
      ...result,
      createdAt: serverTimestamp()
    };

    return dietPlan;
  },

  async saveDietPlan(plan: DetailedDietPlan) {
    return await addDoc(collection(db, 'detailed_diet_plans'), plan);
  },

  async getDietHistory(uid: string): Promise<DetailedDietPlan[]> {
    const q = query(
      collection(db, 'detailed_diet_plans'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DetailedDietPlan));
  }
};
