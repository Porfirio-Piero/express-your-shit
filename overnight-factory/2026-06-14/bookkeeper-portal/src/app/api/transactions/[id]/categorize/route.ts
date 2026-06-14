import { NextRequest, NextResponse } from 'next/server';
import { categorizeTransaction } from '@/lib/queries';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { category, status } = body;

    if (!category && status !== 'skipped') {
      return NextResponse.json(
        { error: 'Category is required for categorization' },
        { status: 400 }
      );
    }

    const transaction = categorizeTransaction(
      id,
      category || 'Uncategorized',
      status || 'categorized'
    );

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Error categorizing transaction:', error);
    return NextResponse.json({ error: 'Failed to categorize transaction' }, { status: 500 });
  }
}