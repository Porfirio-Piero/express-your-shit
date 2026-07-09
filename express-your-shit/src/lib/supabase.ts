import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Client-side Supabase (limited RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase (service role, bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export type Tier = 'petty-theft' | 'full-send' | 'case-closed';
export type PaymentMethod = 'crypto' | 'cash';
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string;
  order_code: string;
  tier: Tier;
  tier_price: number;
  recipient_name: string;
  recipient_address1: string;
  recipient_address2?: string;
  recipient_city: string;
  recipient_state: string;
  recipient_zip: string;
  recipient_country: string;
  recipient_address_hash: string;
  sender_email?: string;
  anonymous_note?: string;
  has_kit: boolean;
  kit_price: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  btcpay_invoice_id?: string;
  cash_code?: string;
  kit_character?: string;
  kit_gender?: string;
  kit_accent?: string;
  kit_message?: string;
  kit_offenses?: string[];
  kit_custom_charge?: string;
  kit_case_number?: string;
  voice_note_url?: string;
  status: OrderStatus;
  is_studio_reserve: boolean;
  created_at: string;
  updated_at: string;
}

export interface KitCase {
  id: string;
  case_number: string;
  order_id: string;
  character_name: string;
  gender: string;
  accent: string;
  message: string;
  offenses: string[];
  custom_charge?: string;
  voice_note_url?: string;
  created_at: string;
}

// Tiers pricing
export const TIER_PRICES: Record<Tier, number> = {
  'petty-theft': 19.99,
  'full-send': 34.99,
  'case-closed': 54.99,
};

export const KIT_STANDALONE_PRICE = 7;
export const KIT_CHECKOUT_PRICE = 5;

// Character voices
export const CHARACTERS = [
  { id: 'disappointed-judge', name: 'The Disappointed Judge' },
  { id: 'movie-trailer', name: 'Movie Trailer Announcer' },
  { id: 'royal-herald', name: 'Royal Herald' },
  { id: 'nature-doc', name: 'Nature Documentarian' },
  { id: 'drill-sergeant', name: 'Drill Sergeant' },
  { id: 'disappointed-parent', name: 'Disappointed Parent' },
];

export const ACCENTS = ['american', 'british', 'australian', 'flat-robotic'];
export const GENDERS = ['male', 'female'];

export const OFFENSES = [
  'Petty Betrayal',
  'Chronic Left-on-Read',
  'Crimes Against the Group Chat',
  'Thermostat Tampering',
  'Leftover Theft',
  'Aggressive Reply-All',
  'Parking Space Piracy',
  'Unsolicited Life Advice',
];