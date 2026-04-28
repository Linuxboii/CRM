import React from 'react';
import { Lead, LeadStatus } from '../types';

interface DealsViewProps {
  leads: Lead[];
  onUpdateStatus: (id: string, newStatus: LeadStatus) => void;
}

const STAGES: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'Qualified', label: 'Qualified', color: 'border-blue-500' },
  { id: 'Proposal', label: 'Proposal', color: 'border-amber-500' },
  { id: 'Negotiation', label: 'Negotiation', color: 'border-purple-500' },
  { id: 'Closed', label: 'Closed Won', color: 'border-emerald-500' },
];

export default function DealsView({ leads, onUpdateStatus }: DealsViewProps) {
  
  const getLeadsByStage = (stage: LeadStatus) => leads.filter(l => l.status === stage);

  const calculateStageTotal = (stageLeads: Lead[]) => {
    return stageLeads.reduce((acc, lead) => {
      const val = parseInt(lead.pricing.replace(/\D/g, ''));
      return acc + (isNaN(val) ? 0 : val);
    }, 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto h-[calc(100vh-73px)] flex flex-col">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h2 className="font-headline-md text-headline-md text-slate-900 dark:text-white">Pipeline Management</h2>
          <p className="font-body-md text-body-md text-slate-500">Track and manage your active deals.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input 
              type="text" 
              placeholder="Search deals..." 
              className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm w-64 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none dark:text-white"
            />
          </div>
          <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">filter_list</span> Filter
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-4 flex-1 items-start">
        {STAGES.map((stage) => {
          const stageLeads = getLeadsByStage(stage.id);
          return (
            <div key={stage.id} className="flex-none w-80 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl p-4 flex flex-col h-full border border-slate-100 dark:border-slate-800">
              <div className={`flex justify-between items-center mb-4 pb-3 border-b-2 ${stage.color}`}>
                <h3 className="font-headline-sm text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">{stage.label}</h3>
                <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-medium text-slate-500 shadow-sm">
                  {stageLeads.length}
                </span>
              </div>
              
              <div className="text-xs text-slate-500 font-medium mb-4">
                Total: {calculateStageTotal(stageLeads)}
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {stageLeads.map((lead) => (
                  <div key={lead.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 sc-shadow cursor-grab hover:border-secondary dark:hover:border-secondary transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                        {lead.location || 'Unknown'}
                      </span>
                      <button className="text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined text-sm">more_horiz</span>
                      </button>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">{lead.name}</h4>
                    <p className="text-xs text-slate-500 mb-3">{lead.clientRequirements || 'No specific requirements.'}</p>
                    
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{lead.pricing}</div>
                      <div className="flex gap-1">
                        <select 
                           className="text-xs border-none bg-transparent dark:text-slate-300 py-0 pr-6 cursor-pointer focus:ring-0"
                           value={lead.status}
                           onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
                        >
                          {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
