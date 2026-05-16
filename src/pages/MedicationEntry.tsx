import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';

export default function MedicationEntry() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [med, setMed] = useState({
    drugName: '',
    dose: '',
    frequency: 'Once Daily',
    route: 'Oral',
    duration: '',
    indication: '',
    startDate: '',
    endDate: '',
    prescribingDoctor: '',
    status: 'Active'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'medications'), {
        ...med,
        uid: user.uid,
        createdAt: new Date().toISOString()
      });
      toast.success('Medication added');
      setMed({
        drugName: '',
        dose: '',
        frequency: 'Once Daily',
        route: 'Oral',
        duration: '',
        indication: '',
        startDate: '',
        endDate: '',
        prescribingDoctor: '',
        status: 'Active'
      });
    } catch (error) {
      toast.error('Failed to add medication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Medication</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Drug Name</Label>
              <Input value={med.drugName} onChange={e => setMed({...med, drugName: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Dose</Label>
              <Input value={med.dose} onChange={e => setMed({...med, dose: e.target.value})} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={med.frequency} onValueChange={v => setMed({...med, frequency: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Once Daily">Once Daily</SelectItem>
                  <SelectItem value="Twice Daily">Twice Daily</SelectItem>
                  <SelectItem value="Thrice Daily">Thrice Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Route</Label>
              <Input value={med.route} onChange={e => setMed({...med, route: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Indication</Label>
            <Input value={med.indication} onChange={e => setMed({...med, indication: e.target.value})} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" />}
            Add Medication
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
