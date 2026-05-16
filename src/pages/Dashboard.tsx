import { useEffect, useState, useMemo, useCallback } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useAuth } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { 
  Activity, 
  Bell, 
  Pill, 
  History as HistoryIcon, 
  TrendingUp,
  ArrowRight,
  Stethoscope,
  Zap,
  Book,
  Utensils,
  QrCode,
  Camera,
  FileText,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Brain,
  Search,
  MessageSquare
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Button, buttonVariants } from '../components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { aiService } from '../services/aiService';
import Markdown from 'react-markdown';
import { Input } from '../components/ui/input';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: 'spring' as const, 
      stiffness: 300, 
      damping: 24 
    } 
  }
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      if (healthLoaded && remindersLoaded && medicinesLoaded && historyLoaded) {
        setLoading(false);
      }
    };

    // Fetch health score from user profile
    const userDoc = doc(db, 'users', user.uid);
    getDoc(userDoc).then(snap => {
      if (snap.exists()) {
        setHealthScore(snap.data().healthScore || 85);
      }
      healthLoaded = true;
      checkAllLoaded();
    }).catch(error => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      healthLoaded = true;
      checkAllLoaded();
    });

    // Active reminders
    const remindersQuery = query(collection(db, 'reminders'), where('uid', '==', user.uid), where('isActive', '==', true));
    const unsubReminders = onSnapshot(remindersQuery, (snap) => {
      setRemindersCount(snap.size);
      remindersLoaded = true;
      checkAllLoaded();
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reminders');
      remindersLoaded = true;
      checkAllLoaded();
    });

    // Medicine search history count
    const medicinesQuery = query(collection(db, 'medicine_search'), where('uid', '==', user.uid));
    const unsubMedicines = onSnapshot(medicinesQuery, (snap) => {
      setMedicinesCount(snap.size);
      medicinesLoaded = true;
      checkAllLoaded();
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'medicine_search');
      medicinesLoaded = true;
      checkAllLoaded();
    });

    // Recent history (diagnosis)
    const diagQuery = query(collection(db, 'diagnosis_history'), where('uid', '==', user.uid));
    const unsubDiag = onSnapshot(diagQuery, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data(), type: 'Diagnosis' }));
      setRecentHistory(docs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3));
      historyLoaded = true;
      checkAllLoaded();
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'diagnosis_history');
      historyLoaded = true;
      checkAllLoaded();
    });

    // Fetch AI Insights
    const fetchInsights = async () => {
      const cachedInsights = sessionStorage.getItem(`ai_insights_${user.uid}`);
      if (cachedInsights) {
        setAiInsights(cachedInsights);
        return;
      }

      setInsightsLoading(true);
      try {
        const profileSnap = await getDoc(doc(db, 'medical_profiles', user.uid));
        const profile = profileSnap.exists() ? profileSnap.data() : {};
        
        const insights = await aiService.getHealthInsights(profile, [], []);
        setAiInsights(insights);
        sessionStorage.setItem(`ai_insights_${user.uid}`, insights);
      } catch (err: any) {
        console.error("Failed to fetch AI insights", err);
        const errorMsg = err?.message || err?.toString() || '';
        if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota')) {
          setAiInsights("💡 **Daily Tip:** Stay hydrated and maintain a balanced diet. (Personalized AI insights are temporarily unavailable due to high demand. Please try again later.)");
        } else {
          setAiInsights("Unable to generate personalized insights at this moment. Please check back later.");
        }
      } finally {
        setInsightsLoading(false);
      }
    };

    fetchInsights();

    return () => {
      unsubReminders();
      unsubMedicines();
      unsubDiag();
    };
  }, [user]);

  const chartData = useMemo(() => [
    { name: 'Score', value: healthScore },
    { name: 'Remaining', value: 100 - healthScore },
  ], [healthScore]);

  const COLORS = ['#2563eb', 'var(--muted)'];

  const healthInfo = useMemo(() => {
    if (healthScore >= 80) return { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
    if (healthScore >= 60) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' };
    if (healthScore >= 40) return { label: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' };
    return { label: 'Poor', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' };
  }, [healthScore]);

  const features = useMemo(() => [
    { name: 'Rx Scanner Pro', path: '/rx-scanner', icon: Camera, color: 'bg-rose-500', text: 'AI Extraction' },
    { name: 'Drug Intelligence', path: '/medicine-info', icon: Pill, color: 'bg-blue-500', text: 'Drug database' },
    { name: 'Interaction Check', path: '/interaction', icon: AlertTriangle, color: 'bg-amber-500', text: 'Safety check' },
    { name: 'Symptom Analysis', path: '/symptom-checker', icon: Stethoscope, color: 'bg-indigo-500', text: 'AI Diagnosis' },
    { name: 'Lab AI Analysis', path: '/lab-reports', icon: FileText, color: 'bg-cyan-500', text: 'Report summary' },
    { name: 'Skin AI Check', path: '/skin-analyzer', icon: ShieldAlert, color: 'bg-orange-500', text: 'Dermatology' },
    { name: 'QR Verification', path: '/qr-verification', icon: QrCode, color: 'bg-sky-600', text: 'Authenticity' },
    { name: 'Mental Wellness', path: '/mental-health', icon: Brain, color: 'bg-purple-500', text: 'Mood & Journal' },
    { name: 'Med Reminders', path: '/reminders', icon: Bell, color: 'bg-blue-600', text: 'Dose schedule' },
    { name: 'Health History', path: '/history', icon: HistoryIcon, color: 'bg-teal-600', text: 'Saved scans' },
  ], []);

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div variants={item}>
          <h2 className="text-4xl font-black text-foreground tracking-tight">
            Hello, {user?.displayName?.split(' ')[0]}!
          </h2>
          <p className="text-muted-foreground font-medium mt-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Your health dashboard is ready for today.
          </p>
        </motion.div>
        <motion.div variants={item} className="flex gap-3">
          <Link 
            to="/rx-scanner"
            className={buttonVariants({ className: "bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-6 h-12 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95" })}
          >
            <Camera className="w-5 h-5 mr-2" />
            Scan Prescription
          </Link>
          <Link 
            to="/chat"
            className={buttonVariants({ variant: "outline", className: "rounded-2xl px-6 h-12 font-bold border-border hover:bg-muted transition-all hover:scale-105 active:scale-95" })}
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            AI Chat
          </Link>
        </motion.div>
      </div>

      <motion.div variants={item} className="relative">
        <form onSubmit={handleQuickSearch} className="relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <Input 
            type="text" 
            placeholder="Search for medicines, symptoms, or health tips..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-16 pl-14 pr-32 bg-card border-none shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl text-lg font-medium focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-6 h-10 font-bold">
              Search
            </Button>
          </div>
        </form>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Health Score', value: `${healthScore}/100`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', trend: '+2%' },
          { label: 'Active Reminders', value: remindersCount, icon: Bell, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Medicines Logged', value: medicinesCount, icon: Pill, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Consultations', value: recentHistory.length, icon: HistoryIcon, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' }
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            variants={item}
            whileHover={{ y: -5 }}
          >
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-3xl overflow-hidden group h-full bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${stat.bg} rounded-2xl group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  {stat.trend && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full uppercase tracking-wider">
                      {stat.trend} Up
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                {loading ? <Skeleton className="h-8 w-16 mt-2" /> : <h3 className="text-3xl font-black text-foreground mt-1">{stat.value}</h3>}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={item} className="lg:col-span-2 space-y-8">
          {/* AI Insights Card */}
          <Card className="border-none shadow-lg shadow-blue-100/50 dark:shadow-none rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <Sparkles className="w-6 h-6 text-amber-300" />
                AI Health Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insightsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full bg-white/20" />
                  <Skeleton className="h-4 w-3/4 bg-white/20" />
                  <Skeleton className="h-4 w-5/6 bg-white/20" />
                </div>
              ) : aiInsights ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <Markdown>{aiInsights}</Markdown>
                </div>
              ) : (
                <p className="text-blue-100 text-sm">Complete your medical profile to get personalized AI insights.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-xl font-bold">
                Recent Activity
                <Link 
                  to="/history" 
                  className={buttonVariants({ variant: "ghost", size: "sm", className: "rounded-xl font-bold text-primary hover:bg-primary/10" })}
                >
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  ))
                ) : recentHistory.length > 0 ? (
                  recentHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 rounded-2xl border border-border transition-colors group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-card rounded-xl shadow-sm group-hover:scale-105 transition-transform">
                          <Stethoscope className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{item.type}: {item.symptoms?.substring(0, 30)}...</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-card text-primary border-primary/20 rounded-lg font-bold text-[10px] uppercase">Completed</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground font-medium">No recent activity found.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden h-full bg-card">
            <CardHeader className="pb-0">
              <CardTitle className="text-xl font-bold">Health Overview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-0">
              {loading ? (
                <div className="w-full space-y-8 flex flex-col items-center py-8">
                  <Skeleton className="h-52 w-52 rounded-full" />
                  <div className="space-y-4 w-full">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={95}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-5xl font-black text-foreground tracking-tighter">{healthScore}%</span>
                      <Badge className={`${healthInfo.bg} ${healthInfo.color} border-none font-black text-[10px] uppercase tracking-widest px-3 py-1`}>
                        {healthInfo.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full space-y-4 mt-4">
                    {[
                      { label: 'BMI Status', value: 'Normal', color: 'text-emerald-600' },
                      { label: 'Activity Level', value: 'Moderate', color: 'text-blue-600' },
                      { label: 'Sleep Quality', value: 'Good', color: 'text-amber-600' }
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-muted/30 rounded-2xl">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{row.label}</span>
                        <span className={`text-sm font-black ${row.color}`}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item} className="space-y-6">
        <h3 className="text-2xl font-black text-foreground tracking-tight">Quick Features</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {features.map((feature) => (
            <motion.div
              key={feature.path}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to={feature.path}
                className="group p-6 bg-card rounded-[2rem] border border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 flex flex-col items-center text-center h-full"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/10 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-sm font-bold text-foreground mb-1">{feature.name}</h4>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{feature.text}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
