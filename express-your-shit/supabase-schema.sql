-- Express Your Sh*t - Supabase Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_code VARCHAR(12) UNIQUE NOT NULL, -- EYS-XXXXXX format
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('petty-theft', 'full-send', 'case-closed')),
  tier_price DECIMAL(10,2) NOT NULL,
  
  -- Recipient (purged 30 days after delivery)
  recipient_name VARCHAR(200) NOT NULL,
  recipient_address1 VARCHAR(500) NOT NULL,
  recipient_address2 VARCHAR(500),
  recipient_city VARCHAR(200) NOT NULL,
  recipient_state VARCHAR(50) NOT NULL,
  recipient_zip VARCHAR(20) NOT NULL,
  recipient_country VARCHAR(2) DEFAULT 'US',
  
  -- Address hash for anti-harassment check (kept 90 days)
  recipient_address_hash VARCHAR(64) NOT NULL,
  
  -- Sender (purged 1 year after order)
  sender_email VARCHAR(500),
  
  -- Anonymous note
  anonymous_note TEXT,
  note_moderated BOOLEAN DEFAULT FALSE,
  note_moderation_result VARCHAR(20), -- 'approved', 'rejected', 'flagged'
  
  -- Kit
  has_kit BOOLEAN DEFAULT FALSE,
  kit_price DECIMAL(10,2) DEFAULT 0,
  
  -- Payment
  payment_method VARCHAR(10) NOT NULL CHECK (payment_method IN ('crypto', 'cash')),
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
  btcpay_invoice_id VARCHAR(200),
  cash_code VARCHAR(20), -- for cash-by-mail orders
  
  -- Kit configuration
  kit_character VARCHAR(30), -- 'disappointed-judge', etc.
  kit_gender VARCHAR(10), -- 'male', 'female'
  kit_accent VARCHAR(20), -- 'american', 'british', 'australian', 'flat-robotic'
  kit_message TEXT,
  kit_message_moderated BOOLEAN DEFAULT FALSE,
  kit_message_moderation_result VARCHAR(20),
  kit_offenses TEXT[], -- array of selected offenses
  kit_custom_charge TEXT,
  kit_case_number VARCHAR(20), -- EYS-GR-XXXXXX
  
  -- Audio
  voice_note_url TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Studio Reserve cap
  is_studio_reserve BOOLEAN DEFAULT FALSE,
  studio_reserve_date DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Purge tracking
  recipient_data_purged BOOLEAN DEFAULT FALSE,
  sender_data_purged BOOLEAN DEFAULT FALSE,
  purged_at TIMESTAMPTZ
);

-- Index on order_code for fast lookups
CREATE INDEX idx_orders_order_code ON orders(order_code);
CREATE INDEX idx_orders_recipient_hash ON orders(recipient_address_hash);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Kit case numbers (separate for QR lookups)
CREATE TABLE kit_cases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  case_number VARCHAR(20) UNIQUE NOT NULL, -- EYS-GR-XXXXXX
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  character_name VARCHAR(50) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  accent VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  offenses TEXT[] NOT NULL,
  custom_charge TEXT,
  voice_note_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  purged BOOLEAN DEFAULT FALSE,
  purged_at TIMESTAMPTZ
);

CREATE INDEX idx_kit_cases_case_number ON kit_cases(case_number);
CREATE INDEX idx_kit_cases_order_id ON kit_cases(order_id);

-- Daily Studio Reserve cap tracking
CREATE TABLE studio_reserve_caps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cap_date DATE NOT NULL,
  orders_placed INTEGER DEFAULT 0,
  max_daily INTEGER DEFAULT 7,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cap_date)
);

CREATE INDEX idx_studio_reserve_caps_date ON studio_reserve_caps(cap_date);

-- Anti-harassment: recent address hashes
CREATE TABLE address_hash_blocklist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  address_hash VARCHAR(64) NOT NULL,
  blocked_until TIMESTAMPTZ NOT NULL, -- 90 days from first shipment
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_address_hash_blocklist_hash ON address_hash_blocklist(address_hash);
CREATE INDEX idx_address_hash_blocklist_until ON address_hash_blocklist(blocked_until);

