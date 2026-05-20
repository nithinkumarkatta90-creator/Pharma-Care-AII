import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { ClipboardList, Plus, Trash2, Loader2, Upload, Calendar, User, Building2, Pill, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Prescription {
  id: string;
  patientName: string;
  doctorName: string;
  doctorRegistration: string;
  hospital: string;
  date: string;
  diagnosis: string;
  medications: { name: string; dose: string; frequency: string; duration: string }[];
  notes: string;
  uid: string;
  createdAt: string;
}

const emptyMed = () => ({ name: '', dose: '', frequency: '', duration: '' });

export default function Prescriptions() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({
    patientName: user?.displayName || '',
    doctorName: '',
    doctorRegistration: '',
    hospital: '',
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    medications: [emptyMed()],
    notes: '',
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'prescriptions'), where('uid', '==', user.uid), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setPrescriptions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Prescription)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user]);

  const addMedRow = () => setForm({ ...form, medications: [...form.medications, emptyMed()] });
  const removeMedRow = (i: number) => setForm({ ...form, medications: form.medications.filter((_, idx) => idx !== i) });
  const updateMed = (i: number, field: string, value: string) => {
    const meds = [...form.medications];
    meds[i] = { ...meds[i], [field]: value };
    setForm({ ...form, medications: meds });
  };

  const handleSave = async () => {
    if (!user || !form.doctorName.trim() || !form.date) return toast.error('Doctor name and date are required.');
    if (form.medications.every(m => !m.name.trim())) return toast.error('Add at least one medication.');
    setSaving(true);
    try {
      await addDoc(collection(db, 'prescriptions'), { ...form, uid: user.uid, createdAt: new Date().toISOString() });
      toast.success('Prescription saved.');
      setShowForm(false);
      setForm({ patientName: user?.displayName || '', doctorName: '', doctorRegistration: '', hospital: '', date: new Date().toISOString().split('T')[0], diagnosis: '', medications: [emptyMed()], notes: '' });
    } catch { toast.error('Failed to save prescription.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try { await deleteDoc(doc(db, 'prescriptions', id)); toast.success('Prescription deleted.'); }
    catch { toast.error('Failed to delete.'); }
    finally { setDeleting(null); }
  };

  const card = isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-gray-200';
  const input = `w-full rounded-xl px-3 py-2.5 text-sm border outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-teal-500/60' : 'bg-white border-gray-300 text-gray-800 focus:border-teal-400'}`;
  const muted = isDark ? 'text-slate-400' : 'text-gray-500';
  const divider = isDark ? 'border-slate-800/60' : 'border-gray-100';

  return (
    <div className="space-y-6 pb-16">
      <PageHeader icon={ClipboardList} title="Prescriptions" description="Store and manage your prescriptions securely — enter manually for permanent personal records." badge="PERSONAL" color="blue" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl border ${card}`}>
            <span className={`text-xs font-bold ${muted}`}>Total</span>
            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{prescriptions.length}</p>
          </div>
          <div className={`px-4 py-2 rounded-xl border ${card}`}>
            <span className={`text-xs font-bold ${muted}`}>This Year</span>
            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{prescriptions.filter(p => new Date(p.date).getFullYear() === new Date().getFullYear()).length}</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white transition-all shadow-lg shadow-teal-500/20">
          <Plus className="w-4 h-4" /> Add Prescription
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className={`rounded-2xl border p-5 space-y-4 ${card}`}>
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>New Prescription</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Patient Name</label>
                <input type="text" placeholder="Your name" value={form.patientName} onChange={e => setForm({ ...form, patientName: e.target.value })} className={input} />
              </div>
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Date *</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={input} />
              </div>
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Doctor Name *</label>
                <input type="text" placeholder="Dr. Rajesh Kumar" value={form.doctorName} onChange={e => setForm({ ...form, doctorName: e.target.value })} className={input} />
              </div>
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Registration No. (MCI/NMC)</label>
                <input type="text" placeholder="MCI-12345" value={form.doctorRegistration} onChange={e => setForm({ ...form, doctorRegistration: e.target.value })} className={input} />
              </div>
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Hospital / Clinic</label>
                <input type="text" placeholder="AIIMS, New Delhi" value={form.hospital} onChange={e => setForm({ ...form, hospital: e.target.value })} className={input} />
              </div>
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Diagnosis / Condition</label>
                <input type="text" placeholder="Hypertension, URI..." value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} className={input} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-xs font-semibold ${muted}`}>Medications *</label>
                <button onClick={addMedRow} className={`text-xs font-semibold flex items-center gap-1 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              <div className="space-y-2">
                {form.medications.map((med, i) => (
                  <div key={i} className={`rounded-xl border p-3 ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <input type="text" placeholder="Drug name" value={med.name} onChange={e => updateMed(i, 'name', e.target.value)} className={input} />
                      <input type="text" placeholder="Dose (e.g. 500mg)" value={med.dose} onChange={e => updateMed(i, 'dose', e.target.value)} className={input} />
                      <input type="text" placeholder="Frequency (BD/TDS)" value={med.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)} className={input} />
                      <div className="flex gap-1">
                        <input type="text" placeholder="Duration" value={med.duration} onChange={e => updateMed(i, 'duration', e.target.value)} className={input} />
                        {form.medications.length > 1 && (
                          <button onClick={() => removeMedRow(i)} className={`p-2.5 rounded-xl flex-shrink-0 ${isDark ? 'text-slate-600 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-300 hover:text-red-500 hover:bg-red-50'}`}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Doctor's Notes / Instructions</label>
              <textarea placeholder="Take after food, avoid alcohol, follow-up in 2 weeks..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className={`${input} resize-none`} />
            </div>

            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white transition-all disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Save Prescription
              </button>
              <button onClick={() => setShowForm(false)} className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {loading ? (
          Array(3).fill(0).map((_, i) => <div key={i} className={`h-24 rounded-2xl animate-pulse ${isDark ? 'bg-slate-800/60' : 'bg-gray-100'}`} />)
        ) : prescriptions.length === 0 ? (
          <div className={`rounded-2xl border p-12 text-center ${card}`}>
            <ClipboardList className={`w-8 h-8 mx-auto mb-3 ${muted}`} />
            <p className={`text-sm font-medium ${muted}`}>No prescriptions saved yet.</p>
            <button onClick={() => setShowForm(true)} className={`mt-3 text-xs font-semibold ${isDark ? 'text-teal-400' : 'text-teal-600'} flex items-center gap-1 mx-auto`}>
              <Plus className="w-3.5 h-3.5" /> Add your first prescription
            </button>
          </div>
        ) : (
          prescriptions.map(rx => (
            <motion.div key={rx.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border overflow-hidden ${card}`}>
              <div className="flex items-start gap-4 p-4">
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                  <ClipboardList className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{rx.diagnosis || 'General Prescription'}</h4>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className={`flex items-center gap-1 text-[11px] ${muted}`}><User className="w-3 h-3" />Dr. {rx.doctorName}</span>
                    {rx.hospital && <span className={`flex items-center gap-1 text-[11px] ${muted}`}><Building2 className="w-3 h-3" />{rx.hospital}</span>}
                    <span className={`flex items-center gap-1 text-[11px] ${muted}`}><Calendar className="w-3 h-3" />{new Date(rx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className={`flex items-center gap-1 text-[11px] ${muted}`}><Pill className="w-3 h-3" />{rx.medications.filter(m => m.name).length} medication{rx.medications.filter(m => m.name).length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => setExpanded(expanded === rx.id ? null : rx.id)}
                    className={`p-2 rounded-xl transition-all ${isDark ? 'text-slate-500 hover:text-slate-200 hover:bg-slate-800' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
                    {expanded === rx.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(rx.id)} disabled={deleting === rx.id}
                    className={`p-2 rounded-xl transition-all ${isDark ? 'text-slate-600 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-300 hover:text-red-500 hover:bg-red-50'}`}>
                    {deleting === rx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {expanded === rx.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className={`border-t p-4 space-y-4 ${divider}`}>
                      <div>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${muted}`}>Medications</p>
                        <div className="space-y-2">
                          {rx.medications.filter(m => m.name).map((med, i) => (
                            <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl ${isDark ? 'bg-slate-800/60' : 'bg-gray-50'}`}>
                              <Pill className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                              <span className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{med.name}</span>
                              {med.dose && <span className={`text-xs ${muted}`}>{med.dose}</span>}
                              {med.frequency && <span className={`text-xs font-medium text-teal-400`}>{med.frequency}</span>}
                              {med.duration && <span className={`text-xs ${muted} ml-auto`}>{med.duration}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                      {rx.notes && (
                        <div>
                          <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${muted}`}>Instructions</p>
                          <p className={`text-xs leading-relaxed ${muted}`}>{rx.notes}</p>
                        </div>
                      )}
                      {rx.doctorRegistration && (
                        <p className={`text-[10px] ${muted}`}>Reg. No.: {rx.doctorRegistration}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
