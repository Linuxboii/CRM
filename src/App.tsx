import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { fetchLeads, createLead, updateLead, deleteLead, fetchUsers, SystemUser, fetchTopProducer, scheduleMeetingWebhook, approveUser, deleteUser } from './api';
import { Lead, LeadStatus } from './types';
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardView from './views/DashboardView';
import DealsView from './views/DealsView';
import ContactsView from './views/ContactsView';
import CalendarView from './views/CalendarView';
import TeamView from './views/TeamView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals State
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingMeetLink, setIsFetchingMeetLink] = useState(false);
  
  // Form Payload
  const [leadForm, setLeadForm] = useState<Partial<Lead>>({
    name: '', email: '', number: '', location: '', pricing: '', status: 'Lead', sourceUserId: '', clientRequirements: '', meetStatus: 'Not Scheduled', meetingDate: '', meetingLink: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('crm_user');
    const token = localStorage.getItem('crm_token');
    if (storedUser && token) {
      setCurrentUser(JSON.parse(storedUser));
    } else {
      setIsLoading(false);
    }
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const tasks: any[] = [fetchLeads()];
      if (isAdmin) tasks.push(fetchUsers());
      
      const results = await Promise.all(tasks);
      setLeads(results[0]);
      if (isAdmin) setUsers(results[1]);
    } catch (e: any) {
      console.error("Networking error:", e);
      if (e.message === 'Unauthorized') handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, isAdmin]);

  const handleLogin = (user: SystemUser, token: string) => {
    localStorage.setItem('crm_user', JSON.stringify(user));
    localStorage.setItem('crm_token', token);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('crm_user');
    localStorage.removeItem('crm_token');
    setCurrentUser(null);
    setLeads([]);
  };

  const openNewModal = () => {
    setEditingId(null);
    setLeadForm({
      name: '', email: '', number: '', location: '', pricing: '', status: 'Lead', sourceUserId: '', clientRequirements: '', meetStatus: 'Not Scheduled', meetingDate: '', meetingLink: ''
    });
    setIsLeadModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingId(lead.id);
    setLeadForm({ ...lead });
    setIsLeadModalOpen(true);
  };

  const handleDeleteLead = async (id: string) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      await deleteLead(id);
      loadData();
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: LeadStatus) => {
    await updateLead(id, { status: newStatus.toLowerCase() });
    loadData();
  };

  const handleGetMeetLink = async () => {
    if (!leadForm.meetingDate) return;
    setIsFetchingMeetLink(true);
    try {
      const webhookRes = await scheduleMeetingWebhook({
        clientName: leadForm.name || '',
        clientEmail: leadForm.email || '',
        clientPhone: leadForm.number || '',
        meetingDate: leadForm.meetingDate,
        clientRequirements: leadForm.clientRequirements || '',
      });
      const event = Array.isArray(webhookRes) ? webhookRes[0] : webhookRes;
      const link = event?.hangoutLink || event?.meetLink || event?.meeting_link || event?.link || '';
      if (link) {
        setLeadForm(prev => ({ ...prev, meetingLink: link, meetStatus: 'Scheduled' }));
      } else {
        alert('Meeting was created but no Google Meet link was returned.');
      }
    } catch (err) {
      console.error('Webhook scheduling failed:', err);
      alert('Failed to generate meeting link. You can enter one manually.');
    } finally {
      setIsFetchingMeetLink(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const rawPricing = parseInt((leadForm.pricing || '0').toString().replace(/\D/g, ''));
    
    const payload = {
      full_name: leadForm.name,
      email: leadForm.email,
      phone: leadForm.number,
      location: leadForm.location,
      pricing_target: rawPricing,
      status: leadForm.status?.toLowerCase() || 'lead',
      assigned_to: leadForm.sourceUserId || null,
      client_requirements: leadForm.clientRequirements || '',
      meeting_status: leadForm.meetingDate ? 'Scheduled' : (leadForm.meetStatus || 'Not Scheduled'),
      meeting_datetime: leadForm.meetingDate || null,
      meeting_link: leadForm.meetingLink || ''
    };

    if (editingId) {
      await updateLead(editingId, payload);
    } else {
      await createLead(payload);
    }

    setIsSubmitting(false);
    setIsLeadModalOpen(false);
    loadData();
  };

  const exportToExcel = () => {
    if (leads.length === 0) {
      alert('No data to export.');
      return;
    }
    const data = leads.map(lead => ({
      'Lead Name': lead.name,
      'Email': lead.email,
      'Phone': lead.number,
      'Location': lead.location,
      'Lead Source': lead.sourceUserName,
      'Pricing': !isAdmin && lead.pricing !== '₹0' ? `₹${(parseInt(lead.pricing.replace(/\D/g, '')) * 0.2).toLocaleString()}` : lead.pricing,
      'Status': lead.status,
      'Meeting Status': lead.meetStatus,
      'Meeting Date': lead.meetingDate ? new Date(lead.meetingDate).toLocaleString() : 'N/A',
      'Meeting Link': lead.meetingLink || 'N/A',
      'Client Requirements': lead.clientRequirements || '',
      'Created At': lead.createdAt,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Export');
    XLSX.writeFile(wb, `Leads_Export_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  if (!currentUser) return <AuthPage onLogin={handleLogin} />;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden font-body-md text-slate-900 dark:text-white">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} isAdmin={isAdmin} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar userName={currentUser.full_name} onLogout={handleLogout} />
        
        <main className="flex-1 overflow-auto">
          {activeTab === 'dashboard' && <DashboardView leads={leads} isAdmin={isAdmin} onExport={exportToExcel} onNewDeal={openNewModal} />}
          {activeTab === 'deals' && <DealsView leads={leads} onUpdateStatus={handleUpdateStatus} />}
          {activeTab === 'contacts' && <ContactsView leads={leads} onEditLead={openEditModal} onDeleteLead={handleDeleteLead} />}
          {activeTab === 'calendar' && <CalendarView leads={leads} />}
          {activeTab === 'team' && isAdmin && <TeamView users={users} onRefresh={loadData} />}
        </main>
      </div>

      {/* Lead Modal */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Deal / Target' : 'Register New Target'}</h2>
              <button onClick={() => setIsLeadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="leadForm" onSubmit={handleLeadSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input type="text" required value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input type="email" value={leadForm.email} onChange={e => setLeadForm({...leadForm, email: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number *</label>
                    <input type="text" required value={leadForm.number} onChange={e => setLeadForm({...leadForm, number: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input type="text" value={leadForm.location} onChange={e => setLeadForm({...leadForm, location: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Pricing Target (₹)</label>
                    <input type="text" value={leadForm.pricing} onChange={e => setLeadForm({...leadForm, pricing: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select value={leadForm.status} onChange={e => setLeadForm({...leadForm, status: e.target.value as LeadStatus})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500">
                      <option value="Lead">Lead</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Proposal">Proposal</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Closed">Closed Won</option>
                    </select>
                  </div>
                  
                  {isAdmin && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Assign To</label>
                      <select value={leadForm.sourceUserId || ''} onChange={e => setLeadForm({...leadForm, sourceUserId: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500">
                        <option value="">Unassigned</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.full_name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Client Requirements / Notes</label>
                    <textarea rows={3} value={leadForm.clientRequirements || ''} onChange={e => setLeadForm({...leadForm, clientRequirements: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500"></textarea>
                  </div>
                  
                  <div className="col-span-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
                     <h3 className="font-bold text-sm">Meeting Configuration</h3>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="block text-xs font-medium text-slate-500 mb-1">Meeting Date & Time</label>
                         <input type="datetime-local" value={leadForm.meetingDate ? new Date(leadForm.meetingDate).toISOString().slice(0, 16) : ''} onChange={e => setLeadForm({...leadForm, meetingDate: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 text-sm" />
                       </div>
                       <div className="flex items-end">
                         <button type="button" onClick={handleGetMeetLink} disabled={isFetchingMeetLink || !leadForm.meetingDate} className="w-full px-4 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50">
                           {isFetchingMeetLink ? 'Generating...' : 'Generate Google Meet Link'}
                         </button>
                       </div>
                       <div className="col-span-2">
                         <label className="block text-xs font-medium text-slate-500 mb-1">Meeting Link</label>
                         <input type="url" value={leadForm.meetingLink || ''} onChange={e => setLeadForm({...leadForm, meetingLink: e.target.value, meetStatus: e.target.value ? 'Scheduled' : 'Not Scheduled'})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 text-sm" placeholder="https://meet.google.com/..." />
                       </div>
                     </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
              <button type="button" onClick={() => setIsLeadModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" form="leadForm" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                {isSubmitting ? 'Saving...' : (editingId ? 'Update Deal' : 'Create Deal')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
