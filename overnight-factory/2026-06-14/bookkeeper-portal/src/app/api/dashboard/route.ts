import { NextResponse } from 'next/server';
import { getClients } from '@/lib/queries';

export async function GET() {
  try {
    const clients = getClients();
    
    // Dashboard stats
    const totalClients = clients.length;
    const totalTransactions = clients.reduce((sum, c) => sum + (c.total_transactions || 0), 0);
    const totalUncategorized = clients.reduce((sum, c) => sum + (c.uncategorized_count || 0), 0);
    const totalCategorized = clients.reduce((sum, c) => sum + (c.categorized_count || 0), 0);
    
    const overallProgress = totalTransactions > 0
      ? Math.round((totalCategorized / totalTransactions) * 100)
      : 0;

    return NextResponse.json({
      stats: {
        totalClients,
        totalTransactions,
        totalUncategorized,
        totalCategorized,
        overallProgress,
      },
      clients,
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
  }
}