-- Elowish Database Schema
-- Initial Migration: Create all core tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- FAMILY SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS family_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_name TEXT NOT NULL,
  share_slug TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT true,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_family_settings_user ON family_settings(user_id);
CREATE INDEX idx_family_settings_slug ON family_settings(share_slug);

-- Row Level Security
ALTER TABLE family_settings ENABLE ROW LEVEL SECURITY;

-- Users can only see their own family settings
CREATE POLICY "Users can view own family settings" ON family_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own family settings" ON family_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own family settings" ON family_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own family settings" ON family_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Public can view if is_public is true (for family sharing)
CREATE POLICY "Public can view public family settings by slug" ON family_settings
  FOR SELECT USING (is_public = true);

-- ============================================
-- KIDS
-- ============================================
CREATE TABLE IF NOT EXISTS kids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birthday DATE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_kids_parent ON kids(parent_user_id);

-- Row Level Security
ALTER TABLE kids ENABLE ROW LEVEL SECURITY;

-- Parents can manage their own kids
CREATE POLICY "Parents can view own kids" ON kids
  FOR SELECT USING (auth.uid() = parent_user_id);

CREATE POLICY "Parents can create own kids" ON kids
  FOR INSERT WITH CHECK (auth.uid() = parent_user_id);

CREATE POLICY "Parents can update own kids" ON kids
  FOR UPDATE USING (auth.uid() = parent_user_id);

CREATE POLICY "Parents can delete own kids" ON kids
  FOR DELETE USING (auth.uid() = parent_user_id);

-- Public can view kids from public families
CREATE POLICY "Public can view kids from public families" ON kids
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_settings
      WHERE family_settings.user_id = kids.parent_user_id
      AND family_settings.is_public = true
    )
  );

-- ============================================
-- HOLIDAYS
-- ============================================
CREATE TABLE IF NOT EXISTS holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  recurring BOOLEAN DEFAULT false,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_holidays_parent ON holidays(parent_user_id);
CREATE INDEX idx_holidays_date ON holidays(date);

-- Row Level Security
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;

-- Parents can manage their own holidays
CREATE POLICY "Parents can view own holidays" ON holidays
  FOR SELECT USING (auth.uid() = parent_user_id);

CREATE POLICY "Parents can create own holidays" ON holidays
  FOR INSERT WITH CHECK (auth.uid() = parent_user_id);

CREATE POLICY "Parents can update own holidays" ON holidays
  FOR UPDATE USING (auth.uid() = parent_user_id);

CREATE POLICY "Parents can delete own holidays" ON holidays
  FOR DELETE USING (auth.uid() = parent_user_id);

-- Public can view holidays from public families
CREATE POLICY "Public can view holidays from public families" ON holidays
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_settings
      WHERE family_settings.user_id = holidays.parent_user_id
      AND family_settings.is_public = true
    )
  );

-- ============================================
-- ITEMS (Master Gift Lists)
-- ============================================
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kid_id UUID REFERENCES kids(id) ON DELETE CASCADE,
  parent_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('url_product', 'text_description', 'cash_giftcard')),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  image_url TEXT,
  source_url TEXT,
  affiliate_urls JSONB,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low', 'future')),
  is_purchased BOOLEAN DEFAULT false,
  purchased_by TEXT,
  purchased_at TIMESTAMPTZ,
  reserved_by TEXT,
  reserved_at TIMESTAMPTZ,
  enable_group_gifting BOOLEAN DEFAULT false,
  group_gift_goal DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX idx_items_kid ON items(kid_id);
CREATE INDEX idx_items_parent ON items(parent_user_id);
CREATE INDEX idx_items_purchased ON items(is_purchased);
CREATE INDEX idx_items_priority ON items(priority);

-- Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Parents can manage their own items
CREATE POLICY "Parents can view own items" ON items
  FOR SELECT USING (auth.uid() = parent_user_id);

CREATE POLICY "Parents can create own items" ON items
  FOR INSERT WITH CHECK (auth.uid() = parent_user_id);

CREATE POLICY "Parents can update own items" ON items
  FOR UPDATE USING (auth.uid() = parent_user_id);

CREATE POLICY "Parents can delete own items" ON items
  FOR DELETE USING (auth.uid() = parent_user_id);

-- Public can view items from public families
CREATE POLICY "Public can view items from public families" ON items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_settings
      WHERE family_settings.user_id = items.parent_user_id
      AND family_settings.is_public = true
    )
  );

-- Public can update reserved_by and purchased status (for marking gifts)
CREATE POLICY "Public can mark items as purchased" ON items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM family_settings
      WHERE family_settings.user_id = items.parent_user_id
      AND family_settings.is_public = true
    )
  );

-- ============================================
-- ITEM TAGS (Many-to-Many with Holidays)
-- ============================================
CREATE TABLE IF NOT EXISTS item_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  holiday_id UUID NOT NULL REFERENCES holidays(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, holiday_id)
);

-- Indexes for faster joins
CREATE INDEX idx_item_tags_item ON item_tags(item_id);
CREATE INDEX idx_item_tags_holiday ON item_tags(holiday_id);

-- Row Level Security
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;

