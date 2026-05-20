import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Calendar,
  ExternalLink,
  FlaskConical,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { PageHeader } from '../components/PageHeader';
import { useTheme } from 'next-themes';

interface LabReport {
  id: string;
  fileName: string;
  labName: string;
  testDate: string;
  notes: string;
  uid: string;
  createdAt: string;
}

export default function LabReports() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [reports, setReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({ fileName: '', labName: '', testDate: new Date().toISOString().split('T')[0], notes: '' });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'lab_reports'), where('uid', '==', user.uid), orderBy('testDate', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() } as LabReport)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user]);

  const handleSave = async () => {
    if (!user || !form.fileName.trim()) return toast.error('Report/test name is required.');
    setSaving(true);
    try {
      await addDoc(collection(db, 'lab_reports'), { ...form, uid: user.uid, createdAt: new Date().toISOString() });
      toast.success('Lab report record saved.');
      setShowForm(false);
      setForm({ fileName: '', labName: '', testDate: new Date().toISOString().split('T')[0], notes: '' });
    } catch { toast.error('Failed to save report.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try { await deleteDoc(doc(db, 'lab_reports', id)); toast.success('Report deleted.'); }
    catch { toast.error('Failed to delete.'); }
    finally { setDeleting(null); }
  };

  const card = isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-gray-200';
  const input = `w-full rounded-xl px-3 py-2.5 text-sm border outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-teal-500/60' : 'bg-white border-gray-300 text-gray-800 focus:border-teal-400'}`;
  const muted = isDark ? 'text-slate-400' : 'text-gray-500';
  const divider = isDark ? 'border-slate-800/60' : 'border-gray-100';

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        icon={FileText}
        title="Lab Reports"
        description="Log and store your lab test records. Use the Lab Reference for normal ranges and interpretation guidance."
        badge="PERSONAL"
        color="cyan"
      />

      <div className={`rounded-2xl border p-4 flex items-start gap-3 ${isDark ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
        <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <p className={`text-xs leading-relaxed ${isDark ? 'text-blue-300/80' : 'text-blue-700'}`}>
          This section stores your lab report records. For reference ranges and understanding what your values mean, visit the{' '}
          <Link to="/lab-reference" className="font-semibold underline">Lab Reference Database</Link> — sourced from WHO, ICMR, and AACC guidelines.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className={`px-4 py-2.5 rounded-xl border ${card}`}>
          <span className={`text-xs font-bold ${muted}`}>Total Reports</span>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{reports.length}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white transition-all shadow-lg shadow-teal-500/20">
          <Upload className="w-4 h-4" /> Add Report
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className={`rounded-2xl border p-5 space-y-4 ${card}`}>
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Add Lab Report</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Test / Report Name *</label>
                <input type="text" placeholder="CBC, Lipid Panel, Thyroid Function Test..." value={form.fileName} onChange={e => setForm({ ...form, fileName: e.target.value })} className={input} />
              </div>
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Test Date *</label>
                <input type="date" value={form.testDate} onChange={e => setForm({ ...form, testDate: e.target.value })} className={input} />
              </div>
              <div>
                <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Laboratory / Hospital</label>
                <input type="text" placeholder="SRL Diagnostics, Metropolis, AIIMS..." value={form.labName} onChange={e => setForm({ ...form, labName: e.target.value })} className={input} />
              </div>
              <div className="sm:col-span-2">
                <label className={`text-xs font-semibold mb-1.5 block ${muted}`}>Key Findings / Notes</label>
                <textarea placeholder="e.g. Hb 11.2 g/dL (low), fasting glucose 118 mg/dL (borderline)..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} className={`${input} resize-none`} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white transition-all disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Save Record
              </button>
              <button onClick={() => setShowForm(false)} className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            Array(3).fill(0).map((_, i) => <div key={i} className={`h-20 rounded-2xl animate-pulse ${isDark ? 'bg-slate-800/60' : 'bg-gray-100'}`} />)
          ) : reports.length === 0 ? (
            <div className={`rounded-2xl border p-12 text-center ${card}`}>
              <FileText className={`w-8 h-8 mx-auto mb-3 ${muted}`} />
              <p className={`text-sm font-medium ${muted}`}>No lab reports logged yet.</p>
              <button onClick={() => setShowForm(true)} className={`mt-3 text-xs font-semibold ${isDark ? 'text-teal-400' : 'text-teal-600'} flex items-center gap-1 mx-auto`}>
                <Upload className="w-3.5 h-3.5" /> Add your first report
              </button>
            </div>
          ) : (
            reports.map(report => (
              <motion.div key={report.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-4 p-4 rounded-2xl border ${card}`}>
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-50'}`}>
                  <FileText className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{report.fileName}</h4>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className={`flex items-center gap-1 text-[11px] ${muted}`}><Calendar className="w-3 h-3" />{new Date(report.testDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {report.labName && <span className={`text-[11px] ${muted}`}>{report.labName}</span>}
                  </div>
                  {report.notes && <p className={`text-xs ${muted} mt-1.5 leading-relaxed`}>{report.notes}</p>}
                </div>
                <button onClick={() => handleDelete(report.id)} disabled={deleting === report.id}
                  className={`p-2 rounded-xl transition-all flex-shrink-0 ${isDark ? 'text-slate-600 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-300 hover:text-red-500 hover:bg-red-50'}`}>
                  {deleting === report.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </motion.div>
            ))
          )}
        </div>

        <div className={`rounded-2xl border p-5 self-start ${card}`}>
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Interpret Your Results</p>
          <Link to="/lab-reference"
            className={`flex items-center gap-3 p-3 rounded-xl mb-2 transition-all ${isDark ? 'bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40' : 'bg-purple-50 border border-purple-100 hover:border-purple-200'}`}>
            <FlaskConical className="w-4 h-4 text-purple-400" />
            <div>
              <p className={`text-xs font-bold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>Lab Reference Database</p>
              <p className={`text-[10px] ${muted}`}>Normal ranges — WHO, ICMR, AACC</p>
            </div>
            <ExternalLink className={`w-3 h-3 ml-auto ${muted}`} />
          </Link>
          <p className={`text-[11px] leading-relaxed mt-3 ${muted}`}>
            Lab report values should always be interpreted by your treating physician. Normal ranges can vary by age, sex, laboratory method, and individual health conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
