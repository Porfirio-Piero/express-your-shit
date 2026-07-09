import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/grievance/[id] - Get grievance/certificate data for QR code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Look up by case number or order ID
  const { data: kitCase, error } = await supabaseAdmin
    .from('kit_cases')
    .select('case_number, character_name, gender, accent, message, offenses, custom_charge, voice_note_url, created_at')
    .eq('case_number', id)
    .maybeSingle();

  if (error || !kitCase) {
    // Try looking up by order's kit_case_number
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('kit_case_number, kit_character, kit_gender, kit_accent, kit_message, kit_offenses, kit_custom_charge, voice_note_url, created_at')
      .eq('kit_case_number', id)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ error: 'Grievance not found' }, { status: 404 });
    }

    return NextResponse.json({
      case_number: order.kit_case_number,
      character_name: order.kit_character,
      gender: order.kit_gender,
      accent: order.kit_accent,
      message: order.kit_message,
      offenses: order.kit_offenses,
      custom_charge: order.kit_custom_charge,
      voice_note_url: order.voice_note_url,
      created_at: order.created_at,
    });
  }

  return NextResponse.json(kitCase);
}