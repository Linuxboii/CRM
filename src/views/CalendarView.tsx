import { Lead } from '../types';

interface CalendarViewProps {
  leads: Lead[];
}

export default function CalendarView({ leads }: CalendarViewProps) {
  const upcomingMeetings = leads.filter(l => l.meetStatus === 'Scheduled' && l.meetingDate).sort((a, b) => new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime());

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-headline-md text-headline-md text-slate-900 dark:text-white">Activities & Calendar</h2>
          <p className="font-body-md text-body-md text-slate-500">Manage your schedule and upcoming tasks.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">add</span> New Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 sc-shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white">Upcoming Meetings</h3>
              <div className="flex gap-2">
                <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
              </div>
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
                      <h4 className="font-bold text-slate-900 dark:text-white">{lead.name} - Discovery Call</h4>
                      <p className="text-xs text-slate-500 mb-2">{new Date(lead.meetingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Video Call</p>
                      <div className="flex gap-2">
                        {lead.meetingLink && (
                          <a href={lead.meetingLink} target="_blank" rel="noreferrer" className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                            Join Link
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 sc-shadow p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Task List</h3>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border border-slate-100 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <input type="checkbox" className="mt-0.5 rounded border-slate-300 text-secondary focus:ring-secondary" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Send proposal to TechCorp</p>
                  <p className="text-xs text-rose-500 font-medium">Due Today</p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 border border-slate-100 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <input type="checkbox" className="mt-0.5 rounded border-slate-300 text-secondary focus:ring-secondary" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Follow up with Sarah</p>
                  <p className="text-xs text-slate-500">Tomorrow</p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 border border-slate-100 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors opacity-60">
                <input type="checkbox" defaultChecked className="mt-0.5 rounded border-slate-300 text-secondary focus:ring-secondary" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white line-through">Prepare Q3 presentation</p>
                  <p className="text-xs text-slate-500">Completed</p>
                </div>
              </label>
            </div>
            <button className="w-full mt-4 py-2 text-sm font-medium text-secondary hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors">
              View All Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
