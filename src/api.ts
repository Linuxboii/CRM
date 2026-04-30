import { formatInr, parseCurrencyValue } from './utils/currency';

const API_URL = "https://crm-api.avlokai.com";

const getHeaders = () => {
  const token = localStorage.getItem('crm_token');
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

export interface SystemUser {
  id: string;
  full_name: string;
  email: string;
  role?: string;
  is_active?: boolean;
}

export const registerUser = async (data: any) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const loginUser = async (data: any) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const fetchUsers = async () => {
  const res = await fetch(`${API_URL}/users`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed");
  const data: SystemUser[] = await res.json();
  return data;
};

export const fetchLeads = async () => {
  const res = await fetch(`${API_URL}/leads`, { headers: getHeaders() });
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Fetch leads error:", res.status, errorText);
    throw new Error(`Failed to fetch leads: ${errorText}`);
  }
  const rawData = await res.json();
  
  // Map database status values to UI status values
  const statusMap: { [key: string]: string } = {
    'lead': 'Lead',
    'contacted': 'Contacted',
    'qualified': 'Qualified',
    'closed': 'Closed Won',
    'lost': 'Closed Lost'
  };
  
  return rawData.map((row: any) => {
    const meetingLink = row.gmeet_link || row.meeting_link || row.meet_link || '';

    return {
      id: row.id,
      name: row.full_name,
      email: row.email,
      number: row.phone,
      location: row.location,
      pricing: formatInr(parseCurrencyValue(row.pricing_target)),
      status: statusMap[row.status] || 'Lead',
      sourceUserId: row.assigned_to || '',
      sourceUserName: row.assigned_to_name || 'Unassigned',
      meetStatus: meetingLink ? 'Scheduled' : 'Not Scheduled',
      meetingDate: row.meeting_datetime ? new Date(row.meeting_datetime).toLocaleString() : '',
      meetingDateIso: row.meeting_datetime || '',
      meetingLink,
      clientRequirements: row.client_requirements || '',
      createdAt: new Date(row.created_at).toLocaleDateString(),
      createdAtIso: row.created_at || '',
      updatedAt: row.updated_at ? new Date(row.updated_at).toLocaleDateString() : 'N/A'
    };
  });
};

export const createLead = async (data: any) => {
  const res = await fetch(`${API_URL}/leads`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Create lead error:", errorText);
    throw new Error(`Failed to create lead: ${errorText}`);
  }
  return res.json();
};

export const updateLead = async (id: string, data: any) => {
  const res = await fetch(`${API_URL}/leads/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Update lead error:", errorText);
    throw new Error(`Failed to update lead: ${errorText}`);
  }
  return res.json();
};

export const deleteLead = async (id: string) => {
  const res = await fetch(`${API_URL}/leads/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  return res.json();
};

export const addMeeting = async (data: any) => {
  const res = await fetch(`${API_URL}/meetings`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const fetchTopProducer = async () => {
  const res = await fetch(`${API_URL}/analytics/top-producer`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch top producer");
  return res.json();
};

export const approveUser = async (id: string) => {
  const res = await fetch(`${API_URL}/users/${id}/approve`, {
    method: "PUT",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to approve user");
  return res.json();
};

export const deleteUser = async (id: string) => {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete user");
  return res.json();
};

export const scheduleMeetingWebhook = async (data: {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  meetingDate: string;
  clientRequirements?: string;
}) => {
  const params = new URLSearchParams({
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    clientPhone: data.clientPhone,
    meetingDate: data.meetingDate,
    ...(data.clientRequirements ? { clientRequirements: data.clientRequirements } : {}),
  });
  const res = await fetch(`https://n8n-bak.avlokai.com/webhook/meet-link?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to schedule meeting via webhook");
  return res.json();
};
