import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, TIER_PRICES, KIT_CHECKOUT_PRICE } from '@/lib/supabase';
import crypto from 'crypto';

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.tier || !body.recipient_name || !body.recipient_address1 || 
        !body.recipient_city || !body.recipient_state || !body.recipient_zip ||
        !body.payment_method) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate tier
    if (!['petty-theft', 'full-send', 'case-closed'].includes(body.tier)) {
      return NextResponse.json(
        { error: 'Invalid tier' },
        { status: 400 }
      );
    }

    // Validate payment method
    if (!['crypto', 'cash'].includes(body.payment_method)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }

    // Hash the recipient address for anti-harassment check
    const addressString = `${body.recipient_address1}|${body.recipient_city}|${body.recipient_state}|${body.recipient_zip}`.toLowerCase().trim();
    const addressHash = crypto.createHash('sha256').update(addressString).digest('hex');

    // Check anti-harassment blocklist
    const { data: blocked } = await supabaseAdmin
      .from('address_hash_blocklist')
      .select('id')
      .eq('address_hash', addressHash)
      .gt('blocked_until', new Date().toISOString())
      .maybeSingle();

    if (blocked) {
      return NextResponse.json(
        { error: 'This address has received a shipment recently. We do not allow repeat shipments to the same address within 90 days.' },
        { status: 403 }
      );
    }

    // Studio Reserve cap check
    if (body.tier === 'case-closed') {
      const { data: capData } = await supabaseAdmin
        .from('studio_reserve_caps')
        .select('orders_placed, max_daily')
        .eq('cap_date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      const remaining = capData 
        ? Math.max(0, (capData.max_daily || 7) - (capData.orders_placed || 0))
        : 7;

      if (remaining <= 0) {
        return NextResponse.json(
          { error: 'Studio Reserve daily limit reached. Please try again tomorrow or select a different tier.' },
          { status: 409 }
        );
      }
    }

    // Calculate price
    const tierPrice = TIER_PRICES[body.tier as keyof typeof TIER_PRICES];
    const kitPrice = body.has_kit ? KIT_CHECKOUT_PRICE : 0;
    const totalPrice = tierPrice + kitPrice;

    // Generate order code
    const orderCode = `EYS-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Generate cash code for cash-by-mail
    const cashCode = body.payment_method === 'cash' 
      ? `CASH-${crypto.randomBytes(4).toString('hex').toUpperCase()}}`
      : null;

    // Create order
    const orderData = {
      order_code: orderCode,
      tier: body.tier,
      tier_price: tierPrice,
      recipient_name: body.recipient_name,
      recipient_address1: body.recipient_address1,
      recipient_address2: body.recipient_address2 || null,
      recipient_city: body.recipient_city,
      recipient_state: body.recipient_state,
      recipient_zip: body.recipient_zip,
      recipient_country: body.recipient_country || 'US',
      recipient_address_hash: addressHash,
      sender_email: body.sender_email || null,
      anonymous_note: body.anonymous_note || null,
      has_kit: body.has_kit || false,
      kit_price: kitPrice,
      payment_method: body.payment_method,
      payment_status: 'pending',
      cash_code: cashCode,
      kit_character: body.kit_character || null,
      kit_gender: body.kit_gender || null,
      kit_accent: body.kit_accent || null,
      kit_message: body.kit_message || null,
      kit_offenses: body.kit_offenses || null,
      kit_custom_charge: body.kit_custom_charge || null,
      status: 'pending',
      is_studio_reserve: body.tier === 'case-closed',
    };

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) {
      console.error('Order creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Add address to blocklist (90-day block)
    await supabaseAdmin
      .from('address_hash_blocklist')
      .insert({
        address_hash: addressHash,
        blocked_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      });

    // Update Studio Reserve cap if applicable
    if (body.tier === 'case-closed') {
      const today = new Date().toISOString().split('T')[0];
      await supabaseAdmin
        .from('studio_reserve_caps')
        .upsert({
          cap_date: today,
          orders_placed: 1,
          max_daily: 7,
        }, { onConflict: 'cap_date' });
      
      // Increment orders_placed
      await supabaseAdmin.rpc('increment_studio_reserve_count', { p_date: today });
    }

    return NextResponse.json({
      order_code: order.order_code,
      total: totalPrice,
      cash_code: cashCode,
      payment_method: body.payment_method,
    }, { status: 201 });

  } catch (error) {
    console.error('Order API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/orders?code=EYS-XXXXXX - Check order status
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: 'Order code required' }, { status: 400 });
  }

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('order_code, tier, status, payment_status, has_kit, kit_case_number, created_at, shipped_at, delivered_at')
    .eq('order_code', code)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json(order);
}