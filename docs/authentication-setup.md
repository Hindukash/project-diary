# Authentication Setup Guide - Project Diary v0.0.4

## Overview

This guide will help you set up authentication for Project Diary v0.0.4, transforming it from a single-user application to a secure multi-user platform.

## Prerequisites

- Completed Project Diary v0.0.3 (Supabase Database Integration)
- Supabase project with existing entries and tags
- Access to your Supabase dashboard

## Step 1: Enable Authentication in Supabase

1. **Go to your Supabase dashboard**
2. **Navigate to Authentication → Settings**
3. **Enable the following providers:**
   - Email (enabled by default)
   - Optionally: Google, GitHub, etc.

4. **Configure Email Settings:**
   - Set up email templates (welcome, password reset, etc.)
   - Configure your SMTP settings or use Supabase's built-in email

5. **Set Authentication Policies:**
   - Go to Authentication → Policies
   - Enable "Email confirmations" if desired
   - Set password requirements

## Step 2: Add Service Key to Environment

1. **Get your service key:**
   - In Supabase dashboard, go to Settings → API
   - Copy the `service_role` key (NOT the anon key)

2. **Update your `.env.local` file:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_USE_DATABASE=true
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   ```

## Step 3: Apply Database Schema Changes

1. **Run the authentication schema migration:**
   ```bash
   # In your Supabase dashboard, go to SQL Editor
   # Copy and paste the contents of database/auth-schema.sql
   # Click "Run" to execute
   ```

2. **The migration will create:**
   - `user_profiles` table
   - `user_id` columns in existing tables
   - Row Level Security (RLS) policies
   - Helper functions for user management

## Step 4: Migrate Existing Data

1. **Run the data migration script:**
   ```bash
   npm run migrate-auth
   ```

2. **This will:**
   - Create a migration user for existing entries
   - Assign all orphaned entries and tags to this user
   - Ensure all data has proper user ownership

## Step 5: Test Row Level Security

1. **Create a test user:**
   ```sql
   -- In Supabase SQL Editor
   SELECT auth.users();
   ```

2. **Verify data isolation:**
   - Each user should only see their own entries and tags
   - No cross-user data leakage

## Step 6: Configure Storage (Optional)

If you plan to use avatar uploads:

1. **Create storage bucket:**
   ```sql
   -- In Supabase SQL Editor
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('avatars', 'avatars', true);
   ```

2. **Set storage policies:**
   ```sql
   -- Allow users to upload their own avatars
   CREATE POLICY "Users can upload their own avatars" 
   ON storage.objects FOR INSERT 
   WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

## Database Schema Changes

### New Tables

```sql
-- User profiles table
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Updated Tables

```sql
-- Added to existing tables
ALTER TABLE entries ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE tags ADD COLUMN user_id UUID REFERENCES auth.users(id);
```

## Row Level Security Policies

All tables now have RLS policies that ensure:
- Users can only see their own data
- Users can only modify their own data
- No unauthorized access to other users' information

## Migration User

If you have existing entries, the migration creates a special user:
- **Email:** `migration@projectdiary.local`
- **Password:** `Migration2024!`
- **Purpose:** Owns all pre-existing entries and tags

You can:
- Keep this user for legacy data
- Transfer entries to real users as needed
- Delete the migration user after transferring data

## Testing Authentication

1. **Create a test account:**
   ```bash
   # Use the auth library we created
   await auth.signUp('test@example.com', 'password123', 'Test User');
   ```

2. **Verify data isolation:**
   - Sign in as different users
   - Ensure each user only sees their own entries

3. **Test permissions:**
   - Try to access another user's data directly
   - Should be blocked by RLS policies

## Troubleshooting

### Common Issues

1. **"User not found" errors:**
   - Check if the user profile was created automatically
   - Verify the trigger function is working

2. **RLS policy errors:**
   - Ensure user is properly authenticated
   - Check that `auth.uid()` returns the correct user ID

3. **Migration user access:**
   - If you can't access migration data, check the user ID assignment
   - Verify the migration script completed successfully

### Reset Authentication

To start fresh:
```bash
# Clear all auth data
npm run clear-db
# Re-run the schema
# Apply auth-schema.sql in Supabase
# Re-run migration
npm run migrate-auth
```

## Security Considerations

1. **Service Key Security:**
   - Never commit the service key to version control
   - Only use it for migrations and admin operations
   - Rotate it regularly

2. **RLS Policies:**
   - Test thoroughly with multiple users
   - Ensure no data leakage between users
   - Monitor query performance

3. **Email Verification:**
   - Enable email confirmation for production
   - Set up proper email templates
   - Monitor bounce rates

## Next Steps

After completing authentication setup:
1. Implement authentication UI components
2. Add user profile management
3. Create protected routes
4. Test multi-user functionality
5. Deploy with proper security measures

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Verify environment variables are set correctly
3. Test RLS policies with different users
4. Review the migration script output