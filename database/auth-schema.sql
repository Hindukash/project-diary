-- =============================================
-- Project Diary v0.0.4: Authentication Schema
-- =============================================

-- Enable Row Level Security on auth.users (if not already enabled)
-- Note: This is managed by Supabase Auth automatically

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{
        "theme": "system",
        "default_tags": [],
        "notifications": {
            "email": true,
            "browser": true
        }
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add user_id column to existing tables
ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE tags 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Update existing entries table to include user_id in updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for entries table
CREATE POLICY "Users can view their own entries" 
    ON entries FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own entries" 
    ON entries FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries" 
    ON entries FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries" 
    ON entries FOR DELETE 
    USING (auth.uid() = user_id);

-- Policies for tags table
CREATE POLICY "Users can view their own tags" 
    ON tags FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tags" 
    ON tags FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags" 
    ON tags FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags" 
    ON tags FOR DELETE 
    USING (auth.uid() = user_id);

-- Policies for entry_tags junction table
CREATE POLICY "Users can view their own entry-tag relationships" 
    ON entry_tags FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM entries 
            WHERE entries.id = entry_tags.entry_id 
            AND entries.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own entry-tag relationships" 
    ON entry_tags FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM entries 
            WHERE entries.id = entry_tags.entry_id 
            AND entries.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own entry-tag relationships" 
    ON entry_tags FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM entries 
            WHERE entries.id = entry_tags.entry_id 
            AND entries.user_id = auth.uid()
        )
    );

-- Policies for entry_history table
CREATE POLICY "Users can view their own entry history" 
    ON entry_history FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM entries 
            WHERE entries.id = entry_history.entry_id 
            AND entries.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own entry history" 
    ON entry_history FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM entries 
            WHERE entries.id = entry_history.entry_id 
            AND entries.user_id = auth.uid()
        )
    );

-- Policies for user_profiles table
CREATE POLICY "Users can view their own profile" 
    ON user_profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
    ON user_profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON user_profiles FOR UPDATE 
    USING (auth.uid() = id);

-- =============================================
-- Authentication Helper Functions
-- =============================================

-- Function to create user profile automatically when user signs up
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
CREATE TRIGGER create_user_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- Function to get current user profile
CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS user_profiles AS $$
BEGIN
    RETURN (
        SELECT * FROM user_profiles 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Data Migration Functions
-- =============================================

-- Function to assign existing entries to a specific user (for migration)
CREATE OR REPLACE FUNCTION assign_entries_to_user(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Update entries without user_id
    UPDATE entries 
    SET user_id = target_user_id 
    WHERE user_id IS NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    -- Update tags without user_id
    UPDATE tags 
    SET user_id = target_user_id 
    WHERE user_id IS NULL;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Comments for Documentation
-- =============================================

COMMENT ON TABLE user_profiles IS 'User profile information and preferences';
COMMENT ON COLUMN user_profiles.preferences IS 'JSONB column storing user preferences like theme, default tags, notifications';
COMMENT ON FUNCTION create_user_profile() IS 'Automatically creates user profile when new user signs up';
COMMENT ON FUNCTION assign_entries_to_user(UUID) IS 'Migration function to assign existing entries to a user';

-- =============================================
-- Grants and Permissions
-- =============================================

-- Grant necessary permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions for the service role (for migrations)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;