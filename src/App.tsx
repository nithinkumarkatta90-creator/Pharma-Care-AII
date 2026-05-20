import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, createContext, useContext, lazy, Suspense } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import SplashScreen from './components/SplashScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';

const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PatientProfile = lazy(() => import('./pages/PatientProfile'));
const MedicationEntry = lazy(() => import('./pages/MedicationEntry'));
const MedicalProfile = lazy(() => import('./pages/MedicalProfile'));
const History = lazy(() => import('./pages/History'));
const Profile = lazy(() => import('./pages/Profile'));
const MedicalHistory = lazy(() => import('./pages/MedicalHistory'));
const MedicalHistoryTimeline = lazy(() => import('./pages/MedicalHistoryTimeline'));
const Reminders = lazy(() => import('./pages/Reminders'));
const AddReminder = lazy(() => import('./pages/AddReminder'));
const ReminderLogs = lazy(() => import('./pages/ReminderLogs'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Settings = lazy(() => import('./pages/Settings'));

const LabReports = lazy(() => import('./pages/LabReports'));
const InteractionChecker = lazy(() => import('./pages/InteractionChecker'));
const IPDatabase = lazy(() => import('./pages/IPDatabase'));
const Nutraceuticals = lazy(() => import('./pages/Nutraceuticals'));
const VaccineGuide = lazy(() => import('./pages/VaccineGuide'));

const HealthRecords = lazy(() => import('./pages/HealthRecords'));
const Prescriptions = lazy(() => import('./pages/Prescriptions'));
const VaccinationRecords = lazy(() => import('./pages/VaccinationRecords'));
const DrugRecalls = lazy(() => import('./pages/DrugRecalls'));
const LabReference = lazy(() => import('./pages/LabReference'));

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    setTimeout(() => setShowSplash(false), 2000);
    return () => unsubscribe();
  }, []);

  if (showSplash || loading) return <SplashScreen />;

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthContext.Provider value={{ user, loading }}>
        <ErrorBoundary>
          <Router>
            <Suspense fallback={<SplashScreen />}>
              <Routes>
                <Route path="/login" element={<Navigate to="/" />} />
                <Route path="/signup" element={<Navigate to="/" />} />
                <Route element={<Layout />}>
                  <Route path="/" element={<Dashboard />} />

                  {/* Personal Records */}
                  <Route path="/health-records" element={<HealthRecords />} />
                  <Route path="/prescriptions" element={<Prescriptions />} />
                  <Route path="/vaccination-records" element={<VaccinationRecords />} />

                  {/* Clinical Reference */}
                  <Route path="/lab-reports" element={<LabReports />} />
                  <Route path="/interaction" element={<InteractionChecker />} />
                  <Route path="/ip-database" element={<IPDatabase />} />
                  <Route path="/lab-reference" element={<LabReference />} />
                  <Route path="/drug-recalls" element={<DrugRecalls />} />

                  {/* Health & Nutrition */}
                  <Route path="/nutraceuticals" element={<Nutraceuticals />} />
                  <Route path="/vaccine-guide" element={<VaccineGuide />} />

                  {/* Management */}
                  <Route path="/medical-profile" element={<MedicalProfile />} />
                  <Route path="/patient-profile" element={<PatientProfile />} />
                  <Route path="/medication-entry" element={<MedicationEntry />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/medical-history" element={<MedicalHistory />} />
                  <Route path="/medical-history-timeline" element={<MedicalHistoryTimeline />} />
                  <Route path="/reminders" element={<Reminders />} />
                  <Route path="/add-reminder" element={<AddReminder />} />
                  <Route path="/edit-reminder/:id" element={<AddReminder />} />
                  <Route path="/reminder-logs" element={<ReminderLogs />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/admin" element={<AdminPanel />} />
                </Route>
              </Routes>
            </Suspense>
            <Toaster position="top-right" />
          </Router>
        </ErrorBoundary>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}
