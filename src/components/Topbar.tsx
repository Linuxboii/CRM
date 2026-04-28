import React, { useState, useRef, useEffect } from 'react';

interface TopbarProps {
  userName: string;
  onLogout: () => void;
}

export default function Topbar({ userName, onLogout }: TopbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        {/* Global Search */}
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
          <input 
            type="text" 
            placeholder="Search deals, contacts..." 
            className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-secondary outline-none dark:text-white transition-all focus:w-72"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-900"></span>
          </button>
        </div>

        <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>

        {/* Profile with click-based dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{userName}</p>
              <p className="text-xs text-slate-500 leading-none">Sales Rep</p>
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
                <p className="text-xs text-slate-500">Sales Representative</p>
              </div>

              <div className="py-1">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">person</span>
                  My Profile
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">settings</span>
                  Settings
                </button>
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
