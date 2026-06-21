'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProjects, getChangeOrders, getProjectStats, deleteProject } from '@/lib/store';
import { Project, ChangeOrder } from '@/lib/types';
import { formatCurrency, formatDate, getCreepLevel, getStatusBadge } from '@/lib/utils';

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProjects(getProjects());
    setChangeOrders(getChangeOrders());
    setLoaded(true);
  }, []);

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'approved').length;
  const totalOriginalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalCOValue = changeOrders.filter(co => co.status === 'approved').reduce((sum, co) => sum + co.amount, 0);
  const pendingCOs = changeOrders.filter(co => co.status === 'pending').length;
  const avgCreep = projects.length > 0
    ? projects.reduce((sum, p) => {
        const stats = getProjectStats(p.id);
        return sum + (stats?.creepPercent || 0);
      }, 0) / projects.length
    : 0;

  const creepLevel = getCreepLevel(avgCreep);

  const handleDelete = (id: string) => {
    if (confirm('Delete this project and all its change orders?')) {
      deleteProject(id);
      setProjects(getProjects());
      setChangeOrders(getChangeOrders());
    }
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-amber-500 text-xl">Loading ScopeGuard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-bold text-lg">
              ⛨
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100">ScopeGuard</h1>
              <p className="text-xs text-zinc-500">Scope Creep Protection</p>
            </div>
          </div>
          <Link
            href="/project/new"
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-black font-semibold rounded-lg hover:from-amber-400 hover:to-orange-500 transition-all text-sm"
          >
            + New Project
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Projects</p>
            <p className="text-2xl font-bold text-zinc-100">{totalProjects}</p>
            <p className="text-xs text-zinc-500">{activeProjects} active</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Original Budget</p>
            <p className="text-2xl font-bold text-zinc-100">{formatCurrency(totalOriginalBudget)}</p>
            <p className="text-xs text-zinc-500">across all projects</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Change Orders</p>
            <p className="text-2xl font-bold text-zinc-100">{formatCurrency(totalCOValue)}</p>
            <p className="text-xs text-amber-400">{pendingCOs} pending approval</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Avg Creep</p>
            <p className={`text-2xl font-bold ${creepLevel.color}`}>{avgCreep.toFixed(1)}%</p>
            <p className="text-xs text-zinc-500">{creepLevel.label} creep level</p>
          </div>
        </div>

        {/* Projects List */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-200">Your Projects</h2>
        </div>

        {projects.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-xl p-12 text-center">
            <div className="text-5xl mb-4">🛡️</div>
            <h3 className="text-xl font-semibold text-zinc-200 mb-2">No projects yet</h3>
            <p className="text-zinc-500 mb-6 max-w-md mx-auto">
              ScopeGuard helps you define project scope, get client approval, and generate change orders when scope creep happens.
            </p>
            <Link
              href="/project/new"
              className="inline-block px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-black font-semibold rounded-lg hover:from-amber-400 hover:to-orange-500 transition-all"
            >
              Create Your First Project
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map(project => {
              const stats = getProjectStats(project.id);
              const status = getStatusBadge(project.status);
              const projectCreep = stats?.creepPercent || 0;
              const projectCreepLevel = getCreepLevel(projectCreep);
              return (
                <div key={project.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-zinc-100 truncate">{project.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.bg} ${status.color}`}>{status.label}</span>
                        {projectCreep > 0 && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${projectCreepLevel.bg} ${projectCreepLevel.color} border`}>
                            {projectCreep.toFixed(1)}% creep
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-500 mb-2">{project.client} · {formatDate(project.createdAt)}</p>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="text-zinc-400">Budget: <span className="text-zinc-200 font-medium">{formatCurrency(project.budget)}</span></span>
                        {stats && stats.totalCOValue > 0 && (
                          <span className="text-zinc-400">Change Orders: <span className="text-amber-400 font-medium">{formatCurrency(stats.totalCOValue)}</span></span>
                        )}
                        <span className="text-zinc-400">Deliverables: <span className="text-zinc-200">{project.deliverables.length}</span></span>
                        {stats && stats.pendingCOs.length > 0 && (
                          <span className="text-amber-400">{stats.pendingCOs.length} pending CO{stats.pendingCOs.length > 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/project/${project.id}`}
                        className="px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="px-2 py-1.5 text-sm text-zinc-600 hover:text-red-400 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom links */}
        <div className="mt-12 pt-8 border-t border-zinc-800 text-center">
          <Link href="/pricing" className="text-sm text-zinc-500 hover:text-amber-400 transition-colors">
            View Plans & Pricing →
          </Link>
        </div>
      </main>
    </div>
  );
}