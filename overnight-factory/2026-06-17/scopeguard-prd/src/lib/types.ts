// ScopeGuard — Types
export interface Deliverable {
  id: string;
  description: string;
  estimatedHours: number;
  completed: boolean;
}

export interface ChangeOrder {
  id: string;
  projectId: string;
  description: string;
  relatedDeliverableId: string | null;
  estimatedHours: number;
  rate: number;
  amount: number;
  status: 'pending' | 'approved' | 'declined';
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
}

export interface ApprovalLink {
  id: string;
  projectId: string;
  changeOrderId: string | null;
  token: string;
  type: 'scope' | 'change-order';
  accessedAt: string | null;
  approvedAt: string | null;
}

export type ProjectStatus = 'draft' | 'approved' | 'active' | 'completed';

export interface Project {
  id: string;
  name: string;
  client: string;
  description: string;
  hourlyRate: number;
  budget: number;
  status: ProjectStatus;
  deliverables: Deliverable[];
  exclusions: string[];
  createdAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
}