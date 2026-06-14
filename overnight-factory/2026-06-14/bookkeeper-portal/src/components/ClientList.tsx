'use client';

import { useState } from 'react';
import { ClientWithStats } from '@/lib/db';
import { formatCurrency } from '@/lib/constants';

interface ClientListProps {
  clients: ClientWithStats[];
  onSelectClient: (client: ClientWithStats) => void;
  onAddClient: () => void;
  onDeleteClient: (id: string) => void;
  onExportClient: (id: string) => void;
  selectedId?: string;
}

export default function ClientList({
  clients,
  onSelectClient,
  onAddClient,
  onDeleteClient,
  onExportClient,
  selectedId,
}: ClientListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Clients</h2>
        <button
          onClick={onAddClient}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-1"
        >
          <span>+</span> Add Client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients yet</h3>
          <p className="text-gray-500 mb-4">Add your first client to start categorizing transactions</p>
          <button
            onClick={onAddClient}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Add Client
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => {
            const total = client.total_transactions || 0;
            const uncategorized = client.uncategorized_count || 0;
            const categorized = client.categorized_count || 0;
            const progress = total > 0 ? Math.round((categorized / total) * 100) : 0;

            return (
              <div
                key={client.id}
                className={`bg-white rounded-xl shadow-sm border transition-all cursor-pointer ${
                  selectedId === client.id
                    ? 'border-blue-500 shadow-md ring-1 ring-blue-500'
                    : 'border-gray-100 hover:border-gray-200 hover:shadow'
                }`}
                onClick={() => onSelectClient(client)}
                onMouseEnter={() => setHoveredId(client.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base">{client.name}</h3>
                      <p className="text-sm text-gray-500">{client.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {uncategorized > 0 && (
                        <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-full">
                          {uncategorized} pending
                        </span>
                      )}
                      {total > 0 && progress === 100 && (
                        <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                          ✅ Complete
                        </span>
                      )}
                    </div>
                  </div>

                  {total > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{categorized} of {total} categorized</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {hoveredId === client.id && (
                  <div className="border-t border-gray-100 px-4 py-2 flex justify-end gap-2 bg-gray-50 rounded-b-xl">
                    <button
                      onClick={(e) => { e.stopPropagation(); onExportClient(client.id); }}
                      className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteClient(client.id); }}
                      className="text-sm text-red-500 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}