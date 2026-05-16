import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Button, buttonVariants } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { 
  Plus, 
  History, 
  FileText, 
  Activity, 
  ShieldAlert, 
  Stethoscope, 
  User, 
  Phone, 
  Trash2, 
  Download, 
  Sparkles, 
  Loader2, 
  Upload,
  ChevronRight,
  HeartPulse,
  Scale,
  Ruler,
  AlertCircle,
  Pill,
  Syringe,
  Home,
  Wine,
  Cigarette,
  Utensils,
  Share2,
  QrCode,
  ArrowLeft
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { auth } from '../lib/firebase';
import { medicalHistoryService } from '../services/medicalHistoryService';
import { aiService } from '../services/aiService';
import { PatientMedicalHistory, MedicalDocument } from '../types/medical-history';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { QRCodeSVG } from 'qrcode.react';

export default function MedicalHistory() {
  const [records, setRecords] = useState<PatientMedicalHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PatientMedicalHistory | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiRisks, setAiRisks] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const [formData, setFormData] = useState<Partial<PatientMedicalHistory>>({
    patientName: '',
    age: 0,
    gender: 'Male',
    height: 0,
    weight: 0,
    bmi: 0,
    bloodGroup: '',
    allergies: '',
    chronicDiseases: [],
    currentMedications: [],
    pastSurgeries: '',
    hospitalizations: '',
    familyHistory: '',
    lifestyleSmoking: 'No',
    lifestyleAlcohol: 'No',
    dietType: 'Veg',
    emergencyContactName: '',
    emergencyContactNumber: '',
    vaccinationHistory: '',
    doctorNotes: '',
    documents: []
  });

  const [newDisease, setNewDisease] = useState('');
  const [newMedication, setNewMedication] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const data = await medicalHistoryService.fetchMedicalHistory(auth.currentUser.uid);
      setRecords(data || []);
    } catch (error) {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = (h: number, w: number) => {
    if (h > 0 && w > 0) {
      const heightInMeters = h / 100;
      return parseFloat((w / (heightInMeters * heightInMeters)).toFixed(2));
    }
    return 0;
  };

  const handleInputChange = (field: keyof PatientMedicalHistory, value: any) => {
    const updatedData = { ...formData, [field]: value };
    if (field === 'height' || field === 'weight') {
      updatedData.bmi = calculateBMI(updatedData.height || 0, updatedData.weight || 0);
    }
    setFormData(updatedData);
  };

  const addDisease = () => {
    if (newDisease && !formData.chronicDiseases?.includes(newDisease)) {
      setFormData({
        ...formData,
        chronicDiseases: [...(formData.chronicDiseases || []), newDisease]
      });
      setNewDisease('');
    }
  };

  const removeDisease = (disease: string) => {
    setFormData({
      ...formData,
      chronicDiseases: formData.chronicDiseases?.filter(d => d !== disease)
    });
  };

  const addMedication = () => {
    if (newMedication && !formData.currentMedications?.includes(newMedication)) {
      setFormData({
        ...formData,
        currentMedications: [...(formData.currentMedications || []), newMedication]
      });
      setNewMedication('');
    }
  };

  const removeMedication = (med: string) => {
    setFormData({
      ...formData,
      currentMedications: formData.currentMedications?.filter(m => m !== med)
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    setUploading(true);
    try {
      const doc = await medicalHistoryService.uploadMedicalDocument(file, auth.currentUser.uid);
      setFormData({
        ...formData,
        documents: [...(formData.documents || []), doc]
      });
      toast.success('Document uploaded');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = async (url: string) => {
    try {
      await medicalHistoryService.deleteMedicalDocument(url);
      setFormData({
        ...formData,
        documents: formData.documents?.filter(d => d.fileUrl !== url)
      });
      toast.success('Document removed');
    } catch (error) {
      toast.error('Failed to remove document');
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser || !formData.patientName) {
      toast.error('Patient name is required');
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        uid: auth.currentUser.uid,
      } as PatientMedicalHistory;

      if (selectedRecord?.id) {
        await medicalHistoryService.updateMedicalHistory(selectedRecord.id, dataToSave);
        toast.success('Record updated');
      } else {
        await medicalHistoryService.saveMedicalHistory(dataToSave);
        toast.success('Record saved');
      }
      fetchRecords();
      resetForm();
    } catch (error) {
      toast.error('Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patientName: '',
      age: 0,
      gender: 'Male',
      height: 0,
      weight: 0,
      bmi: 0,
      bloodGroup: '',
      allergies: '',
      chronicDiseases: [],
      currentMedications: [],
      pastSurgeries: '',
      hospitalizations: '',
      familyHistory: '',
      lifestyleSmoking: 'No',
      lifestyleAlcohol: 'No',
      dietType: 'Veg',
      emergencyContactName: '',
      emergencyContactNumber: '',
      vaccinationHistory: '',
      doctorNotes: '',
      documents: []
    });
    setSelectedRecord(null);
    setAiSummary(null);
    setAiRisks(null);
  };

  const handleAISummary = async (record: PatientMedicalHistory) => {
    setAnalyzing(true);
    try {
      const summary = await aiService.summarizeMedicalHistory(record);
      setAiSummary(summary);
    } catch (error) {
      toast.error('AI Summary failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAIRisks = async (record: PatientMedicalHistory) => {
    setAnalyzing(true);
    try {
      const risks = await aiService.predictHealthRisks(record);
      setAiRisks(risks);
    } catch (error) {
      toast.error('AI Risk Prediction failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const exportPDF = (record: PatientMedicalHistory) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text('Patient Medical History Report', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    doc.text('PharmaCare AI - Your Health Companion', 14, 33);
    
    doc.setDrawColor(200);
    doc.line(14, 38, 196, 38);

    // Patient Details
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('1. Patient Details', 14, 48);
    
    const patientData = [
      ['Name', record.patientName, 'Age', record.age.toString()],
      ['Gender', record.gender, 'Blood Group', record.bloodGroup],
      ['Height', `${record.height} cm`, 'Weight', `${record.weight} kg`],
      ['BMI', record.bmi.toString(), '', '']
    ];

    (doc as any).autoTable({
      startY: 53,
      body: patientData,
      theme: 'plain',
      styles: { fontSize: 10 }
    });

    // Medical Info
    const nextY = (doc as any).lastAutoTable.finalY + 10;
    doc.text('2. Medical Information', 14, nextY);
    
    const medicalData = [
      ['Chronic Diseases', record.chronicDiseases.join(', ') || 'None'],
      ['Current Medications', record.currentMedications.join(', ') || 'None'],
      ['Allergies', record.allergies || 'None'],
      ['Past Surgeries', record.pastSurgeries || 'None'],
      ['Family History', record.familyHistory || 'None']
    ];

    (doc as any).autoTable({
      startY: nextY + 5,
      body: medicalData,
      theme: 'striped',
      styles: { fontSize: 10 }
    });

    // Lifestyle & Emergency
    const nextY2 = (doc as any).lastAutoTable.finalY + 10;
    doc.text('3. Lifestyle & Emergency', 14, nextY2);
    
    const lifestyleData = [
      ['Smoking', record.lifestyleSmoking, 'Alcohol', record.lifestyleAlcohol],
      ['Diet Type', record.dietType, '', ''],
      ['Emergency Contact', record.emergencyContactName, 'Phone', record.emergencyContactNumber]
    ];

    (doc as any).autoTable({
      startY: nextY2 + 5,
      body: lifestyleData,
      theme: 'plain',
      styles: { fontSize: 10 }
    });

    doc.save(`${record.patientName}_Medical_History.pdf`);
    toast.success('PDF Downloaded');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
            <h1 className="text-3xl font-bold text-slate-900">Patient Medical History</h1>
            <p className="text-slate-500 text-sm">Manage comprehensive health records and AI insights.</p>
          </div>
        </div>
        <Dialog>
          <DialogTrigger render={(props) => (
            <Button {...props} className="bg-blue-600 hover:bg-blue-700 text-white" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Record
            </Button>
          )} />
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
            <DialogHeader className="p-6 bg-slate-50 border-b">
              <DialogTitle className="text-2xl font-bold">
                {selectedRecord ? 'Edit Medical History' : 'New Medical History'}
              </DialogTitle>
              <DialogDescription>
                Fill in all details for a complete medical profile.
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-8">
                {/* Basic Details */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-600">
                    <User className="w-5 h-5" />
                    <h3 className="font-bold">Basic Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Patient Name</Label>
                      <Input 
                        placeholder="Full Name" 
                        value={formData.patientName}
                        onChange={(e) => handleInputChange('patientName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Age</Label>
                      <Input 
                        type="number" 
                        placeholder="Age" 
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select 
                        value={formData.gender} 
                        onValueChange={(v) => handleInputChange('gender', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Vitals */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Activity className="w-5 h-5" />
                    <h3 className="font-bold">Vitals & Blood Group</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <Ruler className="w-3 h-3" /> Height (cm)
                      </Label>
                      <Input 
                        type="number" 
                        value={formData.height}
                        onChange={(e) => handleInputChange('height', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <Scale className="w-3 h-3" /> Weight (kg)
                      </Label>
                      <Input 
                        type="number" 
                        value={formData.weight}
                        onChange={(e) => handleInputChange('weight', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>BMI</Label>
                      <Input value={formData.bmi} disabled className="bg-slate-50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Blood Group</Label>
                      <Select 
                        value={formData.bloodGroup} 
                        onValueChange={(v) => handleInputChange('bloodGroup', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Medical Conditions */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <ShieldAlert className="w-5 h-5" />
                    <h3 className="font-bold">Medical Conditions & Allergies</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Allergies</Label>
                      <Textarea 
                        placeholder="List any drug or food allergies..." 
                        value={formData.allergies}
                        onChange={(e) => handleInputChange('allergies', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Chronic Diseases</Label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Add disease (e.g. Diabetes, BP)" 
                          value={newDisease}
                          onChange={(e) => setNewDisease(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addDisease()}
                        />
                        <Button type="button" variant="outline" onClick={addDisease}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.chronicDiseases?.map(d => (
                          <Badge key={d} variant="secondary" className="px-3 py-1">
                            {d}
                            <button onClick={() => removeDisease(d)} className="ml-2 text-red-500 hover:text-red-700">×</button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Current Medications</Label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Add medication" 
                          value={newMedication}
                          onChange={(e) => setNewMedication(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addMedication()}
                        />
                        <Button type="button" variant="outline" onClick={addMedication}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.currentMedications?.map(m => (
                          <Badge key={m} variant="outline" className="px-3 py-1 border-blue-200 bg-blue-50 text-blue-700">
                            {m}
                            <button onClick={() => removeMedication(m)} className="ml-2 text-red-500 hover:text-red-700">×</button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* History */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-amber-600">
                    <History className="w-5 h-5" />
                    <h3 className="font-bold">Past History</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Past Surgeries</Label>
                      <Textarea 
                        value={formData.pastSurgeries}
                        onChange={(e) => handleInputChange('pastSurgeries', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hospitalizations</Label>
                      <Textarea 
                        value={formData.hospitalizations}
                        onChange={(e) => handleInputChange('hospitalizations', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Family Medical History</Label>
                      <Textarea 
                        value={formData.familyHistory}
                        onChange={(e) => handleInputChange('familyHistory', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Vaccination History</Label>
                      <Textarea 
                        value={formData.vaccinationHistory}
                        onChange={(e) => handleInputChange('vaccinationHistory', e.target.value)}
                      />
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Lifestyle */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-purple-600">
                    <Wine className="w-5 h-5" />
                    <h3 className="font-bold">Lifestyle Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <Cigarette className="w-3 h-3" /> Smoking
                      </Label>
                      <Select 
                        value={formData.lifestyleSmoking} 
                        onValueChange={(v) => handleInputChange('lifestyleSmoking', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <Wine className="w-3 h-3" /> Alcohol
                      </Label>
                      <Select 
                        value={formData.lifestyleAlcohol} 
                        onValueChange={(v) => handleInputChange('lifestyleAlcohol', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <Utensils className="w-3 h-3" /> Diet Type
                      </Label>
                      <Select 
                        value={formData.dietType} 
                        onValueChange={(v) => handleInputChange('dietType', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Veg">Veg</SelectItem>
                          <SelectItem value="Non-Veg">Non-Veg</SelectItem>
                          <SelectItem value="Mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Emergency Contact */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-red-500">
                    <Phone className="w-5 h-5" />
                    <h3 className="font-bold">Emergency Contact</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Contact Name</Label>
                      <Input 
                        placeholder="Name" 
                        value={formData.emergencyContactName}
                        onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Number</Label>
                      <Input 
                        placeholder="Phone Number" 
                        value={formData.emergencyContactNumber}
                        onChange={(e) => handleInputChange('emergencyContactNumber', e.target.value)}
                      />
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Documents */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Upload className="w-5 h-5" />
                    <h3 className="font-bold">Medical Documents</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {uploading ? (
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-slate-400 mb-2" />
                              <p className="text-sm text-slate-500">Click to upload reports, prescriptions, etc.</p>
                            </>
                          )}
                        </div>
                        <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.documents?.map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium truncate max-w-[150px]">{doc.fileName}</span>
                              <span className="text-[10px] text-slate-400">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon-sm" render={(props) => (
                              <a {...props} href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="w-3 h-3" />
                              </a>
                            )} />
                            <Button variant="ghost" size="icon-sm" onClick={() => removeDocument(doc.fileUrl)}>
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Doctor Notes */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Stethoscope className="w-5 h-5" />
                    <h3 className="font-bold">Doctor Notes / Remarks</h3>
                  </div>
                  <Textarea 
                    placeholder="Any additional notes from doctors..." 
                    value={formData.doctorNotes}
                    onChange={(e) => handleInputChange('doctorNotes', e.target.value)}
                    rows={4}
                  />
                </section>
              </div>
            </ScrollArea>
            
            <div className="p-6 bg-slate-50 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]" 
                disabled={saving}
                onClick={handleSave}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {selectedRecord ? 'Update Record' : 'Save Record'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.length > 0 ? (
            records.map((record) => (
              <Card key={record.id} className="group hover:shadow-xl transition-all duration-300 border-none shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {record.patientName}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">{record.gender}</Badge>
                        <span>{record.age} Years</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger render={(props) => (
                          <Button {...props} variant="ghost" size="icon-sm" onClick={() => setSelectedRecord(record)}>
                            <Share2 className="w-4 h-4 text-slate-400 hover:text-blue-600" />
                          </Button>
                        )} />
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Share Medical History</DialogTitle>
                            <DialogDescription>
                              Scan this QR code to share {record.patientName}'s medical profile.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex flex-col items-center justify-center p-6 space-y-4">
                            <div className="p-4 bg-white rounded-2xl shadow-inner border">
                              <QRCodeSVG 
                                value={JSON.stringify({
                                  name: record.patientName,
                                  age: record.age,
                                  bloodGroup: record.bloodGroup,
                                  allergies: record.allergies,
                                  emergency: record.emergencyContactNumber
                                })} 
                                size={200}
                              />
                            </div>
                            <p className="text-xs text-slate-500 text-center">
                              This QR code contains basic medical information for emergency use.
                            </p>
                            <Button className="w-full bg-blue-600" onClick={() => toast.success('Link copied to clipboard')}>
                              Copy Share Link
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold mb-1">
                        <HeartPulse className="w-3 h-3 text-red-500" />
                        Blood Group
                      </div>
                      <span className="text-lg font-bold text-slate-900">{record.bloodGroup || 'N/A'}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold mb-1">
                        <Activity className="w-3 h-3 text-emerald-500" />
                        BMI
                      </div>
                      <span className="text-lg font-bold text-slate-900">{record.bmi || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Chronic Diseases</div>
                    <div className="flex flex-wrap gap-1">
                      {record.chronicDiseases.length > 0 ? (
                        record.chronicDiseases.map(d => (
                          <Badge key={d} variant="outline" className="text-[10px]">{d}</Badge>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">None reported</span>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <History className="w-3 h-3" />
                      <span>Updated: {new Date(record.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:bg-blue-50 font-bold h-8"
                        onClick={() => {
                          setSelectedRecord(record);
                          setFormData(record);
                        }}
                      >
                        Edit
                      </Button>
                      <Dialog>
                        <DialogTrigger render={(props) => (
                          <Button 
                            {...props}
                            variant="ghost" 
                            size="sm" 
                            className="text-emerald-600 hover:bg-emerald-50 font-bold h-8"
                            onClick={() => {
                              setSelectedRecord(record);
                              setAiSummary(null);
                              setAiRisks(null);
                            }}
                          >
                            Details
                          </Button>
                        )} />
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                          <DialogHeader className="p-6 bg-slate-50 border-b">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                  {record.patientName}
                                  <Badge className="bg-blue-600">{record.age} Yrs</Badge>
                                </DialogTitle>
                                <DialogDescription>
                                  Detailed Medical History & AI Insights
                                </DialogDescription>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => exportPDF(record)}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download PDF
                                </Button>
                                <Button 
                                  className="bg-blue-600 hover:bg-blue-700" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRecord(record);
                                    setFormData(record);
                                  }}
                                >
                                  Edit Record
                                </Button>
                              </div>
                            </div>
                          </DialogHeader>
                          
                          <ScrollArea className="flex-1 p-6">
                            <Tabs defaultValue="summary" className="w-full">
                              <TabsList className="grid w-full grid-cols-4 mb-8">
                                <TabsTrigger value="summary">Overview</TabsTrigger>
                                <TabsTrigger value="history">History</TabsTrigger>
                                <TabsTrigger value="documents">Documents</TabsTrigger>
                                <TabsTrigger value="ai">AI Insights</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="summary" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <Card className="border-none bg-slate-50/50">
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-blue-600" />
                                        Vitals & Profile
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Height / Weight</span>
                                        <span className="font-medium">{record.height}cm / {record.weight}kg</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">BMI</span>
                                        <span className="font-medium">{record.bmi}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Blood Group</span>
                                        <span className="font-medium text-red-600">{record.bloodGroup}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Diet Type</span>
                                        <span className="font-medium">{record.dietType}</span>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card className="border-none bg-red-50/30">
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-700">
                                        <ShieldAlert className="w-4 h-4" />
                                        Alerts & Conditions
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                      <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-red-400">Allergies</span>
                                        <p className="text-sm text-red-900">{record.allergies || 'No allergies reported'}</p>
                                      </div>
                                      <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-red-400">Chronic Diseases</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {record.chronicDiseases.map(d => (
                                            <Badge key={d} variant="secondary" className="bg-red-100 text-red-700 border-red-200">{d}</Badge>
                                          ))}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card className="border-none bg-blue-50/30 md:col-span-2">
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-700">
                                        <Pill className="w-4 h-4" />
                                        Current Medications
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="flex flex-wrap gap-2">
                                        {record.currentMedications.map(m => (
                                          <Badge key={m} variant="outline" className="bg-white border-blue-200 text-blue-700 px-3 py-1">
                                            {m}
                                          </Badge>
                                        ))}
                                        {record.currentMedications.length === 0 && <span className="text-sm text-slate-400 italic">No active medications</span>}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </TabsContent>

                              <TabsContent value="history" className="space-y-6">
                                <div className="space-y-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <History className="w-4 h-4 text-amber-600" />
                                        Past Surgeries
                                      </h4>
                                      <p className="text-sm text-slate-600 p-4 bg-slate-50 rounded-xl border border-slate-100 min-h-[80px]">
                                        {record.pastSurgeries || 'None reported'}
                                      </p>
                                    </div>
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <Home className="w-4 h-4 text-blue-600" />
                                        Family History
                                      </h4>
                                      <p className="text-sm text-slate-600 p-4 bg-slate-50 rounded-xl border border-slate-100 min-h-[80px]">
                                        {record.familyHistory || 'None reported'}
                                      </p>
                                    </div>
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <Syringe className="w-4 h-4 text-emerald-600" />
                                        Vaccinations
                                      </h4>
                                      <p className="text-sm text-slate-600 p-4 bg-slate-50 rounded-xl border border-slate-100 min-h-[80px]">
                                        {record.vaccinationHistory || 'None reported'}
                                      </p>
                                    </div>
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <Stethoscope className="w-4 h-4 text-slate-600" />
                                        Doctor's Remarks
                                      </h4>
                                      <p className="text-sm text-slate-600 p-4 bg-slate-50 rounded-xl border border-slate-100 min-h-[80px]">
                                        {record.doctorNotes || 'No notes available'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>

                              <TabsContent value="documents" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {record.documents.map((doc, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                      <div className="flex items-center gap-3">
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                          <FileText className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{doc.fileName}</span>
                                          <span className="text-[10px] text-slate-400">{new Date(doc.uploadedAt).toLocaleDateString()} • {doc.fileType.toUpperCase()}</span>
                                        </div>
                                      </div>
                                      <Button variant="ghost" size="icon" render={(props) => (
                                        <a {...props} href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                          <Download className="w-4 h-4 text-blue-600" />
                                        </a>
                                      )} />
                                    </div>
                                  ))}
                                  {record.documents.length === 0 && (
                                    <div className="col-span-full text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                      <FileText className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                                      <p className="text-sm text-slate-400">No documents uploaded for this record</p>
                                    </div>
                                  )}
                                </div>
                              </TabsContent>

                              <TabsContent value="ai" className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-blue-600" />
                                        AI Health Summary
                                      </h4>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        disabled={analyzing}
                                        onClick={() => handleAISummary(record)}
                                      >
                                        {analyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                        Generate Summary
                                      </Button>
                                    </div>
                                    {aiSummary ? (
                                      <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 relative">
                                        <div className="prose prose-sm max-w-none text-blue-900 leading-relaxed whitespace-pre-wrap">
                                          {aiSummary}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-sm text-slate-400">Click generate to get an AI-powered summary of this medical history.</p>
                                      </div>
                                    )}
                                  </div>

                                  <Separator />

                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <ShieldAlert className="w-5 h-5 text-red-600" />
                                        AI Risk Prediction
                                      </h4>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        disabled={analyzing}
                                        onClick={() => handleAIRisks(record)}
                                      >
                                        {analyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                        Predict Risks
                                      </Button>
                                    </div>
                                    {aiRisks ? (
                                      <div className="p-6 bg-red-50 rounded-2xl border border-red-100 relative">
                                        <div className="prose prose-sm max-w-none text-red-900 leading-relaxed whitespace-pre-wrap">
                                          {aiRisks}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-sm text-slate-400">Click predict to identify potential health risks based on this profile.</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900">No medical records yet</h3>
              <p className="text-slate-500 max-w-md mx-auto mt-2">
                Start by adding your first medical history record to track your health journey.
              </p>
              <Button className="mt-6 bg-blue-600" onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Record
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
