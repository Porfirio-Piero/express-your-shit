'use client';

import { useState, useEffect } from 'react';
import { 
  Home, Wrench, DollarSign, Bell, Plus, Check, Clock, 
  AlertTriangle, Trash2, Edit2, X, Building2, Calendar,
  TrendingUp, Users, Sparkles, ChevronRight, Settings,
  LayoutDashboard, Building, FileText, BarChart3,
  Flame, Droplets, Zap, Shield, TreeDeciduous, LucideIcon
} from 'lucide-react';

// Types
interface Property {
  id: string;
  name: string;
  address: string;
  units: number;
  createdAt: string;
}

interface MaintenanceTask {
  id: string;
  propertyId: string;
  name: string;
  category: 'hvac' | 'plumbing' | 'electrical' | 'exterior' | 'safety' | 'other';
  frequency: 'monthly' | 'quarterly' | 'semiannually' | 'annually';
  nextDue: string;
  lastCompleted: string | null;
  estimatedCost: number;
  notes: string;
}

interface Expense {
  id: string;
  taskId: string;
  propertyId: string;
  amount: number;
  date: string;
  vendor: string;
  notes: string;
}

// Task Templates
const TASK_TEMPLATES: Omit<MaintenanceTask, 'id' | 'propertyId' | 'nextDue' | 'lastCompleted'>[] = [
  { name: 'Replace HVAC air filter', category: 'hvac', frequency: 'quarterly', estimatedCost: 25, notes: 'Check filter size before purchasing' },
  { name: 'Schedule HVAC inspection', category: 'hvac', frequency: 'annually', estimatedCost: 150, notes: 'Professional inspection recommended' },
  { name: 'Clean gutters', category: 'exterior', frequency: 'semiannually', estimatedCost: 0, notes: 'Spring and fall' },
  { name: 'Test smoke detectors', category: 'safety', frequency: 'quarterly', estimatedCost: 0, notes: 'Press test button on all detectors' },
  { name: 'Replace smoke detector batteries', category: 'safety', frequency: 'annually', estimatedCost: 15, notes: 'Use 9V batteries' },
  { name: 'Flush water heater', category: 'plumbing', frequency: 'annually', estimatedCost: 0, notes: 'Drain and flush to remove sediment' },
  { name: 'Check carbon monoxide detectors', category: 'safety', frequency: 'quarterly', estimatedCost: 0, notes: 'Test and check expiration date' },
  { name: 'Inspect fire extinguisher', category: 'safety', frequency: 'annually', estimatedCost: 0, notes: 'Check pressure gauge and expiration' },
  { name: 'Clean dryer vents', category: 'safety', frequency: 'annually', estimatedCost: 0, notes: 'Prevent fire hazard' },
  { name: 'Check caulk/grout', category: 'plumbing', frequency: 'annually', estimatedCost: 25, notes: 'Re-caulk if cracked' },
];

