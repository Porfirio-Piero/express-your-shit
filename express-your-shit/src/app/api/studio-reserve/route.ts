import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/studio-reserve - Check daily Studio Reserve availability
export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: capData } = await supabaseAdmin
      .from('studio_reserve_caps')
      .select('orders_placed, max_daily')
      .eq('cap_date', today)
      .maybeSingle();

    const maxDaily = capData?.max_daily || 7;
    const ordersPlaced = capData?.orders_placed || 0;
    const remaining = Math.max(0, maxDaily - ordersPlaced);

    return NextResponse.json({
      date: today,
      remaining,
      max_daily: maxDaily,
      available: remaining > 0,
    });
  } catch (error) {
    console.error('Studio reserve check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}