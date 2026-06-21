'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBrandSettings, saveBrandSettings, getClients } from '@/lib/storage';
import { BrandSettings, DEFAULT_BRAND } from '@/lib/types';

export default function SettingsPage() {
  const [brand, setBrand] = useState<BrandSettings>(DEFAULT_BRAND);
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setBrand(getBrandSettings());
  }, []);

  function handleSave() {
    saveBrandSettings(brand);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBrand(prev => ({ ...prev, logoData: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }

  async function handleExportCSV() {
    setExporting(true);
    try {
      const Papa = (await import('papaparse')).default;
      const clients = getClients();
      const data = clients.map(c => ({
        Name: c.name,
        Email: c.email,
        ProjectType: c.projectType,
        Status: c.status,
        CreatedAt: c.createdAt,
        Deadline: c.deadline,
        Documents: c.documents.filter(d => d.uploadedAt).length,
        FormSubmitted: c.formSubmission ? 'Yes' : 'No',
      }));
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clientvault-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV export failed:', err);
    }
    setExporting(false);
  }

  async function handleExportPDF() {
    setExporting(true);
    try {
      const clients = getClients();
      const content = `
        <html>
        <head><title>ClientVault Export</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: ${brand.primaryColor}; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 14px; }
          th { background: ${brand.primaryColor}22; }
          .status-complete { color: #059669; }
          .status-pending { color: #d97706; }
          .status-overdue { color: #dc2626; }
        </style>
        </head>
        <body>
          <h1>${brand.businessName} — Client Report</h1>
          <p>Exported on ${new Date().toLocaleDateString()}</p>
          <table>
            <tr><th>Name</th><th>Email</th><th>Project</th><th>Status</th><th>Documents</th><th>Form</th></tr>
            ${clients.map(c => `
              <tr>
                <td>${c.name}</td>
                <td>${c.email}</td>
                <td>${c.projectType}</td>
                <td class="status-${c.status}">${c.status.toUpperCase()}</td>
                <td>${c.documents.filter(d => d.uploadedAt).length}</td>
                <td>${c.formSubmission ? '✓' : '—'}</td>
              </tr>
            `).join('')}
          </table>
        </body>
        </html>
      `;
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.createElement('div');
      element.innerHTML = content;
      document.body.appendChild(element);
      await html2pdf().set({
        margin: 10,
        filename: `clientvault-export-${new Date().toISOString().split('T')[0]}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).from(element).save();
      document.body.removeChild(element);
    } catch (err) {
      console.error('PDF export failed:', err);
      // Fallback: open HTML in new tab
      const clients = getClients();
      const blob = new Blob([content(clients)], { type: 'text/html' });
      window.open(URL.createObjectURL(blob));
    }
    setExporting(false);
  }

  function content(clients: any[]) {
    return `<html><head><title>ClientVault Export</title></head><body><h1>${brand.businessName} Export</h1><p>${new Date().toLocaleDateString()}</p></body></html>`;
  }

  function handleClearAll() {
    if (!confirm('Are you sure? This will delete ALL client data, forms, and settings. This cannot be undone.')) return;
    if (!confirm('Really? Type "DELETE" in the next prompt to confirm.')) return;
    localStorage.removeItem('clientvault_clients');
    localStorage.removeItem('clientvault_brand');
    localStorage.removeItem('clientvault_custom_forms');
    setBrand(DEFAULT_BRAND);
    alert('All data has been cleared.');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Brand Settings */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Brand Customization</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                value={brand.businessName}
                onChange={e => setBrand(prev => ({ ...prev, businessName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brand.primaryColor}
                    onChange={e => setBrand(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brand.primaryColor}
                    onChange={e => setBrand(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brand.secondaryColor}
                    onChange={e => setBrand(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brand.secondaryColor}
                    onChange={e => setBrand(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
              {brand.logoData && (
                <div className="mb-2">
                  <img src={brand.logoData} alt="Logo" className="w-16 h-16 rounded-lg object-cover" />
                </div>
              )}
              <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer inline-block">
                Upload Logo
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
              <div className="p-4 rounded-lg border" style={{ backgroundColor: brand.primaryColor + '08', borderColor: brand.primaryColor + '30' }}>
                <div className="flex items-center gap-3">
                  {brand.logoData ? (
                    <img src={brand.logoData} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: brand.primaryColor }}>
                      {brand.businessName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-bold" style={{ color: brand.primaryColor }}>{brand.businessName}</div>
                    <div className="text-xs text-gray-500">Client Intake Portal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Link Settings */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Link Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Expiration</label>
              <select
                value={brand.linkExpirationDays}
                onChange={e => setBrand(prev => ({ ...prev, linkExpirationDays: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={0}>Never expires</option>
              </select>
            </div>
          </div>
        </section>

        {/* Export */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h2>
          <p className="text-sm text-gray-500 mb-4">Export your client data in CSV or PDF format.</p>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {exporting ? 'Exporting...' : 'Export PDF'}
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-white rounded-xl border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-4">Permanently delete all data. This cannot be undone.</p>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Clear All Data
          </button>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            {saved ? '✓ Saved!' : 'Save Settings'}
          </button>
        </div>
      </main>
    </div>
  );
}