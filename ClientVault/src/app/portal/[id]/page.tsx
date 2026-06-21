'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getClientByShareLink, updateClient, addActivity, saveDocument, getFormById, recalculateStatus } from '@/lib/storage';
import { Client, FormTemplate, FormField, BrandSettings, DEFAULT_BRAND } from '@/lib/types';

export default function ClientPortal() {
  const params = useParams();
  const id = params.id as string;
  const [client, setClient] = useState<Client | null>(null);
  const [form, setForm] = useState<FormTemplate | null>(null);
  const [brand, setBrand] = useState<BrandSettings>(DEFAULT_BRAND);
  const [formValues, setFormValues] = useState<Record<string, string | string[] | boolean>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const c = getClientByShareLink(id);
    if (!c) {
      setError('This link is invalid or has been revoked.');
      return;
    }
    if (c.shareLinkExpires && new Date(c.shareLinkExpires) < new Date()) {
      setExpired(true);
      return;
    }
    setClient(c);
    addActivity(c.id, 'link_accessed', 'Client accessed portal link');
    if (c.formId) {
      const f = getFormById(c.formId);
      if (f) setForm(f);
    }
    // Load brand settings
    try {
      const stored = localStorage.getItem('clientvault_brand');
      if (stored) setBrand({ ...DEFAULT_BRAND, ...JSON.parse(stored) });
    } catch {}
  }, [id]);

  function handleFieldChange(fieldId: string, value: string | string[] | boolean) {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
  }

  function handleFileUpload(fieldId: string, files: FileList | null) {
    if (!files) return;
    setUploadedFiles(prev => ({ ...prev, [fieldId]: Array.from(files) }));
  }

  async function handleSubmit() {
    if (!client || !form) return;
    
    // Validate required fields
    const missingRequired = form.fields
      .filter(f => f.required && f.type !== 'document')
      .filter(f => !formValues[f.id] || (typeof formValues[f.id] === 'string' && !(formValues[f.id] as string).trim()));
    
    if (missingRequired.length > 0) {
      setError(`Please fill in required fields: ${missingRequired.map(f => f.label).join(', ')}`);
      return;
    }

    // Save uploaded files to IndexedDB
    for (const [fieldId, files] of Object.entries(uploadedFiles)) {
      for (const file of files) {
        const reader = new FileReader();
        reader.onload = async () => {
          const docId = crypto.randomUUID();
          await saveDocument({
            id: docId,
            name: file.name,
            type: file.type,
            size: file.size,
            data: reader.result as string,
            clientId: client.id,
          });
        };
        reader.readAsDataURL(file);
      }
    }

    // Save form submission
    const submission = {
      formId: form.id,
      submittedAt: new Date().toISOString(),
      values: formValues,
    };

    const docs = Object.entries(uploadedFiles).flatMap(([fieldId, files]) =>
      files.map(f => ({
        id: crypto.randomUUID(),
        name: f.name,
        type: f.type,
        size: f.size,
        uploadedAt: new Date().toISOString(),
      }))
    );

    const updatedDocs = [...client.documents, ...docs];
    const status = recalculateStatus({ ...client, documents: updatedDocs, formSubmission: submission });

    updateClient(client.id, {
      documents: updatedDocs,
      formSubmission: submission,
      status,
    });
    addActivity(client.id, 'form_submitted', 'Client submitted intake form');

    setSubmitted(true);
  }

  if (error && !client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Link Not Found</h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">⏰</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Link Expired</h2>
          <p className="text-gray-500">This portal link has expired. Please request a new one.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: brand.primaryColor + '10' }}>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Submitted Successfully!</h2>
          <p className="text-gray-500 mb-4">Thank you, {client?.name}. Your information has been received.</p>
          <div className="text-sm text-gray-400">You can close this page.</div>
        </div>
      </div>
    );
  }

  if (!client || !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
      </div>
    );
  }

  const progress = form.fields.length > 0
    ? Math.round(
        (form.fields.filter(f => {
          if (f.type === 'document') return uploadedFiles[f.id]?.length > 0;
          if (f.type === 'checkbox') return formValues[f.id] !== undefined;
          return formValues[f.id] && String(formValues[f.id]).trim() !== '';
        }).length / form.fields.length) * 100
      )
    : 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: brand.primaryColor + '08' }}>
      {/* Branded Header */}
      <header className="bg-white border-b shadow-sm" style={{ borderColor: brand.primaryColor + '30' }}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            {brand.logoData ? (
              <img src={brand.logoData} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: brand.primaryColor }}>
                {brand.businessName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold" style={{ color: brand.primaryColor }}>{brand.businessName}</h1>
              <p className="text-sm text-gray-500">Client Intake Form</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium" style={{ color: brand.primaryColor }}>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: brand.primaryColor }}></div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {form.fields.map((field: FormField) => (
            <div key={field.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.helpText && <p className="text-xs text-gray-500 mb-3">{field.helpText}</p>}
              
              {field.type === 'text' && (
                <input
                  type="text"
                  value={String(formValues[field.id] || '')}
                  onChange={e => handleFieldChange(field.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-indigo-500 text-sm"
                  style={{ '--tw-ring-color': brand.primaryColor } as React.CSSProperties}
                  placeholder={field.helpText || 'Enter text...'}
                />
              )}
              
              {field.type === 'paragraph' && (
                <textarea
                  value={String(formValues[field.id] || '')}
                  onChange={e => handleFieldChange(field.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-indigo-500 text-sm"
                  rows={4}
                  placeholder={field.helpText || 'Enter details...'}
                />
              )}
              
              {field.type === 'document' && (
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.893A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                    </div>
                    <input type="file" className="hidden" multiple onChange={e => handleFileUpload(field.id, e.target.files)} />
                  </label>
                  {uploadedFiles[field.id] && (
                    <div className="mt-2 space-y-1">
                      {uploadedFiles[field.id].map((file, idx) => (
                        <div key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                          <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {field.type === 'checkbox' && (
                <label className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    checked={!!formValues[field.id]}
                    onChange={e => handleFieldChange(field.id, e.target.checked)}
                    className="rounded border-gray-300"
                    style={{ color: brand.primaryColor }}
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
              )}
              
              {field.type === 'dropdown' && field.options && (
                <select
                  value={String(formValues[field.id] || '')}
                  onChange={e => handleFieldChange(field.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-indigo-500 text-sm"
                >
                  <option value="">Select an option...</option>
                  {field.options.map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
              
              {field.type === 'date' && (
                <input
                  type="date"
                  value={String(formValues[field.id] || '')}
                  onChange={e => handleFieldChange(field.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-indigo-500 text-sm"
                />
              )}
              
              {field.type === 'number' && (
                <input
                  type="number"
                  value={String(formValues[field.id] || '')}
                  onChange={e => handleFieldChange(field.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-indigo-500 text-sm"
                  placeholder="Enter a number"
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-6 py-3 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: brand.primaryColor }}
          >
            Submit Information
          </button>
        </div>
      </main>
    </div>
  );
}