import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../App';
import { aiService } from '../services/aiService';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Button, buttonVariants } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { 
  FileText, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Sparkles,
  Info
} from 'lucide-react';
import Markdown from 'react-markdown';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function LabReports() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setAnalysis(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    let url = '';
    try {
      // 1. Upload to Storage (Optional - for history)
      try {
        const storageRef = ref(storage, `reports/${user.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        url = await getDownloadURL(storageRef);
      } catch (storageError: any) {
        console.warn('Firebase Storage upload failed, proceeding with AI analysis only:', storageError);
        if (storageError.code === 'storage/retry-limit-exceeded') {
          toast.error('Cloud storage is currently unavailable. Your report will not be saved to history, but analysis will continue.');
        }
      }

      // 2. Real AI Analysis using the image
      const result = await aiService.analyzeLabReport(file);
      setAnalysis(result);

      // 3. Save to Firestore
      await addDoc(collection(db, 'lab_reports'), {
        uid: user.uid,
        fileName: file.name,
        fileUrl: url, // Might be empty if storage failed
        analysis: result,
        createdAt: new Date().toISOString()
      });

      toast.success('Report analyzed successfully');
    } catch (error: any) {
      toast.error('Failed to process report');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24">
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
              Lab AI Analysis
              <Badge className="bg-cyan-500/10 text-cyan-600 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">
                Pro Analysis
              </Badge>
            </h2>
            <p className="text-muted-foreground font-medium mt-1">AI-powered summary and interpretation of your medical reports.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none rounded-[2.5rem] overflow-hidden bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Upload Document
              </CardTitle>
              <CardDescription>Upload your blood test, MRI, or any medical report.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative group">
                <div className={cn(
                  "border-4 border-dashed rounded-[2rem] p-8 text-center transition-all duration-300 relative overflow-hidden h-80 flex flex-col items-center justify-center",
                  previewUrl ? "border-primary/20" : "border-muted hover:border-primary/40"
                )}>
                  {previewUrl && file?.type.startsWith('image/') ? (
                    <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
                  ) : (
                    <div className="relative z-10">
                      <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                        <FileText className="w-10 h-10 text-primary" />
                      </div>
                      <p className="text-sm font-bold text-foreground">{file ? file.name : 'Drop your report here'}</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG up to 10MB</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </div>

              <Button 
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-black shadow-lg shadow-primary/20 transition-all active:scale-95" 
                disabled={!file || uploading}
                onClick={handleUpload}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Analyzing Report...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 mr-3" />
                    Analyze with AI
                  </>
                )}
              </Button>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-800 dark:text-blue-400 leading-relaxed font-medium">
                  Our AI scans for key biomarkers and provides a simplified summary of your results.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {uploading ? (
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
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                </Card>
              </motion.div>
            ) : analysis ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-card overflow-hidden">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-2xl font-black flex items-center gap-3">
                      <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                      Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-4 space-y-8">
                    <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/20 p-8 rounded-[2rem] border border-border">
                      <Markdown>{analysis}</Markdown>
                    </div>

                    <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/20 flex gap-4">
                      <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-black text-amber-900 dark:text-amber-400 uppercase tracking-widest text-xs mb-1">Medical Disclaimer</h4>
                        <p className="text-sm text-amber-800 dark:text-amber-500 font-medium leading-relaxed">
                          This analysis is generated by AI and is for informational purposes only. It does not replace professional medical advice. Always consult with a qualified healthcare provider for diagnosis and treatment.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
                <div className="w-24 h-24 bg-muted/30 rounded-[2.5rem] flex items-center justify-center">
                  <FileText className="w-12 h-12 text-muted-foreground opacity-20" />
                </div>
                <div className="max-w-xs">
                  <h3 className="text-xl font-bold text-foreground">Ready for Analysis</h3>
                  <p className="text-sm text-muted-foreground mt-2">Upload your medical reports to get a clear, AI-powered summary of your health data.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
