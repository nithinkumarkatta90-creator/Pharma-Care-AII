import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, limit, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { aiService } from '../services/aiService';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Button, buttonVariants } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { AlertCircle, Loader2, Zap, ShieldAlert, History, Info, ArrowLeft } from 'lucide-react';
import Markdown from 'react-markdown';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

import { MedicineAutocomplete } from '../components/MedicineAutocomplete';
import { PageHeader } from '../components/PageHeader';

export default function SideEffects() {
  const { user } = useAuth();
  const [medicine, setMedicine] = useState('');
  const [age, setAge] = useState('');
  const [diseases, setDiseases] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [fetchingHistory, setFetchingHistory] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch user profile for defaults
    const fetchProfile = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setAge(data.age?.toString() || '');
          setDiseases(data.disease || '');
        }
      } catch (error) {
        console.error(error);
      }
    };

    // Fetch prediction history
    const q = query(
      collection(db, 'side_effect_predictions'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsub = onSnapshot(q, (snap) => {
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setFetchingHistory(false);
    }, (error) => {
      console.error(error);
      setFetchingHistory(false);
    });

    fetchProfile();
    return unsub;
  }, [user]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicine.trim() || !user) return;

    setLoading(true);
    try {
      const profile = { 
        age: parseInt(age) || 30, 
        existingDiseases: diseases || 'None' 
      };
      
      const prediction = await aiService.predictSideEffects(medicine, profile);
      setResult(prediction);

      await addDoc(collection(db, 'side_effect_predictions'), {
        uid: user.uid,
        medicineName: medicine,
        age: profile.age,
        existingDiseases: profile.existingDiseases,
        result: prediction,
        createdAt: new Date().toISOString()
      });
      
      toast.success('Prediction complete');
    } catch (error: any) {
      toast.error('Failed to predict side effects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <PageHeader
        icon={Zap}
        title="Side Effects AI"
        description="AI-powered prediction of potential side effects based on your health profile."
        color="purple"
        badge="AI Predictor"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Prediction Details</CardTitle>
              <CardDescription>Enter the medication and your health details for a personalized risk assessment.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePredict} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicine">Medicine Name</Label>
                    <MedicineAutocomplete 
                      placeholder="e.g. Ibuprofen, Lisinopril..." 
                      value={medicine}
                      onChange={setMedicine}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Your Age</Label>
                    <Input 
                      id="age"
                      type="number"
                      placeholder="e.g. 45" 
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diseases">Existing Diseases / Conditions</Label>
                  <Input 
                    id="diseases"
                    placeholder="e.g. Diabetes, Hypertension, None" 
                    value={diseases}
                    onChange={(e) => setDiseases(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      >
                        <Loader2 className="w-4 h-4 mr-2" />
                      </motion.div>
                      Predicting...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Predict Side Effects
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {loading ? (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ) : result ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <ShieldAlert className="w-5 h-5 text-amber-600" />
                    Prediction Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none text-slate-700">
                  <Markdown>{result}</Markdown>
                  <div className="mt-6 p-4 bg-white/50 rounded-lg border border-amber-200 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                    <p className="text-xs text-amber-800 italic">
                      Disclaimer: This prediction is AI-generated and should not replace professional medical advice. It does not guarantee that you will experience these side effects. Always consult your doctor.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : null}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-slate-400" />
                Recent Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fetchingHistory ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  ))
                ) : history.length > 0 ? (
                  history.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 cursor-pointer transition-colors"
                      onClick={() => {
                        setMedicine(item.medicineName);
                        setAge(item.age?.toString() || '');
                        setDiseases(item.existingDiseases || '');
                        setResult(item.result);
                      }}
                    >
                      <p className="text-sm font-medium text-slate-900">
                        {item.medicineName}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-[10px] text-slate-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                        <Badge variant="outline" className="text-[8px] h-4 px-1">
                          Age: {item.age}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No recent predictions found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Info className="w-6 h-6" />
                </div>
                <h4 className="font-bold">Why Personalize?</h4>
              </div>
              <p className="text-sm text-amber-50 leading-relaxed">
                Side effects can vary significantly based on age, weight, and pre-existing conditions. Our AI considers these factors to provide a more accurate risk profile.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
