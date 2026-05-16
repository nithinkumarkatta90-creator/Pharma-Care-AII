import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { User, Mail, Calendar, Weight, Activity, Save, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [disease, setDisease] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setName(data.name || user.displayName || '');
          setAge(data.age?.toString() || '');
          setGender(data.gender || '');
          setWeight(data.weight?.toString() || '');
          setHeight(data.height?.toString() || '');
          setDisease(data.disease || '');
          setBloodGroup(data.bloodGroup || '');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Calculate a mock health score
      let score = 70;
      const w = parseFloat(weight);
      const h = parseFloat(height) / 100; // cm to m
      
      if (w && h) {
        const bmi = w / (h * h);
        if (bmi >= 18.5 && bmi <= 24.9) score += 10; // Normal BMI
        else score += 5;
      }

      if (age) {
        const a = parseInt(age);
        if (a < 50) score += 5;
        else score += 2;
      }

      if (disease && disease.toLowerCase() === 'none') score += 10;
      else if (disease) score -= 5;

      // Ensure score is within 0-100
      score = Math.min(100, Math.max(0, score));

      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        name,
        age: parseInt(age),
        gender,
        weight: parseFloat(weight),
        height: parseFloat(height),
        disease,
        bloodGroup,
        healthScore: score,
        updatedAt: new Date().toISOString()
      });

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name
        });
      }

      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-24">
      <div className="flex flex-col md:flex-row items-center gap-8 bg-card p-8 rounded-[2.5rem] border border-border shadow-sm">
        <div className="relative group">
          <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-blue-200 dark:shadow-none overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.displayName?.charAt(0) || 'U'
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform cursor-pointer">
            <User className="w-5 h-5" />
          </div>
        </div>
        <div className="text-center md:text-left space-y-1">
          <h2 className="text-3xl font-black text-foreground tracking-tight">{name || 'Your Profile'}</h2>
          <p className="text-muted-foreground font-medium">{user?.email}</p>
          <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
            <Badge variant="secondary" className="rounded-xl px-3 py-1 font-bold bg-blue-50 text-blue-600 border-blue-100">Patient ID: {user?.uid.substring(0, 8)}</Badge>
            <Badge variant="secondary" className="rounded-xl px-3 py-1 font-bold bg-emerald-50 text-emerald-600 border-emerald-100">Verified Account</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-card">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-bold">Health Information</CardTitle>
              <CardDescription className="font-medium">Update your vitals for more accurate AI analysis.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              {fetching ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array(6).fill(0).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-12 w-full rounded-2xl" />
                      </div>
                    ))}
                  </div>
                  <Skeleton className="h-14 w-full rounded-2xl" />
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pl-12 h-14 rounded-2xl border-border bg-muted/30 focus:bg-card transition-all font-bold" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Age</Label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} className="pl-12 h-14 rounded-2xl border-border bg-muted/30 focus:bg-card transition-all font-bold" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Gender</Label>
                      <Select onValueChange={setGender} value={gender}>
                        <SelectTrigger className="h-14 rounded-2xl border-border bg-muted/30 font-bold">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bloodGroup" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Blood Group</Label>
                      <Select onValueChange={setBloodGroup} value={bloodGroup}>
                        <SelectTrigger className="h-14 rounded-2xl border-border bg-muted/30 font-bold">
                          <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Weight (kg)</Label>
                      <div className="relative group">
                        <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input id="weight" type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} className="pl-12 h-14 rounded-2xl border-border bg-muted/30 focus:bg-card transition-all font-bold" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Height (cm)</Label>
                      <div className="relative group">
                        <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input id="height" type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} className="pl-12 h-14 rounded-2xl border-border bg-muted/30 focus:bg-card transition-all font-bold" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disease" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Existing Medical Conditions</Label>
                    <div className="relative group">
                      <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input id="disease" placeholder="e.g. Diabetes, Hypertension, None" value={disease} onChange={(e) => setDisease(e.target.value)} className="pl-12 h-14 rounded-2xl border-border bg-muted/30 focus:bg-card transition-all font-bold" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Save className="w-5 h-5 mr-3" />}
                    Save Health Profile
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-200" />
                Health Score
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <div className="text-6xl font-black mb-2">85%</div>
              <p className="text-blue-100 text-sm font-medium">Your profile is 85% complete. Add more details for better AI insights.</p>
              <div className="mt-6 h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[85%] rounded-full" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2.5rem] bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-2xl border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-card rounded-xl shadow-sm">
                    <ShieldAlert className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-bold">2FA Security</span>
                </div>
                <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold">Enabled</Badge>
              </div>
              <Button variant="outline" className="w-full h-12 rounded-2xl font-bold border-border">Change Password</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
