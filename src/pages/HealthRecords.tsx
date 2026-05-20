import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { FileHeart, Plus, Trash2, Loader2, AlertCircle, HeartPulse, Pill, Activity, ClipboardList, ChevronRight } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

type RecordType = 'diagnosis' | 'allergy' | 'condition' | 'surgery' | 'family' | 'vital';

interface HealthRecord {
  id: string;
  type: RecordType;
  title: string;
  description: string;
  date: string;
  doctor?: string;
  hospital?: string;
  severity?: string;
  uid: string;
  createdAt: string;
}

const typeConfig: Record<RecordType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  diagnosis: { label: 'Diagnosis', icon: ClipboardList, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  allergy: { label: 'Allergy', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  condition: { label: 'Chronic Condition', icon: HeartPulse, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  surgery: { label: 'Surgery / Procedure', icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  family: { label: 'Family History', icon: FileHeart, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  vital: { label: 'Vital Record', icon: Pill, color: 'text-green-400', bg: 'bg-green-500/10' },
};

export default function HealthRecords() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'diagnosis' as RecordType, title: '', description: '', date: new Date().toISOString().split('T')[0], doctor: '', hospital: '', severity: '' });
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'health_records'), where('uid', '==', user.uid), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() } as HealthRecord)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user]);

  const handleSave = async () => {
    if (!user || !form.title.trim() || !form.date) return toast.error('Please fill in title and date.');
    setSaving(true);
    try {
      await addDoc(collection(db, 'health_records'), { ...form, uid: user.uid, createdAt: new Date().toISOString() });
      toast.success('Health record saved.');
      setShowForm(false);
      setForm({ type: 'diagnosis', title: '', description: '', date: new Date().toISOString().split('T')[0], doctor: '', hospital: '', severity: '' });
    } catch {
      toast.error('Failed to save record.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteDoc(doc(db, 'health_records', id));
      toast.success('Record deleted.');
    } catch { toast.error('Failed to delete.'); }
    finally { setDeleting(null); }
  };

  const byType = (type: RecordType) => records.filter(r => r.type === type);
  const tabTypes: RecordType[] = ['diagnosis', 'condition', 'allergy', 'surgery', 'family', 'vital'];

  const card = isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-gray-200';
  const input = `w-full rounded-xl px-3 py-2.5 text-sm border outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-teal-500/60' : 'bg-white border-gray-300 text-gray-800 focus:border-teal-400'}`;
  const muted = isDark ? 'text-slate-400' : 'text-gray-500';
  const divider = isDark ? 'border-slate-800/60' : 'border-gray-100';

  const RecordCard = ({ record }: { record: HealthRecord }) => {
    const cfg = typeConfig[record.type];
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className={`flex items-start gap-4 p-4 rounded-2xl border ${card}`}>
        <div className={`p-2.5 rounded-xl flex-shrink-0 ${cfg.bg}`}>
          <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{record.title}</h4>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
          </div>
          {record.description && <p className={`text-xs ${muted} mb-1.5 leading-relaxed`}>{record.description}</p>}
          <div className="flex flex-wrap gap-3">
            <span className={`text-[11px] ${muted}`}>{new Date(record.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            {record.doctor && <span className={`text-[11px] ${muted}`}>Dr. {record.doctor}</span>}
            {record.hospital && <span className={`text-[11px] ${muted}`}>{record.hospital}</span>}
            {record.severity && <span className={`text-[11px] font-semibold text-amber-400`}>Severity: {record.severity}</span>}
          </div>
        </div>
        <button onClick={() => handleDelete(record.id)} disabled={deleting === record.id}
          className={`p-2 rounded-xl transition-all flex-shrink-0 ${isDark ? 'text-slate-600 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-300 hover:text-red-500 hover:bg-red-50'}`}>
          {deleting === record.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader icon={FileHeart} title="Health Records" description="Your personal medical history — diagnoses, allergies, conditions, surgeries, and family history stored securely." badge="PERSONAL" color="teal" />

      <div className="flex items-center justify-between">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {tabTypes.map(type => {
            const cfg = typeConfig[type];
            return (
              <div key={type} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border ${card}`}>
                <cfg.icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{byType(type).length}</span>
              </div>
            );
          })}
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white transition-all shadow-lg shadow-teal-500/20 flex-shrink-0">
          <Plus className="w-4 h-4" /> Add Record
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className={`rounded-2xl border p-5 ${card}`}>
            <h3 className={`text-sm font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Add Health Record</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Record Type *</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as RecordType })} className={input}>
                  {tabTypes.map(t => <option key={t} value={t}>{typeConfig[t].label}</option>)}
                </select>
              </div>
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Date *</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={input} />
              </div>
              <div className="sm:col-span-2">
                <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Title *</label>
                <input type="text" placeholder="e.g. Type 2 Diabetes, Penicillin Allergy, Appendectomy..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={input} />
              </div>
              <div className="sm:col-span-2">
                <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Notes / Description</label>
                <textarea placeholder="Additional details, medications, treatment plan..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className={`${input} resize-none`} />
              </div>
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Doctor / Physician</label>
                <input type="text" placeholder="Dr. Sharma" value={form.doctor} onChange={e => setForm({ ...form, doctor: e.target.value })} className={input} />
              </div>
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Hospital / Clinic</label>
                <input type="text" placeholder="Apollo Hospital, Mumbai" value={form.hospital} onChange={e => setForm({ ...form, hospital: e.target.value })} className={input} />
              </div>
              {(form.type === 'allergy' || form.type === 'condition') && (
                <div>
                  <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Severity</label>
                  <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} className={input}>
                    <option value="">Select severity</option>
                    <option>Mild</option>
                    <option>Moderate</option>
                    <option>Severe</option>
                    <option>Life-threatening</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white transition-all disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Save Record
              </button>
              <button onClick={() => setShowForm(false)} className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs defaultValue="all">
        <TabsList className={`flex gap-1 p-1 rounded-xl w-full overflow-x-auto ${isDark ? 'bg-slate-900/60' : 'bg-gray-100'}`}>
          <TabsTrigger value="all" className="text-xs flex-shrink-0">All ({records.length})</TabsTrigger>
          {tabTypes.map(t => (
            <TabsTrigger key={t} value={t} className="text-xs flex-shrink-0">{typeConfig[t].label} ({byType(t).length})</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-3">
          {loading ? (
            Array(3).fill(0).map((_, i) => <div key={i} className={`h-20 rounded-2xl animate-pulse ${isDark ? 'bg-slate-800/60' : 'bg-gray-100'}`} />)
          ) : records.length === 0 ? (
            <div className={`rounded-2xl border p-12 text-center ${card}`}>
              <FileHeart className={`w-8 h-8 mx-auto mb-3 ${muted}`} />
              <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No health records yet.</p>
              <button onClick={() => setShowForm(true)} className={`mt-3 text-xs font-semibold ${isDark ? 'text-teal-400' : 'text-teal-600'} flex items-center gap-1 mx-auto`}>
                <Plus className="w-3.5 h-3.5" /> Add your first record
              </button>
            </div>
          ) : (
            records.map(r => <RecordCard key={r.id} record={r} />)
          )}
        </TabsContent>

        {tabTypes.map(type => (
          <TabsContent key={type} value={type} className="mt-4 space-y-3">
            {loading ? (
              Array(2).fill(0).map((_, i) => <div key={i} className={`h-20 rounded-2xl animate-pulse ${isDark ? 'bg-slate-800/60' : 'bg-gray-100'}`} />)
            ) : byType(type).length === 0 ? (
              <div className={`rounded-2xl border p-10 text-center ${card}`}>
                <p className={`text-sm ${muted}`}>No {typeConfig[type].label.toLowerCase()} records yet.</p>
                <button onClick={() => { setForm({ ...form, type }); setShowForm(true); }}
                  className={`mt-2 text-xs font-semibold ${isDark ? 'text-teal-400' : 'text-teal-600'} flex items-center gap-1 mx-auto`}>
                  <Plus className="w-3.5 h-3.5" /> Add {typeConfig[type].label}
                </button>
              </div>
            ) : (
              byType(type).map(r => <RecordCard key={r.id} record={r} />)
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
