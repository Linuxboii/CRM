export type LeadStatus = 'Lead' | 'Contacted' | 'Qualified' | 'Closed Won' | 'Closed Lost';

export interface Lead {
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
  clientRequirements?: string;
  createdAt: string;
  createdAtIso: string;
  updatedAt: string;
  status: LeadStatus;
}