-- Referral tracking
CREATE TABLE referrals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  referrer_order_id UUID REFERENCES orders(id),
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  credit_earned DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_referrals_code ON referrals(referral_code);

-- ============================================
-- Functions
-- ============================================

-- Generate order code
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS VARCHAR(12) AS $$
DECLARE
  code VARCHAR(12);
  exists BOOLEAN;
BEGIN
  LOOP
    code := 'EYS-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    SELECT EXISTS(SELECT 1 FROM orders WHERE order_code = code) INTO exists;
    IF NOT exists THEN EXIT; END IF;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Generate kit case number
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS VARCHAR(20) AS $$
DECLARE
  num VARCHAR(20);
  exists BOOLEAN;
BEGIN
  LOOP
    num := 'EYS-GR-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    SELECT EXISTS(SELECT 1 FROM kit_cases WHERE case_number = num) INTO exists;
    IF NOT exists THEN EXIT; END IF;
  END LOOP;
  RETURN num;
END;
$$ LANGUAGE plpgsql;

-- Check if address is blocked (anti-harassment)
CREATE OR REPLACE FUNCTION check_address_blocklist(p_address_hash VARCHAR(64))
RETURNS BOOLEAN AS $$
DECLARE
  blocked BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM address_hash_blocklist 
    WHERE address_hash = p_address_hash 
    AND blocked_until > NOW()
  ) INTO blocked;
  RETURN blocked;
END;
$$ LANGUAGE plpgsql;

-- Check Studio Reserve daily cap
CREATE OR REPLACE FUNCTION check_studio_reserve_cap(p_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
DECLARE
  remaining INTEGER;
BEGIN
  SELECT GREATEST(0, COALESCE(max_daily, 7) - COALESCE(orders_placed, 0))
  INTO remaining
  FROM studio_reserve_caps
  WHERE cap_date = p_date;
  
  IF remaining IS NULL THEN
    remaining := 7; -- default daily cap
  END IF;
  
  RETURN remaining;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Purge Job (30-day recipient data purge)
-- ============================================

-- Purge recipient data for orders delivered > 30 days ago
CREATE OR REPLACE FUNCTION purge_recipient_data()
RETURNS INTEGER AS $$
DECLARE
  count INTEGER;
BEGIN
  UPDATE orders SET
    recipient_name = '[PURGED]',
    recipient_address1 = '[PURGED]',
    recipient_address2 = '[PURGED]',
    recipient_city = '[PURGED]',
    recipient_state = '[PURGED]',
    recipient_zip = '[PURGED]',
    recipient_data_purged = TRUE,
    purged_at = NOW()
  WHERE delivered_at < NOW() - INTERVAL '30 days'
  AND recipient_data_purged = FALSE;
  
  GET DIAGNOSTICS count = ROW_COUNT;
  RETURN count;
END;
$$ LANGUAGE plpgsql;

-- Purge sender data for orders > 1 year old
CREATE OR REPLACE FUNCTION purge_sender_data()
RETURNS INTEGER AS $$
DECLARE
  count INTEGER;
BEGIN
  UPDATE orders SET
    sender_email = '[PURGED]',
    sender_data_purged = TRUE,
    purged_at = NOW()
  WHERE created_at < NOW() - INTERVAL '1 year'
  AND sender_data_purged = FALSE;
  
  GET DIAGNOSTICS count = ROW_COUNT;
  RETURN count;
END;
$$ LANGUAGE plpgsql;

-- Clean up expired address blocklist entries
CREATE OR REPLACE FUNCTION purge_expired_blocklist()
RETURNS INTEGER AS $$
DECLARE
  count INTEGER;
BEGIN
  DELETE FROM address_hash_blocklist
  WHERE blocked_until < NOW();
  
  GET DIAGNOSTICS count = ROW_COUNT;
  RETURN count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_reserve_caps ENABLE ROW LEVEL SECURITY;
ALTER TABLE address_hash_blocklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access" ON orders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON kit_cases FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON studio_reserve_caps FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON address_hash_blocklist FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON referrals FOR ALL USING (auth.role() = 'service_role');