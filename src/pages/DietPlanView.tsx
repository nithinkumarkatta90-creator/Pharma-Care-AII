import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Download, 
  Share2, 
  History, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle,
  Droplets,
  Activity,
  Utensils,
  Calendar,
  Info,
  Bell
} from 'lucide-react';
import { useAuth } from '../App';
import { dietService } from '../services/dietService';
import { DetailedDietPlan } from '../types/diet';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { motion } from 'motion/react';

export default function DietPlanView() {
  const { planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<DetailedDietPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (planId) {
      loadPlan();
    }
  }, [planId]);

  const loadPlan = async () => {
    try {
      const history = await dietService.getDietHistory(user!.uid);
      const found = history.find(p => p.id === planId);
      if (found) {
        setPlan(found);
      } else {
        toast.error("Plan not found");
        navigate('/diet-plans');
      }
    } catch (error) {
      console.error("Error loading plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    if (!plan) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("PharmaCare AI - Diet Plan", 15, 25);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date(plan.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}`, 15, 33);

    // Patient Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("Medical Profile", 15, 50);
    doc.setFontSize(10);
    doc.text(`Conditions: ${plan.diseases.join(', ')}`, 15, 58);
    doc.text(`BMI: ${plan.bmi}`, 15, 64);
    doc.text(`Calories Estimate: ${plan.caloriesEstimate}`, 15, 70);

    // Foods to Eat
    doc.setFontSize(14);
    doc.text("Foods to Eat", 15, 85);
    doc.setFontSize(10);
    let y = 93;
    plan.foodsToEat.slice(0, 8).forEach(food => {
      doc.text(`• ${food}`, 20, y);
      y += 6;
    });

    // Foods to Avoid
    doc.setFontSize(14);
    doc.text("Foods to Avoid", 110, 85);
    doc.setFontSize(10);
    y = 93;
    plan.foodsToAvoid.slice(0, 8).forEach(food => {
      doc.text(`• ${food}`, 115, y);
      y += 6;
    });

    // Weekly Plan Table
    doc.setFontSize(14);
    doc.text("Weekly Meal Schedule", 15, 150);
    (doc as any).autoTable({
      startY: 158,
      head: [['Day', 'Breakfast', 'Lunch', 'Dinner']],
      body: plan.weeklyPlan.map(d => [d.day, d.breakfast, d.lunch, d.dinner]),
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(12);
    doc.text("Lifestyle & Advice", 15, finalY);
    doc.setFontSize(9);
    const splitAdvice = doc.splitTextToSize(plan.lifestyleAdvice, pageWidth - 30);
    doc.text(splitAdvice, 15, finalY + 8);

    doc.save(`PharmaCare_Diet_Plan_${planId}.pdf`);
    toast.success("PDF exported successfully!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-10 pb-24"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-start gap-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/diet-plans')}
            className="rounded-2xl h-12 w-12 bg-white border border-slate-100 shadow-sm hover:bg-slate-50 mt-1"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div>
            <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1 mb-3">
              Diet Plan Details
            </Badge>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Personalized Plan</h1>
            <div className="flex flex-wrap gap-2 mt-3">
              {plan.diseases.map(d => (
                <Badge key={d} variant="secondary" className="bg-slate-100 text-slate-700 border-none px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider">
                  {d}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportToPDF} className="gap-2 rounded-2xl h-12 px-6 font-bold border-slate-200 hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => navigate('/diet-history')} className="gap-2 rounded-2xl h-12 px-6 font-bold border-slate-200 hover:bg-slate-50 transition-all">
            <History className="w-4 h-4" />
            History
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Summary & Daily Plan */}
        <div className="lg:col-span-2 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'BMI Result', value: plan.bmi, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Daily Calories', value: plan.caloriesEstimate, icon: Utensils, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Water Intake', value: plan.waterIntake, icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-50' }
            ].map((stat, i) => (
              <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                <CardContent className="p-8 text-center space-y-3">
                  <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mx-auto`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="w-full grid grid-cols-2 bg-slate-100/50 p-2 rounded-[1.5rem] gap-2">
              <TabsTrigger value="daily" className="rounded-xl py-3 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Daily Meal Plan</TabsTrigger>
              <TabsTrigger value="weekly" className="rounded-xl py-3 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Weekly Schedule</TabsTrigger>
            </TabsList>
            
            <TabsContent value="daily" className="mt-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-none shadow-sm overflow-hidden rounded-[2rem] bg-white">
                  <div className="bg-emerald-500 h-2 w-full" />
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      Foods to Eat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-4">
                    <ul className="space-y-4">
                      {plan.foodsToEat.map((food, i) => (
                        <li key={i} className="flex items-start gap-4 text-sm font-medium text-slate-600">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                          {food}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm overflow-hidden rounded-[2rem] bg-white">
                  <div className="bg-rose-500 h-2 w-full" />
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-rose-600" />
                      </div>
                      Foods to Avoid
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-4">
                    <ul className="space-y-4">
                      {plan.foodsToAvoid.map((food, i) => (
                        <li key={i} className="flex items-start gap-4 text-sm font-medium text-slate-600">
                          <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                          {food}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-2xl font-black tracking-tight">Standard Daily Routine</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Breakfast', value: plan.meals.breakfast, color: 'bg-orange-50', iconColor: 'text-orange-600' },
                    { label: 'Lunch', value: plan.meals.lunch, color: 'bg-emerald-50', iconColor: 'text-emerald-600' },
                    { label: 'Snack', value: plan.meals.snack, color: 'bg-amber-50', iconColor: 'text-amber-600' },
                    { label: 'Dinner', value: plan.meals.dinner, color: 'bg-indigo-50', iconColor: 'text-indigo-600' }
                  ].map((meal, i) => (
                    <div key={i} className={`p-6 rounded-3xl ${meal.color} border border-white/50 shadow-sm`}>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{meal.label}</p>
                      <p className="text-slate-900 font-bold leading-relaxed">{meal.value}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="weekly" className="mt-8">
              <Card className="border-none shadow-sm overflow-hidden rounded-[2.5rem] bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                      <tr>
                        <th className="px-8 py-6">Day</th>
                        <th className="px-8 py-6">Breakfast</th>
                        <th className="px-8 py-6">Lunch</th>
                        <th className="px-8 py-6">Dinner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {plan.weeklyPlan.map((day, i) => (
                        <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-8 py-6 font-black text-slate-900">{day.day}</td>
                          <td className="px-8 py-6 text-slate-600 font-medium">{day.breakfast}</td>
                          <td className="px-8 py-6 text-slate-600 font-medium">{day.lunch}</td>
                          <td className="px-8 py-6 text-slate-600 font-medium">{day.dinner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Advice & Reminders */}
        <div className="space-y-10">
          <Card className="border-none shadow-2xl shadow-slate-200 rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Info className="w-32 h-32 rotate-12" />
            </div>
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Info className="w-5 h-5 text-blue-400" />
                </div>
                Lifestyle Advice
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-8 relative z-10">
              <p className="text-slate-300 font-medium leading-relaxed">
                {plan.lifestyleAdvice}
              </p>
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Exercise Recommendation</p>
                <p className="text-sm font-bold leading-relaxed">{plan.exercise}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2rem] bg-amber-50/50 border border-amber-100/50 overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-3 text-amber-900">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                Medical Warnings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <p className="text-sm text-amber-800 font-bold leading-relaxed">
                {plan.warnings}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                Set Diet Reminders
              </CardTitle>
              <CardDescription className="font-medium">Stay consistent with your meal timings.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-3">
              {[
                { title: 'Breakfast', type: 'Diet', color: 'bg-orange-50', iconColor: 'text-orange-600' },
                { title: 'Lunch', type: 'Diet', color: 'bg-emerald-50', iconColor: 'text-emerald-600' },
                { title: 'Dinner', type: 'Diet', color: 'bg-indigo-50', iconColor: 'text-indigo-600' },
                { title: 'Water', type: 'Water', color: 'bg-cyan-50', iconColor: 'text-cyan-600' }
              ].map((rem, i) => (
                <Button 
                  key={i}
                  variant="outline" 
                  className="w-full h-16 justify-start gap-4 rounded-2xl border-slate-100 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-200 transition-all group" 
                  onClick={() => navigate('/add-reminder', { state: { title: rem.title, type: rem.type } })}
                >
                  <div className={`w-10 h-10 rounded-xl ${rem.color} ${rem.iconColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {rem.title === 'Water' ? <Droplets className="w-5 h-5" /> : <Utensils className="w-5 h-5" />}
                  </div>
                  <span className="font-bold text-slate-700">{rem.title} Reminder</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
