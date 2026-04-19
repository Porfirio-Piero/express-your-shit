'use client';

import { useState, useEffect } from 'react';
import { Settings, getSettings, saveSettings, defaultSettings } from '@/lib/storage';

export default function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (key: keyof Settings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Name</h3>
        <input
          type="text"
          value={settings.yourName}
          onChange={(e) => handleChange('yourName', e.target.value)}
          placeholder="Your name for email signatures"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">
          This name will appear in email template signatures
        </p>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Reminder Schedule</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.reminderDay7Enabled}
              onChange={(e) => handleChange('reminderDay7Enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700">Day 7 - Friendly Reminder</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.reminderDay14Enabled}
              onChange={(e) => handleChange('reminderDay14Enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700">Day 14 - Firm Reminder</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.reminderDay21Enabled}
              onChange={(e) => handleChange('reminderDay21Enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700">Day 21 - Final Notice</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Email Templates</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day 7 Template
            </label>
            <textarea
              value={settings.customTemplateDay7 || ''}
              onChange={(e) => handleChange('customTemplateDay7', e.target.value)}
              placeholder="Leave empty for default template"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Placeholders: {`{client_name}, {invoice_number}, {amount}, {due_date}, {days_overdue}, {your_name}`}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day 14 Template
            </label>
            <textarea
              value={settings.customTemplateDay14 || ''}
              onChange={(e) => handleChange('customTemplateDay14', e.target.value)}
              placeholder="Leave empty for default template"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day 21 Template
            </label>
            <textarea
              value={settings.customTemplateDay21 || ''}
              onChange={(e) => handleChange('customTemplateDay21', e.target.value)}
              placeholder="Leave empty for default template"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
        >
          Save Settings
        </button>
        {saved && <span className="text-green-600 text-sm">✓ Settings saved!</span>}
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Management</h3>
        <p className="text-sm text-gray-600 mb-4">
          All data is stored in your browser&apos;s local storage. Clearing your browser data will remove all invoices.
        </p>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to export all invoices as JSON?')) {
              const data = localStorage.getItem('invoicechaser_invoices');
              const blob = new Blob([data || '[]'], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `invoicechaser-backup-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }
          }}
          className="text-sm text-blue-600 hover:text-blue-700 mr-4"
        >
          Export Data
        </button>
      </div>
    </div>
  );
}