import { NextRequest, NextResponse } from 'next/server';
import { getTransactionsByClient, getClient } from '@/lib/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getClient(id);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const transactions = getTransactionsByClient(id);
    
    // Build CSV
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Status'];
    const rows = transactions.map(t => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      t.category || '',
      t.status,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${client.name.replace(/\s+/g, '_')}_categorized.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 });
  }
}