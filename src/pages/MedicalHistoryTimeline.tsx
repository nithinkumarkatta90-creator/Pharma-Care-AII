import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Calendar, 
  History, 
  FileText, 
  Plus, 
  Edit, 
  Upload, 
  ChevronRight, 
  Activity,
  Clock
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { auth } from '../lib/firebase';
import { medicalHistoryService } from '../services/medicalHistoryService';
import { PatientMedicalHistory } from '../types/medical-history';
import { Skeleton } from '../components/ui/skeleton';

interface TimelineEvent {
  date: Date;
  type: 'created' | 'updated' | 'document';
  title: string;
  description: string;
  patientName: string;
  icon: any;
  color: string;
}

export default function MedicalHistoryTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const records = await medicalHistoryService.fetchMedicalHistory(auth.currentUser.uid);
      if (!records) return;

      const allEvents: TimelineEvent[] = [];

      records.forEach(record => {
        // Created Event
        allEvents.push({
          date: new Date(record.createdAt),
          type: 'created',
          title: 'Record Created',
          description: `Initial medical history record created for ${record.patientName}.`,
          patientName: record.patientName,
          icon: Plus,
          color: 'bg-emerald-500'
        });

        // Updated Event (if different from created)
        if (record.updatedAt !== record.createdAt) {
          allEvents.push({
            date: new Date(record.updatedAt),
            type: 'updated',
            title: 'Record Updated',
            description: `Medical history details updated for ${record.patientName}.`,
            patientName: record.patientName,
            icon: Edit,
            color: 'bg-blue-500'
          });
        }

        // Document Events
        record.documents.forEach(doc => {
          allEvents.push({
            date: new Date(doc.uploadedAt),
            type: 'document',
            title: 'Document Uploaded',
            description: `New ${doc.fileType}: "${doc.fileName}" added to records.`,
            patientName: record.patientName,
            icon: Upload,
            color: 'bg-purple-500'
          });
        });
      });

      // Sort by date descending
      allEvents.sort((a, b) => b.date.getTime() - a.date.getTime());
      setEvents(allEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
          <History className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Medical Timeline</h1>
          <p className="text-slate-500">A chronological view of your health records and updates.</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-8">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          {events.length > 0 ? (
            events.map((event, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Icon */}
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${event.color} z-10`}>
                  <event.icon className="w-5 h-5 text-white" />
                </div>
                {/* Content */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-slate-900">{event.title}</div>
                    <time className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {event.date.toLocaleDateString()}
                    </time>
                  </div>
                  <div className="text-xs text-blue-600 font-medium mb-2 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    {event.patientName}
                  </div>
                  <div className="text-sm text-slate-500 leading-relaxed">
                    {event.description}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900">No events found</h3>
              <p className="text-slate-500">Your medical history timeline will appear here once you add records.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
