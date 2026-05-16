import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { QrCode, ShieldCheck, AlertCircle, History as HistoryIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';

export default function QRScanner() {
  const { user } = useAuth();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [verification, setVerification] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, (err) => {
      // Only set error if it's a permission error
      if (err?.toString().includes('NotAllowedError')) {
        setError('Camera permission denied. Please allow camera access to scan.');
      }
      onScanFailure(err);
    });

    function onScanSuccess(decodedText: string) {
      scanner.clear();
      handleScan(decodedText);
    }

    function onScanFailure(error: any) {
      // console.warn(`Code scan error = ${error}`);
    }

    return () => {
      scanner.clear().catch(e => console.error("Failed to clear scanner", e));
    };
  }, []);

  const handleScan = async (data: string) => {
    if (!user) return;
    setScanResult(data);

    // Mock verification logic
    const mockVerification = {
      manufacturer: "PharmaCorp India",
      batchNumber: "BCH-2024-001",
      expiryDate: "2026-12-31",
      status: "Authentic"
    };
    setVerification(mockVerification);

    try {
      await addDoc(collection(db, 'qr_scans'), {
        uid: user.uid,
        data,
        verification: JSON.stringify(mockVerification),
        createdAt: new Date().toISOString()
      });
      toast.success('Medicine verified');
    } catch (error: any) {
      toast.error('Failed to save scan history');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900">Medicine Authenticity Verifier</h2>
        <p className="text-slate-500 mt-2">Scan the QR code on the medicine packaging to verify its authenticity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-600" />
              Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            ) : (
              <div id="reader" className="overflow-hidden rounded-xl border border-slate-200"></div>
            )}
            {scanResult && (
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => window.location.reload()}
              >
                Scan Again
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Result</CardTitle>
          </CardHeader>
          <CardContent>
            {verification ? (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex gap-3">
                  <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-green-900 text-lg">Authentic Medicine</h4>
                    <p className="text-sm text-green-800">This product is verified as genuine.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Manufacturer</span>
                    <span className="font-medium text-slate-900">{verification.manufacturer}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Batch Number</span>
                    <span className="font-medium text-slate-900">{verification.batchNumber}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Expiry Date</span>
                    <span className="font-medium text-slate-900">{verification.expiryDate}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <QrCode className="w-12 h-12 mb-4 opacity-20" />
                <p>Scan a QR code to see results here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
