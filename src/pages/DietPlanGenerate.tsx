import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Loader2, 
  Sparkles, 
  Utensils, 
  Brain, 
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../App';
import { dietService } from '../services/dietService';
import { MedicalProfile } from '../types/diet';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const loadingSteps = [
  { icon: Brain, text: "Analyzing health conditions...", color: "text-blue-500" },
  { icon: Activity, text: "Calculating nutritional requirements...", color: "text-indigo-500" },
  { icon: Utensils, text: "Designing personalized meal plans...", color: "text-green-500" },
  { icon: Sparkles, text: "Finalizing your smart diet plan...", color: "text-amber-500" }
];

export default function DietPlanGenerate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      generatePlan();
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % loadingSteps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const generatePlan = async () => {
    try {
      const profile = await dietService.getMedicalProfile(user!.uid);
      if (!profile || !profile.selectedDiseases || profile.selectedDiseases.length === 0) {
        navigate('/diet-plans');
        return;
      }

      const plan = await dietService.generateDietPlan(profile);
      const savedPlan = await dietService.saveDietPlan(plan);
      
      toast.success("Diet plan generated successfully!");
      navigate(`/diet-plan-view/${savedPlan.id}`);
    } catch (err) {
      console.error("Error generating plan:", err);
      setError("AI generation failed. This could be due to a network issue or API limit. Please try again.");
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <AnimatePresence mode="wait">
        {!error ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="space-y-10 max-w-lg w-full"
          >
            <div className="relative">
              <div className="w-32 h-32 rounded-[2.5rem] bg-blue-50 flex items-center justify-center mx-auto relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 animate-pulse" />
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin relative z-10" />
              </div>
              <motion.div 
                className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shadow-lg shadow-amber-100/50"
                animate={{ rotate: 360, y: [0, -5, 0] }}
                transition={{ 
                  rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                  y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <Sparkles className="w-6 h-6 text-amber-600" />
              </motion.div>
            </div>

            <div className="space-y-3">
              <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1 mb-2">
                AI Engine Processing
              </Badge>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Crafting Your Plan</h2>
              <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                Our AI is analyzing your medical profile to design a nutrition strategy that works for you.
              </p>
            </div>

            <Card className="border-none shadow-2xl shadow-slate-100 rounded-[2.5rem] bg-white overflow-hidden p-8">
              <div className="space-y-6">
                {loadingSteps.map((step, idx) => (
                  <motion.div 
                    key={idx} 
                    className="flex items-center gap-5 text-left"
                    animate={{ 
                      opacity: idx === currentStep ? 1 : idx < currentStep ? 0.6 : 0.3,
                      x: idx === currentStep ? 10 : 0
                    }}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      idx < currentStep ? 'bg-emerald-100 text-emerald-600' : 
                      idx === currentStep ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 
                      'bg-slate-100 text-slate-400'
                    }`}>
                      {idx < currentStep ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <step.icon className={`w-6 h-6 ${idx === currentStep ? 'animate-pulse' : ''}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className={`text-sm font-black uppercase tracking-widest transition-colors duration-500 ${
                        idx === currentStep ? 'text-slate-900' : 'text-slate-400'
                      }`}>
                        {step.text}
                      </span>
                      {idx === currentStep && (
                        <motion.div 
                          className="h-1 bg-blue-100 rounded-full mt-2 overflow-hidden"
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 3, ease: "linear" }}
                        >
                          <div className="h-full bg-blue-600 w-1/3 animate-[loading_1.5s_infinite_linear]" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
              Powered by PharmaCare Smart AI
            </p>
          </motion.div>
        ) : (
          <motion.div 
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-md w-full"
          >
            <div className="w-24 h-24 rounded-[2rem] bg-rose-50 flex items-center justify-center mx-auto shadow-lg shadow-rose-100">
              <AlertCircle className="w-12 h-12 text-rose-600" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Generation Failed</h2>
              <p className="text-slate-500 font-medium leading-relaxed">{error}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/diet-plans')} 
                className="flex-1 h-14 rounded-2xl font-bold border-slate-200 hover:bg-slate-50"
              >
                Go Back
              </Button>
              <Button 
                onClick={generatePlan} 
                className="flex-1 h-14 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-100 transition-all hover:scale-105 active:scale-95"
              >
                Try Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
