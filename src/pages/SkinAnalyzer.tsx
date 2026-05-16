import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Button, buttonVariants } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Camera, Upload, Loader2, ShieldAlert, ArrowLeft, Info } from 'lucide-react';
import { aiService } from '../services/aiService';
import Markdown from 'react-markdown';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function SkinAnalyzer() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    try {
      const analysis = await aiService.analyzeSkinCondition(image);
      setResult(analysis);
      toast.success('Analysis complete');
    } catch (error) {
      console.error(error);
      toast.error('Failed to analyze image');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
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
          <h2 className="text-3xl font-bold text-slate-900">AI Skin Analyzer</h2>
          <p className="text-slate-500 text-sm">Upload a photo of a skin concern for a preliminary AI analysis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-none shadow-xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              Capture or Upload
            </CardTitle>
            <CardDescription>
              Ensure the photo is clear and well-lit.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="relative aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden group hover:border-blue-400 transition-colors">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Upload className="w-12 h-12 text-slate-300 mb-4 group-hover:text-blue-400 transition-colors" />
                  <p className="text-sm font-medium text-slate-500">Click to upload or drag & drop</p>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG up to 5MB</p>
                </>
              )}
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-bold"
              disabled={!image || analyzing}
              onClick={handleAnalyze}
            >
              {analyzing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <Loader2 className="w-4 h-4 mr-2" />
                  </motion.div>
                  Analyzing...
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Analyze Condition
                </>
              )}
            </Button>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-[11px] text-amber-800 leading-relaxed">
                <strong>Disclaimer:</strong> This tool provides an AI-based preliminary analysis only. It is NOT a medical diagnosis. Always consult a certified dermatologist for any skin concerns.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {analyzing ? (
            <Card className="border-none shadow-xl h-full">
              <CardHeader>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="pt-4 space-y-2">
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ) : result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-none shadow-xl h-full overflow-hidden">
                <CardHeader className="bg-blue-600 text-white">
                  <CardTitle>Analysis Result</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="prose prose-sm max-w-none prose-slate">
                    <Markdown>{result}</Markdown>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                <ShieldAlert className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Analysis Yet</h3>
              <p className="text-slate-500 text-sm mt-2">
                Upload a photo and click analyze to see AI insights about your skin concern.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
