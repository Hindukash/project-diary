-- Project Diary Database Schema
-- Execute this SQL in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Entries table (main diary entries)
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table  
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table for entry-tag relationships
CREATE TABLE entry_tags (
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, tag_id)
);

-- Entry version history
CREATE TABLE entry_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_entries_created_at ON entries(created_at DESC);
CREATE INDEX idx_entries_updated_at ON entries(updated_at DESC);
CREATE INDEX idx_entry_tags_entry_id ON entry_tags(entry_id);
CREATE INDEX idx_entry_tags_tag_id ON entry_tags(tag_id);
CREATE INDEX idx_entry_history_entry_id ON entry_history(entry_id);
CREATE INDEX idx_tags_name ON tags(name);

-- Full-text search index
CREATE INDEX idx_entries_search ON entries USING GIN(to_tsvector('english', title || ' ' || content));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_entries_updated_at
    BEFORE UPDATE ON entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO tags (name, color) VALUES
  ('Work', '#3B82F6'),
  ('Personal', '#10B981'),
  ('Ideas', '#F59E0B'),
  ('Project', '#8B5CF6'),
  ('Learning', '#EF4444');

INSERT INTO entries (title, content, summary, images) VALUES
  ('Welcome to Project Diary', 'This is your first entry in the Project Diary app. You can create, edit, and organize your thoughts here.', 'Welcome to Project Diary app with basic functionality.', '[]'),
  ('Getting Started', 'Project Diary helps you organize your thoughts and projects. You can tag entries, search through them, and keep track of your progress.', 'Getting started guide for organizing thoughts and projects.', '[]'),
  ('Feature Overview', 'The app includes rich text editing, tag management, search functionality, and export options. Everything is designed to help you stay organized.', 'Overview of app features including editing, tags, and search.', '[]');

-- Link some entries to tags
INSERT INTO entry_tags (entry_id, tag_id) 
SELECT e.id, t.id 
FROM entries e, tags t 
WHERE e.title = 'Welcome to Project Diary' AND t.name = 'Personal';

INSERT INTO entry_tags (entry_id, tag_id) 
SELECT e.id, t.id 
FROM entries e, tags t 
WHERE e.title = 'Getting Started' AND t.name = 'Learning';

INSERT INTO entry_tags (entry_id, tag_id) 
SELECT e.id, t.id 
FROM entries e, tags t 
WHERE e.title = 'Feature Overview' AND t.name = 'Project';