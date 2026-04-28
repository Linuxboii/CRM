import { Lead } from '../types';

interface DashboardViewProps {
  leads: Lead[];
  isAdmin: boolean;
  onExport: () => void;
  onNewDeal: () => void;
}

export default function DashboardView({ leads, isAdmin, onExport, onNewDeal }: DashboardViewProps) {
  const calculatePipelineValue = () => {
    const total = leads.reduce((acc, lead) => {
      const val = parseInt(lead.pricing.replace(/\D/g, ''));
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
    const finalTotal = isAdmin ? total : total * 0.2;
    if (finalTotal >= 1000000) return `$${(finalTotal / 1000000).toFixed(1)}M`;
    if (finalTotal >= 1000) return `$${(finalTotal / 1000).toFixed(1)}k`;
    return `$${finalTotal}`;
  };

  const openDeals = leads.filter(l => l.status !== 'Closed Won' && l.status !== 'Closed Lost').length;
  const closedDeals = leads.filter(l => l.status === 'Closed Won' || l.status === 'Closed Lost').length;
  const conversionRate = leads.length > 0 ? Math.round((closedDeals / leads.length) * 100) : 0;

  // For pipeline bar chart width calculations
  const stageCount = (status: string) => leads.filter(l => l.status === status).length;
  const totalLeads = leads.length || 1;
  const getWidth = (status: string) => `${Math.max(5, (stageCount(status) / totalLeads) * 100)}%`;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-headline-md text-headline-md text-slate-900 dark:text-white">Sales Dashboard</h2>
          <p className="font-body-md text-body-md text-slate-500">Welcome back. Here's what's happening with your pipeline today.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onExport} className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span> Export Report
          </button>
          <button onClick={onNewDeal} className="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">add</span> New Deal
          </button>
        </div>
      </div>

      {/* KPI Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 sc-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <span className="material-symbols-outlined">payments</span>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-label-md text-label-md uppercase mb-1">Pipeline Value</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{calculatePipelineValue()}</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 sc-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <span className="material-symbols-outlined">handshake</span>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-label-md text-label-md uppercase mb-1">Open Deals</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{openDeals}</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 sc-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-label-md text-label-md uppercase mb-1">Conversion Rate</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{conversionRate}%</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 sc-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <span className="material-symbols-outlined">track_changes</span>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-label-md text-label-md uppercase mb-1">Total Leads</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{leads.length}</h3>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Trend (Line Chart Mock) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 sc-shadow">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-headline-sm text-headline-sm text-slate-900 dark:text-white">Revenue Forecast</h4>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-secondary"></span> Actual
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-600"></span> Goal
              </span>
            </div>
          </div>
          <div className="relative h-64 w-full bg-slate-50 dark:bg-slate-900/50 rounded-lg flex items-end px-4 py-2 overflow-hidden">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0 80 Q 25 70, 40 50 T 70 30 T 100 10" fill="none" stroke="#4648d4" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
              <path d="M0 90 Q 20 85, 40 75 T 60 65 T 80 50 T 100 40" fill="none" stroke="#64748b" strokeDasharray="4" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
            </svg>
            <div className="absolute bottom-2 left-0 w-full flex justify-between px-6 text-[10px] text-slate-400 font-medium">
              <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span>
            </div>
          </div>
        </div>

        {/* Pipeline by Stage */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 sc-shadow">
          <h4 className="font-headline-sm text-headline-sm text-slate-900 dark:text-white mb-6">Pipeline by Stage</h4>
          <div className="space-y-5">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Lead</span>
                <span className="font-bold dark:text-white">{stageCount('Lead')}</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400" style={{ width: getWidth('Lead') }}></div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Contacted</span>
                <span className="font-bold dark:text-white">{stageCount('Contacted')}</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400" style={{ width: getWidth('Contacted') }}></div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Qualified</span>
                <span className="font-bold dark:text-white">{stageCount('Qualified')}</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-400" style={{ width: getWidth('Qualified') }}></div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Closed Won</span>
                <span className="font-bold dark:text-white">{stageCount('Closed Won')}</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-400" style={{ width: getWidth('Closed Won') }}></div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Total Pipeline Value</span>
              <span className="text-slate-900 dark:text-white font-bold">{calculatePipelineValue()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Deals Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 sc-shadow">
        <h4 className="font-headline-sm text-headline-sm text-slate-900 dark:text-white mb-6">Recent Deals</h4>
        
        {leads.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No deals yet. Create your first deal to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase px-2 py-3">Deal Name</th>
                  <th className="text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase px-2 py-3">Contact</th>
                  <th className="text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase px-2 py-3">Location</th>
                  <th className="text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase px-2 py-3">Value</th>
                  <th className="text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase px-2 py-3">Status</th>
                  <th className="text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase px-2 py-3">Assigned To</th>
                  <th className="text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase px-2 py-3">Meeting</th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 10).map((lead) => {
                  const statusColors: { [key: string]: string } = {
                    'Lead': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
                    'Contacted': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                    'Qualified': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
                    'Closed Won': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                    'Closed Lost': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  };
                  
                  return (
                    <tr key={lead.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-2 py-3 text-sm font-medium text-slate-900 dark:text-white">{lead.name}</td>
                      <td className="px-2 py-3 text-sm text-slate-600 dark:text-slate-400">{lead.email}</td>
                      <td className="px-2 py-3 text-sm text-slate-600 dark:text-slate-400">{lead.location || 'N/A'}</td>
                      <td className="px-2 py-3 text-sm font-medium text-slate-900 dark:text-white">{lead.pricing}</td>
                      <td className="px-2 py-3 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[lead.status] || 'bg-slate-100 text-slate-800'}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-sm text-slate-600 dark:text-slate-400">{lead.sourceUserName || 'Unassigned'}</td>
                      <td className="px-2 py-3 text-sm">
                        {lead.meetingLink ? (
                          <div className="flex flex-col gap-1">
                            <a href={lead.meetingLink} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:underline inline-block w-fit">
                              Join Meeting
                            </a>
                            {lead.meetingDate && (
                              <span className={`text-xs font-medium px-2 py-1 rounded inline-block w-fit ${
                                new Date(lead.meetingDate) > new Date()
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                  : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                              }`}>
                                {lead.meetingDate}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">Not Scheduled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
