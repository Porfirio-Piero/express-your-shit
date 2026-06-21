// ScopeGuard — localStorage persistence layer
import { Project, ChangeOrder, ApprovalLink, Deliverable } from './types';

const PROJECTS_KEY = 'scopeguard_projects';
const CHANGE_ORDERS_KEY = 'scopeguard_change_orders';
const APPROVAL_LINKS_KEY = 'scopeguard_approval_links';

function generateId(): string {
  return crypto.randomUUID();
}

// Projects
export function getProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(PROJECTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function getProject(id: string): Project | undefined {
  return getProjects().find(p => p.id === id);
}

export function createProject(data: Omit<Project, 'id' | 'createdAt' | 'deliverables' | 'exclusions' | 'status' | 'approvedAt' | 'approvedBy'> & { deliverables?: Deliverable[]; exclusions?: string[] }): Project {
  const projects = getProjects();
  const project: Project = {
    id: generateId(),
    name: data.name,
    client: data.client,
    description: data.description,
    hourlyRate: data.hourlyRate,
    budget: data.budget,
    status: 'draft',
    deliverables: data.deliverables || [],
    exclusions: data.exclusions || [],
    createdAt: new Date().toISOString(),
    approvedAt: null,
    approvedBy: null,
  };
  projects.push(project);
  saveProjects(projects);
  return project;
}

export function updateProject(id: string, updates: Partial<Project>): Project | undefined {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index === -1) return undefined;
  projects[index] = { ...projects[index], ...updates };
  saveProjects(projects);
  return projects[index];
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter(p => p.id !== id);
  saveProjects(projects);
  // Also clean up change orders and approval links
  const changeOrders = getChangeOrders().filter(co => co.projectId !== id);
  saveChangeOrders(changeOrders);
  const links = getApprovalLinks().filter(l => l.projectId !== id);
  saveApprovalLinks(links);
}

// Change Orders
export function getChangeOrders(projectId?: string): ChangeOrder[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(CHANGE_ORDERS_KEY);
  const all: ChangeOrder[] = data ? JSON.parse(data) : [];
  return projectId ? all.filter(co => co.projectId === projectId) : all;
}

export function saveChangeOrders(changeOrders: ChangeOrder[]): void {
  localStorage.setItem(CHANGE_ORDERS_KEY, JSON.stringify(changeOrders));
}

export function createChangeOrder(data: Omit<ChangeOrder, 'id' | 'createdAt' | 'status' | 'approvedBy' | 'approvedAt' | 'amount'>): ChangeOrder {
  const changeOrders = getChangeOrders();
  const co: ChangeOrder = {
    id: generateId(),
    projectId: data.projectId,
    description: data.description,
    relatedDeliverableId: data.relatedDeliverableId,
    estimatedHours: data.estimatedHours,
    rate: data.rate,
    amount: data.estimatedHours * data.rate,
    status: 'pending',
    approvedBy: null,
    approvedAt: null,
    createdAt: new Date().toISOString(),
  };
  changeOrders.push(co);
  saveChangeOrders(changeOrders);
  return co;
}

export function updateChangeOrder(id: string, updates: Partial<ChangeOrder>): ChangeOrder | undefined {
  const changeOrders = getChangeOrders();
  const index = changeOrders.findIndex(co => co.id === id);
  if (index === -1) return undefined;
  changeOrders[index] = { ...changeOrders[index], ...updates };
  saveChangeOrders(changeOrders);
  return changeOrders[index];
}

// Approval Links
export function getApprovalLinks(projectId?: string): ApprovalLink[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(APPROVAL_LINKS_KEY);
  const all: ApprovalLink[] = data ? JSON.parse(data) : [];
  return projectId ? all.filter(l => l.projectId === projectId) : all;
}

export function saveApprovalLinks(links: ApprovalLink[]): void {
  localStorage.setItem(APPROVAL_LINKS_KEY, JSON.stringify(links));
}

export function createApprovalLink(projectId: string, type: 'scope' | 'change-order', changeOrderId?: string): ApprovalLink {
  const links = getApprovalLinks();
  const link: ApprovalLink = {
    id: generateId(),
    projectId,
    changeOrderId: changeOrderId || null,
    token: generateId(),
    type,
    accessedAt: null,
    approvedAt: null,
  };
  links.push(link);
  saveApprovalLinks(links);
  return link;
}

export function getApprovalLinkByToken(token: string): ApprovalLink | undefined {
  return getApprovalLinks().find(l => l.token === token);
}

// Stats helpers
export function getProjectStats(projectId: string) {
  const project = getProject(projectId);
  if (!project) return null;
  const changeOrders = getChangeOrders(projectId);
  const approvedCOs = changeOrders.filter(co => co.status === 'approved');
  const pendingCOs = changeOrders.filter(co => co.status === 'pending');
  const totalCOValue = approvedCOs.reduce((sum, co) => sum + co.amount, 0);
  const creepPercent = project.budget > 0 ? (totalCOValue / project.budget) * 100 : 0;
  return {
    project,
    changeOrders,
    approvedCOs,
    pendingCOs,
    totalCOValue,
    creepPercent,
    originalBudget: project.budget,
    totalValue: project.budget + totalCOValue,
  };
}