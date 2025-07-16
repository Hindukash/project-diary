# Supabase Setup Guide for Project Diary v0.0.3

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - Name: `project-diary`
   - Database Password: Create a strong password
   - Region: Choose closest to your location
6. Click "Create new project"
7. Wait for project to be created (2-3 minutes)

## 2. Get Project Configuration

1. In your Supabase dashboard, go to Settings → API
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Public anon key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 3. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_USE_DATABASE=true
```

## 4. Create Database Schema

1. In your Supabase dashboard, go to SQL Editor
2. Click "New query"
3. Copy and paste the contents of `database/schema.sql`
4. Click "Run" to execute the SQL
5. Verify tables are created in the Table Editor

## 5. Seed Database (Optional)

To populate your database with sample data for testing:

1. Run the seeding script: `npm run seed`
2. This will create sample entries and tags for development
3. The script will skip seeding if data already exists

## 6. Test Connection

1. Start your development server: `npm run dev`
2. Check browser console for any connection errors
3. Try creating a new entry to test database integration

## 7. Database Tables Created

- **entries**: Main diary entries with content, tags, and metadata
- **tags**: Available tags with colors
- **entry_tags**: Junction table linking entries to tags
- **entry_history**: Version history for entries

## 8. Default Data

The seeding script (`npm run seed`) includes sample data for testing:
- 6 sample entries with rich content
- 10 sample tags (Work, Personal, Ideas, Project, Learning, Travel, Health, Goals, Reflection, Meeting)
- Entry-tag relationships

## 9. Troubleshooting

### Connection Issues
- Verify environment variables are correct
- Check that Supabase project is active
- Ensure anon key has correct permissions

### Permission Errors
- By default, tables are accessible to anonymous users
- For production, you'll want to add Row Level Security (RLS)

### Performance Issues
- Database includes indexes for common queries
- Full-text search is enabled for entries
- Consider adding more indexes for specific query patterns

## 10. Next Steps

Once setup is complete:
1. All mock data will be replaced with database operations
2. Data will persist between browser sessions
3. Ready for authentication in future versions