import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { 
  Search, 
  Plus, 
  X, 
  ChevronRight, 
  Utensils, 
  History, 
  UserCircle,
  Check,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../App';
import { dietService } from '../services/dietService';
import { MASTER_DISEASES, DISEASE_CATEGORIES } from '../constants/diseases';
import { Disease, MedicalProfile } from '../types/diet';
import { Button, buttonVariants } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Checkbox } from '../components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function DietPlans() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [customDisease, setCustomDisease] = useState('');
  const [profile, setProfile] = useState<MedicalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const data = await dietService.getMedicalProfile(user!.uid);
      if (data) {
        setProfile(data);
        setSelectedDiseases(data.selectedDiseases || []);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDiseases = useMemo(() => {
    if (!searchQuery) return [];
    return MASTER_DISEASES.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const toggleDisease = (name: string) => {
    setSelectedDiseases(prev => 
      prev.includes(name) 
        ? prev.filter(d => d !== name) 
        : [...prev, name]
    );
  };

  const addCustomDisease = () => {
    if (customDisease.trim() && !selectedDiseases.includes(customDisease.trim())) {
      setSelectedDiseases(prev => [...prev, customDisease.trim()]);
      setCustomDisease('');
      toast.success(`Added custom condition: ${customDisease}`);
    }
  };

  const handleContinue = async () => {
    if (selectedDiseases.length === 0) {
      toast.error("Please select at least one condition");
      return;
    }

    if (!profile) {
      navigate('/medical-profile', { state: { selectedDiseases } });
      return;
    }

    // Update profile with new diseases
    try {
      await dietService.saveMedicalProfile({
        ...profile,
        selectedDiseases
      });
      navigate('/diet-plan-generate');
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

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
      className="max-w-6xl mx-auto space-y-10 pb-24"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
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
            <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1 mb-1">
              Nutrition AI
            </Badge>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Smart Diet Recommendation</h1>
            <p className="text-slate-500 text-sm font-medium">Select your health conditions for a personalized nutrition plan.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/diet-history')} className="gap-2 rounded-2xl h-12 px-6 font-bold border-slate-200 hover:bg-slate-50 transition-all">
            <History className="w-4 h-4" />
            History
          </Button>
          <Button variant="outline" onClick={() => navigate('/medical-profile')} className="gap-2 rounded-2xl h-12 px-6 font-bold border-slate-200 hover:bg-slate-50 transition-all">
            <UserCircle className="w-4 h-4" />
            Profile
          </Button>
        </div>
      </div>

      {/* Selected Diseases Chips */}
      <AnimatePresence>
        {selectedDiseases.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-wrap items-center gap-3 p-6 bg-white rounded-[2rem] border border-blue-100 shadow-xl shadow-blue-50/50"
          >
            <div className="flex items-center gap-2 mr-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {selectedDiseases.length}
              </div>
              <span className="text-sm font-bold text-slate-900">Selected Conditions</span>
            </div>
            <div className="flex flex-wrap gap-2 flex-1">
              {selectedDiseases.map(d => (
                <Badge 
                  key={d} 
                  variant="secondary" 
                  className="bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600 border-none px-4 py-2 rounded-xl gap-2 group transition-all cursor-pointer font-bold text-xs"
                  onClick={() => toggleDisease(d)}
                >
                  {d}
                  <X className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </Badge>
              ))}
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-8 font-bold shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95"
              onClick={handleContinue}
            >
              Generate Plan
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Search & Categories */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  placeholder="Search 150+ diseases (e.g. Diabetes, Hypertension...)" 
                  className="pl-12 h-16 text-lg border-slate-100 bg-slate-50/50 focus:bg-white rounded-2xl transition-all font-medium placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {searchQuery ? (
                <ScrollArea className="h-[600px] px-8 pb-8">
                  {filteredDiseases.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredDiseases.map(d => (
                        <motion.div 
                          key={d.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                            selectedDiseases.includes(d.name) 
                              ? 'border-blue-200 bg-blue-50/50 ring-2 ring-blue-50' 
                              : 'border-slate-50 hover:border-slate-200 hover:bg-slate-50'
                          }`}
                          onClick={() => toggleDisease(d.name)}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                              selectedDiseases.includes(d.name) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {selectedDiseases.includes(d.name) ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{d.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d.category}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle className="w-10 h-10 text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-bold text-lg">No matching condition found</p>
                      <Button 
                        variant="link" 
                        className="text-blue-600 font-bold mt-2"
                        onClick={() => setCustomDisease(searchQuery)}
                      >
                        Add "{searchQuery}" as custom condition?
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              ) : (
                <Tabs defaultValue={DISEASE_CATEGORIES[0]} className="w-full">
                  <TabsList className="w-full justify-start overflow-x-auto bg-slate-50/50 p-2 h-auto border-b border-slate-100 rounded-none no-scrollbar gap-2 px-8">
                    {DISEASE_CATEGORIES.map(cat => (
                      <TabsTrigger 
                        key={cat} 
                        value={cat}
                        className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all"
                      >
                        {cat}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {DISEASE_CATEGORIES.map(cat => (
                    <TabsContent key={cat} value={cat} className="m-0">
                      <ScrollArea className="h-[600px] p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {MASTER_DISEASES.filter(d => d.category === cat).map(d => (
                            <motion.div 
                              key={d.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all cursor-pointer ${
                                selectedDiseases.includes(d.name) 
                                  ? 'border-blue-200 bg-blue-50/50 ring-2 ring-blue-50' 
                                  : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                              }`}
                              onClick={() => toggleDisease(d.name)}
                            >
                              <Checkbox 
                                checked={selectedDiseases.includes(d.name)}
                                onCheckedChange={() => toggleDisease(d.name)}
                                className="rounded-lg w-5 h-5 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                              />
                              <span className={`font-bold text-sm ${selectedDiseases.includes(d.name) ? 'text-blue-900' : 'text-slate-700'}`}>
                                {d.name}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Custom Disease & Quick Tips */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-bold">Custom Condition</CardTitle>
              <CardDescription className="font-medium">If your condition is not in the list, add it manually.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-4">
              <Input 
                placeholder="Enter condition name..." 
                className="h-14 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white font-medium"
                value={customDisease}
                onChange={(e) => setCustomDisease(e.target.value)}
              />
              <Button 
                className="w-full h-14 rounded-xl gap-2 font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all active:scale-95" 
                onClick={addCustomDisease}
                disabled={!customDisease.trim()}
              >
                <Plus className="w-5 h-5" />
                Add Condition
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl shadow-blue-200 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Utensils className="w-32 h-32 rotate-12" />
            </div>
            <CardContent className="p-10 space-y-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Utensils className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight">Why it matters?</h3>
                <p className="text-blue-100 text-sm font-medium leading-relaxed">
                  Nutrition is the foundation of recovery. Our AI analyzes your specific conditions to create a diet that manages symptoms and promotes healing.
                </p>
              </div>
              <ul className="space-y-4">
                {[
                  'Evidence-based guidelines',
                  'Personalized to your BMI',
                  'Considers multiple conditions'
                ].map((tip, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-blue-50">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
