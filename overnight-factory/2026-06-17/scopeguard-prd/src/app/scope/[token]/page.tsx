'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProject, getApprovalLinkByToken, updateProject } from '@/lib/store';
import { Project, ApprovalLink } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ScopeApproval() {
  const params = useParams();
  const token = params.token as string;
  const [project, setProject] = useState<Project | null>(null);
  const [link, setLink] = useState<ApprovalLink | null>(null);
  const [approved, setApproved] = useState(false);
  const [approverName, setApproverName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const approvalLink = getApprovalLinkByToken(token);
    if (!approvalLink || approvalLink.type !== 'scope') {
      setError('Invalid or expired link.');
      return;
    }
    setLink(approvalLink);
    const p = getProject(approvalLink.projectId);
    if (p) setProject(p);
    else setError('Project not found.');
  }, [token]);

  const handleApprove = () => {
    if (!approverName.trim() || !project || !link) return;
    updateProject(project.id, {
      status: 'approved',
      approvedBy: approverName.trim(),
      approvedAt: new Date().toISOString(),
    });
    setApproved(true);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-zinc-200 mb-2">{error}</h1>
          <p className="text-zinc-500">This link may be invalid or has expired.</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-amber-500">Loading...</div></div>;
  }

  if (approved) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-zinc-900 border border-emerald-500/30 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-emerald-400 mb-2">Scope Approved!</h1>
          <p className="text-zinc-400 mb-4">The project scope for <strong className="text-zinc-200">{project.name}</strong> has been approved by <strong className="text-zinc-200">{approverName}</strong>.</p>
          <p className="text-xs text-zinc-600">Approved on {formatDate(new Date().toISOString())}</p>
        </div>
      </div>
    );
  }

  const totalHours = project.deliverables.reduce((s, d) => s + d.estimatedHours, 0);

  return (
    <div className="min-h-screen bg-zinc-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-bold text-xl">⛨</div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100">ScopeGuard</h1>
              <p className="text-xs text-zinc-500">Project Scope Document</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-zinc-100 mb-1">{project.name}</h2>
          <p className="text-zinc-400 mb-1">Client: <span className="text-zinc-200">{project.client}</span></p>
          {project.description && <p className="text-zinc-400 text-sm mb-4">{project.description}</p>}

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Budget</p>
              <p className="text-xl font-bold text-zinc-100">{formatCurrency(project.budget)}</p>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Est. Hours</p>
              <p className="text-xl font-bold text-zinc-100">{totalHours}h</p>
            </div>
          </div>
        </div>

        {/* Deliverables */}
        {project.deliverables.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-6">
            <h3 className="text-lg font-semibold text-zinc-200 mb-4">✅ Included in Scope</h3>
            <ul className="space-y-3">
              {project.deliverables.map(d => (
                <li key={d.id} className="flex items-center gap-3 py-2 border-b border-zinc-800 last:border-0">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-emerald-400 text-xs">✓</span>
                  </div>
                  <span className="flex-1 text-zinc-200">{d.description}</span>
                  <span className="text-sm text-zinc-500">{d.estimatedHours}h</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Exclusions */}
        {project.exclusions.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-6">
            <h3 className="text-lg font-semibold text-zinc-200 mb-4">🚫 Not Included (Out of Scope)</h3>
            <ul className="space-y-3">
              {project.exclusions.map((exc, i) => (
                <li key={i} className="flex items-center gap-3 py-2 border-b border-zinc-800 last:border-0">
                  <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="text-red-400 text-xs">⊘</span>
                  </div>
                  <span className="text-zinc-300">{exc}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-zinc-500">Any work outside the items above will require a separate Change Order with additional billing.</p>
          </div>
        )}

        {/* Approval Section */}
        <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-8">
          <h3 className="text-lg font-semibold text-amber-400 mb-2">✍️ Approve This Scope</h3>
          <p className="text-zinc-400 text-sm mb-6">By approving, you confirm that the above scope accurately represents the agreed-upon project deliverables.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Your Full Name *</label>
              <input
                type="text"
                value={approverName}
                onChange={e => setApproverName(e.target.value)}
                placeholder="Enter your name to approve"
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1 accent-amber-500" id="confirm" />
              <span className="text-sm text-zinc-400">I confirm that I have reviewed the scope above and agree to the deliverables and exclusions listed.</span>
            </label>

            <button
              onClick={handleApprove}
              disabled={!approverName.trim()}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold rounded-lg hover:from-amber-400 hover:to-orange-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Approve Scope
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-6">Powered by ScopeGuard — Protecting freelancers from scope creep</p>
      </div>
    </div>
  );
}