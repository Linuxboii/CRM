import { useState } from 'react';
import { Lead } from '../types';

interface ContactsViewProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
  onDeleteLead?: (id: string) => void;
  onRefresh: () => void;
}

export default function ContactsView({ leads, onEditLead, onDeleteLead, onRefresh }: ContactsViewProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  if (selectedLead) {
    const currentLead = leads.find(lead => lead.id === selectedLead.id) || selectedLead;
    return <ContactDetail lead={currentLead} onBack={() => setSelectedLead(null)} onEdit={() => onEditLead(currentLead)} onRefresh={onRefresh} />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-headline-md text-headline-md text-slate-900 dark:text-white">Contacts & Leads</h2>
          <p className="font-body-md text-body-md text-slate-500">Manage your entire roster of contacts.</p>
        </div>
        <button onClick={onRefresh} className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">refresh</span> Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 sc-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Value</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Meeting</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => setSelectedLead(lead)}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{lead.name}</div>
                        <div className="text-xs text-slate-500">{lead.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-900 dark:text-white">{lead.pricing}</td>
                  <td className="p-4 text-sm text-slate-500">{lead.location || '-'}</td>
                  <td className="p-4 text-sm text-slate-500">
                     {lead.meetStatus === 'Scheduled' ? lead.meetingDate : lead.meetStatus}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEditLead(lead); }}
                      className="text-slate-400 hover:text-indigo-600 p-1"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    {onDeleteLead && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteLead(lead.id); }}
                        className="text-slate-400 hover:text-rose-600 p-1 ml-2"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ContactDetail({ lead, onBack, onEdit, onRefresh }: { lead: Lead, onBack: () => void, onEdit: () => void, onRefresh: () => void }) {
  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <button onClick={onBack} className="hover:text-slate-900 dark:hover:text-white transition-colors">Contacts</button>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-slate-900 dark:text-white font-medium">{lead.name}</span>
        </div>
        <button onClick={onRefresh} className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">refresh</span> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Header */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 sc-shadow text-center relative">
            <button onClick={onEdit} className="absolute top-4 right-4 text-slate-400 hover:text-indigo-600 transition-colors">
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
            <div className="w-24 h-24 mx-auto bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4">
              {lead.name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{lead.name}</h2>
            <p className="text-sm text-slate-500 mb-4">{lead.location}</p>
            <div className="flex justify-center gap-2">
              {lead.email && (
              <a href={`mailto:${lead.email}`} className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                <span className="material-symbols-outlined text-sm">mail</span>
              </a>
              )}
              {lead.number && (
              <a href={`tel:${lead.number}`} className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                <span className="material-symbols-outlined text-sm">call</span>
              </a>
              )}
              {lead.meetingLink && (
                 <a href={lead.meetingLink} target="_blank" rel="noreferrer" className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                   <span className="material-symbols-outlined text-sm">videocam</span>
                 </a>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 sc-shadow">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Contact Information</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs mb-1">Email</p>
                <p className="font-medium text-slate-900 dark:text-white">{lead.email}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Phone</p>
                <p className="font-medium text-slate-900 dark:text-white">{lead.number}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Meeting</p>
                {lead.meetingLink ? (
                  <div className="space-y-1">
                    <a href={lead.meetingLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                      <span className="material-symbols-outlined text-sm">videocam</span>
                      Join Meeting
                    </a>
                    {lead.meetingDate && <p className="text-xs text-slate-500">{lead.meetingDate}</p>}
                  </div>
                ) : (
                  <p className="font-medium text-slate-900 dark:text-white">Not Scheduled</p>
                )}
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Owner</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[10px] font-bold">
                    {lead.sourceUserName.charAt(0)}
                  </div>
                  <span className="font-medium text-slate-900 dark:text-white">{lead.sourceUserName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Activity & Notes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 sc-shadow">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Client Requirements</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {lead.clientRequirements || "No specific requirements logged yet."}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 sc-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white">Deal Summary</h3>
            </div>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex justify-between items-center hover:border-secondary transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <span className="material-symbols-outlined">attach_money</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{lead.name}</h4>
                  <p className="text-xs text-slate-500">Pipeline: <span className="text-indigo-600 dark:text-indigo-400 font-medium">{lead.status}</span></p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900 dark:text-white">{lead.pricing}</div>
                <div className="text-xs text-slate-500">Meeting: {lead.meetingDate || 'Not scheduled'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
