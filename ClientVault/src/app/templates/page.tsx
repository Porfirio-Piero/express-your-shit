'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getFormTemplates, saveCustomForm, deleteCustomForm } from '@/lib/storage';
import { FormTemplate, DEFAULT_TEMPLATES } from '@/lib/types';

export default function TemplatesLibrary() {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setTemplates(getFormTemplates());
  }, []);

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];
  const filtered = filter === 'all' ? templates : templates.filter(t => t.category === filter);

  function handleDelete(id: string) {
    if (!confirm('Delete this template?')) return;
    deleteCustomForm(id);
    setTemplates(getFormTemplates());
  }

  const categoryIcons: Record<string, string> = {
    Design: '🎨',
    Development: '💻',
    Marketing: '📣',
    Consulting: '💼',
    Custom: '✏️',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Templates Library</h1>
            </div>
            <Link href="/form-builder" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              Create Custom
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === cat ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {cat === 'all' ? '📋 All' : `${categoryIcons[cat] || '📁'} ${cat}`}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(template => (
            <div key={template.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow animate-fade-in">
              {/* Header */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{categoryIcons[template.category] || '📁'}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <span className="text-xs text-gray-400">{template.category}</span>
                    </div>
                  </div>
                  {template.isDefault && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Default</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">{template.description}</p>
                
                {/* Field Summary */}
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                  <span>{template.fields.length} fields</span>
                  <span>{template.fields.filter(f => f.required).length} required</span>
                  <span className="flex gap-1">
                    {Array.from(new Set(template.fields.map(f => f.type))).slice(0, 3).map(type => (
                      <span key={type} className="px-1.5 py-0.5 bg-gray-100 rounded">{type}</span>
                    ))}
                  </span>
                </div>
              </div>

              {/* Expand/Collapse */}
              <button
                onClick={() => setExpandedId(expandedId === template.id ? null : template.id)}
                className="w-full px-5 py-2 text-xs text-indigo-600 hover:bg-gray-50 border-t border-gray-100 transition-colors"
              >
                {expandedId === template.id ? '▲ Hide fields' : '▼ Show fields'}
              </button>

              {/* Expanded Fields */}
              {expandedId === template.id && (
                <div className="px-5 pb-4 border-t border-gray-100">
                  <div className="space-y-2 mt-3">
                    {template.fields.map(field => (
                      <div key={field.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">
                            {field.type === 'text' && '📝'}
                            {field.type === 'paragraph' && '📄'}
                            {field.type === 'document' && '📎'}
                            {field.type === 'checkbox' && '☑️'}
                            {field.type === 'dropdown' && '📋'}
                            {field.type === 'date' && '📅'}
                            {field.type === 'number' && '🔢'}
                          </span>
                          <span className="text-gray-700">{field.label}</span>
                        </div>
                        {field.required && <span className="text-xs text-red-400">Required</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="px-5 pb-4 flex gap-2">
                <Link
                  href={`/form-builder`}
                  className="flex-1 text-center px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-md text-xs font-medium hover:bg-indigo-100 transition-colors"
                  onClick={() => {
                    localStorage.setItem('clientvault_use_template', template.id);
                  }}
                >
                  Use Template
                </Link>
                {!template.isDefault && (
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-md text-xs font-medium transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-indigo-50 rounded-xl p-6 border border-indigo-100">
          <h3 className="font-semibold text-indigo-900 mb-2">About Templates</h3>
          <ul className="text-sm text-indigo-700 space-y-1">
            <li>• Default templates are pre-built for common freelancer workflows</li>
            <li>• You can copy any template and customize it in the Form Builder</li>
            <li>• Custom templates appear with a {categoryIcons.Custom} icon and can be edited or deleted</li>
            <li>• Templates can be assigned to clients for their intake form</li>
          </ul>
        </div>
      </main>
    </div>
  );
}