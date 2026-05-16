import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  History, 
  ArrowLeft, 
  Calendar, 
  ChevronRight, 
  Utensils,
  Trash2,
  Search,
  Activity,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../App';
import { dietService } from '../services/dietService';
import { DetailedDietPlan } from '../types/diet';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';

export default function DietHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<DetailedDietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      const data = await dietService.getDietHistory(user!.uid);
      setHistory(data);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this diet plan?")) return;

    try {
      await deleteDoc(doc(db, 'detailed_diet_plans', id));
      setHistory(prev => prev.filter(p => p.id !== id));
      toast.success("Diet plan deleted");
    } catch (error) {
      toast.error("Failed to delete plan");
    }
  };

  const filteredHistory = history.filter(p => 
    p.diseases.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-10 pb-24"
    >
      <div className="flex items-center gap-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/diet-plans')}
          className="rounded-2xl h-12 w-12 bg-white border border-slate-100 shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Button>
        <div>
          <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1 mb-3">
            Health Records
          </Badge>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Diet History</h1>
          <p className="text-slate-500 font-medium mt-2">Access your previous AI-generated nutrition plans.</p>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <Input 
          placeholder="Search by condition..." 
          className="pl-12 h-16 text-lg border-slate-100 bg-white rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium placeholder:text-slate-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredHistory.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredHistory.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card 
                className="border-none shadow-sm hover:shadow-xl hover:shadow-blue-100/50 transition-all cursor-pointer group rounded-[2rem] bg-white overflow-hidden"
                onClick={() => navigate(`/diet-plan-view/${plan.id}`)}
              >
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        <Utensils className="w-8 h-8" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {plan.diseases.slice(0, 3).map(d => (
                            <Badge key={d} variant="secondary" className="bg-slate-100 text-slate-700 border-none px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider">
                              {d}
                            </Badge>
                          ))}
                          {plan.diseases.length > 3 && (
                            <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider">
                              +{plan.diseases.length - 3} more
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(plan.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5" />
                            BMI: {plan.bmi}
                          </span>
                          <span className="flex items-center gap-2">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {plan.caloriesEstimate}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 self-end md:self-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-12 w-12 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        onClick={(e) => handleDelete(e, plan.id!)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                      <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <ChevronRight className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-inner">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
            <History className="w-12 h-12 text-slate-200" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">No diet plans found</h3>
          <p className="text-slate-500 font-medium mt-3 max-w-xs mx-auto">
            Generate your first diet plan to see it here in your history.
          </p>
          <Button 
            className="mt-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 px-10 font-black shadow-xl shadow-blue-100 transition-all hover:scale-105 active:scale-95"
            onClick={() => navigate('/diet-plans')}
          >
            Generate New Plan
          </Button>
        </div>
      )}
    </motion.div>
  );
}
