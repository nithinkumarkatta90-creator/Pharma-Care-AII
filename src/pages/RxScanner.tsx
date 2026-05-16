import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../App';
import { aiService } from '../services/aiService';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Button, buttonVariants } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { 
  Camera, 
  Upload, 
  Loader2, 
  Pill, 
  CheckCircle2, 
  ArrowLeft, 
  AlertCircle, 
  FileText, 
  Brain, 
  Sparkles,
  Download,
  Info,
  ShieldCheck,
  Languages
} from 'lucide-react';
import { toast } from 'sonner';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ExtractedMedicine {
  name: string;
  strength: string;
  dosage: string;
  duration: string;
  instructions: string;
  confidence: number;
}

interface ScanResult {
  medicines: ExtractedMedicine[];
  doctor: string;
  date: string;
  overallConfidence: number;
  handwritingClarity: string;
}

export default function RxScanner() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [simplifiedText, setSimplifiedText] = useState<string | null>(null);
  const [simplifying, setSimplifying] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setScanResult(null);
      setSimplifiedText(null);
    }
  };

  const handleScan = async () => {
    if (!file || !user) return;

    setScanning(true);
    let url = '';
    try {
      // 1. Upload to Storage (Optional - for history)
      try {
        const storageRef = ref(storage, `prescriptions/${user.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        url = await getDownloadURL(storageRef);
      } catch (storageError: any) {
        console.warn('Firebase Storage upload failed, proceeding with AI analysis only:', storageError);
        if (storageError.code === 'storage/retry-limit-exceeded') {
          toast.error('Cloud storage is currently unavailable. Your scan will not be saved to history, but analysis will continue.');
        }
      }

      // 2. Pro AI Extraction (Independent of storage)
      const result = await aiService.scanPrescriptionPro(file);
      setScanResult(result);

      // 3. Save to Firestore (Only if we have a result)
      await addDoc(collection(db, 'rx_scans'), {
        uid: user.uid,
        fileUrl: url, // Might be empty if storage failed
        result,
        createdAt: new Date().toISOString()
      });

      toast.success('Prescription analyzed with high accuracy');
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to analyze prescription. Please ensure the image is clear.');
    } finally {
      setScanning(false);
    }
  };

  const handleSimplify = async () => {
    if (!scanResult) return;
    setSimplifying(true);
    try {
      const text = await aiService.simplifyPrescription(scanResult.medicines);
      setSimplifiedText(text);
    } catch (error) {
      toast.error('Failed to simplify prescription');
    } finally {
      setSimplifying(false);
    }
  };

  const exportPDF = () => {
    if (!scanResult) return;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Rx AI Scanner Pro - Medical Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Patient: ${user?.displayName || 'N/A'}`, 20, 30);
    doc.text(`Doctor: ${scanResult.doctor || 'N/A'}`, 20, 37);
    doc.text(`Date: ${scanResult.date || new Date().toLocaleDateString()}`, 20, 44);
    
    const tableData = scanResult.medicines.map(m => [
      m.name,
      m.strength,
      m.dosage,
      m.duration,
      m.instructions
    ]);

    (doc as any).autoTable({
      startY: 55,
      head: [['Medicine', 'Strength', 'Dosage', 'Duration', 'Instructions']],
      body: tableData,
    });

    doc.save(`Prescription_${Date.now()}.pdf`);
    toast.success('PDF exported successfully');
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
    if (score >= 70) return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
    return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "rounded-2xl bg-card shadow-sm border border-border"
            )}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-4xl font-black text-foreground tracking-tight flex items-center gap-3">
              Rx Scanner Pro
              <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">
                AI Powered
              </Badge>
            </h2>
            <p className="text-muted-foreground font-medium mt-1">Professional-grade prescription extraction and analysis.</p>
          </div>
        </div>

        {scanResult && (
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="rounded-2xl font-bold border-border"
              onClick={exportPDF}
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button 
              className="rounded-2xl font-bold bg-primary hover:bg-primary/90"
              onClick={handleSimplify}
              disabled={simplifying}
            >
              {simplifying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
              Simplify for Me
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Preview */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none rounded-[2.5rem] overflow-hidden bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Capture Prescription
              </CardTitle>
              <CardDescription>Upload a clear photo of your handwritten or printed Rx.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative group">
                <div className={cn(
                  "border-4 border-dashed rounded-[2rem] p-8 text-center transition-all duration-300 relative overflow-hidden h-80 flex flex-col items-center justify-center",
                  previewUrl ? "border-primary/20" : "border-muted hover:border-primary/40"
                )}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
                  ) : (
                    <div className="relative z-10">
                      <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                        <Upload className="w-10 h-10 text-primary" />
                      </div>
                      <p className="text-sm font-bold text-foreground">Drop your prescription here</p>
                      <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG up to 10MB</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </div>
              </div>

              <Button 
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-black shadow-lg shadow-primary/20 transition-all active:scale-95" 
                disabled={!file || scanning}
                onClick={handleScan}
              >
                {scanning ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Analyzing Handwriting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 mr-3" />
                    Start Pro AI Scan
                  </>
                )}
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-2xl border border-border">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Privacy</p>
                  <p className="text-xs font-bold text-foreground">Secure & Encrypted</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-2xl border border-border">
                  <Languages className="w-5 h-5 text-blue-500 mb-2" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Support</p>
                  <p className="text-xs font-bold text-foreground">Multi-language AI</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {scanning ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-card p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center animate-pulse">
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                    <div>
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-6 bg-muted/20 rounded-3xl border border-border space-y-4">
                        <div className="flex justify-between">
                          <Skeleton className="h-6 w-40" />
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ) : scanResult ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Confidence & Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-none shadow-sm rounded-3xl bg-card p-4 flex flex-col items-center text-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Overall Accuracy</p>
                    <span className={cn("text-2xl font-black px-4 py-1 rounded-2xl", getConfidenceColor(scanResult.overallConfidence))}>
                      {scanResult.overallConfidence}%
                    </span>
                  </Card>
                  <Card className="border-none shadow-sm rounded-3xl bg-card p-4 flex flex-col items-center text-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Handwriting</p>
                    <span className="text-2xl font-black text-foreground">{scanResult.handwritingClarity}</span>
                  </Card>
                  <Card className="border-none shadow-sm rounded-3xl bg-card p-4 flex flex-col items-center text-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Doctor</p>
                    <span className="text-lg font-bold text-foreground truncate w-full">{scanResult.doctor || 'Unknown'}</span>
                  </Card>
                </div>

                {/* Medicines List */}
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-card overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Pill className="w-5 h-5 text-primary" />
                      Detected Medications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {scanResult.medicines.map((med, i) => (
                      <div key={i} className="group p-6 bg-muted/20 hover:bg-muted/40 rounded-3xl border border-border transition-all duration-300">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-card rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Pill className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="text-lg font-black text-foreground">{med.name}</h4>
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{med.strength}</p>
                            </div>
                          </div>
                          <Badge className={cn("border-none font-black text-[10px] uppercase px-3 py-1", getConfidenceColor(med.confidence))}>
                            {med.confidence}% Match
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-card/50 rounded-2xl border border-border/50">
                            <Info className="w-4 h-4 text-blue-500" />
                            <div>
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Dosage</p>
                              <p className="text-sm font-bold text-foreground">{med.dosage}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-card/50 rounded-2xl border border-border/50">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <div>
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Instructions</p>
                              <p className="text-sm font-bold text-foreground">{med.instructions}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl flex gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <p className="text-xs text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
                        AI can make mistakes reading handwriting. Always verify these results with your pharmacist or the physical prescription before taking any medication.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Simplified Explanation */}
                {simplifiedText && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-none shadow-lg shadow-primary/5 rounded-[2.5rem] bg-gradient-to-br from-primary/5 to-indigo-500/5 border border-primary/10">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                          <Brain className="w-6 h-6 text-primary" />
                          AI Prescription Guide
                        </CardTitle>
                        <CardDescription>Simplified instructions for your treatment plan.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none bg-card/50 p-6 rounded-3xl border border-border">
                          <Markdown>{simplifiedText}</Markdown>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
                <div className="w-24 h-24 bg-muted/30 rounded-[2.5rem] flex items-center justify-center">
                  <Camera className="w-12 h-12 text-muted-foreground opacity-20" />
                </div>
                <div className="max-w-xs">
                  <h3 className="text-xl font-bold text-foreground">No Scan Data</h3>
                  <p className="text-sm text-muted-foreground mt-2">Upload a prescription to see the advanced AI analysis and extraction results here.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
