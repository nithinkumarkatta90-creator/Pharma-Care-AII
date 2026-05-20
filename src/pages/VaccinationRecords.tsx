import { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, query, where, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { Syringe, Plus, Trash2, Loader2, Calendar, Building2, CheckCircle2, Clock, AlertCircle, Info } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface VaccinationRecord {
  id: string;
  vaccineName: string;
  disease: string;
  doseNumber: string;
  dateAdministered: string;
  nextDueDate: string;
  batchNumber: string;
  manufacturer: string;
  provider: string;
  hospital: string;
  notes: string;
  uid: string;
  createdAt: string;
}

const commonVaccines = [
  "BCG", "Hepatitis B (HepB)", "OPV (Oral Polio)", "IPV (Injectable Polio)", "DPT (Diphtheria, Pertussis, Tetanus)",
  "Hib (Haemophilus influenzae type b)", "Pneumococcal (PCV13)", "Rotavirus", "MMR (Measles, Mumps, Rubella)",
  "Varicella (Chickenpox)", "Hepatitis A", "Typhoid (Polysaccharide)", "Meningococcal", "HPV (Human Papillomavirus)",
  "Influenza (Flu)", "Tdap (Tetanus, Diphtheria, Pertussis)", "COVID-19 (Covishield/Covaxin/Corbevax)",
  "Rabies", "Yellow Fever", "Japanese Encephalitis", "Shingles (Varicella-Zoster)", "Other"
];

const iapSchedule = [
  { age: 'Birth', vaccines: ['BCG', 'HepB-0', 'OPV-0'] },
  { age: '6 weeks', vaccines: ['DTwP/DTaP-1', 'HepB-1', 'OPV-1', 'Hib-1', 'PCV-1', 'Rota-1', 'IPV-1'] },
  { age: '10 weeks', vaccines: ['DTwP/DTaP-2', 'OPV-2', 'Hib-2', 'PCV-2', 'Rota-2', 'IPV-2'] },
  { age: '14 weeks', vaccines: ['DTwP/DTaP-3', 'OPV-3', 'Hib-3', 'PCV-3', 'Rota-3', 'IPV-3'] },
  { age: '6 months', vaccines: ['HepB-2', 'OPV-4', 'Influenza-1'] },
  { age: '9 months', vaccines: ['MMR-1', 'OPV-5', 'Typhoid conjugate-1'] },
  { age: '12 months', vaccines: ['HepA-1', 'MMR-1 (if not given at 9M)'] },
  { age: '15 months', vaccines: ['DTwP-B1', 'OPV-B1', 'Hib-B1', 'PCV-B1', 'Varicella-1'] },
  { age: '18 months', vaccines: ['DTwP/DTaP-B1', 'HepA-2'] },
  { age: '2 years', vaccines: ['Typhoid conjugate (booster)', 'MMR-2'] },
  { age: '4–6 years', vaccines: ['DTwP/DTaP-B2', 'OPV-B2', 'Varicella-2', 'MMR-2 (if not given)'] },
  { age: '9–14 years (girls)', vaccines: ['HPV-1', 'HPV-2 (6 months apart)'] },
  { age: '10–12 years', vaccines: ['Tdap booster', 'Typhoid', 'Influenza (annual)'] },
  { age: 'Adults (every 10 yr)', vaccines: ['Td booster', 'Influenza (annual)', 'COVID-19 (per schedule)'] },
];

export default function VaccinationRecords() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [tab, setTab] = useState<'records' | 'schedule'>('records');
  const [form, setForm] = useState({
    vaccineName: '', disease: '', doseNumber: '1st dose', dateAdministered: new Date().toISOString().split('T')[0],
    nextDueDate: '', batchNumber: '', manufacturer: '', provider: '', hospital: '', notes: '',
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'vaccination_records'), where('uid', '==', user.uid), orderBy('dateAdministered', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() } as VaccinationRecord)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user]);

  const handleSave = async () => {
    if (!user || !form.vaccineName.trim() || !form.dateAdministered) return toast.error('Vaccine name and date are required.');
    setSaving(true);
    try {
      await addDoc(collection(db, 'vaccination_records'), { ...form, uid: user.uid, createdAt: new Date().toISOString() });
      toast.success('Vaccination record saved.');
      setShowForm(false);
      setForm({ vaccineName: '', disease: '', doseNumber: '1st dose', dateAdministered: new Date().toISOString().split('T')[0], nextDueDate: '', batchNumber: '', manufacturer: '', provider: '', hospital: '', notes: '' });
    } catch { toast.error('Failed to save record.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try { await deleteDoc(doc(db, 'vaccination_records', id)); toast.success('Record deleted.'); }
    catch { toast.error('Failed to delete.'); }
    finally { setDeleting(null); }
  };

  const overdueRecords = useMemo(() => records.filter(r => r.nextDueDate && new Date(r.nextDueDate) < new Date()), [records]);
  const upcomingRecords = useMemo(() => records.filter(r => {
    if (!r.nextDueDate) return false;
    const due = new Date(r.nextDueDate);
    const now = new Date();
    const inDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return inDays >= 0 && inDays <= 60;
  }), [records]);

  const card = isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-gray-200';
  const input = `w-full rounded-xl px-3 py-2.5 text-sm border outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-teal-500/60' : 'bg-white border-gray-300 text-gray-800 focus:border-teal-400'}`;
  const muted = isDark ? 'text-slate-400' : 'text-gray-500';
  const head = isDark ? 'text-slate-500' : 'text-gray-400';
  const divider = isDark ? 'border-slate-800/60' : 'border-gray-100';

  return (
    <div className="space-y-6 pb-16">
      <PageHeader icon={Syringe} title="Vaccination Records" description="Your personal immunization history — log vaccines received, track doses, and monitor upcoming boosters." badge="PERSONAL" color="green" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Vaccines Logged', value: records.length, color: 'text-teal-400', icon: CheckCircle2 },
          { label: 'Overdue', value: overdueRecords.length, color: 'text-red-400', icon: AlertCircle },
          { label: 'Due Soon (60d)', value: upcomingRecords.length, color: 'text-amber-400', icon: Clock },
          { label: 'Unique Vaccines', value: new Set(records.map(r => r.vaccineName)).size, color: 'text-blue-400', icon: Syringe },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl border p-4 ${card}`}>
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${head}`}>{s.label}</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {overdueRecords.length > 0 && (
        <div className={`rounded-2xl border p-4 flex items-start gap-3 ${isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className={`text-xs leading-relaxed ${isDark ? 'text-red-300' : 'text-red-700'}`}>
            <strong>{overdueRecords.length} booster dose{overdueRecords.length > 1 ? 's are' : ' is'} overdue</strong>: {overdueRecords.map(r => r.vaccineName).join(', ')}. Consult your doctor to update your immunization schedule.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className={`flex rounded-xl border p-1 gap-1 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-gray-100 border-transparent'}`}>
          {(['records', 'schedule'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${tab === t ? (isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-900 shadow-sm') : muted}`}>
              {t === 'records' ? 'My Records' : 'IAP Schedule'}
            </button>
          ))}
        </div>
        {tab === 'records' && (
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white transition-all shadow-lg shadow-teal-500/20">
            <Plus className="w-4 h-4" /> Log Vaccine
          </button>
        )}
      </div>

      {tab === 'records' && (
        <>
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className={`rounded-2xl border p-5 space-y-4 ${card}`}>
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Log Vaccination</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Vaccine Name *</label>
                    <select value={form.vaccineName} onChange={e => setForm({ ...form, vaccineName: e.target.value })} className={input}>
                      <option value="">Select vaccine...</option>
                      {commonVaccines.map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Disease Protected Against</label>
                    <input type="text" placeholder="Tuberculosis, Hepatitis B..." value={form.disease} onChange={e => setForm({ ...form, disease: e.target.value })} className={input} />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Dose Number</label>
                    <select value={form.doseNumber} onChange={e => setForm({ ...form, doseNumber: e.target.value })} className={input}>
                      {['1st dose', '2nd dose', '3rd dose', '4th dose', '1st booster', '2nd booster', 'Annual booster', 'Single dose'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Date Administered *</label>
                    <input type="date" value={form.dateAdministered} onChange={e => setForm({ ...form, dateAdministered: e.target.value })} className={input} />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Next Due Date</label>
                    <input type="date" value={form.nextDueDate} onChange={e => setForm({ ...form, nextDueDate: e.target.value })} className={input} />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Batch / Lot Number</label>
                    <input type="text" placeholder="Batch: AB123456" value={form.batchNumber} onChange={e => setForm({ ...form, batchNumber: e.target.value })} className={input} />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Manufacturer</label>
                    <input type="text" placeholder="Serum Institute, Bharat Biotech..." value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} className={input} />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Administered By</label>
                    <input type="text" placeholder="Dr. Sharma / Nurse" value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })} className={input} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Hospital / Vaccination Centre</label>
                    <input type="text" placeholder="Primary Health Centre, AIIMS, Private clinic..." value={form.hospital} onChange={e => setForm({ ...form, hospital: e.target.value })} className={input} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Notes / Side Effects Observed</label>
                    <textarea placeholder="Mild fever for 1 day, injection site soreness..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className={`${input} resize-none`} />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white transition-all disabled:opacity-60">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Syringe className="w-4 h-4" />} Save Record
                  </button>
                  <button onClick={() => setShowForm(false)} className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Cancel</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            {loading ? (
              Array(3).fill(0).map((_, i) => <div key={i} className={`h-24 rounded-2xl animate-pulse ${isDark ? 'bg-slate-800/60' : 'bg-gray-100'}`} />)
            ) : records.length === 0 ? (
              <div className={`rounded-2xl border p-12 text-center ${card}`}>
                <Syringe className={`w-8 h-8 mx-auto mb-3 ${muted}`} />
                <p className={`text-sm font-medium ${muted}`}>No vaccination records yet.</p>
                <button onClick={() => setShowForm(true)} className={`mt-3 text-xs font-semibold ${isDark ? 'text-teal-400' : 'text-teal-600'} flex items-center gap-1 mx-auto`}>
                  <Plus className="w-3.5 h-3.5" /> Log your first vaccine
                </button>
              </div>
            ) : (
              records.map(record => {
                const isOverdue = record.nextDueDate && new Date(record.nextDueDate) < new Date();
                const isDueSoon = record.nextDueDate && !isOverdue && (new Date(record.nextDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24) <= 60;
                return (
                  <motion.div key={record.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-4 p-4 rounded-2xl border ${card}`}>
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
                      <Syringe className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <h4 className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{record.vaccineName}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-teal-500/10 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>{record.doseNumber}</span>
                        {isOverdue && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">Booster Overdue</span>}
                        {isDueSoon && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">Due Soon</span>}
                      </div>
                      {record.disease && <p className={`text-xs ${muted} mb-1`}>Protects against: {record.disease}</p>}
                      <div className="flex flex-wrap gap-3 mt-1">
                        <span className={`flex items-center gap-1 text-[11px] ${muted}`}><Calendar className="w-3 h-3" />{new Date(record.dateAdministered).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        {record.hospital && <span className={`flex items-center gap-1 text-[11px] ${muted}`}><Building2 className="w-3 h-3" />{record.hospital}</span>}
                        {record.batchNumber && <span className={`text-[11px] ${muted}`}>Batch: {record.batchNumber}</span>}
                        {record.nextDueDate && <span className={`text-[11px] font-medium ${isOverdue ? 'text-red-400' : isDueSoon ? 'text-amber-400' : 'text-teal-400'}`}>Next: {new Date(record.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                      </div>
                      {record.notes && <p className={`text-[11px] ${muted} mt-1.5 italic`}>{record.notes}</p>}
                    </div>
                    <button onClick={() => handleDelete(record.id)} disabled={deleting === record.id}
                      className={`p-2 rounded-xl transition-all flex-shrink-0 ${isDark ? 'text-slate-600 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-300 hover:text-red-500 hover:bg-red-50'}`}>
                      {deleting === record.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </motion.div>
                );
              })
            )}
          </div>
        </>
      )}

      {tab === 'schedule' && (
        <div className="space-y-4">
          <div className={`rounded-2xl border p-4 flex items-start gap-3 ${isDark ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
            <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <p className={`text-xs leading-relaxed ${isDark ? 'text-blue-300/80' : 'text-blue-700'}`}>
              <strong>Source: IAP (Indian Academy of Pediatrics) Immunization Schedule 2023</strong> &amp; <strong>Universal Immunization Programme (UIP), Government of India</strong>. Schedule may vary based on individual health conditions — consult your paediatrician.
            </p>
          </div>
          <div className="space-y-3">
            {iapSchedule.map((milestone, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`flex items-start gap-4 p-4 rounded-2xl border ${card}`}>
                <div className={`px-3 py-2 rounded-xl text-center flex-shrink-0 min-w-[72px] ${isDark ? 'bg-teal-500/10 border border-teal-500/20' : 'bg-teal-50 border border-teal-100'}`}>
                  <p className={`text-xs font-bold ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>{milestone.age}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2">
                    {milestone.vaccines.map(v => (
                      <span key={v} className={`text-xs px-2.5 py-1 rounded-lg font-medium ${isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>{v}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
