import { MONTHLY_GOAL_INR, formatInr } from '../utils/currency';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAdmin: boolean;
  monthlyProgressPercent: number;
}

export default function Sidebar({ activeTab, onTabChange, isAdmin, monthlyProgressPercent }: SidebarProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'deals', label: 'Deals', icon: 'view_kanban' },
    { id: 'contacts', label: 'Contacts', icon: 'contacts' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar_month' },
    ...(isAdmin ? [{ id: 'team', label: 'Team', icon: 'groups' }] : []),
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen shrink-0 relative transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center gap-3 text-white mb-8">
          <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center font-bold">SC</div>
          <h1 className="font-headline-md text-xl font-bold tracking-tight">SalesCore</h1>
        </div>

        <nav className="space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-secondary text-white' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6">
        <div className="bg-slate-800 rounded-xl p-4 mb-4">
          <p className="text-xs text-slate-400 mb-2">Monthly Target</p>
          <div className="flex justify-between items-end mb-2">
            <span className="text-lg font-bold text-white">{monthlyProgressPercent}%</span>
            <span className="text-xs text-slate-400">{formatInr(MONTHLY_GOAL_INR)}</span>
          </div>
          <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${monthlyProgressPercent}%` }}></div>
          </div>
        </div>
      </div>
    </aside>
  );
}
