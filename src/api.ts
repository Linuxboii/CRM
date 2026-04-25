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
  if (!res.ok) throw new Error("Unauthorized");
  const rawData = await res.json();
  
  const groupedLeads = new Map<string, any>();
  
  rawData.forEach((row: any) => {
    if (!groupedLeads.has(row.id)) {
      groupedLeads.set(row.id, {
        id: row.id,
        name: row.full_name,
        email: row.email,
        number: row.phone,
        location: row.location,
        pricing: row.pricing_target ? `₹${row.pricing_target}` : '₹0', 
        status: row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : 'Lead', 
        sourceUserId: row.assigned_to || '',
        sourceUserName: row.assigned_to_name || 'Unassigned',
        meetStatus: row.meeting_status ? row.meeting_status.charAt(0).toUpperCase() + row.meeting_status.slice(1) : 'Not Scheduled',
        meetingDate: row.meeting_datetime || '',
        meetingLink: row.meeting_link || '',
        createdAt: new Date(row.created_at).toLocaleDateString(),
        updatedAt: row.updated_at ? new Date(row.updated_at).toLocaleDateString() : 'N/A'
      });
    } else if (row.meeting_datetime) {
      const existing = groupedLeads.get(row.id);
      if (!existing.meetingDate || new Date(row.meeting_datetime) > new Date(existing.meetingDate)) {
        groupedLeads.set(row.id, {
          ...existing,
          meetStatus: row.meeting_status ? row.meeting_status.charAt(0).toUpperCase() + row.meeting_status.slice(1) : 'Scheduled',
          meetingDate: row.meeting_datetime,
          meetingLink: row.meeting_link
        });
      }
    }
  });

  return Array.from(groupedLeads.values());
};

export const createLead = async (data: any) => {
  const res = await fetch(`${API_URL}/leads`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateLead = async (id: string, data: any) => {
  const res = await fetch(`${API_URL}/leads/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
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
