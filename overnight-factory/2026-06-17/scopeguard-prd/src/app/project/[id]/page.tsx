'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProject, getChangeOrders, getProjectStats, updateProject, createApprovalLink, createChangeOrder, deleteProject } from '@/lib/store';
import { Project, ChangeOrder } from '@/lib/types';
import { formatCurrency, formatDate, formatDateTime, getCreepLevel, getStatusBadge, getCOStatusBadge } from '@/lib/utils';

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getProjectStats>>(null);
  const [loaded, setLoaded] = useState(false);
  const [showAddDeliverable, setShowAddDeliverable] = useState(false);
  const [showAddExclusion, setShowAddExclusion] = useState(false);
  const [showNewCO, setShowNewCO] = useState(false);
  const [newDeliverable, setNewDeliverable] = useState({ description: '', estimatedHours: 0 });
  const [newExclusion, setNewExclusion] = useState('');
  const [newCO, setNewCO] = useState({ description: '', relatedDeliverableId: '', estimatedHours: 0 });

  useEffect(() => {
    const p = getProject(projectId);
    if (p) {
      setProject(p);
      setChangeOrders(getChangeOrders(projectId));
      setStats(getProjectStats(projectId));
    }
    setLoaded(true);
  }, [projectId]);

  const refresh = () => {
    const p = getProject(projectId);
    if (p) {
      setProject(p);
      setChangeOrders(getChangeOrders(projectId));
      setStats(getProjectStats(projectId));
    }
  };

  const addDeliverable = () => {
    if (!project || !newDeliverable.description.trim()) return;
    const updated = {
      ...project,
      deliverables: [...project.deliverables, {
        id: crypto.randomUUID(),
        description: newDeliverable.description.trim(),
        estimatedHours: newDeliverable.estimatedHours,
        completed: false,
      }],
    };
    updateProject(projectId, updated);
    setNewDeliverable({ description: '', estimatedHours: 0 });
    setShowAddDeliverable(false);
    refresh();
  };

  const removeDeliverable = (delId: string) => {
    if (!project) return;
    updateProject(projectId, { deliverables: project.deliverables.filter(d => d.id !== delId) });
    refresh();
  };

  const toggleDeliverable = (delId: string) => {
    if (!project) return;
    updateProject(projectId, {
      deliverables: project.deliverables.map(d => d.id === delId ? { ...d, completed: !d.completed } : d),
    });
    refresh();
  };

  const addExclusion = () => {
    if (!project || !newExclusion.trim()) return;
    updateProject(projectId, { exclusions: [...project.exclusions, newExclusion.trim()] });
    setNewExclusion('');
    setShowAddExclusion(false);
    refresh();
  };

  const removeExclusion = (index: number) => {
    if (!project) return;
    updateProject(projectId, { exclusions: project.exclusions.filter((_, i) => i !== index) });
    refresh();
  };

  const handleCreateCO = () => {
    if (!project || !newCO.description.trim()) return;
    createChangeOrder({
      projectId,
      description: newCO.description.trim(),
      relatedDeliverableId: newCO.relatedDeliverableId || null,
      estimatedHours: newCO.estimatedHours,
      rate: project.hourlyRate,
    });
    setNewCO({ description: '', relatedDeliverableId: '', estimatedHours: 0 });
    setShowNewCO(false);
    refresh();
  };

  const generateScopeLink = () => {
    if (!project) return;
    updateProject(projectId, { status: 'approved' });
    const link = createApprovalLink(projectId, 'scope');
    refresh();
    alert(`Scope approval link generated!\n\nShare this with your client:\n${window.location.origin}/scope/${link.token}`);
  };

  const generateCOLink = (coId: string) => {
    const link = createApprovalLink(projectId, 'change-order', coId);
    alert(`Change Order approval link generated!\n\nShare this with your client:\n${window.location.origin}/change-order/${link.token}`);
  };

  const handleDelete = () => {
    if (confirm('Delete this project permanently?')) {
      deleteProject(projectId);
      router.push('/');
    }
  };

  if (!loaded) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-amber-500">Loading...</div></div>;
  if (!project) return <div className="min-h-screen flex items-center justify-center text-zinc-400">Project not found</div>;

  const status = getStatusBadge(project.status);
  const creepLevel = getCreepLevel(stats?.creepPercent || 0);

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">← Dashboard</a>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded text-xs font-medium ${status.bg} ${status.color}`}>{status.label}</span>
            <button onClick={handleDelete} className="text-zinc-600 hover:text-red-400 transition-colors text-sm">Delete</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Project Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100 mb-1">{project.name}</h1>
            <p className="text-zinc-500">{project.client} · Created {formatDate(project.createdAt)}</p>
            {project.description && <p className="text-zinc-400 mt-2 text-sm">{project.description}</p>}
          </div>
          {stats && stats.creepPercent > 0 && (
            <div className={`px-4 py-2 rounded-lg border ${creepLevel.bg} text-center`}>
              <p className={`text-2xl font-bold ${creepLevel.color}`}>{stats.creepPercent.toFixed(1)}%</p>
              <p className="text-xs text-zinc-500">Scope Creep</p>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Budget</p>
            <p className="text-xl font-bold text-zinc-100">{formatCurrency(project.budget)}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Rate</p>
            <p className="text-xl font-bold text-zinc-100">${project.hourlyRate}/hr</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Change Orders</p>
            <p className="text-xl font-bold text-amber-400">{formatCurrency(stats?.totalCOValue || 0)}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Value</p>
            <p className="text-xl font-bold text-emerald-400">{formatCurrency(stats?.totalValue || project.budget)}</p>
          </div>
        </div>

        {/* Deliverables */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-200">📋 Deliverables (In Scope)</h2>
            <button onClick={() => setShowAddDeliverable(!showAddDeliverable)} className="text-sm text-amber-400 hover:text-amber-300 transition-colors">+ Add</button>
          </div>

          {showAddDeliverable && (
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-4 space-y-3">
              <input
                type="text"
                placeholder="Deliverable description..."
                value={newDeliverable.description}
                onChange={e => setNewDeliverable({ ...newDeliverable, description: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
              />
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Est. hours"
                  value={newDeliverable.estimatedHours || ''}
                  onChange={e => setNewDeliverable({ ...newDeliverable, estimatedHours: Number(e.target.value) })}
                  className="w-32 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                />
                <button onClick={addDeliverable} className="px-4 py-2 bg-amber-500 text-black font-medium rounded-lg text-sm hover:bg-amber-400 transition-colors">Add</button>
                <button onClick={() => setShowAddDeliverable(false)} className="text-sm text-zinc-500 hover:text-zinc-300">Cancel</button>
              </div>
            </div>
          )}

          {project.deliverables.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-4">No deliverables yet. Add what's included in scope.</p>
          ) : (
            <ul className="space-y-2">
              {project.deliverables.map(d => (
                <li key={d.id} className="flex items-center gap-3 py-2 px-3 bg-zinc-800/50 rounded-lg group">
                  <button onClick={() => toggleDeliverable(d.id)} className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${d.completed ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600 hover:border-zinc-400'}`}>
                    {d.completed && <span className="text-black text-xs">✓</span>}
                  </button>
                  <span className={`flex-1 text-sm ${d.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{d.description}</span>
                  <span className="text-xs text-zinc-500">{d.estimatedHours}h</span>
                  <button onClick={() => removeDeliverable(d.id)} className="text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">✕</button>
                </li>
              ))}
            </ul>
          )}

          {project.deliverables.length > 0 && (
            <p className="mt-3 text-xs text-zinc-500">Total estimated: {project.deliverables.reduce((s, d) => s + d.estimatedHours, 0)} hours ({formatCurrency(project.deliverables.reduce((s, d) => s + d.estimatedHours, 0) * project.hourlyRate)})</p>
          )}
        </div>

        {/* Exclusions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-200">🚫 Exclusions (Out of Scope)</h2>
            <button onClick={() => setShowAddExclusion(!showAddExclusion)} className="text-sm text-amber-400 hover:text-amber-300 transition-colors">+ Add</button>
          </div>

          {showAddExclusion && (
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-4 space-y-3">
              <input
                type="text"
                placeholder="What's NOT included..."
                value={newExclusion}
                onChange={e => setNewExclusion(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
              />
              <div className="flex items-center gap-3">
                <button onClick={addExclusion} className="px-4 py-2 bg-amber-500 text-black font-medium rounded-lg text-sm hover:bg-amber-400 transition-colors">Add</button>
                <button onClick={() => setShowAddExclusion(false)} className="text-sm text-zinc-500 hover:text-zinc-300">Cancel</button>
              </div>
            </div>
          )}

          {project.exclusions.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-4">No exclusions defined. Adding these protects you from scope creep!</p>
          ) : (
            <ul className="space-y-2">
              {project.exclusions.map((exc, i) => (
                <li key={i} className="flex items-center gap-3 py-2 px-3 bg-zinc-800/50 rounded-lg group">
                  <span className="text-red-400 text-sm">⊘</span>
                  <span className="flex-1 text-sm text-zinc-300">{exc}</span>
                  <button onClick={() => removeExclusion(i)} className="text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Change Orders */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-200">📝 Change Orders</h2>
            <button onClick={() => setShowNewCO(!showNewCO)} className="text-sm text-amber-400 hover:text-amber-300 transition-colors">+ New Change Order</button>
          </div>

          {showNewCO && (
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-4 space-y-3">
              <input
                type="text"
                placeholder="Describe the requested change..."
                value={newCO.description}
                onChange={e => setNewCO({ ...newCO, description: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
              />
              <select
                value={newCO.relatedDeliverableId}
                onChange={e => setNewCO({ ...newCO, relatedDeliverableId: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
              >
                <option value="">Related to (optional)</option>
                {project.deliverables.map(d => (
                  <option key={d.id} value={d.id}>{d.description}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Estimated additional hours"
                value={newCO.estimatedHours || ''}
                onChange={e => setNewCO({ ...newCO, estimatedHours: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
              />
              {newCO.estimatedHours > 0 && (
                <p className="text-xs text-amber-400">Charge: {formatCurrency(newCO.estimatedHours * project.hourlyRate)} ({newCO.estimatedHours}h × ${project.hourlyRate}/hr)</p>
              )}
              <div className="flex items-center gap-3">
                <button onClick={handleCreateCO} className="px-4 py-2 bg-amber-500 text-black font-medium rounded-lg text-sm hover:bg-amber-400 transition-colors">Create Change Order</button>
                <button onClick={() => setShowNewCO(false)} className="text-sm text-zinc-500 hover:text-zinc-300">Cancel</button>
              </div>
            </div>
          )}

          {changeOrders.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-4">No change orders yet. When scope creep happens, document it here.</p>
          ) : (
            <div className="space-y-3">
              {changeOrders.map(co => {
                const coStatus = getCOStatusBadge(co.status);
                return (
                  <div key={co.id} className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${coStatus.bg} ${coStatus.color}`}>{coStatus.label}</span>
                          <span className="text-sm font-medium text-zinc-200">{co.description}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                          <span>{co.estimatedHours}h × ${co.rate}/hr</span>
                          <span className="text-amber-400 font-medium">{formatCurrency(co.amount)}</span>
                          <span>{formatDate(co.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => generateCOLink(co.id)} className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded transition-colors">Share</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Share Scope */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-amber-400 mb-2">🔗 Share Scope for Approval</h2>
          <p className="text-zinc-400 text-sm mb-4">Generate a client-facing link. They'll see the scope document and can approve it with one click.</p>
          <button onClick={generateScopeLink} className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-black font-semibold rounded-lg hover:from-amber-400 hover:to-orange-500 transition-all">
            Generate Approval Link
          </button>
        </div>
      </main>
    </div>
  );
}