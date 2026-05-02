import { Lead } from '../types';
import { SystemUser } from '../api';
import { MONTHLY_GOAL_INR, formatInr, parseCurrencyValue } from '../utils/currency';

interface DashboardViewProps {
  leads: Lead[];
  isAdmin: boolean;
  topProducer: { name: string; count: number } | null;
  onExport: () => void;
  onNewDeal: () => void;
  onRefresh: () => void;
  users: SystemUser[];
  currentUser: SystemUser | null;
}

export default function DashboardView({ leads, isAdmin, topProducer, onExport, onNewDeal, onRefresh, users, currentUser }: DashboardViewProps) {
  const getVisibleValue = (value: number) => isAdmin ? value : value * 0.2;
  const qualifiedPipelineLeads = leads.filter(lead => lead.status !== 'Lead');
  const valuationLeads = leads.filter(lead => lead.status === 'Closed Won' || lead.status === 'Qualified');
  const pipelineTotal = valuationLeads.reduce((acc, lead) => acc + parseCurrencyValue(lead.pricing), 0);
  const visiblePipelineTotal = getVisibleValue(pipelineTotal);
  const calculatePipelineValue = () => formatInr(visiblePipelineTotal);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const currentMonthLeads = qualifiedPipelineLeads.filter(lead => {
    const createdAt = new Date(lead.createdAtIso || lead.createdAt);
    return createdAt >= monthStart && createdAt < nextMonthStart;
  });
  const currentMonthValue = getVisibleValue(currentMonthLeads.reduce((acc, lead) => acc + parseCurrencyValue(lead.pricing), 0));
  const projectedMonthValue = currentDay > 0 ? Math.round((currentMonthValue / currentDay) * daysInMonth) : currentMonthValue;
  const goalProgress = Math.min(100, Math.round((currentMonthValue / MONTHLY_GOAL_INR) * 100));
  const projectionProgress = Math.min(100, Math.round((projectedMonthValue / MONTHLY_GOAL_INR) * 100));
  const chartMax = Math.max(MONTHLY_GOAL_INR, projectedMonthValue, currentMonthValue, 1);
  const actualPointList = Array.from({ length: currentDay }, (_, dayIndex) => {
    const day = dayIndex + 1;
    const totalForDay = currentMonthLeads.reduce((acc, lead) => {
      const createdAt = new Date(lead.createdAtIso || lead.createdAt);
      return createdAt.getDate() <= day ? acc + getVisibleValue(parseCurrencyValue(lead.pricing)) : acc;
    }, 0);
    const x = daysInMonth === 1 ? 0 : ((day - 1) / (daysInMonth - 1)) * 100;
    const y = 92 - (totalForDay / chartMax) * 76;
    return { x, y: Math.max(12, y) };
  });
  const actualPoints = actualPointList.map(point => `${point.x},${point.y}`).join(' ');
  const latestActualPoint = actualPointList[actualPointList.length - 1] || { x: 0, y: 92 };
  const projectedY = 92 - (projectedMonthValue / chartMax) * 76;
  const goalY = 92 - (MONTHLY_GOAL_INR / chartMax) * 76;

  const openDeals = qualifiedPipelineLeads.filter(l => l.status !== 'Closed Won' && l.status !== 'Closed Lost').length;
  const closedDeals = leads.filter(l => l.status === 'Closed Won' || l.status === 'Closed Lost').length;
  const conversionRate = qualifiedPipelineLeads.length > 0 ? Math.round((closedDeals / qualifiedPipelineLeads.length) * 100) : 0;

  // For pipeline bar chart width calculations
  const stageCount = (status: string) => leads.filter(l => l.status === status).length;
  const totalLeads = leads.length || 1;
  const getWidth = (status: string) => `${Math.max(5, (stageCount(status) / totalLeads) * 100)}%`;
  // Build leaderboard: get unique sales rep names, exclude admins
  const adminNames = new Set(
    users.filter(u => u.role === 'admin').map(u => u.full_name)
  );
  // Also exclude current user if admin (safety net for non-admin view where users list is empty)
  if (currentUser?.role === 'admin') {
    adminNames.add(currentUser.full_name);
  }
  const leaderboardNames = Array.from(
    new Set(
      leads
        .map(l => l.sourceUserName)
        .filter(name => name && name !== 'Unassigned' && !adminNames.has(name))
    )
  );

  const statusColors: { [key: string]: string } = {
    'Lead': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    'Contacted': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'Qualified': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    'Closed Won': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'Closed Lost': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  };

  if (!isAdmin) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="font-headline-md text-headline-md text-slate-900 dark:text-white">Sales Dashboard</h2>
            <p className="font-body-md text-body-md text-slate-500">Your clients, monthly goal, and pipeline cut.</p>
          </div>
          <button onClick={onRefresh} className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">refresh</span> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 sc-shadow">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg w-fit mb-4">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-label-md text-label-md uppercase mb-1">Pipeline Valuation</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{calculatePipelineValue()}</h3>
            <p className="text-xs text-slate-500 mt-2">Shows your 20% revenue cut.</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 sc-shadow">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg w-fit mb-4">
              <span className="material-symbols-outlined">track_changes</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-label-md text-label-md uppercase mb-1">Monthly Goal</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatInr(MONTHLY_GOAL_INR)}</h3>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Current progress</span>
                <span>{goalProgress}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-secondary transition-all duration-500" style={{ width: `${goalProgress}%` }}></div>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Top Performer</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{topProducer?.name || 'None'}</p>
                    <p className="text-xs text-slate-500">{topProducer?.count || 0} active client{topProducer?.count === 1 ? '' : 's'}</p>
                  </div>
                </div>
                <button onClick={onRefresh} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Refresh">
                  <span className="material-symbols-outlined text-sm">refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Leaderboard */}
        {leaderboardNames.length > 0 && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 sc-shadow">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <span className="material-symbols-outlined">emoji_events</span>
              </div>
              <div>
                <h4 className="font-headline-sm text-headline-sm text-slate-900 dark:text-white">Sales Leaderboard</h4>
                <p className="text-xs text-slate-500">Active sales reps in the competition</p>
              </div>
            </div>
            <div className="space-y-2">
              {leaderboardNames.map((name, index) => (
                <div key={name} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 transition-all hover:border-indigo-200 dark:hover:border-indigo-800">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    index === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                    index === 1 ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' :
                    index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' :
                    'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 sc-shadow">
          <h4 className="font-headline-sm text-headline-sm text-slate-900 dark:text-white mb-6">Clients List</h4>

          {leads.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No clients assigned yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase px-2 py-3">Client</th>
                    <th className="text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase px-2 py-3">Location</th>
                    <th className="text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase px-2 py-3">Your Cut</th>
                    <th className="text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase px-2 py-3">Status</th>
                    <th className="text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase px-2 py-3">Meeting</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-2 py-3">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{lead.name}</div>
                        <div className="text-xs text-slate-500">{lead.email}</div>
                      </td>
                      <td className="px-2 py-3 text-sm text-slate-600 dark:text-slate-400">{lead.location || 'N/A'}</td>
                      <td className="px-2 py-3 text-sm font-medium text-slate-900 dark:text-white">{formatInr(parseCurrencyValue(lead.pricing) * 0.2)}</td>
                      <td className="px-2 py-3 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[lead.status] || 'bg-slate-100 text-slate-800'}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-sm">
                        {lead.meetingLink ? (
                          <a href={lead.meetingLink} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:underline inline-block w-fit">
                            Join Meeting
                          </a>
                        ) : (
                          <span className="text-xs text-slate-500">Not Scheduled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-headline-md text-headline-md text-slate-900 dark:text-white">Sales Dashboard</h2>
          <p className="font-body-md text-body-md text-slate-500">Welcome back. Here's what's happening with your pipeline today.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onRefresh} className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">refresh</span> Refresh
          </button>
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
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 sc-shadow">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
            <div>
              <h4 className="font-headline-sm text-headline-sm text-slate-900 dark:text-white">Monthly Projection</h4>
              <p className="text-xs text-slate-500 mt-1">Tracks backend deals created this month, excluding leads. Resets on the 1st.</p>
            </div>
            <div className="flex gap-4 text-right">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Current</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{formatInr(currentMonthValue)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Projected</p>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{formatInr(projectedMonthValue)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Goal</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{formatInr(MONTHLY_GOAL_INR)}</p>
              </div>
            </div>
          </div>
          <div className="relative h-64 w-full bg-slate-50 dark:bg-slate-900/50 rounded-lg overflow-hidden">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <line x1="0" y1={goalY} x2="100" y2={goalY} stroke="#94a3b8" strokeDasharray="4" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              {actualPoints && (
                <polyline points={actualPoints} fill="none" stroke="#4648d4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              )}
              <line x1={latestActualPoint.x} y1={latestActualPoint.y} x2="100" y2={Math.max(12, projectedY)} stroke="#10b981" strokeDasharray="3" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="absolute top-3 left-4 right-4 flex justify-between text-[10px] text-slate-400 font-bold uppercase">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-secondary"></span> Actual
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Projection
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span> Goal
              </span>
            </div>
            <div className="absolute bottom-2 left-0 w-full flex justify-between px-6 text-[10px] text-slate-400 font-medium">
              <span>1</span><span>{currentDay}</span><span>{daysInMonth}</span>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Current progress</span>
                <span>{goalProgress}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-secondary transition-all duration-500" style={{ width: `${goalProgress}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Projected progress</span>
                <span>{projectionProgress}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${projectionProgress}%` }}></div>
              </div>
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

      {/* Sales Leaderboard */}
      {leaderboardNames.length > 0 && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 sc-shadow mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <span className="material-symbols-outlined">emoji_events</span>
            </div>
            <div>
              <h4 className="font-headline-sm text-headline-sm text-slate-900 dark:text-white">Sales Leaderboard</h4>
              <p className="text-xs text-slate-500">Active sales reps in the competition</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {leaderboardNames.map((name, index) => (
              <div key={name} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 transition-all hover:border-indigo-200 dark:hover:border-indigo-800">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  index === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                  index === 1 ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' :
                  index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' :
                  'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                }`}>
                  {index + 1}
                </div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
