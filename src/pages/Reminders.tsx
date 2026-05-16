import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { 
  Plus, 
  Bell, 
  Clock, 
  Pill, 
  CheckCircle2, 
  XCircle, 
  MoreVertical, 
  Trash2, 
  Edit, 
  History,
  TrendingUp,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button, buttonVariants } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';
import { useAuth } from '../App';
import { reminderService } from '../services/reminderService';
import { Reminder } from '../types/reminder';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import { motion, AnimatePresence } from 'motion/react';

export default function Reminders() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [adherence, setAdherence] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsub = reminderService.subscribeToReminders(user.uid, (data) => {
      setReminders(data);
      setLoading(false);
    });

    reminderService.calculateAdherencePercentage(user.uid).then(setAdherence);

    return () => unsub();
  }, [user]);

  const activeRemindersCount = useMemo(() => reminders.filter(r => r.isActive).length, [reminders]);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;
    try {
      await reminderService.deleteReminder(id);
      toast.success('Reminder deleted successfully');
    } catch (error) {
      toast.error('Failed to delete reminder');
    }
  }, []);

  const toggleActive = useCallback(async (reminder: Reminder) => {
    try {
      await reminderService.updateReminder(reminder.id!, { isActive: !reminder.isActive });
      toast.success(`Reminder ${!reminder.isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to update reminder');
    }
  }, []);

  const markAsTaken = useCallback(async (reminder: Reminder, time: string) => {
    try {
      await reminderService.logAdherence({
        uid: user!.uid,
        reminderId: reminder.id!,
        medicineName: reminder.medicineName,
        scheduledTime: time,
        takenTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Taken',
        date: new Date().toISOString().split('T')[0]
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      toast.success(`Marked ${reminder.medicineName} as taken`);
      reminderService.calculateAdherencePercentage(user!.uid).then(setAdherence);
    } catch (error) {
      toast.error('Failed to log adherence');
    }
  }, [user]);

  const markAsMissed = useCallback(async (reminder: Reminder, time: string) => {
    try {
      await reminderService.logAdherence({
        uid: user!.uid,
        reminderId: reminder.id!,
        medicineName: reminder.medicineName,
        scheduledTime: time,
        status: 'Missed',
        date: new Date().toISOString().split('T')[0]
      });
      toast.error(`Marked ${reminder.medicineName} as missed`);
      reminderService.calculateAdherencePercentage(user!.uid).then(setAdherence);
    } catch (error) {
      toast.error('Failed to log adherence');
    }
  }, [user]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto relative">
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white/80 backdrop-blur-md p-12 rounded-[3rem] shadow-2xl border border-blue-100 flex flex-col items-center gap-6">
              <motion.div
                initial={{ rotate: -45, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200"
              >
                <CheckCircle2 className="w-12 h-12 text-white" />
              </motion.div>
              <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900">Great Job!</h2>
                <p className="text-slate-500 font-bold">Medicine logged successfully.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Medicine Reminders</h1>
            <p className="text-slate-500 text-sm">Track your medication and stay on top of your health.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/reminder-logs"
            className={buttonVariants({ variant: "outline", className: "border-blue-200 text-blue-600 hover:bg-blue-50" })}
          >
            <History className="w-4 h-4 mr-2" />
            View Logs
          </Link>
          <Link 
            to="/add-reminder"
            className={buttonVariants({ className: "bg-blue-600 hover:bg-blue-700 text-white" })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Reminder
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <TrendingUp className="w-32 h-32" />
            </div>
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold mb-1">Weekly Adherence</h3>
                  <p className="text-blue-100 text-sm">Your medicine consistency score</p>
                </div>
                <div className="text-4xl font-black">{adherence}%</div>
              </div>
              <Progress value={adherence} className="h-3 bg-white/20" />
              <div className="mt-6 flex items-center gap-2 text-sm text-blue-100">
                <AlertCircle className="w-4 h-4" />
                <span>{adherence >= 80 ? 'Excellent work! Keep it up.' : 'Try to be more consistent for better results.'}</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Active Reminders
              <Badge variant="secondary" className="bg-blue-100 text-blue-600">{activeRemindersCount}</Badge>
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="border-slate-100">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : reminders.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {reminders.map((reminder) => (
                    <motion.div
                      key={reminder.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card className={`group border-slate-100 hover:border-blue-200 transition-all ${!reminder.isActive ? 'opacity-60 grayscale' : 'hover:shadow-md'}`}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                              <div className={`p-4 rounded-2xl shadow-sm ${reminder.isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                <Pill className="w-6 h-6" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-lg text-slate-900">{reminder.medicineName}</h3>
                                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{reminder.medicineType}</Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {reminder.times.join(', ')}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    {reminder.dosage} • {reminder.beforeAfterFood} Food
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex gap-2 mr-2">
                                {reminder.isActive && reminder.times.map((time, idx) => (
                                  <div key={idx} className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-slate-400 text-center">{time}</span>
                                    <div className="flex gap-1">
                                      <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="h-8 w-8 rounded-full text-emerald-600 hover:bg-emerald-50"
                                        onClick={() => markAsTaken(reminder, time)}
                                        title="Mark as Taken"
                                      >
                                        <CheckCircle2 className="w-4 h-4" />
                                      </Button>
                                      <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="h-8 w-8 rounded-full text-rose-600 hover:bg-rose-50"
                                        onClick={() => markAsMissed(reminder, time)}
                                        title="Mark as Missed"
                                      >
                                        <XCircle className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger render={(props) => (
                                  <Button {...props} variant="ghost" size="icon" className="h-10 w-10">
                                    <MoreVertical className="w-5 h-5 text-slate-400" />
                                  </Button>
                                )} />
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => toggleActive(reminder)}>
                                    <Bell className="w-4 h-4 mr-2" />
                                    {reminder.isActive ? 'Deactivate' : 'Activate'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem render={(props) => (
                                    <Link {...props} to={`/edit-reminder/${reminder.id}`}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit Details
                                    </Link>
                                  )} />
                                  <DropdownMenuItem 
                                    className="text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                                    onClick={() => handleDelete(reminder.id!)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Reminder
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Pill className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No reminders yet</h3>
                    <p className="text-slate-500 mb-6 max-w-xs mx-auto">Add your first medicine reminder to start tracking your adherence.</p>
                    <Link 
                      to="/add-reminder"
                      className={buttonVariants({ className: "bg-blue-600 hover:bg-blue-700 text-white" })}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add My First Reminder
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Health Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  Consistency is key. Taking your medicine at the same time every day helps maintain stable levels in your bloodstream.
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  Always check if your medicine should be taken before or after meals as food can affect absorption.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold">Adherence Insights</h3>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Based on your last 7 days, your adherence is {adherence >= 80 ? 'excellent' : 'improving'}. 
                {adherence < 80 && ' Try setting alarms to help you remember.'}
              </p>
              <div className="flex items-center justify-between text-xs font-mono text-blue-400">
                <span>7 DAY TREND</span>
                <span>{adherence}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
