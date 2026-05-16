import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Clock, 
  Plus, 
  X, 
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../App';
import { reminderService } from '../services/reminderService';
import { aiService } from '../services/aiService';
import { Reminder, MedicineType, Frequency, BeforeAfterFood, RepeatType } from '../types/reminder';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';

export default function AddReminder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Reminder, 'id' | 'uid' | 'createdAt' | 'updatedAt'>>({
    medicineName: location.state?.title || '',
    dosage: '',
    medicineType: (location.state?.type as MedicineType) || 'Tablet',
    frequency: 'Once',
    times: ['08:00'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    beforeAfterFood: 'After',
    repeatType: 'Daily',
    notes: '',
    isActive: true
  });

  useEffect(() => {
    if (id && user) {
      reminderService.fetchReminders(user.uid).then(reminders => {
        const reminder = reminders.find(r => r.id === id);
        if (reminder) {
          const { id: _, uid: __, createdAt: ___, updatedAt: ____, ...rest } = reminder;
          setFormData(rest);
        }
      });
    }
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      if (id) {
        await reminderService.updateReminder(id, formData);
        toast.success('Reminder updated successfully');
      } else {
        await reminderService.addReminder({ ...formData, uid: user.uid });
        toast.success('Reminder added successfully');
      }
      navigate('/reminders');
    } catch (error) {
      toast.error('Failed to save reminder');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTime = () => {
    setFormData(prev => ({ ...prev, times: [...prev.times, '12:00'] }));
  };

  const handleRemoveTime = (index: number) => {
    if (formData.times.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }));
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData(prev => ({ ...prev, times: newTimes }));
  };

  const getAiSuggestion = async () => {
    if (!formData.medicineName) {
      toast.error('Please enter a medicine name first');
      return;
    }
    setAiLoading(true);
    try {
      const suggestion = await aiService.suggestMedicineSchedule(
        formData.medicineName,
        'General Health',
        formData.frequency
      );
      setAiSuggestion(suggestion);
    } catch (error) {
      toast.error('Failed to get AI suggestion');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/reminders')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{id ? 'Edit' : 'Add'} Reminder</h1>
          <p className="text-slate-500">Set up your medication schedule and notifications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-xl border-slate-100">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle>Medicine Details</CardTitle>
            <CardDescription>Enter the basic information about your medication.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form id="reminder-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="medicineName">Medicine Name</Label>
                <Input 
                  id="medicineName" 
                  placeholder="e.g., Paracetamol" 
                  value={formData.medicineName}
                  onChange={e => setFormData(prev => ({ ...prev, medicineName: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input 
                    id="dosage" 
                    placeholder="e.g., 500mg" 
                    value={formData.dosage}
                    onChange={e => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Medicine Type</Label>
                  <Select 
                    value={formData.medicineType} 
                    onValueChange={(v: MedicineType) => setFormData(prev => ({ ...prev, medicineType: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tablet">Tablet</SelectItem>
                      <SelectItem value="Syrup">Syrup</SelectItem>
                      <SelectItem value="Capsule">Capsule</SelectItem>
                      <SelectItem value="Injection">Injection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select 
                    value={formData.frequency} 
                    onValueChange={(v: Frequency) => setFormData(prev => ({ ...prev, frequency: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Once">Once Daily</SelectItem>
                      <SelectItem value="Twice">Twice Daily</SelectItem>
                      <SelectItem value="Thrice">Thrice Daily</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Before/After Food</Label>
                  <Select 
                    value={formData.beforeAfterFood} 
                    onValueChange={(v: BeforeAfterFood) => setFormData(prev => ({ ...prev, beforeAfterFood: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Before">Before Food</SelectItem>
                      <SelectItem value="After">After Food</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Reminder Times
                  </Label>
                  <Button type="button" variant="ghost" size="sm" onClick={handleAddTime} className="text-blue-600">
                    <Plus className="w-4 h-4 mr-1" /> Add Time
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {formData.times.map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input 
                        type="time" 
                        value={time} 
                        onChange={e => handleTimeChange(index, e.target.value)}
                        className="flex-1"
                      />
                      {formData.times.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveTime(index)}
                          className="text-rose-500 h-10 w-10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input 
                    id="startDate" 
                    type="date" 
                    value={formData.startDate}
                    onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input 
                    id="endDate" 
                    type="date" 
                    value={formData.endDate}
                    onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="e.g., Take with a full glass of water." 
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-bold"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                {id ? 'Update' : 'Save'} Reminder
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-none shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">AI Schedule Suggestion</h3>
              </div>
              <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                Not sure when to take your medicine? Let our AI suggest the optimal schedule based on clinical data.
              </p>
              <Button 
                variant="secondary" 
                className="w-full bg-white text-blue-700 hover:bg-blue-50 font-bold h-12"
                onClick={getAiSuggestion}
                disabled={aiLoading}
              >
                {aiLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                Get AI Suggestion
              </Button>
            </CardContent>
          </Card>

          {aiSuggestion && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-blue-100 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    AI Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm prose-blue max-w-none text-slate-700">
                    <Markdown>{aiSuggestion}</Markdown>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h4 className="font-bold text-amber-900 mb-1">Important Disclaimer</h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                Always follow your doctor's prescription. AI suggestions are for informational purposes and should be verified with a healthcare professional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
