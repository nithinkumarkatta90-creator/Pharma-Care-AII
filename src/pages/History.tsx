import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useAuth } from '../App';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  History as HistoryIcon, 
  Trash2, 
  Stethoscope, 
  Pill, 
  FileText, 
  QrCode, 
  Utensils, 
  Zap, 
  Camera, 
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Badge } from '../components/ui/badge';

export default function History() {
  const { user } = useAuth();
  const [diagnosis, setDiagnosis] = useState<any[]>([]);
  const [medicineSearch, setMedicineSearch] = useState<any[]>([]);
  const [labReports, setLabReports] = useState<any[]>([]);
  const [qrScans, setQrScans] = useState<any[]>([]);
  const [dietPlans, setDietPlans] = useState<any[]>([]);
  const [sideEffects, setSideEffects] = useState<any[]>([]);
  const [rxScans, setRxScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;

    let diagLoaded = false;
    let medLoaded = false;
    let labLoaded = false;
    let qrLoaded = false;
    let dietLoaded = false;
    let sideEffectsLoaded = false;
    let rxLoaded = false;

    const checkAllLoaded = () => {
      if (diagLoaded && medLoaded && labLoaded && qrLoaded && dietLoaded && sideEffectsLoaded && rxLoaded) {
        setLoading(false);
      }
    };

    const unsubDiag = onSnapshot(query(collection(db, 'diagnosis_history'), where('uid', '==', user.uid)), (snap) => {
      setDiagnosis(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      diagLoaded = true;
      checkAllLoaded();
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'diagnosis_history');
      diagLoaded = true;
      checkAllLoaded();
    });

    const unsubMed = onSnapshot(query(collection(db, 'medicine_search'), where('uid', '==', user.uid)), (snap) => {
      setMedicineSearch(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      medLoaded = true;
      checkAllLoaded();
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'medicine_search');
      medLoaded = true;
      checkAllLoaded();
    });

    const unsubLab = onSnapshot(query(collection(db, 'lab_reports'), where('uid', '==', user.uid)), (snap) => {
      setLabReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      labLoaded = true;
      checkAllLoaded();
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'lab_reports');
      labLoaded = true;
      checkAllLoaded();
    });

    const unsubQR = onSnapshot(query(collection(db, 'qr_scans'), where('uid', '==', user.uid)), (snap) => {
      setQrScans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      qrLoaded = true;
      checkAllLoaded();
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'qr_scans');
      qrLoaded = true;
      checkAllLoaded();
    });

    const unsubDiet = onSnapshot(query(collection(db, 'diet_plans'), where('uid', '==', user.uid)), (snap) => {
      setDietPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      dietLoaded = true;
      checkAllLoaded();
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'diet_plans');
      dietLoaded = true;
      checkAllLoaded();
    });

    const unsubSideEffects = onSnapshot(query(collection(db, 'side_effect_predictions'), where('uid', '==', user.uid)), (snap) => {
      setSideEffects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      sideEffectsLoaded = true;
      checkAllLoaded();
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'side_effect_predictions');
      sideEffectsLoaded = true;
      checkAllLoaded();
    });

    const unsubRx = onSnapshot(query(collection(db, 'rx_scans'), where('uid', '==', user.uid)), (snap) => {
      setRxScans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      rxLoaded = true;
      checkAllLoaded();
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'rx_scans');
      rxLoaded = true;
      checkAllLoaded();
    });

    return () => {
      unsubDiag();
      unsubMed();
      unsubLab();
      unsubQR();
      unsubDiet();
      unsubSideEffects();
      unsubRx();
    };
  }, [user]);

  const filterItems = (items: any[], titleKey: string, subtitleKey?: string) => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item => 
      (item[titleKey] && item[titleKey].toLowerCase().includes(q)) ||
      (subtitleKey && item[subtitleKey] && item[subtitleKey].toLowerCase().includes(q))
    );
  };

  const handleDelete = async (coll: string, id: string) => {
    try {
      await deleteDoc(doc(db, coll, id));
      toast.success('Record deleted');
    } catch (error: any) {
      toast.error('Failed to delete record');
    }
  };

  const clearAll = async (coll: string) => {
    if (!user) return;
    try {
      const q = query(collection(db, coll), where('uid', '==', user.uid));
      const snap = await getDocs(q);
      const promises = snap.docs.map(d => deleteDoc(doc(db, coll, d.id)));
      await Promise.all(promises);
      toast.success('History cleared');
    } catch (error: any) {
      toast.error('Failed to clear history');
    }
  };

  const HistoryList = ({ items, collectionName, icon: Icon, titleKey, subtitleKey }: any) => {
    const filtered = filterItems(items, titleKey, subtitleKey);
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-black text-foreground uppercase tracking-widest flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            {filtered.length} {filtered.length === 1 ? 'Record' : 'Records'}
            {searchQuery && <span className="text-xs text-muted-foreground normal-case font-medium">(filtered)</span>}
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => clearAll(collectionName)} 
            className="text-rose-600 hover:bg-rose-50 rounded-xl font-bold" 
            disabled={loading || items.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="border-none shadow-sm rounded-3xl bg-card">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-2xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-10 rounded-xl" />
                </CardContent>
              </Card>
            ))
          ) : filtered.length > 0 ? (
            <AnimatePresence>
              {filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((item: any) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                >
                  <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl bg-card group overflow-hidden">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-black text-foreground text-lg leading-tight">
                            {item[titleKey] || 'Untitled Record'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              {new Date(item.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {subtitleKey && item[subtitleKey] && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1 font-medium">{item[subtitleKey]}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(collectionName, item.id)} 
                          className="text-muted-foreground hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                        <ChevronRight className="w-5 h-5 text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-muted/30 rounded-[2rem] flex items-center justify-center">
                <Search className="w-10 h-10 text-muted-foreground opacity-20" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground">No records found</h4>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  {searchQuery ? `No results for "${searchQuery}"` : 'Your activity history will appear here.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="p-2 rounded-2xl bg-card shadow-sm border border-border hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-4xl font-black text-foreground tracking-tight">Health History</h2>
            <p className="text-muted-foreground font-medium mt-1">Manage your medical records and AI analysis logs.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all w-64"
            />
          </div>
          <div className="flex items-center gap-2 bg-card p-1 rounded-2xl border border-border">
            <Button variant="ghost" size="sm" className="rounded-xl font-bold">Export PDF</Button>
            <Button variant="ghost" size="sm" className="rounded-xl font-bold">Sync Cloud</Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="rx" className="w-full">
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <TabsList className="inline-flex w-auto h-14 bg-muted/50 p-1.5 rounded-2xl border border-border gap-2">
            <TabsTrigger value="rx" className="rounded-xl px-6 font-black text-xs uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Camera className="w-4 h-4 mr-2" />
              Rx Scans
            </TabsTrigger>
            <TabsTrigger value="diagnosis" className="rounded-xl px-6 font-black text-xs uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Stethoscope className="w-4 h-4 mr-2" />
              Diagnosis
            </TabsTrigger>
            <TabsTrigger value="medicines" className="rounded-xl px-6 font-black text-xs uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Pill className="w-4 h-4 mr-2" />
              Meds
            </TabsTrigger>
            <TabsTrigger value="qr" className="rounded-xl px-6 font-black text-xs uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <QrCode className="w-4 h-4 mr-2" />
              QR Scans
            </TabsTrigger>
            <TabsTrigger value="lab" className="rounded-xl px-6 font-black text-xs uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <FileText className="w-4 h-4 mr-2" />
              Lab Reports
            </TabsTrigger>
            <TabsTrigger value="diet" className="rounded-xl px-6 font-black text-xs uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Utensils className="w-4 h-4 mr-2" />
              Diet
            </TabsTrigger>
          </TabsList>
        </ScrollArea>

        <div className="mt-8">
          <TabsContent value="rx">
            <HistoryList items={rxScans} collectionName="rx_scans" icon={Camera} titleKey="doctorName" subtitleKey="date" />
          </TabsContent>
          <TabsContent value="diagnosis">
            <HistoryList items={diagnosis} collectionName="diagnosis_history" icon={Stethoscope} titleKey="symptoms" />
          </TabsContent>
          <TabsContent value="medicines">
            <HistoryList items={medicineSearch} collectionName="medicine_search" icon={Pill} titleKey="medicineName" />
          </TabsContent>
          <TabsContent value="qr">
            <HistoryList items={qrScans} collectionName="qr_scans" icon={QrCode} titleKey="medicineName" />
          </TabsContent>
          <TabsContent value="lab">
            <HistoryList items={labReports} collectionName="lab_reports" icon={FileText} titleKey="fileName" />
          </TabsContent>
          <TabsContent value="diet">
            <HistoryList items={dietPlans} collectionName="diet_plans" icon={Utensils} titleKey="disease" />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
