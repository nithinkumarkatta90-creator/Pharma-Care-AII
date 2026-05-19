import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, createContext, useContext, lazy, Suspense } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import SplashScreen from './components/SplashScreen';
import { ErrorBoundary } from './components/ErrorBoundary';

// Layout
import Layout from './components/Layout';

// Lazy Loaded Pages
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const PatientProfile = lazy(() => import('./pages/PatientProfile'));
const MedicationEntry = lazy(() => import('./pages/MedicationEntry'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Chat = lazy(() => import('./pages/Chat'));
const LabReports = lazy(() => import('./pages/LabReports'));
const MedicineInfo = lazy(() => import('./pages/MedicineInfo'));
const DietPlans = lazy(() => import('./pages/DietPlans'));
const DietPlanGenerate = lazy(() => import('./pages/DietPlanGenerate'));
const DietPlanView = lazy(() => import('./pages/DietPlanView'));
const DietHistory = lazy(() => import('./pages/DietHistory'));
const MedicalProfile = lazy(() => import('./pages/MedicalProfile'));
const QRScanner = lazy(() => import('./pages/QRScanner'));
const QRVerify = lazy(() => import('./pages/QRVerify'));
const History = lazy(() => import('./pages/History'));
const Profile = lazy(() => import('./pages/Profile'));
const InteractionChecker = lazy(() => import('./pages/InteractionChecker'));
const SideEffects = lazy(() => import('./pages/SideEffects'));
const IPDatabase = lazy(() => import('./pages/IPDatabase'));
const MedicalHistory = lazy(() => import('./pages/MedicalHistory'));
const MedicalHistoryTimeline = lazy(() => import('./pages/MedicalHistoryTimeline'));
const Reminders = lazy(() => import('./pages/Reminders'));
const AddReminder = lazy(() => import('./pages/AddReminder'));
const ReminderLogs = lazy(() => import('./pages/ReminderLogs'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Settings = lazy(() => import('./pages/Settings'));

// Auth Context
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    setTimeout(() => setShowSplash(false), 2000);

    return () => unsubscribe();
  }, []);

  if (showSplash || loading) {
    return <SplashScreen />;
  }

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
                  <Route path="/patient-profile" element={<PatientProfile />} />
                  <Route path="/medication-entry" element={<MedicationEntry />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/lab-reports" element={<LabReports />} />
                  <Route path="/medicine-info" element={<MedicineInfo />} />
                  <Route path="/interaction" element={<InteractionChecker />} />
                  <Route path="/side-effects" element={<SideEffects />} />
                  <Route path="/ip-database" element={<IPDatabase />} />
                  <Route path="/diet-plans" element={<DietPlans />} />
                  <Route path="/diet-plan-generate" element={<DietPlanGenerate />} />
                  <Route path="/diet-plan-view/:planId" element={<DietPlanView />} />
                  <Route path="/diet-history" element={<DietHistory />} />
                  <Route path="/medical-profile" element={<MedicalProfile />} />
                  <Route path="/qr-scanner" element={<QRScanner />} />
                  <Route path="/qr-verification" element={<QRVerify />} />
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
