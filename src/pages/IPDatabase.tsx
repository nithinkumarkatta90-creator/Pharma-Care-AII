import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Button, buttonVariants } from '../components/ui/button';
import { 
  Search, 
  Book, 
  Loader2, 
  Info, 
  FileText, 
  Download, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  History, 
  Filter,
  ExternalLink,
  FlaskConical,
  ShieldCheck,
  Package,
  Calendar,
  Thermometer,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import localDb from '../data/ip-database.json';

interface IPRecord {
  name: string;
  category: string;
  description: string;
  standard: string;
  dosageForms: string[];
  storage: string;
  identification: string;
  assay: string;
  impurities: string;
  labelClaim: string;
  container: string;
  stability: string;
  referenceYear: string;
}

const CATEGORIES = [
  "All",
  "Analgesic/Antipyretic",
  "Antibiotic",
  "Antidiabetic",
  "Antihyperlipidemic",
  "Antihypertensive",
  "NSAID",
  "Proton Pump Inhibitor",
  "ACE Inhibitor"
];

export default function IPDatabase() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDrug, setSelectedDrug] = useState<IPRecord | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [recentViews, setRecentViews] = useState<IPRecord[]>([]);

  // Load bookmarks and recents from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('ip_bookmarks');
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));

    const savedRecents = localStorage.getItem('ip_recents');
    if (savedRecents) setRecentViews(JSON.parse(savedRecents));
  }, []);

  const filteredResults = useMemo(() => {
    let data = localDb as IPRecord[];
    if (query) {
      const lowerQuery = query.toLowerCase();
      data = data.filter(item => 
        item.name.toLowerCase().includes(lowerQuery) || 
        item.category.toLowerCase().includes(lowerQuery)
      );
    }
    if (selectedCategory !== 'All') {
      data = data.filter(item => item.category === selectedCategory);
    }
    return data;
  }, [query, selectedCategory]);

  const toggleBookmark = (drugName: string) => {
    const newBookmarks = bookmarks.includes(drugName)
      ? bookmarks.filter(b => b !== drugName)
      : [...bookmarks, drugName];
    setBookmarks(newBookmarks);
    localStorage.setItem('ip_bookmarks', JSON.stringify(newBookmarks));
    toast.success(bookmarks.includes(drugName) ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const addToRecent = (drug: IPRecord) => {
    const filtered = recentViews.filter(r => r.name !== drug.name);
    const newRecents = [drug, ...filtered].slice(0, 5);
    setRecentViews(newRecents);
    localStorage.setItem('ip_recents', JSON.stringify(newRecents));
  };

  const handleExplain = async (drug: IPRecord) => {
    setExplaining(true);
    setAiExplanation(null);
    try {
      const response = await fetch('/api/ip-database/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugName: drug.name, monograph: drug })
      });
      const data = await response.json();
      setAiExplanation(data.explanation);
    } catch (error) {
      toast.error('Failed to generate AI explanation');
    } finally {
      setExplaining(false);
    }
  };

  const exportToPDF = (drug: IPRecord) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Monograph: ${drug.name} (IP ${drug.referenceYear})`, 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Category: ${drug.category}`, 14, 32);
    doc.text(`Standard: ${drug.standard}`, 14, 40);
    
    const tableData = [
      ['Description', drug.description],
      ['Dosage Forms', drug.dosageForms.join(', ')],
      ['Storage', drug.storage],
      ['Identification', drug.identification],
      ['Assay', drug.assay],
      ['Impurities', drug.impurities],
      ['Label Claim', drug.labelClaim],
      ['Container', drug.container],
      ['Stability', drug.stability]
    ];

    (doc as any).autoTable({
      startY: 50,
      head: [['Field', 'Details']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`${drug.name}_IP_Monograph.pdf`);
    toast.success('PDF Exported successfully');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link 
          to="/" 
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "rounded-xl bg-white shadow-sm border border-slate-200"
          )}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">IP Database</h2>
          <p className="text-slate-500 text-sm">Official drug standards and monographs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters & Recents */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-slate-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedCategory === cat 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </CardContent>
          </Card>

          {recentViews.length > 0 && (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Recently Viewed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentViews.map(drug => (
                  <button
                    key={drug.name}
                    onClick={() => {
                      setSelectedDrug(drug);
                      addToRecent(drug);
                    }}
                    className="w-full flex items-center justify-between group text-left"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{drug.name}</span>
                      <span className="text-[10px] text-slate-500">{drug.category}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-400" />
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-sm bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-900">
                <ShieldCheck className="w-4 h-4" />
                IP Standards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-blue-800 leading-relaxed">
                The Indian Pharmacopoeia is published by the Indian Pharmacopoeia Commission (IPC) to provide standards for drugs manufactured and marketed in India.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Search & Results */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none shadow-lg overflow-hidden">
            <div className="h-1 bg-blue-600" />
            <CardContent className="p-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input 
                    placeholder="Search by drug name (e.g. Paracetamol, Metformin...)" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-12 h-12 text-lg border-slate-200 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredResults.length > 0 ? (
              filteredResults.map((item, i) => (
                  <Card key={i} className="group hover:shadow-xl transition-all duration-300 border-none shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(item.name);
                        }}
                        className="text-slate-300 hover:text-blue-600 transition-colors"
                      >
                        {bookmarks.includes(item.name) ? (
                          <BookmarkCheck className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Bookmark className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                          {item.category}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">{item.standard}</Badge>
                      </div>
                      <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>IP {item.referenceYear}</span>
                        </div>
                        <Dialog>
                          <DialogTrigger
                            render={
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-blue-600 hover:bg-blue-50 font-bold"
                                onClick={() => {
                                  setSelectedDrug(item);
                                  addToRecent(item);
                                  setAiExplanation(null);
                                }}
                              >
                                View Monograph
                                <ExternalLink className="w-3 h-3 ml-2" />
                              </Button>
                            }
                          />
                          {selectedDrug && (
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                              <DialogHeader className="p-6 bg-slate-50 border-b">
                                <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                    <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                      {selectedDrug.name}
                                      <Badge className="bg-blue-600">{selectedDrug.standard}</Badge>
                                    </DialogTitle>
                                    <DialogDescription className="text-slate-500">
                                      Official Pharmacopoeial Monograph Details
                                    </DialogDescription>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => exportToPDF(selectedDrug)}>
                                      <Download className="w-4 h-4 mr-2" />
                                      Export PDF
                                    </Button>
                                    <Button 
                                      className="bg-blue-600 hover:bg-blue-700" 
                                      size="sm"
                                      disabled={explaining}
                                      onClick={() => handleExplain(selectedDrug)}
                                    >
                                      {explaining ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                      AI Explanation
                                    </Button>
                                  </div>
                                </div>
                              </DialogHeader>
                              
                              <ScrollArea className="flex-1 p-6">
                                <Tabs defaultValue="general" className="w-full">
                                  <TabsList className="grid w-full grid-cols-4 mb-8">
                                    <TabsTrigger value="general">General</TabsTrigger>
                                    <TabsTrigger value="tests">Tests & Assay</TabsTrigger>
                                    <TabsTrigger value="storage">Storage & Stability</TabsTrigger>
                                    <TabsTrigger value="ai">AI Insight</TabsTrigger>
                                  </TabsList>
                                  
                                  <TabsContent value="general" className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                          <div className="p-2 bg-blue-50 rounded-lg">
                                            <Info className="w-5 h-5 text-blue-600" />
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-bold text-slate-900">Description</h4>
                                            <p className="text-sm text-slate-600">{selectedDrug.description}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                          <div className="p-2 bg-purple-50 rounded-lg">
                                            <Package className="w-5 h-5 text-purple-600" />
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-bold text-slate-900">Dosage Forms</h4>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {selectedDrug.dosageForms.map(df => (
                                                <Badge key={df} variant="secondary" className="text-[10px]">{df}</Badge>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                          <div className="p-2 bg-emerald-50 rounded-lg">
                                            <FileText className="w-5 h-5 text-emerald-600" />
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-bold text-slate-900">Label Claim</h4>
                                            <p className="text-sm text-slate-600">{selectedDrug.labelClaim}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                          <div className="p-2 bg-amber-50 rounded-lg">
                                            <Package className="w-5 h-5 text-amber-600" />
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-bold text-slate-900">Container Type</h4>
                                            <p className="text-sm text-slate-600">{selectedDrug.container}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="tests" className="space-y-6">
                                    <div className="space-y-6">
                                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                                          <FlaskConical className="w-4 h-4 text-blue-600" />
                                          Identification Tests
                                        </h4>
                                        <p className="text-sm text-slate-600 leading-relaxed">{selectedDrug.identification}</p>
                                      </div>
                                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                          Assay Method / Limits
                                        </h4>
                                        <p className="text-sm text-slate-600 leading-relaxed">{selectedDrug.assay}</p>
                                      </div>
                                      <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                        <h4 className="text-sm font-bold text-red-900 flex items-center gap-2 mb-2">
                                          <ShieldCheck className="w-4 h-4 text-red-600" />
                                          Impurities / Related Substances
                                        </h4>
                                        <p className="text-sm text-red-800 leading-relaxed">{selectedDrug.impurities}</p>
                                      </div>
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="storage" className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                        <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2 mb-2">
                                          <Thermometer className="w-4 h-4 text-amber-600" />
                                          Storage Conditions
                                        </h4>
                                        <p className="text-sm text-amber-800 leading-relaxed">{selectedDrug.storage}</p>
                                      </div>
                                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-2">
                                          <Calendar className="w-4 h-4 text-blue-600" />
                                          Stability & Expiry
                                        </h4>
                                        <p className="text-sm text-blue-800 leading-relaxed">{selectedDrug.stability}</p>
                                      </div>
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="ai" className="space-y-6">
                                    {!aiExplanation ? (
                                      <div className="text-center py-12 space-y-4">
                                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                                          <Sparkles className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <div className="space-y-2">
                                          <h4 className="text-lg font-bold text-slate-900">AI Monograph Explainer</h4>
                                          <p className="text-sm text-slate-500 max-w-md mx-auto">
                                            Let Gemini explain this complex monograph in simple, everyday language.
                                          </p>
                                        </div>
                                        <Button 
                                          className="bg-blue-600 hover:bg-blue-700" 
                                          disabled={explaining}
                                          onClick={() => handleExplain(selectedDrug)}
                                        >
                                          {explaining ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                          Generate Explanation
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 relative">
                                        <div className="absolute -top-3 left-6 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                                          <Sparkles className="w-3 h-3" />
                                          AI GENERATED INSIGHT
                                        </div>
                                        <div className="prose prose-sm max-w-none text-blue-900 leading-relaxed">
                                          {aiExplanation.split('\n').map((line, i) => (
                                            <p key={i} className="mb-2">{line}</p>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </TabsContent>
                                </Tabs>
                              </ScrollArea>
                            </DialogContent>
                          )}
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-slate-200" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">No drugs found</h3>
                  <p className="text-slate-500">Try adjusting your search or category filter.</p>
                  <Button 
                    variant="link" 
                    className="mt-2 text-blue-600 font-bold"
                    onClick={() => {
                      setQuery('');
                      setSelectedCategory('All');
                    }}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
