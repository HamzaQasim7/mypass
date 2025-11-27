-- Create passwords table for SafePass
CREATE TABLE IF NOT EXISTS passwords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  username TEXT DEFAULT '',
  email TEXT DEFAULT '',
  password TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE passwords ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own passwords
CREATE POLICY "Users can view own passwords" ON passwords
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own passwords" ON passwords
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own passwords" ON passwords
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own passwords" ON passwords
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS passwords_user_id_idx ON passwords(user_id);
CREATE INDEX IF NOT EXISTS passwords_service_idx ON passwords(service);
