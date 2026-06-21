'use client';

import { Client, FormTemplate, BrandSettings, DEFAULT_BRAND, DEFAULT_TEMPLATES, ActivityEntry } from './types';

const CLIENTS_KEY = 'clientvault_clients';
const TEMPLATES_KEY = 'clientvault_templates';
const BRAND_KEY = 'clientvault_brand';
const CUSTOM_FORMS_KEY = 'clientvault_custom_forms';

function generateId(): string {
  return crypto.randomUUID();
}

// ============ Clients ============

export function getClients(): Client[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(CLIENTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveClients(clients: Client[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}

export function getClient(id: string): Client | undefined {
  return getClients().find(c => c.id === id);
}

export function createClient(data: { name: string; email: string; projectType: string; formId?: string | null }): Client {
  const clients = getClients();
  const now = new Date().toISOString();
  const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const client: Client = {
    id: generateId(),
    name: data.name,
    email: data.email,
    projectType: data.projectType,
    status: 'pending',
    createdAt: now,
    deadline,
    formId: data.formId || null,
    shareLinkId: null,
    shareLinkExpires: null,
    documents: [],
    formSubmission: null,
    activity: [
      { id: generateId(), type: 'created', description: 'Client created', timestamp: now }
    ],
  };
  clients.push(client);
  saveClients(clients);
  return client;
}

export function updateClient(id: string, updates: Partial<Client>): Client | undefined {
  const clients = getClients();
  const index = clients.findIndex(c => c.id === id);
  if (index === -1) return undefined;
  clients[index] = { ...clients[index], ...updates };
  saveClients(clients);
  return clients[index];
}

export function deleteClient(id: string): void {
  const clients = getClients().filter(c => c.id !== id);
  saveClients(clients);
}

export function addActivity(clientId: string, type: ActivityEntry['type'], description: string): void {
  const client = getClient(clientId);
  if (!client) return;
  const entry: ActivityEntry = {
    id: generateId(),
    type,
    description,
    timestamp: new Date().toISOString(),
  };
  const activity = [entry, ...(client.activity || [])];
  updateClient(clientId, { activity });
}

export function generateShareLink(clientId: string, expirationDays: number = 30): string {
  const linkId = generateId();
  const expires = expirationDays > 0
    ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString()
    : null;
  updateClient(clientId, {
    shareLinkId: linkId,
    shareLinkExpires: expires,
  });
  addActivity(clientId, 'link_generated', `Share link generated${expires ? ` (expires in ${expirationDays} days)` : ' (never expires)'}`);
  return linkId;
}

export function revokeShareLink(clientId: string): void {
  updateClient(clientId, { shareLinkId: null, shareLinkExpires: null });
  addActivity(clientId, 'link_generated', 'Share link revoked');
}

export function getClientByShareLink(linkId: string): Client | undefined {
  return getClients().find(c => c.shareLinkId === linkId);
}

export function recalculateStatus(client: Client): 'complete' | 'pending' | 'overdue' {
  const hasForm = client.formSubmission !== null;
  const hasDocs = client.documents.filter(d => d.uploadedAt).length > 0;
  const form = getFormById(client.formId || '');
  const requiredFields = form ? form.fields.filter(f => f.required) : [];
  const docFields = form ? form.fields.filter(f => f.type === 'document') : [];
  
  if (hasForm && (docFields.length === 0 || hasDocs)) {
    return 'complete';
  }
  
  if (new Date(client.deadline) < new Date()) {
    return 'overdue';
  }
  
  return 'pending';
}

export function recalculateAllStatuses(): void {
  const clients = getClients();
  const updated = clients.map(c => ({ ...c, status: recalculateStatus(c) }));
  saveClients(updated);
}

// ============ Form Templates ============

export function getFormTemplates(): FormTemplate[] {
  if (typeof window === 'undefined') return DEFAULT_TEMPLATES;
  const customData = localStorage.getItem(CUSTOM_FORMS_KEY);
  const custom: FormTemplate[] = customData ? JSON.parse(customData) : [];
  return [...DEFAULT_TEMPLATES, ...custom];
}

export function getFormById(id: string): FormTemplate | undefined {
  return getFormTemplates().find(t => t.id === id);
}

export function saveCustomForm(form: Omit<FormTemplate, 'id'>): FormTemplate {
  const customForms = getCustomForms();
  const newForm: FormTemplate = { ...form, id: generateId(), isDefault: false };
  customForms.push(newForm);
  localStorage.setItem(CUSTOM_FORMS_KEY, JSON.stringify(customForms));
  return newForm;
}

export function updateCustomForm(id: string, updates: Partial<FormTemplate>): FormTemplate | undefined {
  const customForms = getCustomForms();
  const index = customForms.findIndex(f => f.id === id);
  if (index === -1) return undefined;
  customForms[index] = { ...customForms[index], ...updates };
  localStorage.setItem(CUSTOM_FORMS_KEY, JSON.stringify(customForms));
  return customForms[index];
}

export function deleteCustomForm(id: string): void {
  const customForms = getCustomForms().filter(f => f.id !== id);
  localStorage.setItem(CUSTOM_FORMS_KEY, JSON.stringify(customForms));
}

function getCustomForms(): FormTemplate[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(CUSTOM_FORMS_KEY);
  return data ? JSON.parse(data) : [];
}

// ============ Brand Settings ============

export function getBrandSettings(): BrandSettings {
  if (typeof window === 'undefined') return DEFAULT_BRAND;
  const data = localStorage.getItem(BRAND_KEY);
  return data ? { ...DEFAULT_BRAND, ...JSON.parse(data) } : DEFAULT_BRAND;
}

export function saveBrandSettings(settings: Partial<BrandSettings>): BrandSettings {
  if (typeof window === 'undefined') return DEFAULT_BRAND;
  const current = getBrandSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(BRAND_KEY, JSON.stringify(updated));
  return updated;
}

// ============ IndexedDB for Documents ============

const DB_NAME = 'clientvault_db';
const DB_VERSION = 1;
const DOC_STORE = 'documents';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DOC_STORE)) {
        db.createObjectStore(DOC_STORE, { keyPath: 'id' });
      }
    };
  });
}

export async function saveDocument(doc: { id: string; name: string; type: string; size: number; data: string; clientId: string }): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DOC_STORE, 'readwrite');
    tx.objectStore(DOC_STORE).put(doc);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getDocument(id: string): Promise<{ id: string; name: string; type: string; size: number; data: string; clientId: string } | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DOC_STORE, 'readonly');
    const request = tx.objectStore(DOC_STORE).get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteDocument(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DOC_STORE, 'readwrite');
    tx.objectStore(DOC_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ============ Stats ============

export function getDashboardStats() {
  const clients = getClients();
  const total = clients.length;
  const complete = clients.filter(c => c.status === 'complete').length;
  const pending = clients.filter(c => c.status === 'pending').length;
  const overdue = clients.filter(c => c.status === 'overdue').length;
  const completionRate = total > 0 ? Math.round((complete / total) * 100) : 0;
  const avgDays = total > 0
    ? Math.round(clients.reduce((acc, c) => {
        const created = new Date(c.createdAt).getTime();
        const submitted = c.formSubmission ? new Date(c.formSubmission.submittedAt).getTime() : Date.now();
        return acc + (submitted - created) / (1000 * 60 * 60 * 24);
      }, 0) / total)
    : 0;

  return { total, complete, pending, overdue, completionRate, avgDays };
}