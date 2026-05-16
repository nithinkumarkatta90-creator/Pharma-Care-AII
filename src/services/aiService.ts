import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const aiService = {
  async chat(history: { role: string; content: string }[], message: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: "You are PharmaCare AI, a professional medical assistant. Provide helpful, accurate, and empathetic medical information. Always include a disclaimer that you are an AI and the user should consult a real doctor for serious conditions."
      }
    });
    return response.text;
  },

  async checkSymptoms(data: any) {
    const prompt = `Analyze the following patient symptoms and profile:
    - Symptoms: ${data.symptoms}
    - Duration: ${data.duration}
    - Severity: ${data.severity}
    - Age: ${data.age}
    - Gender: ${data.gender}
    - Existing Diseases: ${data.existingDiseases}
    - Allergies: ${data.allergies}
    - Current Medicines: ${data.currentMedicines}
    
    Provide a comprehensive medical analysis in the following structured format:
    
    ### 1. Possible Conditions
    List possible diseases/conditions with their Probability Level (Low, Medium, or High) and a short explanation in simple language.
    
    ### 2. Emergency Status
    Identify if this is an EMERGENCY case or NORMAL. If emergency, provide a clear warning.
    
    ### 3. First Aid & Home Remedies
    Provide basic first aid guidance and safe home remedies.
    
    ### 4. Diet Recommendations
    List Do's and Don'ts for food and hydration.
    
    ### 5. OTC Medicine Suggestions
    Suggest safe Over-The-Counter medicines for these symptoms (e.g., Paracetamol for fever). 
    **MANDATORY WARNING**: "Do not self-medicate without doctor advice. Consult pharmacist/doctor."
    
    ### 6. Doctor Consultation
    Recommend the type of specialist to consult (e.g., General Physician, Cardiologist).
    
    Keep the tone professional and cautious. Always include a medical disclaimer.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a senior medical diagnostic assistant. Provide structured, accurate, and safe medical guidance. Prioritize emergency detection."
      }
    });
    return response.text;
  },

  async diagnose(symptoms: string, profile: any) {
    const prompt = `Patient Symptoms: ${symptoms}
    Patient Profile:
    - Age: ${profile.age}
    - Gender: ${profile.gender}
    - Weight: ${profile.weight}
    
    Provide a preliminary analysis including:
    1. Possible conditions (with a disclaimer).
    2. Recommended next steps or precautions.
    3. Red flags: When to seek immediate emergency care.
    4. Suggested specialist to consult.
    
    Return in a clear, structured format using markdown.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a medical diagnostic assistant. Analyze symptoms and profile to suggest possible conditions. Be cautious and professional."
      }
    });
    return response.text;
  },

  async analyzeLabReport(imageFile?: File, text?: string) {
    let parts: any[] = [];
    
    if (imageFile) {
      const base64 = await fileToBase64(imageFile);
      parts.push({
        inlineData: {
          mimeType: imageFile.type,
          data: base64.split(',')[1]
        }
      });
      parts.push({ text: "Analyze this lab report image. Provide a summary of normal/abnormal values, key health warnings, and suggested doctor type. Return in a structured markdown format." });
    } else {
      parts.push({ text: `Analyze this lab report text: ${text}\nProvide a summary of normal/abnormal values, key health warnings, and suggested doctor type. Return in a structured markdown format.` });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts }],
      config: {
        systemInstruction: "You are a lab report analyzer. Summarize findings clearly and professionally. Always include a medical disclaimer."
      }
    });
    return response.text;
  },

  async getMedicineInfo(name: string) {
    const prompt = `Provide detailed information for medicine: ${name}. Include uses, dosage, contraindications, side effects, and precautions.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a pharmaceutical expert. Provide accurate drug information."
      }
    });
    return response.text;
  },

  async checkInteractions(medicines: string[]) {
    const prompt = `Check drug interactions for: ${medicines.join(", ")}. 
    For each potential interaction, provide:
    1. Risk Level: High, Medium, or Low (use bold text).
    2. Description of the interaction.
    3. Actionable advice (e.g., consult doctor, avoid taking together).
    If no interactions are found, state that clearly.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a drug interaction specialist. Identify risks between multiple medications."
      }
    });
    return response.text;
  },

  async predictSideEffects(medicine: string, profile: any) {
    const prompt = `Predict possible side effects for ${medicine} for a patient with the following profile:
    - Age: ${profile.age}
    - Existing Diseases/Conditions: ${profile.existingDiseases}
    
    Provide:
    1. List of potential side effects.
    2. Risk Level (High, Medium, or Low) for each or overall.
    3. Precautions to take.
    
    Output in a clear, structured format.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a clinical pharmacologist. Predict side effects based on patient data."
      }
    });
    return response.text;
  },

  async getDietPlan(disease: string) {
    const prompt = `Provide a diet plan for ${disease}. Include foods to eat, foods to avoid, a weekly plan, and hydration tips.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a clinical nutritionist. Provide disease-specific diet recommendations."
      }
    });
    return response.text;
  },

  async scanPrescription(imageFile?: File, text?: string) {
    let parts: any[] = [];
    
    if (imageFile) {
      const base64 = await fileToBase64(imageFile);
      parts.push({
        inlineData: {
          mimeType: imageFile.type,
          data: base64.split(',')[1]
        }
      });
      parts.push({ text: "Extract all medicine names and dosages from this prescription image. Return them as a clean list, one per line." });
    } else {
      parts.push({ text: `Extract medicine names from this prescription text: ${text}. Return as a list.` });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts }],
      config: {
        systemInstruction: "You are an OCR and medical data extraction specialist. Extract drug names and dosages accurately from prescriptions."
      }
    });
    return response.text;
  },

  async summarizeMedicalHistory(data: any) {
    const prompt = `Summarize the following patient medical history in simple, professional language:
    - Patient: ${data.patientName}, Age: ${data.age}, Gender: ${data.gender}
    - Vitals: BMI ${data.bmi} (${data.height}cm, ${data.weight}kg)
    - Chronic Diseases: ${data.chronicDiseases.join(", ")}
    - Medications: ${data.currentMedications.join(", ")}
    - Allergies: ${data.allergies}
    - Past Surgeries: ${data.pastSurgeries}
    - Family History: ${data.familyHistory}
    - Lifestyle: Smoking: ${data.lifestyleSmoking}, Alcohol: ${data.lifestyleAlcohol}, Diet: ${data.dietType}
    
    Provide:
    1. A concise overview of the patient's health status.
    2. Key health risks identified.
    3. Suggested precautions and lifestyle changes.
    4. A summary for a doctor to review.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a medical summary expert. Provide clear, professional, and actionable summaries."
      }
    });
    return response.text;
  },

  async predictHealthRisks(data: any) {
    const prompt = `Based on the following patient data, predict potential health risks (e.g., Diabetes risk, BP risk, Cardiovascular risk):
    - Age: ${data.age}, Gender: ${data.gender}
    - BMI: ${data.bmi}
    - Family History: ${data.familyHistory}
    - Chronic Diseases: ${data.chronicDiseases.join(", ")}
    - Lifestyle: Smoking: ${data.lifestyleSmoking}, Alcohol: ${data.lifestyleAlcohol}, Diet: ${data.dietType}
    
    Provide:
    1. Identified Risks with probability levels (Low, Medium, High).
    2. Reasoning for each risk.
    3. Preventive measures to mitigate these risks.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a preventative medicine specialist. Predict health risks based on patient profiles."
      }
    });
    return response.text;
  },

  async suggestMedicineSchedule(medicine: string, disease: string, frequency: string) {
    const prompt = `Suggest the best timing schedule for the following medicine:
    - Medicine: ${medicine}
    - Disease/Condition: ${disease}
    - Frequency: ${frequency}
    
    Provide:
    1. Recommended specific times (e.g., 8:00 AM, 2:00 PM, 8:00 PM).
    2. Advice on taking it before or after food.
    3. Important precautions or interactions to keep in mind.
    4. Why this schedule is optimal for this medicine and condition.
    
    Return in a clear, structured format using markdown.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a clinical pharmacist. Suggest optimal medication schedules based on drug properties and patient conditions."
      }
    });
    return response.text;
  },

  async getHealthInsights(profile: any, history: any[], medications: any[]) {
    const prompt = `Based on the following patient data, provide 3-4 personalized health insights or tips:
    - Profile: Age ${profile.age}, Gender ${profile.gender}, BMI ${profile.bmi}
    - Chronic Diseases: ${profile.chronicDiseases?.join(", ") || "None"}
    - Recent History: ${history.map(h => h.symptoms).join("; ")}
    - Current Medications: ${medications.map(m => m.name).join(", ")}
    
    Provide:
    1. A personalized health tip.
    2. A potential risk to watch out for.
    3. A suggested lifestyle improvement.
    
    Keep it concise, professional, and empathetic. Return in a clean markdown format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a personalized health coach and medical advisor. Provide actionable, data-driven health insights."
      }
    });
    return response.text;
  },

  async analyzeSkinCondition(imageFile: File) {
    const base64 = await fileToBase64(imageFile);
    const parts = [
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64.split(',')[1]
        }
      },
      { text: "Analyze this skin condition image. Identify potential issues (e.g., rash, mole, acne), provide a risk level, and suggest if a dermatologist visit is needed. Return in a structured markdown format with a clear disclaimer." }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts }],
      config: {
        systemInstruction: "You are an AI dermatology assistant. Provide preliminary analysis of skin conditions. Always emphasize that this is not a final diagnosis and a doctor must be consulted."
      }
    });
    return response.text;
  },

  async scanPrescriptionPro(imageFile: File) {
    const base64 = await fileToBase64(imageFile);
    const prompt = `Analyze this prescription image with extreme precision. 
    It may be in English or regional languages (like Hindi, Telugu, etc.).
    Extract the following information for EACH medicine found:
    - Medicine Name (Auto-correct common spelling errors, translate to English if needed)
    - Strength (e.g., 500mg, 5ml)
    - Dosage/Frequency (e.g., 1-0-1, twice daily)
    - Duration (e.g., 5 days, 1 week)
    - Instructions (e.g., after food, before bed)
    - Confidence Score (0-100% for the extraction)
    - Handwriting Clarity (Clear, Average, Poor)
    
    Also provide:
    - Doctor's Name (if visible)
    - Date of Prescription (if visible)
    - Overall Confidence Score for the entire scan.
    
    Format the output as a valid JSON object with the following structure:
    {
      "medicines": [
        { "name": "", "strength": "", "dosage": "", "duration": "", "instructions": "", "confidence": 0 }
      ],
      "doctor": "",
      "date": "",
      "overallConfidence": 0,
      "handwritingClarity": ""
    }
    
    Return ONLY the JSON object.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [
          { inlineData: { mimeType: imageFile.type, data: base64.split(',')[1] } },
          { text: prompt }
        ]
      }],
      config: {
        systemInstruction: "You are a world-class medical OCR and prescription extraction expert. You can read complex doctor handwriting in multiple languages and extract structured drug data with high accuracy. Return structured JSON only.",
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text);
  },

  async simplifyPrescription(medicines: any[]) {
    const prompt = `Convert these complex medical prescription details into simple, easy-to-understand language for a patient:
    ${JSON.stringify(medicines)}
    
    For each medicine, explain:
    1. What it is for (Drug Class/Purpose).
    2. Exactly how to take it in plain English (e.g., "Take one pill in the morning and one at night after eating").
    3. Any critical warnings (e.g., "Do not drive after taking this").
    
    Return in a clear, patient-friendly markdown format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a patient education specialist. Simplify complex medical jargon into clear, actionable instructions."
      }
    });
    return response.text;
  },

  async analyzeMentalHealth(journalEntries: string[]) {
    const prompt = `Analyze the following mental health journal entries for mood trends, emotional patterns, and potential stress indicators:
    
    Entries:
    ${journalEntries.map((e, i) => `Entry ${i + 1}: ${e}`).join("\n\n")}
    
    Provide:
    1. Overall Mood Summary.
    2. Emotional Trends (e.g., increasing anxiety, stable happiness).
    3. Potential Stressors identified.
    4. Suggested Coping Strategies or Mindfulness exercises.
    5. A note on when to seek professional help.
    
    Return in a clean markdown format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are an AI mental health wellness assistant. Provide empathetic, supportive, and insightful analysis of journal entries. Always include a disclaimer and crisis resources if needed."
      }
    });
    return response.text;
  },

  async reAnalyze(context: string, previousResult: string, error: string) {
    const prompt = `The previous AI analysis encountered an error or was unsatisfactory. Please re-analyze the following information.
    
    Context: ${context}
    Previous Result: ${previousResult}
    Error/Issue Encountered: ${error}
    
    Please provide a corrected or improved analysis, addressing the issue.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are an AI error-correction and improvement specialist. Analyze the previous attempt and the error, then provide a corrected, high-quality response."
      }
    });
    return response.text;
  }
};