-- Parents can manage their own item tags
CREATE POLICY "Parents can view own item tags" ON item_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = item_tags.item_id
      AND items.parent_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can create own item tags" ON item_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = item_tags.item_id
      AND items.parent_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can delete own item tags" ON item_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = item_tags.item_id
      AND items.parent_user_id = auth.uid()
    )
  );

-- Public can view item tags from public families
CREATE POLICY "Public can view item tags from public families" ON item_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items
      JOIN family_settings ON family_settings.user_id = items.parent_user_id
      WHERE items.id = item_tags.item_id
      AND family_settings.is_public = true
    )
  );

-- ============================================
-- PLEDGES (Group Gifting)
-- ============================================
CREATE TABLE IF NOT EXISTS pledges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  pledger_name TEXT NOT NULL,
  pledger_email TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('authorized', 'charged', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  charged_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Indexes for faster lookups
CREATE INDEX idx_pledges_item ON pledges(item_id);
CREATE INDEX idx_pledges_status ON pledges(status);
CREATE INDEX idx_pledges_stripe ON pledges(stripe_payment_intent_id);

-- Row Level Security
ALTER TABLE pledges ENABLE ROW LEVEL SECURITY;

-- Anyone can create pledges (for public group gifting)
CREATE POLICY "Anyone can create pledges" ON pledges
  FOR INSERT WITH CHECK (true);

-- Parents can view pledges for their items
CREATE POLICY "Parents can view pledges for own items" ON pledges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = pledges.item_id
      AND items.parent_user_id = auth.uid()
    )
  );

-- Public can view pledges for public items (to see funding progress)
CREATE POLICY "Public can view pledges for public items" ON pledges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items
      JOIN family_settings ON family_settings.user_id = items.parent_user_id
      WHERE items.id = pledges.item_id
      AND family_settings.is_public = true
    )
  );

-- System can update pledge status (via service role)
CREATE POLICY "Service role can update pledges" ON pledges
  FOR UPDATE USING (true);

-- ============================================
-- PRICE HISTORY (Deal Finder)
-- ============================================
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  retailer TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX idx_price_history_item ON price_history(item_id);
CREATE INDEX idx_price_history_checked ON price_history(checked_at);

-- Row Level Security
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Parents can view price history for their items
CREATE POLICY "Parents can view price history for own items" ON price_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = price_history.item_id
      AND items.parent_user_id = auth.uid()
    )
  );

-- Public can view price history for public items
CREATE POLICY "Public can view price history for public items" ON price_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items
      JOIN family_settings ON family_settings.user_id = items.parent_user_id
      WHERE items.id = price_history.item_id
      AND family_settings.is_public = true
    )
  );

-- System can insert price history (via service role)
CREATE POLICY "Service role can insert price history" ON price_history
  FOR INSERT WITH CHECK (true);

-- ============================================
-- SUBSCRIPTIONS (Email Notifications)
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES family_settings(id) ON DELETE CASCADE,
  kid_id UUID REFERENCES kids(id) ON DELETE CASCADE,
  subscriber_email TEXT NOT NULL,
  notification_prefs JSONB DEFAULT '{"new_items": true, "purchases": true, "price_drops": true, "reminders": true}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, subscriber_email)
);

-- Index for faster lookups
CREATE INDEX idx_subscriptions_family ON subscriptions(family_id);
CREATE INDEX idx_subscriptions_email ON subscriptions(subscriber_email);

-- Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (for public families)
CREATE POLICY "Anyone can subscribe to public families" ON subscriptions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_settings
      WHERE family_settings.id = subscriptions.family_id
      AND family_settings.is_public = true
    )
  );

-- Subscribers can view their own subscriptions
CREATE POLICY "Subscribers can view own subscriptions" ON subscriptions
  FOR SELECT USING (subscriber_email = auth.email());

-- Subscribers can update their own subscriptions
CREATE POLICY "Subscribers can update own subscriptions" ON subscriptions
  FOR UPDATE USING (subscriber_email = auth.email());

-- Subscribers can delete their own subscriptions (unsubscribe)
CREATE POLICY "Subscribers can delete own subscriptions" ON subscriptions
  FOR DELETE USING (subscriber_email = auth.email());

-- ============================================
-- GIFT TRACKING (Personal Dashboard for Gift-Givers)
-- ============================================
CREATE TABLE IF NOT EXISTS gift_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  gift_idea TEXT NOT NULL,
  purchased BOOLEAN DEFAULT false,
  amount_spent DECIMAL(10,2),
  notes TEXT,
  for_occasion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_gift_tracking_user ON gift_tracking(user_id);

-- Row Level Security
ALTER TABLE gift_tracking ENABLE ROW LEVEL SECURITY;

-- Users can manage their own gift tracking
CREATE POLICY "Users can view own gift tracking" ON gift_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own gift tracking" ON gift_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gift tracking" ON gift_tracking
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gift tracking" ON gift_tracking
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to relevant tables
CREATE TRIGGER update_family_settings_updated_at
  BEFORE UPDATE ON family_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kids_updated_at
  BEFORE UPDATE ON kids
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gift_tracking_updated_at
  BEFORE UPDATE ON gift_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL SEED DATA (Optional)
-- ============================================

-- We'll add seed data later when we have actual users
-- For now, schema is complete!