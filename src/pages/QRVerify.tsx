import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  QrCode, 
  Camera, 
  Zap, 
  ZapOff, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Info,
  ShieldCheck,
  History,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { qrService } from '../services/qrService';
import { MedicineQRData, ScanResult } from '../types/qr';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { PageHeader } from '../components/PageHeader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

export default function QRVerify() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);
  const [scannedData, setScannedData] = useState<MedicineQRData | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isTransitioning = useRef(false);
  const scannerId = "qr-reader";

  useEffect(() => {
    let mounted = true;

    const initScanner = async () => {
      if (scanning && !scannedData && mounted) {
        await startScanner();
      }
    };

    initScanner();

    return () => {
      mounted = false;
      stopScanner();
    };
  }, [scanning, scannedData]);

  const startScanner = async () => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;

    try {
      // Ensure any existing instance is stopped
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerId);
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanFailure
      );
      setError(null);
      setPermissionDenied(false);
    } catch (err: any) {
      console.error("Failed to start scanner:", err);
      if (err?.toString().includes("NotAllowedError") || err?.name === "NotAllowedError") {
        setPermissionDenied(true);
        setError("Camera permission denied. Please enable camera access in your browser settings to scan QR codes.");
      } else {
        setError("Could not start camera. Please ensure no other app is using it and try again.");
      }
    } finally {
      isTransitioning.current = false;
    }
  };

  const stopScanner = async () => {
    if (isTransitioning.current) return;
    
    if (scannerRef.current && scannerRef.current.isScanning) {
      isTransitioning.current = true;
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      } finally {
        isTransitioning.current = false;
      }
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText) as MedicineQRData;
      
      // Basic validation of keys
      if (!data.medicineName || !data.approvalNo || !data.batchNo) {
        throw new Error("Invalid QR format");
      }

      await stopScanner();
      setScanning(false);
      setScannedData(data);
      
      // Verify with service
      const result = await qrService.verifyMedicine(data);
      setScanResult(result);
      
      // Save to history
      if (user) {
        await qrService.saveScanHistory(user.uid, data, decodedText, result);
      }

      toast.success(`Medicine scanned: ${data.medicineName}`);
    } catch (err) {
      console.error("Scan error:", err);
      toast.error("Invalid QR code format. Please scan a valid medicine QR.");
    }
  };

  const onScanFailure = (error: any) => {
    // Silently handle scan failures (common during active scanning)
  };

  const toggleFlash = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        const state = !isFlashOn;
        // html5-qrcode doesn't have a direct toggle function that works everywhere, 
        // but we can try to apply camera constraints if supported
        const track = (scannerRef.current as any).getRunningTrack();
        if (track && 'applyConstraints' in track) {
          await (track as any).applyConstraints({
            advanced: [{ torch: state }]
          });
          setIsFlashOn(state);
        } else {
          toast.error("Flash not supported on this device/browser");
        }
      } catch (err) {
        console.error("Flash error:", err);
      }
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setScanResult(null);
    setScanning(true);
    setError(null);
  };

  const handleReportFake = async () => {
    if (!user || !scannedData || !reportReason.trim()) return;

    setIsSubmittingReport(true);
    try {
      await qrService.reportFake({
        userId: user.uid,
        medicineName: scannedData.medicineName,
        batchNo: scannedData.batchNo,
        approvalNo: scannedData.approvalNo,
        manufacturer: scannedData.manufacturer,
        qrRawData: JSON.stringify(scannedData),
        reportReason: reportReason
      });
      
      toast.success("Report submitted successfully. Thank you for your vigilance.");
      setIsReporting(false);
      setReportReason('');
    } catch (err) {
      console.error("Report error:", err);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const getResultColor = () => {
    switch (scanResult) {
      case 'Genuine': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Expired': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Fake': return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'Not Verified': return 'text-slate-600 bg-slate-50 border-slate-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getResultIcon = () => {
    switch (scanResult) {
      case 'Genuine': return <CheckCircle2 className="w-12 h-12 text-emerald-500" />;
      case 'Expired': return <AlertTriangle className="w-12 h-12 text-amber-500" />;
      case 'Fake': return <XCircle className="w-12 h-12 text-rose-500" />;
      case 'Not Verified': return <AlertCircle className="w-12 h-12 text-slate-400" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <PageHeader
        icon={QrCode}
        title="QR Verification"
        description="Scan medicine QR codes to verify authenticity and detect counterfeits."
        color="indigo"
        badge="Verify"
      />

      <div className="relative z-20">
        <AnimatePresence mode="wait">
          {scanning ? (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="overflow-hidden border-none shadow-xl">
                <CardContent className="p-0">
                  <div className="relative aspect-square bg-black flex items-center justify-center overflow-hidden">
                    <div id={scannerId} className="w-full h-full"></div>
                    
                    {/* Scanner Overlay */}
                    <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40">
                      <div className="w-full h-full border-2 border-blue-400/50 rounded-lg relative">
                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                        
                        {/* Scanning Line */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-scan"></div>
                      </div>
                    </div>

                    {error && (
                      <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-8 text-center z-50">
                        {permissionDenied ? (
                          <Camera className="w-12 h-12 text-rose-500 mb-4" />
                        ) : (
                          <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
                        )}
                        <p className="text-white font-medium text-lg mb-2">
                          {permissionDenied ? "Camera Access Required" : "Scanner Error"}
                        </p>
                        <p className="text-slate-300 text-sm mb-6">
                          {error}
                        </p>
                        <div className="flex flex-col gap-3 w-full max-w-[200px]">
                          <Button 
                            variant="default" 
                            className="bg-blue-600 hover:bg-blue-700 text-white" 
                            onClick={startScanner}
                          >
                            Try Again
                          </Button>
                          <Button 
                            variant="outline" 
                            className="text-white border-white/20 hover:bg-white/10" 
                            onClick={() => navigate(-1)}
                          >
                            Go Back
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex justify-center gap-4 bg-white">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="rounded-full gap-2"
                      onClick={toggleFlash}
                    >
                      {isFlashOn ? <ZapOff className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                      Flash
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="rounded-full gap-2"
                      onClick={() => {
                        stopScanner();
                        startScanner();
                      }}
                    >
                      <RefreshCw className="w-5 h-5" />
                      Switch
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : scannedData && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Result Status Card */}
              <Card className={`border-2 shadow-lg ${getResultColor()}`}>
                <CardContent className="p-8 flex flex-col items-center text-center">
                  {getResultIcon()}
                  <h2 className="text-2xl font-bold mt-4">{scanResult}</h2>
                  <p className="mt-2 opacity-80">
                    {scanResult === 'Genuine' && "This medicine is verified as authentic."}
                    {scanResult === 'Expired' && "Warning: This medicine has passed its expiry date."}
                    {scanResult === 'Fake' && "Warning: This batch has been flagged as counterfeit."}
                    {scanResult === 'Not Verified' && "This medicine is not in our verification database."}
                  </p>
                </CardContent>
              </Card>

              {/* Medicine Details Card */}
              <Card className="shadow-md border-none">
                <CardHeader className="border-b bg-slate-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-slate-900">{scannedData.medicineName}</CardTitle>
                      <CardDescription>{scannedData.brandName} • {scannedData.strength}</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-white">{scannedData.dosageForm}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-slate-500">Manufacturer</p>
                      <p className="font-medium text-slate-900">{scannedData.manufacturer}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-500">Batch Number</p>
                      <p className="font-medium text-slate-900">{scannedData.batchNo}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-500">Approval No.</p>
                      <p className="font-medium text-slate-900">{scannedData.approvalNo}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-500">MRP</p>
                      <p className="font-medium text-slate-900">{scannedData.mrp}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-500">Mfg Date</p>
                      <p className="font-medium text-slate-900">{scannedData.mfgDate}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-500">Exp Date</p>
                      <p className={`font-medium ${scanResult === 'Expired' ? 'text-rose-600' : 'text-slate-900'}`}>
                        {scannedData.expDate}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                      <span>License: {scannedData.licenseNo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Info className="w-4 h-4 text-blue-500" />
                      <span>Storage: {scannedData.storage}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Button 
                  size="lg" 
                  className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-lg rounded-2xl shadow-lg shadow-blue-200"
                  onClick={resetScanner}
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Scan Another
                </Button>
                
                {(scanResult === 'Fake' || scanResult === 'Not Verified') && (
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full h-14 text-lg rounded-2xl border-rose-200 text-rose-600 hover:bg-rose-50"
                    onClick={() => setIsReporting(true)}
                  >
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Report Fake Medicine
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Report Dialog */}
      <Dialog open={isReporting} onOpenChange={setIsReporting}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              Report Counterfeit
            </DialogTitle>
            <DialogDescription>
              Help us protect others by reporting suspicious medicines. Your report will be sent to regulatory authorities.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for reporting</Label>
              <Textarea 
                id="reason" 
                placeholder="Describe why you suspect this medicine is fake (e.g., poor packaging, unusual smell, verification failed)..."
                className="min-h-[120px]"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReporting(false)}>Cancel</Button>
            <Button 
              className="bg-rose-600 hover:bg-rose-700" 
              onClick={handleReportFake}
              disabled={!reportReason.trim() || isSubmittingReport}
            >
              {isSubmittingReport ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
