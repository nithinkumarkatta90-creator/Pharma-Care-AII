import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { trustedMedicineService } from '../services/trustedMedicineService';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Button, buttonVariants } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { AlertTriangle, Plus, Trash2, Loader2, History, ShieldAlert, CheckCircle2, Pill, ArrowLeft } from 'lucide-react';
import Markdown from 'react-markdown';
import { toast } from 'sonner';

import { MedicineAutocomplete } from '../components/MedicineAutocomplete';

export default function InteractionChecker() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<string[]>(['', '']);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [currentMeds, setCurrentMeds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    // Fetch current medications from active reminders
    const qMeds = query(
      collection(db, 'reminders'),
      where('uid', '==', user.uid),
      where('isActive', '==', true)
    );

    const unsubMeds = onSnapshot(qMeds, (snap) => {
      const meds = snap.docs.map(d => d.data().medicineName).filter(Boolean);
      setCurrentMeds(Array.from(new Set(meds)));
    });

    const q = query(
      collection(db, 'drug_interactions'),
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

    return () => {
      unsub();
      unsubMeds();
    };
  }, [user]);

  const handleAddCurrentMeds = () => {
    const uniqueMeds = Array.from(new Set([...medicines.filter(m => m.trim() !== ''), ...currentMeds]));
    if (uniqueMeds.length < 2) {
      setMedicines([...uniqueMeds, ...Array(2 - uniqueMeds.length).fill('')]);
    } else {
      setMedicines(uniqueMeds);
    }
    toast.success('Current medications added to list');
  };

  const handleAddMedicine = () => {
    setMedicines([...medicines, '']);
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index: number, value: string) => {
    const newMeds = [...medicines];
    newMeds[index] = value;
    setMedicines(newMeds);
  };

  const handleCheck = async () => {
    const activeMeds = medicines.filter(m => m.trim() !== '');
    if (activeMeds.length < 2) {
      toast.error('Please enter at least two medicines to check interactions.');
      return;
    }

    setLoading(true);
    try {
      const verifiedRecords = await Promise.all(
        activeMeds.map(async (medicine) => ({
          medicine,
          record: await trustedMedicineService.getBestVerifiedRecord(medicine),
        })),
      );
      const missingRecords = verifiedRecords.filter((item) => !item.record);

      if (missingRecords.length > 0) {
        toast.error(`No trusted record found for: ${missingRecords.map((item) => item.medicine).join(', ')}`);
        setResult(null);
        return;
      }

      const interactionResult = [
        '### Trusted-source interaction check',
        '',
        'Gemini is disabled as a drug-interaction source. This screen only verifies that each entered medicine exists in the trusted Firestore medicine database.',
        '',
        'A true interaction result requires a curated interaction source, such as structured interaction data licensed from a clinical drug database or manually entered pharmacist-reviewed interaction records.',
        '',
        '### Verified medicines',
        ...verifiedRecords.map((item) => {
          const citations = item.record?.citations?.map((citation) => citation.sourceName).join(', ') || 'No citation listed';
          return `- **${item.record?.name || item.medicine}**: ${citations}`;
        }),
        '',
        '### Safety note',
        'Do not combine medicines based on this screen alone. Ask a licensed pharmacist or doctor to review interactions, contraindications, dose, age, pregnancy status, kidney/liver disease, and allergies.',
      ].join('\n');

      setResult(interactionResult);

      if (user) {
        await addDoc(collection(db, 'drug_interactions'), {
          uid: user.uid,
          medicines: activeMeds,
          result: interactionResult,
          sourcePolicy: 'trusted-source-only-no-gemini',
          createdAt: new Date().toISOString()
        });
      }
      toast.success('Trusted source verification complete');
    } catch (error) {
      toast.error('Failed to verify trusted medicine records');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
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
          <h2 className="text-3xl font-bold text-slate-900">Drug Interaction Checker</h2>
          <p className="text-slate-500 text-sm">Identify potential risks when taking multiple medications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Enter Medications</CardTitle>
                  <CardDescription>Add all the medicines you are currently taking or planning to take.</CardDescription>
                </div>
                {currentMeds.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddCurrentMeds}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 font-bold rounded-xl"
                  >
                    <Pill className="w-4 h-4 mr-2" />
                    Add Current Meds
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {medicines.map((med, index) => (
                <div key={index} className="flex gap-2">
                  <MedicineAutocomplete
                    placeholder={`Medicine name (e.g. Aspirin)`}
                    value={med}
                    onChange={(val) => handleMedicineChange(index, val)}
                  />
                  {medicines.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMedicine(index)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={handleAddMedicine}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another
                </Button>
                <Button 
                  onClick={handleCheck}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
                  Check Interactions
                </Button>
              </div>
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
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ) : result ? (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                  Interaction Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-amber-900">
                <Markdown>{result}</Markdown>
                <div className="mt-6 p-4 bg-white/50 rounded-lg border border-amber-200 text-xs italic">
                  Disclaimer: Gemini is not used as a drug-interaction source. This result only verifies trusted source records and must not replace professional medical advice.
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-slate-400" />
                Recent Checks
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
                        setMedicines(item.medicines);
                        setResult(item.result);
                      }}
                    >
                      <p className="text-sm font-medium text-slate-900 line-clamp-1">
                        {item.medicines.join(', ')}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No recent checks found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold">Safe Usage Tips</h4>
              </div>
              <ul className="text-sm space-y-3 text-blue-50">
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  Keep an updated list of all medications.
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  Inform your doctor about supplements.
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">•</span>
                  Read the patient information leaflet.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
