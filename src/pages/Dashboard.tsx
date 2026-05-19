import { useEffect, useState, useMemo, useCallback } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useAuth } from '../App';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import {
  Bell,
  Pill,
  History as HistoryIcon,
  TrendingUp,
  ArrowRight,
  Stethoscope,
  Zap,
  Book,
  QrCode,
  FileText,
  AlertTriangle,
  MessageSquare,
  Search,
  ChevronRight,
  HeartPulse,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { aiService } from '../services/aiService';
import Markdown from 'react-markdown';
import { useTheme } from 'next-themes';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [healthScore, setHealthScore] = useState(85);
  const [remindersCount, setRemindersCount] = useState(0);
  const [medicinesCount, setMedicinesCount] = useState(0);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleQuickSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/medicine-info?q=${encodeURIComponent(searchQuery)}`);
  }, [searchQuery, navigate]);

  useEffect(() => {
    if (!user) return;

    let healthLoaded = false;
    let remindersLoaded = false;
    let medicinesLoaded = false;
    let historyLoaded = false;

    const checkAllLoaded = () => {
      if (healthLoaded && remindersLoaded && medicinesLoaded && historyLoaded) setLoading(false);
    };

    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) setHealthScore(snap.data().healthScore || 85);
      healthLoaded = true;
      checkAllLoaded();
    }).catch(error => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      healthLoaded = true;
      checkAllLoaded();
    });

    const remindersQuery = query(collection(db, 'reminders'), where('uid', '==', user.uid), where('isActive', '==', true));
    const unsubReminders = onSnapshot(remindersQuery, snap => {
      setRemindersCount(snap.size);
      remindersLoaded = true;
      checkAllLoaded();
    }, error => {
      handleFirestoreError(error, OperationType.LIST, 'reminders');
      remindersLoaded = true;
      checkAllLoaded();
    });

    const medicinesQuery = query(collection(db, 'medicine_search'), where('uid', '==', user.uid));
    const unsubMedicines = onSnapshot(medicinesQuery, snap => {
      setMedicinesCount(snap.size);
      medicinesLoaded = true;
      checkAllLoaded();
    }, error => {
      handleFirestoreError(error, OperationType.LIST, 'medicine_search');
      medicinesLoaded = true;
      checkAllLoaded();
    });

    const diagQuery = query(collection(db, 'diagnosis_history'), where('uid', '==', user.uid));
    const unsubDiag = onSnapshot(diagQuery, snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data(), type: 'Diagnosis' }));
      setRecentHistory(docs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3));
      historyLoaded = true;
      checkAllLoaded();
    }, error => {
      handleFirestoreError(error, OperationType.LIST, 'diagnosis_history');
      historyLoaded = true;
      checkAllLoaded();
    });

    const fetchInsights = async () => {
      const cached = sessionStorage.getItem(`ai_insights_${user.uid}`);
      if (cached) { setAiInsights(cached); return; }
      setInsightsLoading(true);
      try {
        const profileSnap = await getDoc(doc(db, 'medical_profiles', user.uid));
        const profile = profileSnap.exists() ? profileSnap.data() : {};
        const insights = await aiService.getHealthInsights(profile, [], []);
        setAiInsights(insights);
        sessionStorage.setItem(`ai_insights_${user.uid}`, insights);
      } catch (err: any) {
        const msg = err?.message || err?.toString() || '';
        if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
          setAiInsights("**Daily Tip:** Stay hydrated and maintain a balanced diet. (Personalized insights temporarily unavailable — please try again later.)");
        } else {
          setAiInsights("Unable to generate personalized insights at this moment. Please check back later.");
        }
      } finally {
        setInsightsLoading(false);
      }
    };
    fetchInsights();

    return () => { unsubReminders(); unsubMedicines(); unsubDiag(); };
  }, [user]);

  const chartData = useMemo(() => [
    { name: 'Score', value: healthScore },
    { name: 'Remaining', value: 100 - healthScore },
  ], [healthScore]);

  const healthInfo = useMemo(() => {
    if (healthScore >= 80) return { label: 'Excellent', color: 'text-emerald-600', bg: isDark ? 'bg-emerald-900/30' : 'bg-emerald-50' };
    if (healthScore >= 60) return { label: 'Good', color: 'text-blue-600', bg: isDark ? 'bg-blue-900/30' : 'bg-blue-50' };
    if (healthScore >= 40) return { label: 'Moderate', color: 'text-amber-600', bg: isDark ? 'bg-amber-900/30' : 'bg-amber-50' };
    return { label: 'Poor', color: 'text-rose-600', bg: isDark ? 'bg-rose-900/30' : 'bg-rose-50' };
  }, [healthScore, isDark]);

  const quickActions = useMemo(() => [
    { name: 'AI Health Chat', path: '/chat', icon: MessageSquare, desc: 'Consult with AI' },
    { name: 'Drug Intelligence', path: '/medicine-info', icon: Pill, desc: 'Search medications' },
    { name: 'Lab AI Analysis', path: '/lab-reports', icon: FileText, desc: 'Upload reports' },
    { name: 'QR Verification', path: '/qr-verification', icon: QrCode, desc: 'Verify authenticity' },
    { name: 'Interaction Check', path: '/interaction', icon: AlertTriangle, desc: 'Check drug safety' },
    { name: 'Side Effects AI', path: '/side-effects', icon: Zap, desc: 'Learn about side effects' },
    { name: 'IP Database', path: '/ip-database', icon: Book, desc: 'Pharmacopoeia data' },
    { name: 'Med Reminders', path: '/reminders', icon: Bell, desc: 'Dose schedule' },
  ], []);

  const card = `rounded-xl border p-5 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`;
  const sectionTitle = 'text-base font-semibold mb-4';

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-16">

      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hello, {user?.displayName?.split(' ')[0] || 'User'}
          </h1>
          <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Your health dashboard is ready for today.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/chat"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${isDark ? 'bg-indigo-700 hover:bg-indigo-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            <MessageSquare className="w-4 h-4" /> AI Chat
          </Link>
          <Link
            to="/reminders"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border transition-colors ${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            <Bell className="w-4 h-4" /> Reminders
          </Link>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={item}>
        <form onSubmit={handleQuickSearch} className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
          <input
            type="text"
            placeholder="Search for medicines, symptoms, or health tips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full h-10 pl-9 pr-24 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${isDark ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
          />
          <button
            type="submit"
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${isDark ? 'bg-indigo-700 hover:bg-indigo-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            Search
          </button>
        </form>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Health Score', value: `${healthScore}/100`, icon: TrendingUp, color: 'text-emerald-500', trend: '+2%' },
          { label: 'Active Reminders', value: remindersCount, icon: Bell, color: 'text-amber-500' },
          { label: 'Medicines Logged', value: medicinesCount, icon: Pill, color: 'text-indigo-500' },
          { label: 'Consultations', value: recentHistory.length, icon: HistoryIcon, color: 'text-blue-500' },
        ].map((stat, i) => (
          <div key={i} className={`${card} flex items-center justify-between`}>
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
              {loading
                ? <Skeleton className="h-7 w-16 mt-1" />
                : <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
              }
              {stat.trend && (
                <span className={`mt-1 inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full ${isDark ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                  {stat.trend}
                </span>
              )}
            </div>
            <div className={`p-2.5 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
        ))}
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: AI Insights + Quick Actions */}
        <div className="lg:col-span-2 space-y-6">

          {/* AI Health Insights */}
          <motion.section variants={item}>
            <h2 className={sectionTitle}>AI Health Insights</h2>
            <div className={`rounded-xl border p-5 ${isDark ? 'bg-indigo-950/30 border-indigo-900/50' : 'bg-indigo-50/60 border-indigo-100'}`}>
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg flex-shrink-0 ${isDark ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
                  <HeartPulse className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  {insightsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  ) : aiInsights ? (
                    <div className={`prose prose-sm max-w-none ${isDark ? 'prose-invert' : ''}`}>
                      <Markdown>{aiInsights}</Markdown>
                    </div>
                  ) : (
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-indigo-300' : 'text-indigo-900'}`}>
                        Complete your medical profile to get personalized AI insights.
                      </p>
                      <Link
                        to="/medical-profile"
                        className={`mt-2 inline-flex items-center text-sm font-medium ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
                      >
                        Set up profile <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Quick Actions */}
          <motion.section variants={item}>
            <h2 className={sectionTitle}>Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.path}
                  to={action.path}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${isDark ? 'bg-gray-900 border-gray-800 hover:border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                >
                  <div className={`p-2 rounded-lg flex-shrink-0 ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{action.name}</p>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{action.desc}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 ml-auto flex-shrink-0 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                </Link>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Right: Health Overview + Recent Activity */}
        <div className="space-y-6">

          {/* Health Overview */}
          <motion.section variants={item}>
            <h2 className={sectionTitle}>Health Overview</h2>
            <div className={card}>
              {loading ? (
                <div className="flex flex-col items-center py-4 space-y-4">
                  <Skeleton className="h-40 w-40 rounded-full" />
                  <div className="w-full space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-48 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={6} dataKey="value" stroke="none">
                          <Cell fill={isDark ? '#818cf8' : '#4f46e5'} />
                          <Cell fill={isDark ? '#1f2937' : '#f3f4f6'} />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-bold">{healthScore}%</span>
                      <span className={`text-xs font-medium mt-1 px-2 py-0.5 rounded-full ${healthInfo.bg} ${healthInfo.color}`}>
                        {healthInfo.label}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 space-y-2">
                    {[
                      { label: 'BMI Status', value: 'Normal', color: 'text-emerald-600' },
                      { label: 'Activity Level', value: 'Moderate', color: 'text-blue-600' },
                      { label: 'Sleep Quality', value: 'Good', color: 'text-amber-600' },
                    ].map((row, i) => (
                      <div key={i} className={`flex justify-between items-center px-3 py-2 rounded-md ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{row.label}</span>
                        <span className={`text-xs font-semibold ${row.color}`}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.section>

          {/* Recent Activity */}
          <motion.section variants={item}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={sectionTitle.replace('mb-4', 'mb-0')}>Recent Activity</h2>
              <Link
                to="/history"
                className={`text-xs font-medium flex items-center gap-1 ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : recentHistory.length > 0 ? (
                <ul className={`divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-100'}`}>
                  {recentHistory.map((entry) => (
                    <li key={entry.id} className={`flex items-center gap-3 p-4 transition-colors cursor-pointer ${isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}`}>
                      <div className={`h-2 w-2 rounded-full flex-shrink-0 ${isDark ? 'bg-indigo-400' : 'bg-indigo-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{entry.type}: {entry.symptoms?.substring(0, 28)}...</p>
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{new Date(entry.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] font-medium ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>Done</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={`p-8 text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  No recent activity yet.
                </div>
              )}
              <div className={`px-4 py-3 border-t text-center ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-gray-50'}`}>
                <Link to="/history" className={`text-xs font-medium ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
                  View all activity
                </Link>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
}
