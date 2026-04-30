import { Lead } from '../types';

interface CalendarViewProps {
  leads: Lead[];
  onRefresh: () => void;
}

export default function CalendarView({ leads, onRefresh }: CalendarViewProps) {
  const upcomingMeetings = leads
    .filter(lead => lead.meetStatus === 'Scheduled' && lead.meetingDate)
    .sort((a, b) => new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime());

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-headline-md text-headline-md text-slate-900 dark:text-white">Activities & Calendar</h2>
          <p className="font-body-md text-body-md text-slate-500">Meetings scheduled from backend lead data.</p>
        </div>
        <button onClick={onRefresh} className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">refresh</span> Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 sc-shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-900 dark:text-white">Upcoming Meetings</h3>
          <span className="text-xs font-medium text-slate-500">{upcomingMeetings.length} scheduled</span>
        </div>

        <div className="space-y-4">
          {upcomingMeetings.length === 0 ? (
            <p className="text-sm text-slate-500">No upcoming meetings scheduled.</p>
          ) : (
            upcomingMeetings.map(lead => (
              <div key={lead.id} className="flex gap-4 p-4 border border-slate-100 dark:border-slate-700 rounded-lg hover:border-secondary transition-colors">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold uppercase">{new Date(lead.meetingDate).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-lg font-bold leading-none">{new Date(lead.meetingDate).getDate()}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-white">{lead.name}</h4>
                  <p className="text-xs text-slate-500 mb-2">{new Date(lead.meetingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | Video Call</p>
                  {lead.meetingLink && (
                    <a href={lead.meetingLink} target="_blank" rel="noreferrer" className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                      Join Link
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
