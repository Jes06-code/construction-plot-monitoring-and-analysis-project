-- ============================================
-- IndustrialOps Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- Profiles table
-- =====================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'field_officer' CHECK (role IN ('admin', 'company_rep', 'field_officer', 'contractor', 'government_authority')),
  phone TEXT,
  organization TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'field_officer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid errors on re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating to avoid "already exists" errors
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- =====================
-- Projects table
-- =====================
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_code TEXT UNIQUE NOT NULL,
  plot_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL,
  area_size DECIMAL NOT NULL,
  area_unit TEXT DEFAULT 'sqft',
  investment_commitment DECIMAL,
  workforce_commitment INTEGER,
  deadline DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','in_progress','delayed','completed','cancelled')),
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending','approved','rejected')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  current_stage TEXT DEFAULT 'Site',
  completion_percentage DECIMAL DEFAULT 0,
  compliance_score DECIMAL DEFAULT 100,
  stage_images JSONB DEFAULT '{}',
  auto_progress BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  company_rep_id UUID REFERENCES profiles(id),
  contractor_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was already created
ALTER TABLE projects ADD COLUMN IF NOT EXISTS stage_images JSONB DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS auto_progress BOOLEAN DEFAULT TRUE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS current_stage TEXT DEFAULT 'Site';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS completion_percentage DECIMAL DEFAULT 0;

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view projects" ON projects;
CREATE POLICY "Authenticated users can view projects" ON projects FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert projects" ON projects;
CREATE POLICY "Authenticated users can insert projects" ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update projects" ON projects;
CREATE POLICY "Authenticated users can update projects" ON projects FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete projects" ON projects;
CREATE POLICY "Authenticated users can delete projects" ON projects FOR DELETE USING (auth.role() = 'authenticated');

-- =====================
-- Documents table
-- =====================
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id),
  doc_type TEXT CHECK (doc_type IN ('ownership','approval','compliance','report','other')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view documents" ON documents;
CREATE POLICY "Authenticated users can view documents" ON documents FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can upload documents" ON documents;
CREATE POLICY "Authenticated users can upload documents" ON documents FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =====================
-- Progress Images table
-- =====================
CREATE TABLE IF NOT EXISTS progress_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id),
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  remarks TEXT,
  stage TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  location_name TEXT,
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  ai_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE progress_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view images" ON progress_images;
CREATE POLICY "Authenticated users can view images" ON progress_images FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can upload images" ON progress_images;
CREATE POLICY "Authenticated users can upload images" ON progress_images FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =====================
-- Milestones table
-- =====================
CREATE TABLE IF NOT EXISTS milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage milestones" ON milestones;
CREATE POLICY "Authenticated users can manage milestones" ON milestones FOR ALL USING (auth.role() = 'authenticated');

-- =====================
-- Budget Entries table
-- =====================
CREATE TABLE IF NOT EXISTS budget_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT,
  allocated DECIMAL DEFAULT 0,
  spent DECIMAL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage budget" ON budget_entries;
CREATE POLICY "Authenticated users can manage budget" ON budget_entries FOR ALL USING (auth.role() = 'authenticated');

-- =====================
-- Notifications table
-- =====================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  project_id UUID REFERENCES projects(id),
  title TEXT NOT NULL,
  message TEXT,
  type TEXT CHECK (type IN ('deadline','delay','missing_upload','compliance','info')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
