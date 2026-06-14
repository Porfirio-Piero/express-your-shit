import { NextRequest, NextResponse } from 'next/server';
import { getTransactionsByClient, getUncategorizedByClient, bulkImportTransactions } from '@/lib/queries';
import { getClient } from '@/lib/queries';

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

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter');

    let transactions;
    if (filter === 'uncategorized') {
      transactions = getUncategorizedByClient(id);
    } else {
      transactions = getTransactionsByClient(id);
    }

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getClient(id);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const body = await request.json();
    const { transactions } = body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json(
        { error: 'Transactions array is required' },
        { status: 400 }
      );
    }

    // Validate each transaction
    for (const t of transactions) {
      if (!t.date || !t.description || t.amount === undefined) {
        return NextResponse.json(
          { error: 'Each transaction must have date, description, and amount' },
          { status: 400 }
        );
      }
    }

    const count = bulkImportTransactions(id, transactions);
    return NextResponse.json({ imported: count }, { status: 201 });
  } catch (error) {
    console.error('Error importing transactions:', error);
    return NextResponse.json({ error: 'Failed to import transactions' }, { status: 500 });
  }
}