const CATEGORY_STYLES: Record<string, { icon: LucideIcon; color: string; bg: string; label: string }> = {
  hvac: { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'HVAC' },
  plumbing: { icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Plumbing' },
  electrical: { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Electrical' },
  exterior: { icon: TreeDeciduous, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Exterior' },
  safety: { icon: Shield, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Safety' },
  other: { icon: Wrench, color: 'text-gray-500', bg: 'bg-gray-500/10', label: 'Other' },
};

// Storage helpers
const STORAGE_KEYS = {
  properties: 'landlordminder_properties',
  tasks: 'landlordminder_tasks',
  expenses: 'landlordminder_expenses',
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function calculateNextDue(lastCompleted: string | null, frequency: string): string {
  const base = lastCompleted ? new Date(lastCompleted) : new Date();
  const next = new Date(base);
  
  switch (frequency) {
    case 'monthly': next.setMonth(next.getMonth() + 1); break;
    case 'quarterly': next.setMonth(next.getMonth() + 3); break;
    case 'semiannually': next.setMonth(next.getMonth() + 6); break;
    case 'annually': next.setFullYear(next.getFullYear() + 1); break;
  }
  
  return next.toISOString().split('T')[0];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getTaskStatus(daysUntil: number): 'overdue' | 'soon' | 'upcoming' | 'ok' {
  if (daysUntil < 0) return 'overdue';
  if (daysUntil <= 7) return 'soon';
  if (daysUntil <= 30) return 'upcoming';
  return 'ok';
}

export default function LandlordMinder() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'properties' | 'tasks' | 'expenses'>('dashboard');
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [completingTask, setCompletingTask] = useState<MaintenanceTask | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Form states
  const [propertyForm, setPropertyForm] = useState({ name: '', address: '', units: 1 });
  const [taskForm, setTaskForm] = useState({ 
    name: '', 
    category: 'hvac' as MaintenanceTask['category'], 
    frequency: 'quarterly' as MaintenanceTask['frequency'],
    estimatedCost: 0,
    notes: ''
  });
  const [expenseForm, setExpenseForm] = useState({ amount: 0, vendor: '', notes: '' });
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  // Load data from localStorage
  useEffect(() => {
    setMounted(true);
    setProperties(loadFromStorage(STORAGE_KEYS.properties, []));
    setTasks(loadFromStorage(STORAGE_KEYS.tasks, []));
    setExpenses(loadFromStorage(STORAGE_KEYS.expenses, []));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (mounted) saveToStorage(STORAGE_KEYS.properties, properties);
  }, [properties, mounted]);

  useEffect(() => {
    if (mounted) saveToStorage(STORAGE_KEYS.tasks, tasks);
  }, [tasks, mounted]);

  useEffect(() => {
    if (mounted) saveToStorage(STORAGE_KEYS.expenses, expenses);
  }, [expenses, mounted]);

  // Property CRUD
  const handleAddProperty = () => {
    if (!propertyForm.name.trim()) return;
    const newProperty: Property = {
      id: generateId(),
      ...propertyForm,
      createdAt: new Date().toISOString(),
    };
    setProperties([...properties, newProperty]);
    setPropertyForm({ name: '', address: '', units: 1 });
    setShowPropertyModal(false);
  };

  const handleUpdateProperty = () => {
    if (!editingProperty) return;
    setProperties(properties.map(p => p.id === editingProperty.id ? { ...editingProperty, ...propertyForm } : p));
    setEditingProperty(null);
    setPropertyForm({ name: '', address: '', units: 1 });
    setShowPropertyModal(false);
  };

  const handleDeleteProperty = (id: string) => {
    setProperties(properties.filter(p => p.id !== id));
    setTasks(tasks.filter(t => t.propertyId !== id));
    setExpenses(expenses.filter(e => e.propertyId !== id));
  };

  // Task CRUD
  const handleAddTask = () => {
    if (!taskForm.name.trim() || !selectedPropertyId) return;
    const newTask: MaintenanceTask = {
      id: generateId(),
      propertyId: selectedPropertyId,
      ...taskForm,
      nextDue: calculateNextDue(null, taskForm.frequency),
      lastCompleted: null,
    };
    setTasks([...tasks, newTask]);
    setTaskForm({ name: '', category: 'hvac', frequency: 'quarterly', estimatedCost: 0, notes: '' });
    setShowTaskModal(false);
  };

  const handleAddTemplateTasks = () => {
    if (!selectedPropertyId || selectedTemplates.length === 0) return;
    const newTasks = selectedTemplates.map(templateName => {
      const template = TASK_TEMPLATES.find(t => t.name === templateName);
      if (!template) return null;
      return {
        id: generateId(),
        propertyId: selectedPropertyId,
        ...template,
        nextDue: calculateNextDue(null, template.frequency),
        lastCompleted: null,
      };
    }).filter(Boolean) as MaintenanceTask[];
    
    setTasks([...tasks, ...newTasks]);
    setSelectedTemplates([]);
    setShowTaskModal(false);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleCompleteTask = () => {
    if (!completingTask) return;
    const now = new Date().toISOString();
    setTasks(tasks.map(t => 
      t.id === completingTask.id 
        ? { ...t, lastCompleted: now, nextDue: calculateNextDue(now, t.frequency) }
        : t
    ));
    
    if (expenseForm.amount > 0) {
      const newExpense: Expense = {
        id: generateId(),
        taskId: completingTask.id,
        propertyId: completingTask.propertyId,
        ...expenseForm,
        date: now,
      };
      setExpenses([...expenses, newExpense]);
    }
    
    setCompletingTask(null);
    setExpenseForm({ amount: 0, vendor: '', notes: '' });
    setShowExpenseModal(false);
  };

  // Calculations
  const overdueTasks = tasks.filter(t => getDaysUntil(t.nextDue) < 0);
  const upcomingTasks = tasks.filter(t => {
    const days = getDaysUntil(t.nextDue);
    return days >= 0 && days <= 7;
  });
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const getPropertyTaskStatus = (propertyId: string) => {
    const propertyTasks = tasks.filter(t => t.propertyId === propertyId);
    if (propertyTasks.some(t => getDaysUntil(t.nextDue) < 0)) return 'overdue';
    if (propertyTasks.some(t => getDaysUntil(t.nextDue) <= 7)) return 'soon';
    return 'ok';
  };

  const getPropertyExpenses = (propertyId: string) => {
    return expenses.filter(e => e.propertyId === propertyId).reduce((sum, e) => sum + e.amount, 0);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">LandlordMinder</h1>
                <p className="text-xs text-slate-400 hidden sm:block">Property Maintenance Tracker</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {overdueTasks.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">{overdueTasks.length} overdue</span>
                </div>
              )}
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Bell className="w-5 h-5 text-slate-400" />
              </button>
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Settings className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-16 z-40 backdrop-blur-xl bg-slate-900/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'properties', label: 'Properties', icon: Building },
              { id: 'tasks', label: 'Tasks', icon: Wrench },
              { id: 'expenses', label: 'Expenses', icon: DollarSign },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-800/50 border border-white/10 p-6 hover:border-violet-500/50 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-xl bg-violet-500/10">
                      <Building className="w-5 h-5 text-violet-400" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">{properties.length}</p>
                  <p className="text-sm text-slate-400 mt-1">Properties</p>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-800/50 border border-white/10 p-6 hover:border-emerald-500/50 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-xl bg-emerald-500/10">
                      <Wrench className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{tasks.length}</p>
                  <p className="text-sm text-slate-400 mt-1">Total Tasks</p>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-800/50 border border-white/10 p-6 hover:border-red-500/50 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-xl bg-red-500/10">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    {overdueTasks.length > 0 && (
                      <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                  </div>
                  <p className="text-3xl font-bold text-white">{overdueTasks.length}</p>
                  <p className="text-sm text-slate-400 mt-1">Overdue</p>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-800/50 border border-white/10 p-6 hover:border-amber-500/50 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-xl bg-amber-500/10">
                      <DollarSign className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="text-xs text-amber-400">YTD</span>
                  </div>
                  <p className="text-3xl font-bold text-white">${totalExpenses.toLocaleString()}</p>
                  <p className="text-sm text-slate-400 mt-1">Expenses</p>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {overdueTasks.length > 0 && (
              <div className="rounded-2xl bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/20 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-red-500/20">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="font-semibold text-red-400">Overdue Tasks</h3>
                </div>
                <div className="space-y-2">
                  {overdueTasks.slice(0, 3).map(task => {
                    const property = properties.find(p => p.id === task.propertyId);
                    const days = Math.abs(getDaysUntil(task.nextDue));
                    return (
                      <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
                        <div>
                          <p className="font-medium text-white">{task.name}</p>
                          <p className="text-sm text-slate-400">{property?.name} • {days} days overdue</p>
                        </div>
                        <button
                          onClick={() => {
                            setCompletingTask(task);
                            setShowExpenseModal(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                        >
                          Complete
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {upcomingTasks.length > 0 && (
              <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-amber-500/20">
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="font-semibold text-amber-400">Due This Week</h3>
                </div>
                <div className="space-y-2">
                  {upcomingTasks.slice(0, 3).map(task => {
                    const property = properties.find(p => p.id === task.propertyId);
                    const days = getDaysUntil(task.nextDue);
                    return (
                      <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
                        <div>
                          <p className="font-medium text-white">{task.name}</p>
                          <p className="text-sm text-slate-400">{property?.name} • Due in {days} days</p>
                        </div>
                        <button
                          onClick={() => {
                            setCompletingTask(task);
                            setShowExpenseModal(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
                        >
                          Complete
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-800/50 border border-white/10 p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  Quick Actions
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditingProperty(null);
                      setPropertyForm({ name: '', address: '', units: 1 });
                      setShowPropertyModal(true);
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Property
                  </button>
                  <button
                    onClick={() => {
                      if (properties.length === 0) {
                        alert('Please add a property first');
                        return;
                      }
                      setSelectedPropertyId(properties[0].id);
                      setShowTaskModal(true);
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Task
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-800/50 border border-white/10 p-6">
                <h3 className="font-semibold text-white mb-4">Getting Started</h3>
                {properties.length === 0 ? (
                  <p className="text-slate-400 text-sm">Start by adding your first property to track maintenance tasks.</p>
                ) : tasks.length === 0 ? (
                  <p className="text-slate-400 text-sm">Great! Now add maintenance tasks for your properties.</p>
                ) : (
                  <p className="text-slate-400 text-sm">You have {tasks.length} tasks scheduled. Keep up the good work!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Properties</h2>
                <p className="text-slate-400 text-sm mt-1">Manage your rental properties</p>
              </div>
              <button
                onClick={() => {
                  setEditingProperty(null);
                  setPropertyForm({ name: '', address: '', units: 1 });
                  setShowPropertyModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Property
              </button>
            </div>

            {properties.length === 0 ? (
              <div className="text-center py-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-800/50 border border-white/10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Building className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No properties yet</h3>
                <p className="text-slate-400 mb-6">Add your first property to start tracking maintenance</p>
                <button
                  onClick={() => setShowPropertyModal(true)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Add Your First Property
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map(property => {
                  const status = getPropertyTaskStatus(property.id);
                  const taskCount = tasks.filter(t => t.propertyId === property.id).length;
                  const expenseTotal = getPropertyExpenses(property.id);
                  
                  return (
                    <div key={property.id} className="group rounded-2xl bg-gradient-to-br from-slate-800 to-slate-800/50 border border-white/10 p-6 hover:border-violet-500/50 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-white text-lg">{property.name}</h3>
                          <p className="text-sm text-slate-400">{property.address}</p>
                          <p className="text-xs text-slate-500 mt-1">{property.units} unit{property.units > 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingProperty(property);
                              setPropertyForm({ name: property.name, address: property.address, units: property.units });
                              setShowPropertyModal(true);
                            }}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-slate-400" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this property? This will also delete all associated tasks.')) {
                                handleDeleteProperty(property.id);
                              }
                            }}
                            className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Tasks</span>
                          <span className="font-medium text-white">{taskCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Expenses</span>
                          <span className="font-medium text-white">${expenseTotal.toLocaleString()}</span>
                        </div>
                        <div className="pt-2">
                          {status === 'overdue' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                              Overdue tasks
                            </span>
                          )}
                          {status === 'soon' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              Tasks due soon
                            </span>
                          )}
                          {status === 'ok' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Up to date
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Maintenance Tasks</h2>
                <p className="text-slate-400 text-sm mt-1">Track recurring maintenance</p>
              </div>
              <button
                onClick={() => {
                  if (properties.length === 0) {
                    alert('Please add a property first');
                    return;
                  }
                  setSelectedPropertyId(properties[0].id);
                  setShowTaskModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-800/50 border border-white/10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Wrench className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No tasks scheduled</h3>
                <p className="text-slate-400 mb-6">Add maintenance tasks to track recurring work</p>
                {properties.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedPropertyId(properties[0].id);
                      setShowTaskModal(true);
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    Add Your First Task
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map(task => {
                  const property = properties.find(p => p.id === task.propertyId);
                  const days = getDaysUntil(task.nextDue);
                  const status = getTaskStatus(days);
                  const categoryStyle = CATEGORY_STYLES[task.category] || CATEGORY_STYLES.other;
                  const CategoryIcon = categoryStyle.icon;
                  
                  return (
                    <div key={task.id} className="group rounded-2xl bg-gradient-to-br from-slate-800 to-slate-800/50 border border-white/10 p-4 hover:border-violet-500/50 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${categoryStyle.bg}`}>
                            <CategoryIcon className={`w-5 h-5 ${categoryStyle.color}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium text-white">{task.name}</h3>
                              {status === 'overdue' && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                  {Math.abs(days)} days overdue
                                </span>
                              )}
                              {status === 'soon' && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  Due in {days} days
                                </span>
                              )}
                              {status === 'upcoming' && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                  {formatDate(task.nextDue)}
                                </span>
                              )}
                              {status === 'ok' && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  {formatDate(task.nextDue)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-400 mt-0.5">
                              {property?.name || 'Unknown property'} • {task.frequency} • Est. ${task.estimatedCost}
                            </p>
                            {task.notes && <p className="text-xs text-slate-500 mt-1">{task.notes}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setCompletingTask(task);
                              setShowExpenseModal(true);
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Complete
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this task?')) {
                                handleDeleteTask(task.id);
                              }
                            }}
                            className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-bold text-white">Maintenance Expenses</h2>
              <p className="text-slate-400 text-sm mt-1">Track your maintenance costs</p>
            </div>
            
            {expenses.length === 0 ? (
              <div className="text-center py-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-800/50 border border-white/10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No expenses logged</h3>
                <p className="text-slate-400">Expenses are logged when you complete maintenance tasks</p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-400">Total YTD Expenses</p>
                      <p className="text-4xl font-bold text-white mt-1">${totalExpenses.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-500/10">
                      <BarChart3 className="w-8 h-8 text-amber-400" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {expenses.map(expense => {
                    const task = tasks.find(t => t.id === expense.taskId);
                    const property = properties.find(p => p.id === expense.propertyId);
                    
                    return (
                      <div key={expense.id} className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-800/50 border border-white/10 p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xl font-bold text-white">${expense.amount.toLocaleString()}</p>
                            <p className="text-sm text-slate-400 mt-1">{task?.name || 'Unknown task'}</p>
                            <p className="text-xs text-slate-500">{property?.name || 'Unknown property'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-400">{formatDate(expense.date)}</p>
                            {expense.vendor && <p className="text-xs text-slate-500 mt-1">{expense.vendor}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Property Modal */}
      {showPropertyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => {
            setShowPropertyModal(false);
            setEditingProperty(null);
            setPropertyForm({ name: '', address: '', units: 1 });
          }} />
          <div className="relative w-full max-w-md rounded-2xl bg-slate-800 border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                {editingProperty ? 'Edit Property' : 'Add Property'}
              </h3>
              <button
                onClick={() => {
                  setShowPropertyModal(false);
                  setEditingProperty(null);
                  setPropertyForm({ name: '', address: '', units: 1 });
                }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Property Name</label>
                <input
                  type="text"
                  value={propertyForm.name}
                  onChange={(e) => setPropertyForm({ ...propertyForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  placeholder="e.g., 123 Main St Apartment"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
                <input
                  type="text"
                  value={propertyForm.address}
                  onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  placeholder="e.g., 123 Main St, City, State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Number of Units</label>
                <input
                  type="number"
                  value={propertyForm.units}
                  onChange={(e) => setPropertyForm({ ...propertyForm, units: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  min="1"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowPropertyModal(false);
                    setEditingProperty(null);
                    setPropertyForm({ name: '', address: '', units: 1 });
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingProperty ? handleUpdateProperty : handleAddProperty}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
                >
                  {editingProperty ? 'Save Changes' : 'Add Property'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => {
            setShowTaskModal(false);
            setTaskForm({ name: '', category: 'hvac', frequency: 'quarterly', estimatedCost: 0, notes: '' });
            setSelectedTemplates([]);
          }} />
          <div className="relative w-full max-w-md rounded-2xl bg-slate-800 border border-white/10 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Add Maintenance Task</h3>
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setTaskForm({ name: '', category: 'hvac', frequency: 'quarterly', estimatedCost: 0, notes: '' });
                  setSelectedTemplates([]);
                }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Property</label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                >
                  <option value="">Select a property</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-white/10 pt-4">
                <label className="block text-sm font-medium text-slate-300 mb-3">Quick Add from Templates</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {TASK_TEMPLATES.map((template, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 hover:bg-slate-900 transition-colors cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedTemplates.includes(template.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTemplates([...selectedTemplates, template.name]);
                          } else {
                            setSelectedTemplates(selectedTemplates.filter(t => t !== template.name));
                          }
                        }}
                        className="w-4 h-4 rounded border-white/20 bg-slate-900 text-violet-500 focus:ring-violet-500 focus:ring-offset-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{template.name}</p>
                        <p className="text-xs text-slate-500">{template.frequency} • ${template.estimatedCost}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {selectedTemplates.length > 0 && (
                  <button
                    onClick={handleAddTemplateTasks}
                    disabled={!selectedPropertyId}
                    className="w-full mt-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add {selectedTemplates.length} Template{selectedTemplates.length > 1 ? 's' : ''}
                  </button>
                )}
              </div>

              <div className="border-t border-white/10 pt-4">
                <label className="block text-sm font-medium text-slate-300 mb-3">Or Create Custom Task</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={taskForm.name}
                    onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder="Task name"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={taskForm.category}
                      onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value as MaintenanceTask['category'] })}
                      className="px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    >
                      <option value="hvac">HVAC</option>
                      <option value="plumbing">Plumbing</option>
                      <option value="electrical">Electrical</option>
                      <option value="exterior">Exterior</option>
                      <option value="safety">Safety</option>
                      <option value="other">Other</option>
                    </select>
                    <select
                      value={taskForm.frequency}
                      onChange={(e) => setTaskForm({ ...taskForm, frequency: e.target.value as MaintenanceTask['frequency'] })}
                      className="px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="semiannually">Semiannually</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={taskForm.estimatedCost || ''}
                      onChange={(e) => setTaskForm({ ...taskForm, estimatedCost: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      placeholder="Est. cost"
                    />
                  </div>
                  <textarea
                    value={taskForm.notes}
                    onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                    placeholder="Notes (optional)"
                    rows={2}
                  />
                  <button
                    onClick={handleAddTask}
                    disabled={!taskForm.name.trim() || !selectedPropertyId}
                    className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Custom Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Task Modal */}
      {showExpenseModal && completingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => {
            setShowExpenseModal(false);
            setCompletingTask(null);
            setExpenseForm({ amount: 0, vendor: '', notes: '' });
          }} />
          <div className="relative w-full max-w-md rounded-2xl bg-slate-800 border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Complete Task</h3>
              <button
                onClick={() => {
                  setShowExpenseModal(false);
                  setCompletingTask(null);
                  setExpenseForm({ amount: 0, vendor: '', notes: '' });
                }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
                <p className="font-medium text-white">{completingTask.name}</p>
                <p className="text-sm text-slate-400 mt-1">
                  {properties.find(p => p.id === completingTask.propertyId)?.name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Expense Amount (optional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    value={expenseForm.amount || ''}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              {expenseForm.amount > 0 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Vendor (optional)</label>
                    <input
                      type="text"
                      value={expenseForm.vendor}
                      onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      placeholder="e.g., ABC Plumbing"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Notes (optional)</label>
                    <textarea
                      value={expenseForm.notes}
                      onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                      rows={2}
                      placeholder="Any notes about this expense"
                    />
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowExpenseModal(false);
                    setCompletingTask(null);
                    setExpenseForm({ amount: 0, vendor: '', notes: '' });
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteTask}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Mark Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}