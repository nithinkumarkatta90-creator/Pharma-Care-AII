# PharmaCare AI

A comprehensive AI-powered healthcare platform for diagnosis, medicine tracking, and health management.

## Features
- **AI Chat Assistant**: Real-time health consultation.
- **AI Diagnosis**: Symptom analysis and preliminary diagnosis.
- **Lab Report Analyzer**: Upload and analyze medical reports.
- **Medicine Info**: Detailed drug information and interaction checker.
- **Diet Plans**: Disease-specific nutrition recommendations.
- **Medicine Reminders**: Track dosages and set alerts.
- **QR Scanner**: Verify medicine authenticity.
- **Rx Scanner**: Extract medicine names from prescriptions.
- **Health Dashboard**: Overview of health score and activities.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Storage**: Firebase Storage
- **AI**: Google Gemini API

## Setup Instructions
1. **Firebase Configuration**:
   - The app uses `firebase-applet-config.json` for configuration.
   - Ensure Firestore, Authentication (Google + Email), and Storage are enabled in your Firebase project.
2. **Environment Variables**:
   - `GEMINI_API_KEY`: Required for AI features.
3. **Running the App**:
   - Install dependencies: `npm install`
   - Start the dev server: `npm run dev` (runs both frontend and backend)

## Security
- Firestore Security Rules are implemented to protect user data.
- Only authenticated users can access their own health records.
