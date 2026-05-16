import { useState, useEffect } from 'react';
import { collection, addDoc, query, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Pill, Utensils, Plus, Trash2, Edit, Save, X, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminPanel() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [dietPlans, setDietPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Form states
  const [medForm, setMedForm] = useState({
    name: '',
    genericName: '',
    composition: '',
    dosage: '',
    uses: '',
    sideEffects: '',
    category: 'Antibiotic'
  });

  const [dietForm, setDietForm] = useState({
    disease: '',
    breakfast: '',
    lunch: '',
    dinner: '',
    avoid: '',
    exercise: ''
  });

  useEffect(() => {
    if (!user) return;

    const unsubMeds = onSnapshot(collection(db, 'medicine_database'), (snap) => {
      setMedicines(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubDiet = onSnapshot(collection(db, 'master_diet_plans'), (snap) => {
      setDietPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => {
      unsubMeds();
      unsubDiet();
    };
  }, [user]);

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'medicine_database'), {
        ...medForm,
        createdAt: new Date().toISOString()
      });
      setMedForm({
        name: '',
        genericName: '',
        composition: '',
        dosage: '',
        uses: '',
        sideEffects: '',
        category: 'Antibiotic'
      });
      toast.success('Medicine added to database');
    } catch (error) {
      toast.error('Failed to add medicine');
    }
  };

  const handleAddDietPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'master_diet_plans'), {
        ...dietForm,
        createdAt: new Date().toISOString()
      });
      setDietForm({
        disease: '',
        breakfast: '',
        lunch: '',
        dinner: '',
        avoid: '',
        exercise: ''
      });
      toast.success('Diet plan added to database');
    } catch (error) {
      toast.error('Failed to add diet plan');
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;
    try {
      await deleteDoc(doc(db, 'medicine_database', id));
      toast.success('Medicine deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleDeleteDietPlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this diet plan?')) return;
    try {
      await deleteDoc(doc(db, 'master_diet_plans', id));
      toast.success('Diet plan deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Admin Control Panel</h2>
            <p className="text-slate-500 font-bold">Manage medicine database and master diet plans.</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="medicines" className="space-y-8">
        <TabsList className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 h-14">
          <TabsTrigger value="medicines" className="rounded-xl px-8 font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Pill className="w-4 h-4 mr-2" />
            Medicine Database
          </TabsTrigger>
          <TabsTrigger value="diet" className="rounded-xl px-8 font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Utensils className="w-4 h-4 mr-2" />
            Master Diet Plans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="medicines" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Medicine Form */}
            <Card className="border-none shadow-xl lg:col-span-1 h-fit sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl font-black">Add New Medicine</CardTitle>
                <CardDescription>Populate the global medicine library.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMedicine} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Brand Name</Label>
                    <Input 
                      value={medForm.name}
                      onChange={e => setMedForm({...medForm, name: e.target.value})}
                      placeholder="e.g. Panadol"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Generic Name</Label>
                    <Input 
                      value={medForm.genericName}
                      onChange={e => setMedForm({...medForm, genericName: e.target.value})}
                      placeholder="e.g. Paracetamol"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select 
                      className="w-full h-10 rounded-md border border-slate-200 px-3 text-sm"
                      value={medForm.category}
                      onChange={e => setMedForm({...medForm, category: e.target.value})}
                    >
                      <option>Antibiotic</option>
                      <option>Analgesic</option>
                      <option>Antacid</option>
                      <option>Antihistamine</option>
                      <option>Antiviral</option>
                      <option>Antifungal</option>
                      <option>Cardiovascular</option>
                      <option>Respiratory</option>
                      <option>Neurological</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Uses</Label>
                    <Textarea 
                      value={medForm.uses}
                      onChange={e => setMedForm({...medForm, uses: e.target.value})}
                      placeholder="What is it used for?"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold h-12 rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medicine
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Medicine List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-black text-slate-900 px-2">Existing Medicines ({medicines.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {medicines.map((med) => (
                    <motion.div
                      key={med.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <Card className="border-none shadow-md hover:shadow-lg transition-all group">
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-black text-slate-900">{med.name}</h4>
                              <p className="text-xs text-slate-500 font-bold">{med.genericName}</p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-rose-600"
                                onClick={() => handleDeleteMedicine(med.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase tracking-wider">
                              {med.category}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="diet" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Diet Plan Form */}
            <Card className="border-none shadow-xl lg:col-span-1 h-fit sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl font-black">Add Master Diet Plan</CardTitle>
                <CardDescription>Create standard diet templates for diseases.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddDietPlan} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Disease Name</Label>
                    <Input 
                      value={dietForm.disease}
                      onChange={e => setDietForm({...dietForm, disease: e.target.value})}
                      placeholder="e.g. Diabetes Type 2"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Breakfast Plan</Label>
                    <Textarea 
                      value={dietForm.breakfast}
                      onChange={e => setDietForm({...dietForm, breakfast: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lunch Plan</Label>
                    <Textarea 
                      value={dietForm.lunch}
                      onChange={e => setDietForm({...dietForm, lunch: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dinner Plan</Label>
                    <Textarea 
                      value={dietForm.dinner}
                      onChange={e => setDietForm({...dietForm, dinner: e.target.value})}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold h-12 rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Save Diet Plan
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Diet Plan List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-black text-slate-900 px-2">Master Diet Plans ({dietPlans.length})</h3>
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {dietPlans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card className="border-none shadow-md hover:shadow-lg transition-all group">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-black text-slate-900">{plan.disease}</h4>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-slate-400 hover:text-rose-600"
                                onClick={() => handleDeleteDietPlan(plan.id)}
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Breakfast</p>
                              <p className="text-xs text-slate-600 line-clamp-2">{plan.breakfast}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Lunch</p>
                              <p className="text-xs text-slate-600 line-clamp-2">{plan.lunch}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Dinner</p>
                              <p className="text-xs text-slate-600 line-clamp-2">{plan.dinner}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
