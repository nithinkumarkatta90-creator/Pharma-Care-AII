import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Button, buttonVariants } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { Skeleton } from '../components/ui/skeleton';
import { Brain, Send, Sparkles, History, Trash2, Loader2, ArrowLeft, Heart, Info } from 'lucide-react';
import { aiService } from '../services/aiService';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../App';
import Markdown from 'react-markdown';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function MentalHealth() {
  const { user } = useAuth();
  const [entry, setEntry] = useState('');
  const [entries, setEntries] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'mental_health_journal'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setEntries(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return unsub;
  }, [user]);

  const handleSaveEntry = async () => {
    if (!entry.trim() || !user) return;

    try {
      await addDoc(collection(db, 'mental_health_journal'), {
        uid: user.uid,
        content: entry,
        createdAt: new Date().toISOString()
      });
      setEntry('');
      toast.success('Journal entry saved');
    } catch (error) {
      toast.error('Failed to save entry');
    }
  };

  const handleAnalyze = async () => {
    if (entries.length === 0) {
      toast.error('Please add some journal entries first');
      return;
    }

    setAnalyzing(true);
    try {
      const journalTexts = entries.slice(0, 5).map(e => e.content);
      const result = await aiService.analyzeMentalHealth(journalTexts);
      setAnalysis(result);
      toast.success('AI Analysis complete');
    } catch (error) {
      toast.error('Failed to analyze journal');
    } finally {
      setAnalyzing(false);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'mental_health_journal', id));
      toast.success('Entry deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link 
          to="/" 
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "rounded-xl bg-white shadow-sm border border-slate-200"
          )}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-slate-900">AI Mental Wellness</h2>
          <p className="text-slate-500 text-sm">Journal your thoughts and get AI-powered emotional insights.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-xl overflow-hidden">
            <CardHeader className="bg-blue-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Daily Journal
              </CardTitle>
              <CardDescription className="text-blue-100">
                How are you feeling today? Write it down.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Textarea 
                placeholder="Write your thoughts here..."
                className="min-h-[200px] rounded-2xl border-slate-200 focus:ring-blue-500 text-lg p-6"
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-400">Your journal is private and secure.</p>
                <Button 
                  onClick={handleSaveEntry}
                  disabled={!entry.trim()}
                  className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8 font-bold"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Save Entry
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                Recent Entries
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAnalyze}
                disabled={entries.length === 0 || analyzing}
                className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Analyze Mood Trends
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-4 pr-4">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                  ))
                ) : entries.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-500">No entries yet. Start journaling today!</p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {entries.map((e) => (
                      <motion.div
                        key={e.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-xs font-bold text-blue-600">
                                {new Date(e.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => deleteEntry(e.id)}
                                className="h-8 w-8 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="text-slate-700 whitespace-pre-wrap">{e.content}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Brain className="w-32 h-32" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI Emotional Insights
              </CardTitle>
              <CardDescription className="text-indigo-100">
                Personalized analysis of your mood and mental well-being.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <AnimatePresence mode="wait">
                {analyzing ? (
                  <motion.div 
                    key="analyzing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <Skeleton className="h-4 w-full bg-white/20" />
                    <Skeleton className="h-4 w-full bg-white/20" />
                    <Skeleton className="h-4 w-3/4 bg-white/20" />
                    <div className="pt-4 flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      >
                        <Loader2 className="w-4 h-4" />
                      </motion.div>
                      <span className="text-sm">Analyzing emotional patterns...</span>
                    </div>
                  </motion.div>
                ) : analysis ? (
                  <motion.div 
                    key="analysis"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="prose prose-sm prose-invert max-w-none"
                  >
                    <Markdown>{analysis}</Markdown>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <p className="text-indigo-100 text-sm italic">
                      "The first step towards change is awareness."
                    </p>
                    <Button 
                      onClick={handleAnalyze}
                      className="mt-6 bg-white text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl w-full"
                      disabled={entries.length === 0}
                    >
                      Get AI Insights
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 text-blue-700">
              <Info className="w-5 h-5" />
              <h4 className="font-bold">Need Help?</h4>
            </div>
            <p className="text-sm text-blue-600 leading-relaxed">
              If you're experiencing a crisis or need immediate support, please reach out to professional services.
            </p>
            <div className="space-y-2">
              <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Resources:</p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• National Suicide Prevention Lifeline: 988</li>
                <li>• Crisis Text Line: Text HOME to 741741</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
