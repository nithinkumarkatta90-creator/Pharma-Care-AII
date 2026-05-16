import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  Scale, 
  Ruler, 
  Heart, 
  AlertCircle, 
  ChevronRight,
  ArrowLeft,
  Check
} from 'lucide-react';
import { useAuth } from '../App';
import { dietService } from '../services/dietService';
import { MedicalProfile as MedicalProfileType } from '../types/diet';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export default function MedicalProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    foodPreference: 'Veg' as 'Veg' | 'Non-Veg',
    allergies: '',
    weightGoal: 'Maintain' as 'Loss' | 'Gain' | 'Maintain'
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const profile = await dietService.getMedicalProfile(user!.uid);
      if (profile) {
        setFormData({
          age: profile.age.toString(),
          gender: profile.gender,
          height: profile.height.toString(),
          weight: profile.weight.toString(),
          foodPreference: profile.foodPreference,
          allergies: profile.allergies || '',
          weightGoal: profile.weightGoal || 'Maintain'
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (!formData.age || !formData.gender || !formData.height || !formData.weight) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const selectedDiseases = location.state?.selectedDiseases || [];
      
      const profileData: MedicalProfileType = {
        uid: user.uid,
        age: Number(formData.age),
        gender: formData.gender,
        height: Number(formData.height),
        weight: Number(formData.weight),
        foodPreference: formData.foodPreference,
        allergies: formData.allergies,
        weightGoal: formData.weightGoal,
        selectedDiseases: selectedDiseases.length > 0 ? selectedDiseases : (await dietService.getMedicalProfile(user.uid))?.selectedDiseases || [],
        updatedAt: new Date().toISOString()
      };

      await dietService.saveMedicalProfile(profileData);
      toast.success("Medical profile saved successfully!");
      
      if (location.state?.selectedDiseases) {
        navigate('/diet-plan-generate');
      } else {
        navigate('/diet-plans');
      }
    } catch (error) {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
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
      className="max-w-4xl mx-auto space-y-10 pb-24"
    >
      <div className="flex items-center gap-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="rounded-2xl h-12 w-12 bg-white border border-slate-100 shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Button>
        <div>
          <Badge className="bg-indigo-50 text-indigo-600 border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1 mb-3">
            Health Profile
          </Badge>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Medical Profile</h1>
          <p className="text-slate-500 font-medium mt-2">Provide your details for accurate diet recommendations.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Age (Years)</Label>
                <Input 
                  id="age" 
                  type="number" 
                  placeholder="e.g. 25" 
                  className="h-14 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white font-bold text-lg"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Gender</Label>
                <Select 
                  onValueChange={(v) => setFormData({...formData, gender: v})} 
                  value={formData.gender}
                >
                  <SelectTrigger id="gender" className="h-14 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white font-bold text-lg">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                    <SelectItem value="Male" className="rounded-xl font-bold">Male</SelectItem>
                    <SelectItem value="Female" className="rounded-xl font-bold">Female</SelectItem>
                    <SelectItem value="Other" className="rounded-xl font-bold">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-indigo-600" />
                </div>
                Body Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="height" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Height (cm)</Label>
                <div className="relative group">
                  <Input 
                    id="height" 
                    type="number" 
                    placeholder="e.g. 170" 
                    className="h-14 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white font-bold text-lg pl-4 pr-12"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    required
                  />
                  <Ruler className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Weight (kg)</Label>
                <div className="relative group">
                  <Input 
                    id="weight" 
                    type="number" 
                    placeholder="e.g. 70" 
                    className="h-14 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white font-bold text-lg pl-4 pr-12"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    required
                  />
                  <Scale className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Heart className="w-5 h-5 text-rose-600" />
              </div>
              Preferences & Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="foodPref" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Food Preference</Label>
                <Select 
                  onValueChange={(v: any) => setFormData({...formData, foodPreference: v})} 
                  value={formData.foodPreference}
                >
                  <SelectTrigger id="foodPref" className="h-14 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white font-bold text-lg">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                    <SelectItem value="Veg" className="rounded-xl font-bold">Vegetarian</SelectItem>
                    <SelectItem value="Non-Veg" className="rounded-xl font-bold">Non-Vegetarian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Weight Goal</Label>
                <Select 
                  onValueChange={(v: any) => setFormData({...formData, weightGoal: v})} 
                  value={formData.weightGoal}
                >
                  <SelectTrigger id="goal" className="h-14 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white font-bold text-lg">
                    <SelectValue placeholder="Select goal" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                    <SelectItem value="Loss" className="rounded-xl font-bold">Weight Loss</SelectItem>
                    <SelectItem value="Gain" className="rounded-xl font-bold">Weight Gain</SelectItem>
                    <SelectItem value="Maintain" className="rounded-xl font-bold">Maintain Weight</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergies" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Allergies (Optional)</Label>
              <Textarea 
                id="allergies" 
                placeholder="List any food allergies (e.g. Peanuts, Dairy, Gluten...)" 
                className="h-[148px] rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white font-medium p-4"
                value={formData.allergies}
                onChange={(e) => setFormData({...formData, allergies: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-5 p-6 bg-amber-50/50 rounded-3xl border border-amber-100/50">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <p className="text-sm text-amber-900 font-medium leading-relaxed">
            Your data is used solely to generate personalized health recommendations and is stored securely. We follow strict privacy standards to protect your medical information.
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full h-16 text-xl font-black bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-100 transition-all hover:scale-[1.01] active:scale-[0.99]"
          disabled={saving}
        >
          {saving ? (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Saving Profile...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Check className="w-6 h-6" />
              Save & Continue
              <ChevronRight className="w-6 h-6 ml-1" />
            </div>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
