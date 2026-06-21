'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getClient, updateClient, addActivity, generateShareLink, revokeShareLink, saveDocument, deleteDocument, recalculateStatus, getFormTemplates } from '@/lib/storage';
import { Client, FormTemplate, STATUS_COLORS, STATUS_ICONS, ActivityEntry } from '@/lib/types';

export default function ClientDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [client, setClient] = useState<Client | null>(null);
  const [form, setForm] = useState<FormTemplate | null>(null);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'documents' | 'form' | 'activity'>('documents');

  useEffect(() => {
    loadData();
  }, [id]);

  function loadData() {
    const c = getClient(id);
    if (c) {
      setClient(c);
      if (c.formId) {
        const f = getFormTemplates().find(t => t.id === c.formId);
        setForm(f || null);
      }
      if (c.shareLinkId) {
        setShareLink(`${window.location.origin}/portal/${c.shareLinkId}`);
      }
    }
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Client not found</h2>
          <Link href="/" className="text-indigo-600 hover:underline text-sm">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  function handleGenerateLink() {
    const linkId = generateShareLink(id, 30);
    setShareLink(`${window.location.origin}/portal/${linkId}`);
    loadData();
  }

  function handleRevokeLink() {
    revokeShareLink(id);
    setShareLink('');
    loadData();
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    
    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = async () => {
        const docId = crypto.randomUUID();
        const docData = {
          id: docId,
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result as string,
          clientId: id,
        };
        await saveDocument(docData);
        
        const currentClient = getClient(id);
        if (currentClient) {
          const newDoc = {
            id: docId,
            name: file.name,
            type: file.type,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          };
          const updatedDocs = [...currentClient.documents, newDoc];
          const status = recalculateStatus({ ...currentClient, documents: updatedDocs });
          updateClient(id, { documents: updatedDocs, status });
          addActivity(id, 'document_uploaded', `Document uploaded: ${file.name}`);
          loadData();
        }
      };
      reader.readAsDataURL(file);
    }
    setUploading(false);
    e.target.value = '';
  }

  async function handleDeleteDoc(docId: string, docName: string) {
    if (!confirm(`Delete "${docName}"?`)) return;
    await deleteDocument(docId);
    const currentClient = getClient(id);
    if (currentClient) {
      const updatedDocs = currentClient.documents.filter(d => d.id !== docId);
      const status = recalculateStatus({ ...currentClient, documents: updatedDocs });
      updateClient(id, { documents: updatedDocs, status });
      addActivity(id, 'document_uploaded', `Document deleted: ${docName}`);
      loadData();
    }
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{client.name}</h1>
                <p className="text-xs text-gray-500">{client.email || 'No email'}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[client.status]}`}>
              {STATUS_ICONS[client.status]} {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Info Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap items-center gap-4 text-sm">
          <div><span className="text-gray-500">Project:</span> <span className="font-medium">{client.projectType || 'Not set'}</span></div>
          <div><span className="text-gray-500">Created:</span> <span className="font-medium">{new Date(client.createdAt).toLocaleDateString()}</span></div>
          <div><span className="text-gray-500">Deadline:</span> <span className="font-medium">{new Date(client.deadline).toLocaleDateString()}</span></div>
          <div><span className="text-gray-500">Documents:</span> <span className="font-medium">{client.documents.filter(d => d.uploadedAt).length}</span></div>
          <div><span className="text-gray-500">Form:</span> <span className="font-medium">{client.formSubmission ? 'Submitted ✓' : form ? 'Pending' : 'Not assigned'}</span></div>
        </div>

        {/* Share Link Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Client Portal Link</h3>
          {shareLink ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={shareLink}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono"
                />
                <button onClick={handleCopyLink} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
                <button onClick={handleRevokeLink} className="px-4 py-2 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                  Revoke
                </button>
              </div>
              {client.shareLinkExpires && (
                <p className="text-xs text-gray-500">Expires: {new Date(client.shareLinkExpires!).toLocaleDateString()}</p>
              )}
            </div>
          ) : (
            <button onClick={handleGenerateLink} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              Generate Share Link
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
          {(['documents', 'form', 'activity'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Documents</h3>
                <label className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer">
                  {uploading ? 'Uploading...' : 'Upload Files'}
                  <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
              {client.documents.filter(d => d.uploadedAt).length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No documents yet. Upload files or share the portal link with your client.
                </div>
              ) : (
                <div className="space-y-2">
                  {client.documents.filter(d => d.uploadedAt).map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center">
                          <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                          <div className="text-xs text-gray-500">{formatBytes(doc.size)} · {new Date(doc.uploadedAt!).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteDoc(doc.id, doc.name)} className="text-red-400 hover:text-red-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'form' && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Intake Form</h3>
            {client.formSubmission ? (
              <div className="space-y-3">
                <p className="text-sm text-green-600 font-medium mb-3">✓ Form submitted on {new Date(client.formSubmission.submittedAt).toLocaleDateString()}</p>
                {Object.entries(client.formSubmission.values).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-100 pb-2">
                    <div className="text-xs text-gray-500 mb-0.5">{key}</div>
                    <div className="text-sm text-gray-900">{Array.isArray(value) ? value.join(', ') : String(value)}</div>
                  </div>
                ))}
              </div>
            ) : form ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-3">Form assigned: <span className="font-medium text-gray-900">{form.name}</span></p>
                <p className="text-sm text-gray-500">Waiting for client to fill out via the portal link.</p>
                <div className="text-sm text-gray-400">
                  {form.fields.length} fields · {form.fields.filter(f => f.required).length} required
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-3">No intake form assigned yet.</p>
                <Link href="/form-builder" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors inline-block">
                  Create Form
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Activity Timeline</h3>
            {client.activity.length === 0 ? (
              <p className="text-sm text-gray-400">No activity yet.</p>
            ) : (
              <div className="space-y-3">
                {client.activity.map(entry => (
                  <div key={entry.id} className="flex items-start gap-3 animate-slide-in">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-1.5 shrink-0"></div>
                    <div>
                      <div className="text-sm text-gray-900">{entry.description}</div>
                      <div className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}