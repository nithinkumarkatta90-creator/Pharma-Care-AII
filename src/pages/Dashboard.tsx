import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useAuth } from '../App';
import { Skeleton } from '../components/ui/skeleton';
import {
  Bell,
  Pill,
  History as HistoryIcon,
  ArrowRight,
  Book,
  FileText,
  AlertTriangle,
  ChevronRight,
  HeartPulse,
  Activity,
  Leaf,
  Syringe,
  FileHeart,
  ClipboardList,
  CalendarCheck,
  FlaskConical,
  AlertOctagon,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTheme } from 'next-themes';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 22 } },
};

const dataSources = [
  { name: 'Indian Pharmacopoeia 2022', org: 'IPC', url: 'https://ipc.gov.in', color: 'text-orange-400 bg-orange-500/10' },
  { name: 'ICMR Guidelines', org: 'ICMR', url: 'https://icmr.gov.in', color: 'text-teal-400 bg-teal-500/10' },
  { name: 'OpenFDA Drug Recalls', org: 'FDA', url: 'https://open.fda.gov', color: 'text-blue-400 bg-blue-500/10' },
  { name: 'IAP Immunization Schedule', org: 'IAP', url: 'https://iapindia.org', color: 'text-green-400 bg-green-500/10' },
  { name: 'NIN India — Nutrition', org: 'NIN', url: 'https://nin.res.in', color: 'text-amber-400 bg-amber-500/10' },
  { name: 'WHO ICD-11', org: 'WHO', url: 'https://icd.who.int', color: 'text-purple-400 bg-purple-500/10' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [healthScore, setHealthScore] = useState(85);
  const [remindersCount, setRemindersCount] = useState(0);
  const [medicinesCount, setMedicinesCount] = useState(0);
  const [healthRecordsCount, setHealthRecordsCount] = useState(0);
  const [prescriptionsCount, setPrescriptionsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let healthLoaded = false;
    let remindersLoaded = false;
    let medicinesLoaded = false;
    let recordsLoaded = false;
    let rxLoaded = false;

    const checkAllLoaded = () => {
      if (healthLoaded && remindersLoaded && medicinesLoaded && recordsLoaded && rxLoaded) setLoading(false);
    };

    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) setHealthScore(snap.data().healthScore || 85);
      healthLoaded = true; checkAllLoaded();
    }).catch(error => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      healthLoaded = true; checkAllLoaded();
    });

    const remindersQuery = query(collection(db, 'reminders'), where('uid', '==', user.uid), where('isActive', '==', true));
    const unsubReminders = onSnapshot(remindersQuery, snap => {
      setRemindersCount(snap.size); remindersLoaded = true; checkAllLoaded();
    }, error => {
      handleFirestoreError(error, OperationType.LIST, 'reminders');
      remindersLoaded = true; checkAllLoaded();
    });

    const medicinesQuery = query(collection(db, 'medicine_search'), where('uid', '==', user.uid));
    const unsubMedicines = onSnapshot(medicinesQuery, snap => {
      setMedicinesCount(snap.size); medicinesLoaded = true; checkAllLoaded();
    }, error => {
      handleFirestoreError(error, OperationType.LIST, 'medicine_search');
      medicinesLoaded = true; checkAllLoaded();
    });

    const recordsQuery = query(collection(db, 'health_records'), where('uid', '==', user.uid));
    const unsubRecords = onSnapshot(recordsQuery, snap => {
      setHealthRecordsCount(snap.size); recordsLoaded = true; checkAllLoaded();
    }, error => { recordsLoaded = true; checkAllLoaded(); });

    const rxQuery = query(collection(db, 'prescriptions'), where('uid', '==', user.uid));
    const unsubRx = onSnapshot(rxQuery, snap => {
      setPrescriptionsCount(snap.size); rxLoaded = true; checkAllLoaded();
    }, error => { rxLoaded = true; checkAllLoaded(); });

    return () => { unsubReminders(); unsubMedicines(); unsubRecords(); unsubRx(); };
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
    { label: 'Health Score', value: `${healthScore}%`, icon: HeartPulse, gradient: 'from-teal-500/20 via-teal-500/5 to-transparent', border: 'border-teal-500/20', iconBg: 'bg-teal-500/15', iconColor: 'text-teal-400', glow: 'shadow-teal-500/10' },
    { label: 'Active Reminders', value: remindersCount, icon: Bell, gradient: 'from-blue-500/20 via-blue-500/5 to-transparent', border: 'border-blue-500/20', iconBg: 'bg-blue-500/15', iconColor: 'text-blue-400', glow: 'shadow-blue-500/10' },
    { label: 'Health Records', value: healthRecordsCount, icon: FileHeart, gradient: 'from-indigo-500/20 via-indigo-500/5 to-transparent', border: 'border-indigo-500/20', iconBg: 'bg-indigo-500/15', iconColor: 'text-indigo-400', glow: 'shadow-indigo-500/10' },
    { label: 'Prescriptions', value: prescriptionsCount, icon: ClipboardList, gradient: 'from-cyan-500/20 via-cyan-500/5 to-transparent', border: 'border-cyan-500/20', iconBg: 'bg-cyan-500/15', iconColor: 'text-cyan-400', glow: 'shadow-cyan-500/10' },
  ], [healthScore, remindersCount, healthRecordsCount, prescriptionsCount]);

  const quickActions = useMemo(() => [
    { name: 'Health Records', path: '/health-records', icon: FileHeart, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20 hover:border-indigo-500/50', desc: 'Diagnoses, allergies, history' },
    { name: 'Prescriptions', path: '/prescriptions', icon: ClipboardList, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20 hover:border-blue-500/50', desc: 'Store & manage prescriptions' },
    { name: 'Vaccination Records', path: '/vaccination-records', icon: CalendarCheck, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20 hover:border-green-500/50', desc: 'Track your immunizations' },
    { name: 'Drug Recall Alerts', path: '/drug-recalls', icon: AlertOctagon, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20 hover:border-red-500/50', desc: 'FDA & CDSCO recalls' },
    { name: 'Lab Reference', path: '/lab-reference', icon: FlaskConical, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20 hover:border-purple-500/50', desc: 'Normal ranges & values' },
    { name: 'Drug Database', path: '/ip-database', icon: Book, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20 hover:border-amber-500/50', desc: 'Indian Pharmacopoeia 2022' },
    { name: 'Food & Nutraceuticals', path: '/nutraceuticals', icon: Leaf, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20 hover:border-emerald-500/50', desc: 'NIN/ICMR nutrition data' },
    { name: 'Vaccine Guide', path: '/vaccine-guide', icon: Syringe, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20 hover:border-cyan-500/50', desc: 'WHO/IAP immunization data' },
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
            <p className="text-slate-400 mt-1 text-sm">Your personal health hub — evidence-based, no AI advice.</p>
          </div>
          <div className="flex gap-2.5 flex-shrink-0">
            <Link to="/health-records"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.02] active:scale-95">
              <FileHeart className="w-4 h-4" /> My Records
            </Link>
            <Link to="/reminders"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600 transition-all">
              <Bell className="w-4 h-4" /> Reminders
            </Link>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={i} whileHover={{ scale: 1.02, y: -2 }} transition={{ type: 'spring', stiffness: 300 }}
              className={`relative overflow-hidden rounded-2xl border bg-slate-900/60 backdrop-blur-sm p-5 shadow-lg ${stat.border} ${stat.glow}`}>
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

            {/* Trusted Sources Banner */}
            <motion.section variants={item}>
              <div className="relative overflow-hidden rounded-2xl border border-teal-500/25 bg-slate-900/60 backdrop-blur-sm">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/60 to-transparent" />
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-teal-500/8 to-transparent pointer-events-none" />
                <div className="relative p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-teal-500/15 border border-teal-500/25 flex-shrink-0">
                      <Shield className="w-5 h-5 text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-white mb-1">Evidence-Based Healthcare Reference</h3>
                      <p className="text-sm text-slate-400 mb-4">All data sourced from trusted international and Indian health authorities. No AI-generated medical advice.</p>
                      <div className="flex flex-wrap gap-2">
                        {dataSources.map(src => (
                          <a key={src.org} href={src.url} target="_blank" rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${src.color} transition-opacity hover:opacity-80`}>
                            {src.org}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
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
                  <motion.div key={action.path} whileHover={{ scale: 1.015, y: -1 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <Link to={action.path}
                      className={`flex items-center gap-3.5 p-4 rounded-2xl border bg-slate-900/60 backdrop-blur-sm transition-all ${action.border}`}>
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
                          <Pie data={chartData} cx="50%" cy="50%" innerRadius={58} outerRadius={76} paddingAngle={4} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
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
                        { label: 'Medicines Logged', value: medicinesCount, color: 'text-teal-400' },
                        { label: 'Active Reminders', value: remindersCount, color: 'text-blue-400' },
                        { label: 'Prescriptions', value: prescriptionsCount, color: 'text-indigo-400' },
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between items-center px-3 py-2.5 rounded-xl bg-slate-800/60">
                          <span className="text-xs text-slate-400">{row.label}</span>
                          <span className={`text-xs font-bold ${row.color}`}>{loading ? '—' : row.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.section>

            {/* Upcoming */}
            <motion.section variants={item}>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Key References</h2>
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
                {[
                  { label: 'Check Drug Recalls', path: '/drug-recalls', icon: AlertOctagon, color: 'text-red-400', bg: 'bg-red-500/10' },
                  { label: 'Lab Normal Ranges', path: '/lab-reference', icon: FlaskConical, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                  { label: 'Vaccine Schedule', path: '/vaccine-guide', icon: Syringe, color: 'text-green-400', bg: 'bg-green-500/10' },
                  { label: 'Drug Interactions', path: '/interaction', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                ].map((ref, idx, arr) => (
                  <Link key={ref.path} to={ref.path}
                    className={`flex items-center gap-3 p-4 hover:bg-slate-800/50 transition-colors ${idx < arr.length - 1 ? 'border-b border-slate-800/60' : ''}`}>
                    <div className={`p-2 rounded-xl flex-shrink-0 ${ref.bg}`}>
                      <ref.icon className={`w-3.5 h-3.5 ${ref.color}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-300 flex-1">{ref.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  </Link>
                ))}
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
          <p className="text-gray-500 mt-1 text-sm">Your personal health hub — evidence-based, no AI advice.</p>
        </div>
        <div className="flex gap-2.5 flex-shrink-0">
          <Link to="/health-records"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/25 transition-all">
            <FileHeart className="w-4 h-4" /> My Records
          </Link>
          <Link to="/reminders"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all">
            <Bell className="w-4 h-4" /> Reminders
          </Link>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Health Score', value: `${healthScore}%`, icon: HeartPulse, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
          { label: 'Active Reminders', value: remindersCount, icon: Bell, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Health Records', value: healthRecordsCount, icon: FileHeart, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
          { label: 'Prescriptions', value: prescriptionsCount, icon: ClipboardList, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
        ].map((stat, i) => (
          <div key={i} className={`rounded-2xl border p-5 bg-white shadow-sm hover:shadow-md transition-all ${stat.border}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">{stat.label}</span>
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            {loading ? <Skeleton className="h-8 w-16" /> : <span className="text-3xl font-bold text-gray-900">{stat.value}</span>}
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          <motion.section variants={item}>
            <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-teal-100 flex-shrink-0">
                  <Shield className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Evidence-Based Healthcare Reference</h3>
                  <p className="text-sm text-gray-600 mb-4">All data sourced from trusted international and Indian health authorities. No AI-generated medical advice.</p>
                  <div className="flex flex-wrap gap-2">
                    {dataSources.map(src => (
                      <a key={src.org} href={src.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                        {src.org} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section variants={item}>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link key={action.path} to={action.path}
                  className="flex items-center gap-3.5 p-4 rounded-2xl border border-gray-200 bg-white hover:shadow-md hover:border-gray-300 transition-all">
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
                      { label: 'Medicines Logged', value: medicinesCount, color: 'text-teal-600' },
                      { label: 'Active Reminders', value: remindersCount, color: 'text-blue-600' },
                      { label: 'Prescriptions', value: prescriptionsCount, color: 'text-indigo-600' },
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
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Key References</h2>
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {[
                { label: 'Check Drug Recalls', path: '/drug-recalls', icon: AlertOctagon, color: 'text-red-500', bg: 'bg-red-50' },
                { label: 'Lab Normal Ranges', path: '/lab-reference', icon: FlaskConical, color: 'text-purple-500', bg: 'bg-purple-50' },
                { label: 'Vaccine Schedule', path: '/vaccine-guide', icon: Syringe, color: 'text-green-500', bg: 'bg-green-50' },
                { label: 'Drug Interactions', path: '/interaction', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
              ].map((ref, idx, arr) => (
                <Link key={ref.path} to={ref.path}
                  className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors ${idx < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className={`p-2 rounded-xl flex-shrink-0 ${ref.bg}`}>
                    <ref.icon className={`w-3.5 h-3.5 ${ref.color}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 flex-1">{ref.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                </Link>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
}
