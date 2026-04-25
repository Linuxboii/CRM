import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, LayoutDashboard, Users, Briefcase, Settings, Search, Bell, HelpCircle,
  MoreVertical, TrendingUp, TrendingDown, Phone, Mail, MapPin, Calendar, 
  CheckCircle2, Clock, Plus, X, Edit2, Trash2, CalendarPlus, AlertTriangle, Trophy, LogOut, RefreshCw
} from 'lucide-react';
import { fetchLeads, createLead, updateLead, deleteLead, addMeeting, fetchUsers, SystemUser, loginUser, registerUser, fetchTopProducer, approveUser, deleteUser } from './api';
import './index.css';

type LeadStatus = 'Lead' | 'Qualified' | 'Closed';

interface Lead {
  id: string;
  name: string;
  email: string;
  number: string;
  location: string;
  pricing: string;
  meetStatus: string;
  meetingDate: string;
  meetingLink: string;
  sourceUserId: string;
  sourceUserName: string;
  createdAt: string;
  updatedAt: string;
  status: LeadStatus;
}

function AuthPage({ onLogin }: { onLogin: (user: SystemUser, token: string) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      if (isLogin) {
        const res = await loginUser({ email, password });
        onLogin(res.user, res.token);
      } else {
        await registerUser({ full_name: name, email, password });
        setIsLogin(true);
        setSuccessMsg("Your account is under review try again after some time");
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <div className="glass-panel" style={{ padding: '3rem', width: '400px', textAlign: 'center', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }}>
        <Building2 size={48} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{isLogin ? 'Sign In' : 'Create Account'}</h2>
        
        {error && <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
        {successMsg && <div style={{ color: '#16a34a', backgroundColor: '#dcfce7', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{successMsg}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <input type="text" placeholder="Full Name" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-primary)' }} required value={name} onChange={e => setName(e.target.value)} />
          )}
          <input type="email" placeholder="Email Address" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-primary)' }} required value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-primary)' }} required value={password} onChange={e => setPassword(e.target.value)} />
          
          <button type="submit" className="btn-primary" style={{ padding: '1rem', marginTop: '0.5rem', width: '100%' }} disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Authenticate' : 'Register Securely')}
          </button>
        </form>
        
        <p style={{ marginTop: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.875rem' }} onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }}>
          {isLogin ? "Don't have an account? Sign up" : "Already registered? Sign in"}
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [serverTopProducer, setServerTopProducer] = useState({ name: 'None', count: 0 });
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals State
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  
  // Form Payloads
  const [leadForm, setLeadForm] = useState<Partial<Lead>>({
    name: '', email: '', number: '', location: '', pricing: '', status: 'Lead', sourceUserId: ''
  });
  
  const [meetingForm, setMeetingForm] = useState({ date: '', link: '' });

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
      const tasks: any[] = [fetchLeads(), fetchTopProducer()];
      if (isAdmin) tasks.push(fetchUsers());
      
      const results = await Promise.all(tasks);
      setLeads(results[0]);
      setServerTopProducer(results[1]);
      if (isAdmin) setUsers(results[2]);
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

  if (!currentUser) return <AuthPage onLogin={handleLogin} />;

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openNewModal = () => {
    setEditingId(null);
    setLeadForm({
      name: '', email: '', number: '', location: '', pricing: '', status: 'Lead', sourceUserId: ''
    });
    setIsLeadModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingId(lead.id);
    setLeadForm({
      name: lead.name,
      email: lead.email,
      number: lead.number,
      location: lead.location,
      pricing: lead.pricing,
      status: lead.status,
      sourceUserId: lead.sourceUserId,
    });
    setIsLeadModalOpen(true);
  };

  const openMeetingModal = (id: string) => {
    setEditingId(id);
    setMeetingForm({ date: '', link: '' });
    setIsMeetingModalOpen(true);
  }

  const openDeleteModal = (id: string) => {
    setLeadToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (leadToDelete) {
      await deleteLead(leadToDelete);
      setIsDeleteModalOpen(false);
      setLeadToDelete(null);
      loadData();
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const rawPricing = parseInt((leadForm.pricing || '0').toString().replace(/\D/g, ''));
    
    if (editingId) {
      await updateLead(editingId, {
        full_name: leadForm.name,
        email: leadForm.email,
        phone: leadForm.number,
        location: leadForm.location,
        pricing_target: rawPricing,
        status: leadForm.status?.toLowerCase() || 'lead',
        assigned_to: leadForm.sourceUserId || null
      });
    } else {
      await createLead({
        full_name: leadForm.name,
        email: leadForm.email,
        phone: leadForm.number,
        location: leadForm.location,
        pricing_target: rawPricing,
        status: leadForm.status?.toLowerCase() || 'lead',
        assigned_to: leadForm.sourceUserId || null
      });
    }
    
    setIsLeadModalOpen(false);
    loadData();
  };

  const handleMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && meetingForm.date) {
      await addMeeting({
        lead_id: editingId,
        meeting_status: 'scheduled',
        meeting_datetime: meetingForm.date,
        meeting_link: meetingForm.link || undefined
      });
      setIsMeetingModalOpen(false);
      loadData();
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'qualified': return 'status-qualified';
      case 'closed': return 'status-closed';
      default: return 'status-lead';
    }
  };

  const calculatePipelineValue = () => {
    const total = leads.reduce((acc, lead) => {
      const val = parseInt(lead.pricing.replace(/\D/g, ''));
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
    const finalTotal = isAdmin ? total : total * 0.2;
    if (finalTotal >= 1000000) return `₹${(finalTotal / 1000000).toFixed(2)}M`;
    if (finalTotal >= 1000) return `₹${(finalTotal / 1000).toFixed(1)}k`;
    return `₹${finalTotal}`;
  };

  const meetingsScheduled = leads.filter(l => l.meetStatus === 'Scheduled').length;

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header" style={{ position: 'relative', zIndex: 1 }}>
          <Building2 size={28} color="var(--primary-accent)" />
          <h2>AvlokAI <span style={{fontSize: '0.6em', color: 'var(--text-muted)', verticalAlign: 'middle', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px'}}>SALES CRM</span></h2>
        </div>
        
        <nav className="sidebar-nav">
          <a href="#" className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} />
            Overview
          </a>
          {isAdmin && (
            <a href="#" className={`nav-item ${activeTab === 'team' ? 'active' : ''}`} onClick={() => setActiveTab('team')}>
              <Users size={20} />
              Team Management
            </a>
          )}
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="search-bar">
            <Search size={20} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search by name, status, or location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="topbar-actions">
            <button className="icon-button"><Bell size={20} /></button>
            <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="avatar">{currentUser.full_name.charAt(0).toUpperCase()}</div>
              <div className="user-info">
                <span className="user-name">{currentUser.full_name}</span>
                <span className="user-role" style={{ fontSize: '0.75rem', color: 'var(--primary-color)' }}>{isAdmin ? 'Administrator' : 'Sales Exec'}</span>
              </div>
              <button onClick={handleLogout} className="icon-button" style={{ marginLeft: '1rem' }} title="Log out">
                <LogOut size={18} color="#ef4444" />
              </button>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="content-scrollable fade-in">
            <div className="dashboard-header">
            <div>
              <h1>Lead Command Center</h1>
              <p>Track, execute, and dominate your pipeline operations.</p>
            </div>
            <button className="btn-primary" onClick={openNewModal}>
              <Plus size={20} />
              Register Target
            </button>
          </div>

          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Gross Pipeline Value</span>
                <div className="kpi-icon"><Briefcase size={20} /></div>
              </div>
              <div className="kpi-value">{calculatePipelineValue()}</div>
              {leads.length > 0 && (
                <div className="kpi-trend">
                  <TrendingUp size={16} className="trend-up" />
                  <span className="trend-up">Active potential</span>
                </div>
              )}
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Meetings Arranged</span>
                <div className="kpi-icon" style={{ color: '#f59e0b' }}><Calendar size={20} /></div>
              </div>
              <div className="kpi-value">{meetingsScheduled}</div>
              <div className="kpi-subtitle">Total meetings arranged</div>
            </div>

            <div className="kpi-card glass-panel fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="kpi-header">
                <h3>Top Producer</h3>
                <div className="icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                  <Trophy size={20} />
                </div>
              </div>
              <div className="kpi-value">{serverTopProducer.name}</div>
              <div className="kpi-subtitle">{serverTopProducer.count} Leads secured natively</div>
            </div>
          </div>

          <div className="data-table-container fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="data-table-header">
              <h3>Active Target Roster</h3>
              <button className="icon-button"><MoreVertical size={20} /></button>
            </div>
            
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Lead Name</th>
                    <th>Contact</th>
                    <th>Lead Source</th>
                    <th>Pricing</th>
                    <th>Status</th>
                    <th style={{textAlign: 'right'}}>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {!isLoading && filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                        We couldn't find any leads matching your query.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar">{lead.name.charAt(0).toUpperCase()}</div>
                            <div className="user-details">
                              <span className="user-name">{lead.name}</span>
                              <span className="user-email">{lead.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{display: 'flex', flexDirection: 'column', gap: '0.375rem'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem'}}>
                              <Phone size={14} color="var(--text-muted)" />
                              {lead.number}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                            <Users size={14} />
                            <span style={{ fontSize: '0.9rem' }}>{lead.sourceUserName}</span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: '500' }}>
                          {!isAdmin && lead.pricing !== '₹0' ? `₹${(parseInt(lead.pricing.replace(/\D/g, '')) * 0.2).toLocaleString()}` : lead.pricing}
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusClass(lead.status)}`}>{lead.status}</span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="icon-button" onClick={() => openEditModal(lead)} title="Edit Configuration">
                              <Edit2 size={16} />
                            </button>
                            <button className="icon-button" onClick={() => openMeetingModal(lead.id)} title="Add Standalone Meeting">
                              <CalendarPlus size={16} />
                            </button>
                            <button className="icon-button" onClick={() => openDeleteModal(lead.id)} style={{color: '#ef4444'}} title="Scrap Lead">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          </div>
        )}

        {activeTab === 'team' && isAdmin && (
          <div className="content-scrollable fade-in">
            <div className="dashboard-header">
              <div>
                <h1>Team Administration</h1>
                <p>Manage user approvals and active team members.</p>
              </div>
              <button className="btn-secondary" onClick={loadData} disabled={isLoading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={18} />
                Refresh Data
              </button>
            </div>

            <div className="data-table-container fade-in" style={{ marginBottom: '2rem' }}>
              <div className="data-table-header">
                <h3>Pending Approvals</h3>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th style={{textAlign: 'right'}}>Options</th></tr>
                  </thead>
                  <tbody>
                    {users.filter(u => !u.is_active).length === 0 ? (
                      <tr><td colSpan={3} style={{textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)'}}>No pending registrations.</td></tr>
                    ) : (
                      users.filter(u => !u.is_active).map(user => (
                        <tr key={user.id}>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar">{user.full_name.charAt(0).toUpperCase()}</div>
                              <div className="user-details">
                                <span className="user-name">{user.full_name}</span>
                              </div>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="icon-button" style={{color: '#16a34a'}} onClick={async () => { await approveUser(user.id); loadData(); }} title="Approve">
                                <CheckCircle2 size={16} />
                              </button>
                              <button className="icon-button" style={{color: '#ef4444'}} onClick={async () => { await deleteUser(user.id); loadData(); }} title="Reject">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="data-table-container fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="data-table-header">
                <h3>Active Roster</h3>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Role</th><th style={{textAlign: 'right'}}>Options</th></tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.is_active).map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar">{user.full_name.charAt(0).toUpperCase()}</div>
                            <div className="user-details">
                              <span className="user-name">{user.full_name}</span>
                            </div>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600', backgroundColor: user.role === 'admin' ? '#fef08a' : 'var(--bg-color)', color: user.role === 'admin' ? '#854d0e' : 'var(--text-secondary)', padding: '0.25rem 0.625rem', borderRadius: '9999px' }}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          {user.id !== currentUser?.id && (
                            <div className="action-buttons">
                              <button className="icon-button" style={{color: '#ef4444'}} onClick={async () => { if(window.confirm('Are you sure you want to delete this user? Their leads will be unassigned.')){ await deleteUser(user.id); loadData(); } }} title="Terminate Account">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {isLeadModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLeadModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Configuration' : 'Add New Lead'}</h2>
              <button className="icon-button" type="button" onClick={() => setIsLeadModalOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleLeadSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={leadForm.name} onChange={(e) => setLeadForm({...leadForm, name: e.target.value})} required/>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={leadForm.email} onChange={(e) => setLeadForm({...leadForm, email: e.target.value})} required/>
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" value={leadForm.number} onChange={(e) => setLeadForm({...leadForm, number: e.target.value})} required/>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {isAdmin && (
                  <div className="form-group">
                    <label>Lead Source / Assigner</label>
                    <select 
                      required
                      value={leadForm.sourceUserId || ''} 
                      onChange={(e) => setLeadForm({...leadForm, sourceUserId: e.target.value})}
                    >
                      <option value="" disabled>Select User...</option>
                      {users.filter(u => u.is_active).map(u => (
                        <option key={u.id} value={u.id}>{u.full_name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="form-group" style={{ gridColumn: isAdmin ? 'auto' : '1 / -1' }}>
                  <label>Location</label>
                  <input type="text" value={leadForm.location} onChange={(e) => setLeadForm({...leadForm, location: e.target.value})} required/>
                </div>
              </div>

              <div className="form-group">
                <label>Full Deal Value {!isAdmin ? "(You receive 20% on completion)" : ""}</label>
                <input type="text" value={leadForm.pricing} onChange={(e) => setLeadForm({...leadForm, pricing: e.target.value})} placeholder="e.g. ₹50,000 (Enter 100% Value)" required/>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Status</label>
                  <select value={leadForm.status} onChange={(e) => setLeadForm({...leadForm, status: e.target.value as LeadStatus})}>
                    <option value="Lead">Lead</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsLeadModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Execute</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Standalone Meeting Modal */}
      {isMeetingModalOpen && (
        <div className="modal-overlay" onClick={() => setIsMeetingModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Schedule Check-in</h2>
              <button className="icon-button" type="button" onClick={() => setIsMeetingModalOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleMeetingSubmit}>
              <div className="form-group">
                <label>Meeting Date & Time</label>
                <input type="datetime-local" value={meetingForm.date} onChange={(e) => setMeetingForm({...meetingForm, date: e.target.value})} required/>
              </div>
              <div className="form-group">
                <label>Meeting Link</label>
                <input type="url" value={meetingForm.link} onChange={(e) => setMeetingForm({...meetingForm, link: e.target.value})}/>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsMeetingModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Set Objective</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center', padding: '2.5rem 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '1.25rem', borderRadius: '50%' }}>
                <AlertTriangle size={36} />
              </div>
            </div>
            <h2 style={{ marginBottom: '0.75rem', fontSize: '1.25rem' }}>Erase Target Lead</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.5', fontSize: '0.925rem' }}>
              Are you sure you want to permanently scrap this lead? This action cannot be undone and will strip all associated tracking data.
            </p>
            <div className="modal-actions" style={{ justifyContent: 'center', gap: '1rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button type="button" className="btn-primary" style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }} onClick={confirmDelete}>Scrap Target</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
