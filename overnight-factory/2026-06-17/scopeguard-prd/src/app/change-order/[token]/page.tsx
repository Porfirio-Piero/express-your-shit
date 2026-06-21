'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProject, getChangeOrders, getApprovalLinkByToken, updateChangeOrder } from '@/lib/store';
import { Project, ChangeOrder, ApprovalLink } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ChangeOrderApproval() {
  const params = useParams();
  const token = params.token as string;
  const [project, setProject] = useState<Project | null>(null);
  const [changeOrder, setChangeOrder] = useState<ChangeOrder | null>(null);
  const [link, setLink] = useState<ApprovalLink | null>(null);
  const [approved, setApproved] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [approverName, setApproverName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const approvalLink = getApprovalLinkByToken(token);
    if (!approvalLink || approvalLink.type !== 'change-order' || !approvalLink.changeOrderId) {
      setError('Invalid or expired link.');
      return;
    }
    setLink(approvalLink);
    const p = getProject(approvalLink.projectId);
    if (p) setProject(p);
    else { setError('Project not found.'); return; }
    const cos = getChangeOrders(approvalLink.projectId);
    const co = cos.find(c => c.id === approvalLink.changeOrderId);
    if (co) setChangeOrder(co);
    else setError('Change order not found.');
  }, [token]);

  const handleApprove = () => {
    if (!approverName.trim() || !changeOrder) return;
    updateChangeOrder(changeOrder.id, {
      status: 'approved',
      approvedBy: approverName.trim(),
      approvedAt: new Date().toISOString(),
    });
    setApproved(true);
  };

  const handleDecline = () => {
    if (!approverName.trim() || !changeOrder) return;
    updateChangeOrder(changeOrder.id, {
      status: 'declined',
      approvedBy: approverName.trim(),
      approvedAt: new Date().toISOString(),
    });
    setDeclined(true);
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

  if (!project || !changeOrder) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-amber-500">Loading...</div></div>;
  }

  if (approved) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-zinc-900 border border-emerald-500/30 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-emerald-400 mb-2">Change Order Approved!</h1>
          <p className="text-zinc-400 mb-2">The change order for <strong className="text-zinc-200">{project.name}</strong> has been approved.</p>
          <p className="text-zinc-300 font-medium mb-4">{changeOrder.description}</p>
          <p className="text-xl font-bold text-emerald-400 mb-2">{formatCurrency(changeOrder.amount)}</p>
          <p className="text-xs text-zinc-600">Approved by {approverName} on {formatDate(new Date().toISOString())}</p>
        </div>
      </div>
    );
  }

  if (declined) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-zinc-900 border border-red-500/30 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-400 mb-2">Change Order Declined</h1>
          <p className="text-zinc-400">The change order for <strong className="text-zinc-200">{project.name}</strong> was not approved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-bold text-xl">⛨</div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100">ScopeGuard</h1>
              <p className="text-xs text-zinc-500">Change Order Request</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-zinc-100 mb-1">Change Order</h2>
          <p className="text-zinc-400 mb-4">For project: <span className="text-zinc-200 font-medium">{project.name}</span></p>
        </div>

        <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-8 mb-6">
          <h3 className="text-lg font-semibold text-amber-400 mb-4">📋 Change Request Details</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Description</p>
              <p className="text-zinc-200">{changeOrder.description}</p>
            </div>

            {changeOrder.relatedDeliverableId && (
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Related To</p>
                <p className="text-zinc-300">{project.deliverables.find(d => d.id === changeOrder.relatedDeliverableId)?.description || 'Unknown deliverable'}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-zinc-800 rounded-lg p-4 text-center">
                <p className="text-xs text-zinc-500 mb-1">Hours</p>
                <p className="text-xl font-bold text-zinc-100">{changeOrder.estimatedHours}h</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4 text-center">
                <p className="text-xs text-zinc-500 mb-1">Rate</p>
                <p className="text-xl font-bold text-zinc-100">${changeOrder.rate}/hr</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4 text-center">
                <p className="text-xs text-zinc-500 mb-1">Total</p>
                <p className="text-xl font-bold text-amber-400">{formatCurrency(changeOrder.amount)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <h3 className="text-lg font-semibold text-zinc-200 mb-4">✍️ Review & Respond</h3>
          <p className="text-zinc-400 text-sm mb-6">This work falls outside the original project scope and requires your approval.</p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Your Full Name *</label>
            <input
              type="text"
              value={approverName}
              onChange={e => setApproverName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              disabled={!approverName.trim()}
              className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Approve — {formatCurrency(changeOrder.amount)}
            </button>
            <button
              onClick={handleDecline}
              disabled={!approverName.trim()}
              className="flex-1 py-3 bg-zinc-700 text-zinc-300 font-bold rounded-lg hover:bg-zinc-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Decline
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-6">Powered by ScopeGuard — Protecting freelancers from scope creep</p>
      </div>
    </div>
  );
}