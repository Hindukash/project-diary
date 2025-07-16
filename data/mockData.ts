// Project Diary v0.0.4 - Database Mode
// This file is kept for compatibility but is not used in database mode
// All data operations now use the Supabase database with user authentication

import { Entry, Tag } from './types';

// Empty mock data - not used in database mode
export const mockTags: Tag[] = [];
export const mockEntries: Entry[] = [];

// Note: The application now uses:
// - lib/multi-user-db.ts for all database operations
// - Row Level Security for data isolation
// - Real user authentication and profiles