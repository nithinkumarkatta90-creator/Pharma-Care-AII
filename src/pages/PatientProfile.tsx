import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

export default function PatientProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    gender: 'Male',
    weight: '',
    conditions: '',
    allergies: ''
  });

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const docRef = doc(db, 'medical_profiles', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as any);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'medical_profiles', user.uid), {
        ...profile,
        uid: user.uid,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast.success('Profile saved successfully');
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Patient Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Age</Label>
            <Input type="number" value={profile.age} onChange={e => setProfile({...profile, age: e.target.value})} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Medical Conditions</Label>
          <Input value={profile.conditions} onChange={e => setProfile({...profile, conditions: e.target.value})} placeholder="e.g. Diabetes, Hypertension" />
        </div>
        <div className="space-y-2">
          <Label>Allergies</Label>
          <Input value={profile.allergies} onChange={e => setProfile({...profile, allergies: e.target.value})} placeholder="e.g. Penicillin, Peanuts" />
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
          Save Profile
        </Button>
      </CardContent>
    </Card>
  );
}
