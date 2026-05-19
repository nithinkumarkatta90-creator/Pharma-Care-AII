import { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { trustedMedicineService } from '../services/trustedMedicineService';
import { TrustedMedicineRecord } from '../types/trusted-medicine';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { 
  Pill, 
  Search, 
  AlertTriangle, 
  Info, 
  Loader2, 
  Filter, 
  ArrowLeft, 
  ShieldAlert, 
  Zap, 
  Brain,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { PageHeader } from '../components/PageHeader';

const MEDICINE_CATEGORIES = [
  "All",
  "Antibiotic",
  "Analgesic",
  "Antacid",
  "Antihistamine",
  "Antiviral",
  "Antifungal",
  "Cardiovascular",
  "Respiratory",
  "Neurological",
  "Diabetes",
  "Hormonal"
];

export default function MedicineInfo() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [medInfo, setMedInfo] = useState<TrustedMedicineRecord | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = async (query: string) => {
    if (!query.trim() || !user) return;

    setSearching(true);
    try {
      const info = await trustedMedicineService.getBestVerifiedRecord(query);
      if (!info) {
        setMedInfo(null);
        toast.error('No verified trusted-source record found for this medicine.');
        return;
      }

      setMedInfo(info);

      await addDoc(collection(db, 'medicine_search'), {
        uid: user.uid,
        medicineName: query,
        trustedRecordId: info.id,
        trustedCollection: info.collectionName,
        citations: info.citations || [],
        createdAt: new Date().toISOString()
      });
    } catch (error: any) {
      toast.error('Failed to load trusted medicine data');
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <PageHeader
        icon={Pill}
        title="Drug Intelligence"
        description="AI-powered pharmacology and drug interaction database."
        color="blue"
        badge="Pro Database"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Categories */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none shadow-sm rounded-[2rem] bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
                <Filter className="w-4 h-4" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {MEDICINE_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300",
                    selectedCategory === cat 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {cat}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6">
            <ShieldAlert className="w-10 h-10 mb-4 text-blue-200" />
            <h4 className="font-black text-lg mb-2">Safety First</h4>
            <p className="text-xs text-blue-100 leading-relaxed font-medium">
              Our AI cross-references with FDA and DrugBank standards to ensure you get the most accurate safety data.
            </p>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none rounded-[2.5rem] bg-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Search Medicine</CardTitle>
              <CardDescription>Enter a drug name to get comprehensive AI intelligence.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <Input 
                  placeholder="e.g. Metformin, Atorvastatin, Amoxicillin..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 pl-12 pr-32 bg-muted/30 border-none rounded-2xl text-lg font-medium focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Button type="submit" disabled={searching} className="h-10 rounded-xl bg-primary hover:bg-primary/90 font-bold px-6">
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Analyze
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <AnimatePresence mode="wait">
            {searching ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-card p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center animate-pulse">
                      <Pill className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </Card>
              </motion.div>
            ) : medInfo ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-card overflow-hidden">
                  <CardHeader className="pb-4 border-b border-border bg-muted/10">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-black flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Pill className="w-6 h-6 text-primary" />
                        </div>
                        {searchQuery}
                      </CardTitle>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">
                        Trusted Source
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-black text-foreground">{medInfo.name}</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          {medInfo.summary || medInfo.sourceText || 'Verified medicine record available from trusted source data.'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {medInfo.genericName && (
                          <div className="p-4 rounded-2xl bg-muted/30">
                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Generic Name</h4>
                            <p className="font-bold mt-1">{medInfo.genericName}</p>
                          </div>
                        )}
                        {medInfo.category && (
                          <div className="p-4 rounded-2xl bg-muted/30">
                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Category</h4>
                            <p className="font-bold mt-1">{medInfo.category}</p>
                          </div>
                        )}
                        {medInfo.dosageForms?.length ? (
                          <div className="p-4 rounded-2xl bg-muted/30">
                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Dosage Forms</h4>
                            <p className="font-bold mt-1">{medInfo.dosageForms.join(', ')}</p>
                          </div>
                        ) : null}
                        {medInfo.storage && (
                          <div className="p-4 rounded-2xl bg-muted/30">
                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Storage</h4>
                            <p className="font-bold mt-1">{medInfo.storage}</p>
                          </div>
                        )}
                      </div>

                      {medInfo.uses?.length ? (
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3">Uses</h4>
                          <ul className="space-y-2 text-sm">
                            {medInfo.uses.map((item) => <li key={item}>{item}</li>)}
                          </ul>
                        </div>
                      ) : null}

                      {medInfo.warnings?.length ? (
                        <div className="p-6 bg-rose-50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/20">
                          <div className="flex items-center gap-3 mb-3">
                            <AlertTriangle className="w-5 h-5 text-rose-600" />
                            <h5 className="font-black text-rose-900 dark:text-rose-400 text-sm uppercase tracking-wider">Warnings From Source</h5>
                          </div>
                          <ul className="text-xs text-rose-800 dark:text-rose-300 font-medium leading-relaxed space-y-2">
                            {medInfo.warnings.map((warning) => <li key={warning}>{warning}</li>)}
                          </ul>
                        </div>
                      ) : null}

                      <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/20">
                        <div className="flex items-center gap-3 mb-3">
                          <Info className="w-5 h-5 text-blue-600" />
                          <h5 className="font-black text-blue-900 dark:text-blue-400 text-sm uppercase tracking-wider">Citations</h5>
                        </div>
                        <div className="space-y-3">
                          {(medInfo.citations || []).map((citation, index) => (
                            <div key={`${citation.sourceKey}-${index}`} className="text-xs text-blue-900 dark:text-blue-300">
                              <p className="font-black">{citation.sourceName}</p>
                              <p>Retrieved: {citation.retrievedAt}</p>
                              {citation.revisionDate && <p>Revision: {citation.revisionDate}</p>}
                              {citation.sourceUrl && (
                                <a className="font-bold underline" href={citation.sourceUrl} target="_blank" rel="noreferrer">
                                  View source
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                  </CardContent>
                </Card>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
                    This screen only displays records imported from trusted sources. Gemini is not used as a medicine data source. Never change your medication or dosage without consulting a licensed healthcare professional.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
                <div className="w-24 h-24 bg-muted/30 rounded-[2.5rem] flex items-center justify-center">
                  <Search className="w-12 h-12 text-muted-foreground opacity-20" />
                </div>
                <div className="max-w-xs">
                  <h3 className="text-xl font-bold text-foreground">No Drug Selected</h3>
                  <p className="text-sm text-muted-foreground mt-2">Search for a medicine in the verified Firestore source database.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
