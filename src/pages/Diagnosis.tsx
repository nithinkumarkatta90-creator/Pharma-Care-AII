import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, query, where, orderBy, limit, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { aiService } from '../services/aiService';
import { Button, buttonVariants } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Stethoscope, Loader2, AlertCircle, CheckCircle2, History, Info, Search, X, AlertTriangle, ShieldAlert, HeartPulse, Home, Pill, UserRound, Zap, FileText, ArrowLeft } from 'lucide-react';
import Markdown from 'react-markdown';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const COMMON_SYMPTOMS = [
  "Fever", "Cough", "Headache", "Sore throat", "Runny nose", "Body ache", 
  "Fatigue", "Shortness of breath", "Chest pain", "Nausea", "Vomiting", 
  "Diarrhea", "Abdominal pain", "Rash", "Dizziness", "Loss of taste/smell",
  "Joint pain", "Muscle weakness", "Blurred vision", "Ear pain"
];

const EMERGENCY_SYMPTOMS = [
  "Chest pain", "Breathing difficulty", "Shortness of breath", "Seizures", 
  "Severe bleeding", "Unconsciousness", "Stroke symptoms", "Severe allergic reaction"
];

export default function Diagnosis() {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('Mild');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [diseases, setDiseases] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medicines, setMedicines] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isEmergency, setIsEmergency] = useState(false);
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
          setGender(data.gender || '');
          setDiseases(data.disease || '');
        }
      } catch (error) {
        console.error(error);
      }
    };

    // Fetch diagnosis history
    const q = query(
      collection(db, 'diagnosis_history'),
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

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom) 
        : [...prev, symptom]
    );
  };

  const checkEmergency = (selectedSymptoms: string[]) => {
    return selectedSymptoms.some(s => EMERGENCY_SYMPTOMS.includes(s));
  };

  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (symptoms.length === 0 || !user) {
      toast.error("Please select at least one symptom");
      return;
    }

    const emergencyDetected = checkEmergency(symptoms);
    setIsEmergency(emergencyDetected);

    setLoading(true);
    try {
      const data = {
        symptoms: symptoms.join(', '),
        duration,
        severity,
        age: parseInt(age) || 30,
        gender: gender || 'Not specified',
        existingDiseases: diseases || 'None',
        allergies: allergies || 'None',
        currentMedicines: medicines || 'None'
      };
      
      const analysis = await aiService.checkSymptoms(data);
      setResult(analysis);

      // Save to Firestore
      await addDoc(collection(db, 'diagnosis_history'), {
        uid: user.uid,
        symptoms: data.symptoms,
        duration: data.duration,
        severity: data.severity,
        age: data.age,
        gender: data.gender,
        existingDiseases: data.existingDiseases,
        allergies: data.allergies,
        currentMedicines: data.currentMedicines,
        result: analysis,
        isEmergency: emergencyDetected,
        createdAt: new Date().toISOString()
      });

      toast.success('Analysis complete');
    } catch (error: any) {
      toast.error('Failed to get analysis');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSymptoms = COMMON_SYMPTOMS.filter(s => 
    s.toLowerCase().includes(searchTerm.toLowerCase()) && !symptoms.includes(s)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
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
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Symptom Checker</h2>
          <p className="text-slate-500 text-sm">Get instant AI-powered medical guidance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Input Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-2 space-y-6"
        >
          <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle>Symptom Assessment</CardTitle>
                  <CardDescription>Provide details about how you're feeling.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <form onSubmit={handleDiagnose} className="space-y-8">
                {/* Symptom Selection */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Select Symptoms</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="Search symptoms (e.g. Fever, Cough...)" 
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  {searchTerm && filteredSymptoms.length > 0 && (
                    <div className="p-2 border rounded-lg bg-white shadow-sm max-h-40 overflow-y-auto">
                      {filteredSymptoms.map(s => (
                        <button
                          key={s}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-md text-sm transition-colors"
                          onClick={() => {
                            toggleSymptom(s);
                            setSearchTerm('');
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {symptoms.map(s => (
                      <Badge 
                        key={s} 
                        variant="secondary" 
                        className="pl-2 pr-1 py-1 gap-1 bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100"
                      >
                        {s}
                        <button 
                          type="button" 
                          onClick={() => toggleSymptom(s)}
                          className="hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                    {symptoms.length === 0 && (
                      <p className="text-sm text-slate-400 italic">No symptoms selected yet.</p>
                    )}
                  </div>
                </div>

                {/* Profile & Context */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input 
                      id="duration"
                      placeholder="e.g. 2 days, 1 week"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="severity">Severity</Label>
                    <Select value={severity} onValueChange={setSeverity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mild">Mild</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="Severe">Severe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input 
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diseases">Existing Diseases</Label>
                    <Input 
                      id="diseases"
                      placeholder="e.g. Diabetes, Hypertension"
                      value={diseases}
                      onChange={(e) => setDiseases(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies (Optional)</Label>
                    <Input 
                      id="allergies"
                      placeholder="e.g. Peanuts, Penicillin"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medicines">Current Medicines (Optional)</Label>
                    <Input 
                      id="medicines"
                      placeholder="e.g. Metformin, Aspirin"
                      value={medicines}
                      onChange={(e) => setMedicines(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className={cn(
                      "w-full h-14 text-lg font-bold transition-all duration-300 shadow-lg",
                      checkEmergency(symptoms) 
                        ? "bg-red-600 hover:bg-red-700 shadow-red-200" 
                        : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                    )} 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                          <Loader2 className="w-6 h-6 mr-3" />
                        </motion.div>
                        Analyzing Symptoms...
                      </>
                    ) : (
                      <>
                        <Zap className="w-6 h-6 mr-3" />
                        Get AI Analysis
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Results Section */}
          {loading ? (
            <Card className="border-none shadow-xl overflow-hidden">
              <div className="h-2 bg-blue-600 animate-pulse" />
              <CardContent className="p-8 space-y-6">
                <div className="flex gap-4 items-center">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <Skeleton className="h-8 w-64" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <Skeleton className="h-32 w-full rounded-xl" />
                  <Skeleton className="h-32 w-full rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ) : result ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Emergency Alert */}
              {isEmergency && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <Card className="border-red-200 bg-red-50 shadow-lg shadow-red-100 overflow-hidden">
                    <div className="bg-red-600 px-6 py-3 flex items-center gap-3 text-white">
                      <ShieldAlert className="w-6 h-6 animate-pulse" />
                      <h3 className="font-bold text-lg">🚨 Emergency Condition Detected</h3>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-red-800 font-semibold text-lg mb-2">
                        Call an ambulance or visit the nearest hospital immediately.
                      </p>
                      <p className="text-red-700 text-sm">
                        Your symptoms indicate a potentially life-threatening situation. Do not wait.
                      </p>
                      <div className="mt-4 flex gap-4">
                        <Button className="bg-red-600 hover:bg-red-700 text-white font-bold px-8">
                          Call Emergency (911)
                        </Button>
                        <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-100">
                          Find Nearest Hospital
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Main Analysis */}
              <Card className="border-none shadow-xl overflow-hidden">
                <CardHeader className="bg-slate-900 text-white p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      <CardTitle>AI Preliminary Analysis</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-white border-white/20">
                      {new Date().toLocaleDateString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-strong:text-slate-900">
                    <Markdown>{result}</Markdown>
                  </div>

                  <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold">
                        <Home className="w-5 h-5" />
                        Home Care
                      </div>
                      <p className="text-sm text-emerald-800 leading-relaxed">
                        Follow the AI-suggested home remedies and diet plan for faster recovery. Ensure plenty of rest and hydration.
                      </p>
                    </div>
                    <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
                      <div className="flex items-center gap-2 text-blue-700 font-bold">
                        <UserRound className="w-5 h-5" />
                        Specialist Advice
                      </div>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        Based on your symptoms, we recommend consulting a specialist.
                      </p>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-8">
                        Consult Doctor Now
                      </Button>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-3">
                    <Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500 italic leading-relaxed">
                      <strong>Safety Note:</strong> This app provides AI-based guidance only. It is not a replacement for a doctor. Always consult a certified doctor or pharmacist before taking any medication or following home remedies.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-slate-300 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200">
              <HeartPulse className="w-20 h-20 mb-6 opacity-20" />
              <p className="text-xl font-medium">Your analysis will appear here</p>
              <p className="text-sm mt-2">Select your symptoms and click "Get AI Analysis"</p>
            </div>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* History Sidebar */}
          <Card className="border-none shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="w-5 h-5 text-slate-400" />
                  Recent Checks
                </CardTitle>
                <Link 
                  to="/history" 
                  className={buttonVariants({ variant: "ghost", size: "sm", className: "text-xs text-blue-600 hover:text-blue-700 px-2 h-7" })}
                >
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 cursor-pointer transition-all hover:shadow-md group"
                    onClick={() => {
                      setSymptoms(item.symptoms.split(', '));
                      setDuration(item.duration || '');
                      setSeverity(item.severity || 'Mild');
                      setAge(item.age?.toString() || '');
                      setGender(item.gender || '');
                      setDiseases(item.existingDiseases || '');
                      setResult(item.result);
                      setIsEmergency(item.isEmergency || false);
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {item.symptoms}
                      </p>
                      {item.isEmergency && <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-[10px] text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                      <Badge variant="outline" className={cn(
                        "text-[8px] h-4 px-1.5",
                        item.severity === 'Severe' ? "text-red-600 border-red-100 bg-red-50" :
                        item.severity === 'Moderate' ? "text-amber-600 border-amber-100 bg-amber-50" :
                        "text-emerald-600 border-emerald-100 bg-emerald-50"
                      )}>
                        {item.severity}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 text-sm">
                  <History className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p>No recent checks found.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldAlert className="w-24 h-24" />
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Info className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-lg">Safety First</h4>
              </div>
              <p className="text-sm text-blue-50 leading-relaxed mb-4">
                PharmaCare AI uses advanced medical logic to analyze symptoms, but it is not a diagnostic tool. 
              </p>
              <ul className="text-xs space-y-2 text-blue-100">
                <li className="flex gap-2">
                  <div className="w-1 h-1 bg-white rounded-full mt-1.5 flex-shrink-0" />
                  Always consult a human doctor.
                </li>
                <li className="flex gap-2">
                  <div className="w-1 h-1 bg-white rounded-full mt-1.5 flex-shrink-0" />
                  Do not ignore severe pain.
                </li>
                <li className="flex gap-2">
                  <div className="w-1 h-1 bg-white rounded-full mt-1.5 flex-shrink-0" />
                  Verify OTC meds with a pharmacist.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card className="border-none shadow-lg bg-red-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-red-900 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-red-600" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-red-100">
                <span className="text-xs font-medium text-slate-600">Ambulance</span>
                <span className="text-sm font-bold text-red-600">911 / 102</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-red-100">
                <span className="text-xs font-medium text-slate-600">Poison Control</span>
                <span className="text-sm font-bold text-red-600">1-800-222-1222</span>
              </div>
            </CardContent>
          </Card>

          {/* Upload Report Extra Feature */}
          <Card className="border-none shadow-lg bg-emerald-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                Have a Lab Report?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-[10px] text-emerald-800">
                Upload your blood, sugar, or lab reports for a more detailed AI analysis.
              </p>
              <Link 
                to="/lab-reports"
                className={buttonVariants({ variant: "outline", className: "w-full border-emerald-200 text-emerald-700 hover:bg-emerald-100 h-8 text-xs" })}
              >
                Upload & Analyze Report
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
