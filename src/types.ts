export type LeadStatus = 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed';

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
  updatedAt: string;
  status: LeadStatus;
}
