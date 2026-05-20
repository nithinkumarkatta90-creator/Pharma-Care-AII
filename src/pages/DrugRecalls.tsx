import { useState, useMemo, useEffect } from 'react';
import { AlertOctagon, Search, ExternalLink, Info, Calendar, Building2, Shield, ChevronRight, RefreshCw } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Recall {
  id: string;
  drugName: string;
  manufacturer: string;
  reason: string;
  classification: string;
  status: string;
  date: string;
  affectedLots: string;
  action: string;
  source: string;
  sourceUrl: string;
  region: string;
}

export default function DrugRecalls() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [recalls, setRecalls] = useState<Recall[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('All');
  const [status, setStatus] = useState('All');
  const [selected, setSelected] = useState<Recall | null>(null);

  const fetchRecalls = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (region !== 'All') params.set('region', region);
      if (status !== 'All') params.set('status', status);
      const res = await fetch(`/api/drug-recalls?${params}`);
      const data = await res.json();
      setRecalls(data);
    } catch {
      toast.error('Unable to load recall data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecalls(); }, []);

  const filtered = useMemo(() => {
    let result = recalls;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r => r.drugName.toLowerCase().includes(q) || r.reason.toLowerCase().includes(q) || r.manufacturer.toLowerCase().includes(q));
    }
    if (region !== 'All') result = result.filter(r => r.region.includes(region));
    if (status !== 'All') result = result.filter(r => r.status === status);
    return result;
  }, [recalls, search, region, status]);

  const classColor = (cls: string) => {
    if (cls === 'Class I') return isDark ? 'bg-red-500/15 text-red-400 border-red-500/30' : 'bg-red-50 text-red-600 border-red-200';
    if (cls === 'Class II') return isDark ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-200';
    if (cls === 'Class III') return isDark ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-green-50 text-green-600 border-green-200';
    return isDark ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' : 'bg-orange-50 text-orange-600 border-orange-200';
  };

  const statusColor = (s: string) =>
    s === 'Active'
      ? (isDark ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-600')
      : (isDark ? 'bg-green-500/15 text-green-400' : 'bg-green-50 text-green-600');

  const card = isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-gray-200';
  const muted = isDark ? 'text-slate-400' : 'text-gray-500';
  const head = isDark ? 'text-slate-500' : 'text-gray-400';
  const divider = isDark ? 'border-slate-800/60' : 'border-gray-100';
  const infoBox = isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-gray-50 border-gray-200';

  const summaryStats = useMemo(() => ({
    total: recalls.length,
    active: recalls.filter(r => r.status === 'Active').length,
    india: recalls.filter(r => r.region.includes('India')).length,
    classI: recalls.filter(r => r.classification === 'Class I').length,
  }), [recalls]);

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        icon={AlertOctagon}
        title="Drug Recall Alerts"
        description="Regulatory recall notices from CDSCO India, U.S. FDA (OpenFDA), and international health authorities — updated from official sources."
        badge="SAFETY"
        color="red"
      />

      <div className={`rounded-2xl border p-4 ${isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className={`text-xs leading-relaxed ${isDark ? 'text-amber-300/80' : 'text-amber-700'}`}>
            <strong>Data Sources:</strong> U.S. FDA MedWatch / OpenFDA (<a href="https://open.fda.gov" target="_blank" rel="noopener noreferrer" className="underline">open.fda.gov</a>), CDSCO India (<a href="https://cdsco.gov.in" target="_blank" rel="noopener noreferrer" className="underline">cdsco.gov.in</a>). If you suspect a recalled medicine, <strong>consult your pharmacist or prescribing doctor immediately</strong>. Do not stop prescription medication without medical guidance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Recalls', value: summaryStats.total, color: 'text-slate-400', icon: AlertOctagon },
          { label: 'Active Recalls', value: summaryStats.active, color: 'text-red-400', icon: Shield },
          { label: 'India (CDSCO)', value: summaryStats.india, color: 'text-orange-400', icon: Building2 },
          { label: 'Class I (Highest Risk)', value: summaryStats.classI, color: 'text-rose-400', icon: AlertOctagon },
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

      <div className="flex flex-col sm:flex-row gap-3">
        <div className={`flex-1 flex items-center gap-2 rounded-xl px-3 py-2.5 border ${isDark ? 'bg-slate-900/60 border-slate-700/50' : 'bg-white border-gray-200'}`}>
          <Search className={`w-4 h-4 flex-shrink-0 ${muted}`} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search drug name, reason, or manufacturer..."
            className="bg-transparent outline-none text-sm w-full placeholder:text-slate-500"
          />
        </div>
        <select value={region} onChange={e => setRegion(e.target.value)}
          className={`rounded-xl px-3 py-2.5 border text-sm font-medium outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-gray-200 text-gray-700'}`}>
          {['All', 'USA', 'India', 'Global'].map(r => <option key={r}>{r}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className={`rounded-xl px-3 py-2.5 border text-sm font-medium outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-gray-200 text-gray-700'}`}>
          {['All', 'Active', 'Closed'].map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={fetchRecalls} className={`p-2.5 rounded-xl border transition-all ${isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-400' : 'border-gray-200 hover:bg-gray-50 text-gray-500'}`}>
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className={`h-24 rounded-2xl animate-pulse ${isDark ? 'bg-slate-800/60' : 'bg-gray-100'}`} />
            ))
          ) : filtered.length === 0 ? (
            <div className={`rounded-2xl border p-12 text-center ${card}`}>
              <AlertOctagon className={`w-8 h-8 mx-auto mb-3 ${muted}`} />
              <p className={`text-sm font-medium ${muted}`}>No recalls match your search filters.</p>
            </div>
          ) : (
            filtered.map(recall => (
              <motion.button
                key={recall.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelected(selected?.id === recall.id ? null : recall)}
                className={`w-full text-left rounded-2xl border p-4 transition-all ${card} ${selected?.id === recall.id ? (isDark ? 'border-teal-500/40 bg-teal-500/5' : 'border-teal-300 bg-teal-50/50') : (isDark ? 'hover:border-slate-700' : 'hover:border-gray-300')}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                    <AlertOctagon className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{recall.drugName}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(recall.status)}`}>{recall.status}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${classColor(recall.classification)}`}>{recall.classification}</span>
                    </div>
                    <p className={`text-xs ${muted} truncate mb-1`}>{recall.manufacturer}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'} line-clamp-2`}>{recall.reason}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className={`w-3 h-3 ${muted}`} />
                        <span className={`text-[10px] ${muted}`}>{new Date(recall.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>{recall.region}</span>
                      <span className={`text-[10px] font-semibold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{recall.source}</span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-1 transition-transform ${selected?.id === recall.id ? 'rotate-90' : ''} ${muted}`} />
                </div>

                <AnimatePresence>
                  {selected?.id === recall.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className={`mt-4 pt-4 border-t space-y-3 ${divider}`}>
                        <div>
                          <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${head}`}>Recommended Action</p>
                          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{recall.action}</p>
                        </div>
                        <div>
                          <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${head}`}>Affected Lots</p>
                          <p className={`text-xs ${muted}`}>{recall.affectedLots}</p>
                        </div>
                        <a href={recall.sourceUrl} target="_blank" rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl transition-all ${isDark ? 'bg-slate-800 text-teal-400 hover:bg-slate-700' : 'bg-gray-100 text-teal-600 hover:bg-gray-200'}`}
                          onClick={e => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                          View on {recall.source}
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))
          )}
        </div>

        <div className="space-y-4">
          <div className={`rounded-2xl border p-5 ${card}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${head}`}>Risk Classification</p>
            <div className="space-y-3">
              {[
                { cls: 'Class I', desc: 'Serious adverse health consequences or death likely', color: 'text-red-400 bg-red-500/10' },
                { cls: 'Class II', desc: 'Temporary or reversible adverse health consequences', color: 'text-amber-400 bg-amber-500/10' },
                { cls: 'Class III', desc: 'Unlikely to cause adverse health consequences', color: 'text-green-400 bg-green-500/10' },
                { cls: 'NSQ (India)', desc: 'Not of Standard Quality — CDSCO classification', color: 'text-orange-400 bg-orange-500/10' },
              ].map(item => (
                <div key={item.cls} className={`flex items-start gap-3 p-3 rounded-xl ${item.color.split(' ')[1]}`}>
                  <Shield className={`w-4 h-4 flex-shrink-0 mt-0.5 ${item.color.split(' ')[0]}`} />
                  <div>
                    <p className={`text-xs font-bold ${item.color.split(' ')[0]}`}>{item.cls}</p>
                    <p className={`text-[11px] ${muted} mt-0.5`}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl border p-5 ${card}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${head}`}>Official Recall Databases</p>
            <div className="space-y-2">
              {[
                { name: 'OpenFDA Recalls', url: 'https://open.fda.gov/apis/drug/enforcement/', org: 'U.S. FDA' },
                { name: 'CDSCO Drug Recalls', url: 'https://cdsco.gov.in', org: 'India' },
                { name: 'MHRA Recalls', url: 'https://www.gov.uk/drug-device-alerts', org: 'UK' },
                { name: 'EMA Safety Info', url: 'https://www.ema.europa.eu/en/human-regulatory-overview/post-authorisation/pharmacovigilance/medicines-under-additional-monitoring', org: 'Europe' },
              ].map(src => (
                <a key={src.name} href={src.url} target="_blank" rel="noopener noreferrer"
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}`}>
                  <div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{src.name}</p>
                    <p className={`text-[10px] ${muted}`}>{src.org}</p>
                  </div>
                  <ExternalLink className={`w-3 h-3 ${muted}`} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
