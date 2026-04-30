import { useState, useRef, useEffect } from 'react';

interface TopbarProps {
  userName: string;
  userRole?: string;
  onLogout: () => void;
}

export default function Topbar({ userName, userRole, onLogout }: TopbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const displayRole = userRole === 'admin' ? 'Admin' : 'Sales Rep';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-[73px] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
      <div className="flex-1"></div>
      
      <div className="flex items-center gap-6">
        {/* Profile with click-based dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{userName}</p>
              <p className="text-xs text-slate-500 leading-none">{displayRole}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold border-2 border-white dark:border-slate-900 shadow-sm">
              {userName.charAt(0)}
            </div>
            <span className={`material-symbols-outlined text-slate-400 text-[18px] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}>expand_more</span>
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              {/* User info header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{userName}</p>
                <p className="text-xs text-slate-500">{displayRole}</p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700 py-1">
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors font-medium"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
