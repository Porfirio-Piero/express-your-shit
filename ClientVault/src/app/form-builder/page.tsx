'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getFormTemplates, saveCustomForm, updateCustomForm, deleteCustomForm } from '@/lib/storage';
import { FormTemplate, FormField, FIELD_TYPE_LABELS } from '@/lib/types';

export default function FormBuilder() {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [editingForm, setEditingForm] = useState<FormTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Custom');
  const [fields, setFields] = useState<FormField[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    setTemplates(getFormTemplates());
  }, []);

  function startNew() {
    setEditingForm(null);
    setIsCreating(true);
    setFormName('');
    setFormDescription('');
    setFormCategory('Custom');
    setFields([]);
  }

  function startFromTemplate(template: FormTemplate) {
    setIsCreating(true);
    setEditingForm(null);
    setFormName(template.name + ' (Copy)');
    setFormDescription(template.description);
    setFormCategory(template.category);
    setFields(template.fields.map(f => ({ ...f, id: crypto.randomUUID() })));
    setShowTemplates(false);
  }

  function editTemplate(template: FormTemplate) {
    if (template.isDefault) {
      startFromTemplate(template);
      return;
    }
    setEditingForm(template);
    setIsCreating(true);
    setFormName(template.name);
    setFormDescription(template.description);
    setFormCategory(template.category);
    setFields([...template.fields]);
  }

  function addField(type: FormField['type']) {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: FIELD_TYPE_LABELS[type],
      helpText: '',
      required: false,
      options: type === 'dropdown' ? ['Option 1', 'Option 2'] : undefined,
    };
    setFields([...fields, newField]);
  }

  function updateField(index: number, updates: Partial<FormField>) {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    setFields(updated);
  }

  function removeField(index: number) {
    setFields(fields.filter((_, i) => i !== index));
  }

  function moveField(from: number, to: number) {
    const updated = [...fields];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setFields(updated);
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      moveField(dragIndex, index);
      setDragIndex(index);
    }
  }

  function handleDragEnd() {
    setDragIndex(null);
  }

  function handleSave() {
    if (!formName.trim() || fields.length === 0) return;
    
    if (editingForm && !editingForm.isDefault) {
      updateCustomForm(editingForm.id, {
        name: formName,
        description: formDescription,
        category: formCategory,
        fields,
      });
    } else {
      saveCustomForm({
        name: formName,
        description: formDescription,
        category: formCategory,
        fields,
        isDefault: false,
      });
    }
    
    setIsCreating(false);
    setEditingForm(null);
    setFormTemplates(getFormTemplates());
  }

  function setFormTemplates(newTemplates: FormTemplate[]) {
    setTemplates(newTemplates);
  }

  function handleDeleteForm(id: string) {
    if (!confirm('Delete this form?')) return;
    deleteCustomForm(id);
    setTemplates(getFormTemplates());
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Form Builder</h1>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowTemplates(!showTemplates)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Start from Template
              </button>
              <button onClick={startNew} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                + New Form
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isCreating ? (
          /* Form Editor */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Field Types Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-3">Add Fields</h3>
                <div className="space-y-2">
                  {(Object.entries(FIELD_TYPE_LABELS) as [FormField['type'], string][]).map(([type, label]) => (
                    <button
                      key={type}
                      onClick={() => addField(type)}
                      className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg text-sm hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
                    >
                      <span className="text-gray-400">
                        {type === 'text' && '📝'}
                        {type === 'paragraph' && '📄'}
                        {type === 'document' && '📎'}
                        {type === 'checkbox' && '☑️'}
                        {type === 'dropdown' && '📋'}
                        {type === 'date' && '📅'}
                        {type === 'number' && '🔢'}
                      </span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Canvas */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Form Name *</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="e.g. Design Brief"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={formDescription}
                      onChange={e => setFormDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="What is this form for?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="e.g. Design, Development"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Fields ({fields.length})</h3>
                {fields.length === 0 ? (
                  <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                    <p className="text-gray-400 mb-2">Add fields from the sidebar</p>
                    <p className="text-sm text-gray-300">Drag to reorder</p>
                  </div>
                ) : (
                  fields.map((field, index) => (
                    <div
                      key={field.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={e => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white rounded-xl border border-gray-200 p-4 cursor-grab transition-all ${
                        dragIndex === index ? 'opacity-50 scale-[0.98]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col gap-1 pt-1">
                          <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="6" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="18" r="2"/></svg>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                              {FIELD_TYPE_LABELS[field.type]}
                            </span>
                            <input
                              type="text"
                              value={field.label}
                              onChange={e => updateField(index, { label: e.target.value })}
                              className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-indigo-500"
                              placeholder="Field label"
                            />
                            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={e => updateField(index, { required: e.target.checked })}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              Required
                            </label>
                            <button onClick={() => removeField(index)} className="text-red-400 hover:text-red-600 transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                          <input
                            type="text"
                            value={field.helpText}
                            onChange={e => updateField(index, { helpText: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-gray-500 focus:ring-1 focus:ring-indigo-500"
                            placeholder="Help text (optional)"
                          />
                          {field.type === 'dropdown' && field.options && (
                            <div className="space-y-1">
                              {field.options.map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={e => {
                                      const newOpts = [...field.options!];
                                      newOpts[optIdx] = e.target.value;
                                      updateField(index, { options: newOpts });
                                    }}
                                    className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-indigo-500"
                                  />
                                  <button
                                    onClick={() => {
                                      const newOpts = field.options!.filter((_, i) => i !== optIdx);
                                      updateField(index, { options: newOpts });
                                    }}
                                    className="text-gray-300 hover:text-red-500"
                                  >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const newOpts = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
                                  updateField(index, { options: newOpts });
                                }}
                                className="text-xs text-indigo-600 hover:text-indigo-800"
                              >
                                + Add option
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {fields.length > 0 && formName.trim() && (
                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                    Save Form
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Template List */
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Form Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map(template => (
                <div key={template.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                    </div>
                    {template.isDefault && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Default</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    <span>{template.fields.length} fields</span>
                    <span>{template.fields.filter(f => f.required).length} required</span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded">{template.category}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => startFromTemplate(template)} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-md text-xs font-medium hover:bg-indigo-100 transition-colors">
                      Use Template
                    </button>
                    {!template.isDefault && (
                      <>
                        <button onClick={() => editTemplate(template)} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md text-xs font-medium transition-colors">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteForm(template.id)} className="px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-md text-xs font-medium transition-colors">
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Template Picker Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTemplates(false)}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto animate-fade-in" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Start from Template</h2>
              <div className="space-y-3">
                {templates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => startFromTemplate(template)}
                    className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{template.description}</div>
                    <div className="text-xs text-gray-400 mt-2">{template.fields.length} fields · {template.category}</div>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowTemplates(false)} className="mt-4 w-full py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">Cancel</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}