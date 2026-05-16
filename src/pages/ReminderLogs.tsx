import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { useAuth } from '../App';
import { reminderService } from '../services/reminderService';
import { ReminderLog } from '../types/reminder';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';

export default function ReminderLogs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<ReminderLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user, filterDate]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await reminderService.fetchLogs(user!.uid, filterDate);
      setLogs(data);
    } catch (error) {
      toast.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevDay = () => {
    const d = new Date(filterDate);
    d.setDate(d.getDate() - 1);
    setFilterDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(filterDate);
    d.setDate(d.getDate() + 1);
    setFilterDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/reminders')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Adherence Logs</h1>
          <p className="text-slate-500">Review your medication history and consistency.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrevDay}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-700">{new Date(filterDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleNextDay} disabled={filterDate === new Date().toISOString().split('T')[0]}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Input 
            type="date" 
            value={filterDate} 
            onChange={e => setFilterDate(e.target.value)}
            className="w-40"
          />
          <Button variant="ghost" size="icon" className="text-slate-400">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))
        ) : logs.length > 0 ? (
          logs.map((log) => (
            <Card key={log.id} className="border-slate-100 hover:shadow-md transition-shadow overflow-hidden">
              <div className={`w-1.5 h-full absolute left-0 top-0 ${log.status === 'Taken' ? 'bg-emerald-500' : log.status === 'Missed' ? 'bg-rose-500' : 'bg-amber-500'}`} />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${log.status === 'Taken' ? 'bg-emerald-50 text-emerald-600' : log.status === 'Missed' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                      {log.status === 'Taken' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{log.medicineName}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Scheduled: {log.scheduledTime}
                        </span>
                        {log.takenTime && (
                          <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            Taken at: {log.takenTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={
                      log.status === 'Taken' ? 'bg-emerald-100 text-emerald-700' : 
                      log.status === 'Missed' ? 'bg-rose-100 text-rose-700' : 
                      'bg-amber-100 text-amber-700'
                    }
                  >
                    {log.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Calendar className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No logs for this date</h3>
            <p className="text-slate-500">There are no medication logs recorded for {new Date(filterDate).toLocaleDateString()}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
