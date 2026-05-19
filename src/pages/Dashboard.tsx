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
  ChevronRight,
  HeartPulse,
  Sparkles,
  Activity,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { aiService } from '../services/aiService';
import Markdown from 'react-markdown';
import { useTheme } from 'next-themes';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 22 } },
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
      setRecentHistory(docs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4));
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
          setAiInsights("**Daily Tip:** Stay hydrated and maintain a balanced diet. Personalized insights temporarily unavailable — please try again later.");
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
    if (healthScore >= 80) return { label: 'Excellent', ringColor: isDark ? '#2dd4bf' : '#0d9488' };
    if (healthScore >= 60) return { label: 'Good', ringColor: isDark ? '#60a5fa' : '#2563eb' };
    if (healthScore >= 40) return { label: 'Moderate', ringColor: isDark ? '#fbbf24' : '#d97706' };
    return { label: 'Needs Attention', ringColor: isDark ? '#f87171' : '#dc2626' };
  }, [healthScore, isDark]);

  const stats = useMemo(() => [
    {
      label: 'Health Score',
      value: `${healthScore}%`,
      icon: HeartPulse,
      gradient: 'from-teal-500/20 via-teal-500/5 to-transparent',
      border: 'border-teal-500/20',
      iconBg: 'bg-teal-500/15',
      iconColor: 'text-teal-400',
      glow: 'shadow-teal-500/10',
    },
    {
      label: 'Active Reminders',
      value: remindersCount,
      icon: Bell,
      gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
      border: 'border-blue-500/20',
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-400',
      glow: 'shadow-blue-500/10',
    },
    {
      label: 'Medicines Logged',
      value: medicinesCount,
      icon: Pill,
      gradient: 'from-indigo-500/20 via-indigo-500/5 to-transparent',
      border: 'border-indigo-500/20',
      iconBg: 'bg-indigo-500/15',
      iconColor: 'text-indigo-400',
      glow: 'shadow-indigo-500/10',
    },
    {
      label: 'Consultations',
      value: recentHistory.length,
      icon: Stethoscope,
      gradient: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
      border: 'border-cyan-500/20',
      iconBg: 'bg-cyan-500/15',
      iconColor: 'text-cyan-400',
      glow: 'shadow-cyan-500/10',
    },
  ], [healthScore, remindersCount, medicinesCount, recentHistory.length]);

  const quickActions = useMemo(() => [
    { name: 'AI Health Chat', path: '/chat', icon: MessageSquare, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20 hover:border-teal-500/50', desc: 'Consult with AI' },
    { name: 'Drug Intelligence', path: '/medicine-info', icon: Pill, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20 hover:border-blue-500/50', desc: 'Search medications' },
    { name: 'Lab AI Analysis', path: '/lab-reports', icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20 hover:border-indigo-500/50', desc: 'Upload lab reports' },
    { name: 'QR Verification', path: '/qr-verification', icon: QrCode, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20 hover:border-cyan-500/50', desc: 'Verify authenticity' },
    { name: 'Interaction Check', path: '/interaction', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20 hover:border-amber-500/50', desc: 'Check drug safety' },
    { name: 'Side Effects AI', path: '/side-effects', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20 hover:border-purple-500/50', desc: 'Learn about risks' },
    { name: 'IP Database', path: '/ip-database', icon: Book, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20 hover:border-emerald-500/50', desc: 'Pharmacopoeia data' },
    { name: 'Med Reminders', path: '/reminders', icon: Bell, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20 hover:border-rose-500/50', desc: 'Dose schedule' },
  ], []);

  if (isDark) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-16">

        {/* Welcome Header */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-teal-400/80 mb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Health Dashboard
            </p>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Hello, <span className="gradient-text">{user?.displayName?.split(' ')[0] || 'User'}</span>
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Your health overview is ready for today.</p>
          </div>
          <div className="flex gap-2.5 flex-shrink-0">
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.02] active:scale-95"
            >
              <MessageSquare className="w-4 h-4" /> AI Chat
            </Link>
            <Link
              to="/reminders"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600 transition-all"
            >
              <Bell className="w-4 h-4" /> Reminders
            </Link>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className={`relative overflow-hidden rounded-2xl border bg-slate-900/60 backdrop-blur-sm p-5 shadow-lg ${stat.border} ${stat.glow}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} pointer-events-none`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                  <div className={`p-2 rounded-xl ${stat.iconBg}`}>
                    <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
                  </div>
                </div>
                {loading
                  ? <Skeleton className="h-8 w-16 bg-slate-800" />
                  : <span className="text-3xl font-bold text-white">{stat.value}</span>
                }
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* AI Insights */}
            <motion.section variants={item}>
              <div className="relative overflow-hidden rounded-2xl border border-teal-500/25 bg-slate-900/60 backdrop-blur-sm">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/60 to-transparent" />
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-teal-500/8 to-transparent pointer-events-none" />
                <div className="relative p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-teal-500/15 border border-teal-500/25 flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-white mb-1">AI Health Insights</h3>
                      {insightsLoading ? (
                        <div className="space-y-2 mt-2">
                          <Skeleton className="h-3.5 w-full bg-slate-800" />
                          <Skeleton className="h-3.5 w-4/5 bg-slate-800" />
                          <Skeleton className="h-3.5 w-3/5 bg-slate-800" />
                        </div>
                      ) : aiInsights ? (
                        <div className="text-sm text-slate-400 leading-relaxed prose prose-sm prose-invert max-w-none prose-p:my-1">
                          <Markdown>{aiInsights}</Markdown>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-slate-400">Complete your medical profile to unlock personalized AI insights.</p>
                          <Link
                            to="/medical-profile"
                            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors"
                          >
                            Set up profile <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      )}
                      {aiInsights && (
                        <Link
                          to="/chat"
                          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/20 transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Discuss with AI
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Quick Actions */}
            <motion.section variants={item}>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <motion.div
                    key={action.path}
                    whileHover={{ scale: 1.015, y: -1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Link
                      to={action.path}
                      className={`flex items-center gap-3.5 p-4 rounded-2xl border bg-slate-900/60 backdrop-blur-sm transition-all ${action.border}`}
                    >
                      <div className={`p-2.5 rounded-xl flex-shrink-0 ${action.bg}`}>
                        <action.icon className={`w-4 h-4 ${action.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-200">{action.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{action.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* Health Overview */}
            <motion.section variants={item}>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Health Overview</h2>
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-sm p-5">
                {loading ? (
                  <div className="flex flex-col items-center py-4 gap-4">
                    <Skeleton className="h-40 w-40 rounded-full bg-slate-800" />
                    <Skeleton className="h-4 w-full bg-slate-800" />
                    <Skeleton className="h-4 w-full bg-slate-800" />
                  </div>
                ) : (
                  <>
                    <div className="h-44 w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={58}
                            outerRadius={76}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                            startAngle={90}
                            endAngle={-270}
                          >
                            <Cell fill={healthInfo.ringColor} />
                            <Cell fill="#1e293b" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold text-white">{healthScore}</span>
                        <span className="text-xs text-slate-400 mt-0.5">/ 100</span>
                        <span className="mt-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-400 border border-teal-500/20">
                          {healthInfo.label}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {[
                        { label: 'BMI Status', value: 'Normal', color: 'text-emerald-400' },
                        { label: 'Activity Level', value: 'Moderate', color: 'text-blue-400' },
                        { label: 'Sleep Quality', value: 'Good', color: 'text-amber-400' },
                      ].map((row, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center px-3 py-2.5 rounded-xl bg-slate-800/60"
                        >
                          <span className="text-xs text-slate-400">{row.label}</span>
                          <span className={`text-xs font-bold ${row.color}`}>{row.value}</span>
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
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Recent Activity</h2>
                <Link
                  to="/history"
                  className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {Array(3).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full bg-slate-800 rounded-xl" />
                    ))}
                  </div>
                ) : recentHistory.length > 0 ? (
                  <ul>
                    {recentHistory.map((entry, idx) => (
                      <li
                        key={entry.id}
                        className={`flex items-start gap-3 p-4 transition-colors hover:bg-slate-800/50 cursor-pointer ${
                          idx < recentHistory.length - 1 ? 'border-b border-slate-800/60' : ''
                        }`}
                      >
                        <div className="mt-0.5 relative flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                            <HistoryIcon className="h-3.5 w-3.5 text-teal-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">
                            {entry.type}: {entry.symptoms?.substring(0, 25) || 'Session'}
                            {entry.symptoms?.length > 25 ? '…' : ''}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className="text-[10px] border-slate-700 text-slate-400 bg-transparent flex-shrink-0">
                          Done
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-5 h-5 text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-500">No recent activity yet.</p>
                    <Link to="/chat" className="mt-2 inline-block text-xs text-teal-400 hover:text-teal-300 font-medium">
                      Start a consultation →
                    </Link>
                  </div>
                )}
              </div>
            </motion.section>
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── Light Mode ───────────────────────────────────────────────────────────────
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-16">

      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-teal-600 mb-1 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Health Dashboard
          </p>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Hello, {user?.displayName?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Your health overview is ready for today.</p>
        </div>
        <div className="flex gap-2.5 flex-shrink-0">
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/25 transition-all"
          >
            <MessageSquare className="w-4 h-4" /> AI Chat
          </Link>
          <Link
            to="/reminders"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
          >
            <Bell className="w-4 h-4" /> Reminders
          </Link>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Health Score', value: `${healthScore}%`, icon: HeartPulse, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
          { label: 'Active Reminders', value: remindersCount, icon: Bell, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Medicines Logged', value: medicinesCount, icon: Pill, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
          { label: 'Consultations', value: recentHistory.length, icon: Stethoscope, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
        ].map((stat, i) => (
          <div key={i} className={`rounded-2xl border p-5 bg-white shadow-sm hover:shadow-md transition-all ${stat.border}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">{stat.label}</span>
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            {loading
              ? <Skeleton className="h-8 w-16" />
              : <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
            }
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.section variants={item}>
            <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-teal-100 flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">AI Health Insights</h3>
                  {insightsLoading ? (
                    <div className="space-y-2 mt-2">
                      <Skeleton className="h-3.5 w-full" />
                      <Skeleton className="h-3.5 w-4/5" />
                      <Skeleton className="h-3.5 w-3/5" />
                    </div>
                  ) : aiInsights ? (
                    <div className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none prose-p:my-1">
                      <Markdown>{aiInsights}</Markdown>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600">Complete your medical profile to unlock personalized AI insights.</p>
                      <Link to="/medical-profile" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700">
                        Set up profile <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                  {aiInsights && (
                    <Link to="/chat" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all">
                      <MessageSquare className="w-3.5 h-3.5" /> Discuss with AI
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section variants={item}>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.path}
                  to={action.path}
                  className="flex items-center gap-3.5 p-4 rounded-2xl border border-gray-200 bg-white hover:shadow-md hover:border-gray-300 transition-all"
                >
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${action.bg}`}>
                    <action.icon className={`w-4 h-4 ${action.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800">{action.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </motion.section>
        </div>

        <div className="space-y-6">
          <motion.section variants={item}>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Health Overview</h2>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              {loading ? (
                <div className="flex flex-col items-center gap-4 py-4">
                  <Skeleton className="h-40 w-40 rounded-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <>
                  <div className="h-44 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={58} outerRadius={76} paddingAngle={4} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                          <Cell fill={healthInfo.ringColor} />
                          <Cell fill="#f3f4f6" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-bold text-gray-900">{healthScore}</span>
                      <span className="text-xs text-gray-400 mt-0.5">/ 100</span>
                      <span className="mt-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                        {healthInfo.label}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {[
                      { label: 'BMI Status', value: 'Normal', color: 'text-emerald-600' },
                      { label: 'Activity Level', value: 'Moderate', color: 'text-blue-600' },
                      { label: 'Sleep Quality', value: 'Good', color: 'text-amber-600' },
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between items-center px-3 py-2.5 rounded-xl bg-gray-50">
                        <span className="text-xs text-gray-500">{row.label}</span>
                        <span className={`text-xs font-bold ${row.color}`}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.section>

          <motion.section variants={item}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Recent Activity</h2>
              <Link to="/history" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
                </div>
              ) : recentHistory.length > 0 ? (
                <ul>
                  {recentHistory.map((entry, idx) => (
                    <li
                      key={entry.id}
                      className={`flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${idx < recentHistory.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                      <div className="h-8 w-8 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <HistoryIcon className="h-3.5 w-3.5 text-teal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {entry.type}: {entry.symptoms?.substring(0, 25) || 'Session'}
                          {entry.symptoms?.length > 25 ? '…' : ''}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(entry.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] border-gray-200 text-gray-400 flex-shrink-0">Done</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-5 h-5 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400">No recent activity yet.</p>
                  <Link to="/chat" className="mt-2 inline-block text-xs text-teal-600 hover:text-teal-700 font-medium">
                    Start a consultation →
                  </Link>
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
}
