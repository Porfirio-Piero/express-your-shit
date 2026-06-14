import { NextRequest, NextResponse } from 'next/server';
import { getClientByUuid, getClient } from '@/lib/queries';
import { getUncategorizedByClient, getTransactionsByClient, getClientStats } from '@/lib/queries';
import { CATEGORIES } from '@/lib/constants';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
    const client = getClientByUuid(uuid);
    
    if (!client) {
      return NextResponse.json({ error: 'Invalid link' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter');

    let transactions;
    if (filter === 'uncategorized') {
      transactions = getUncategorizedByClient(client.id);
    } else {
      transactions = getTransactionsByClient(client.id);
    }

    const stats = getClientStats(client.id);

    return NextResponse.json({
      client: { id: client.id, name: client.name },
      transactions,
      stats,
      categories: CATEGORIES,
    });
  } catch (error) {
    console.error('Error fetching categorization data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}