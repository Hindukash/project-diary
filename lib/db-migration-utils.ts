import { supabase } from './supabase';
import { getCurrentUser } from './auth-db';

// Migration utilities for transitioning from single-user to multi-user database operations

export interface MigrationProgress {
  total: number;
  completed: number;
  errors: string[];
  status: 'idle' | 'running' | 'completed' | 'failed';
}

// Check if database has multi-user setup
export async function checkMultiUserSetup(): Promise<{
  hasUserIdColumns: boolean;
  hasRlsPolicies: boolean;
  hasUserProfiles: boolean;
}> {
  try {
    // Check if user_id columns exist
    const { data: entryColumns } = await supabase
      .rpc('get_table_columns', { table_name: 'entries' });
    
    const { data: tagColumns } = await supabase
      .rpc('get_table_columns', { table_name: 'tags' });

    const hasUserIdColumns = entryColumns?.some((col: any) => col.column_name === 'user_id') &&
                             tagColumns?.some((col: any) => col.column_name === 'user_id');

    // Check if user_profiles table exists
    const { data: userProfiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    const hasUserProfiles = !profileError;

    // Check if RLS is enabled (basic check)
    const { data: rlsStatus } = await supabase
      .rpc('check_rls_enabled', { table_name: 'entries' });

    const hasRlsPolicies = rlsStatus?.length > 0;

    return {
      hasUserIdColumns,
      hasRlsPolicies,
      hasUserProfiles
    };
  } catch (error) {
    console.error('Error checking multi-user setup:', error);
    return {
      hasUserIdColumns: false,
      hasRlsPolicies: false,
      hasUserProfiles: false
    };
  }
}

// Get statistics about current database state
export async function getDatabaseStats(): Promise<{
  totalEntries: number;
  totalTags: number;
  entriesWithUser: number;
  tagsWithUser: number;
  orphanedEntries: number;
  orphanedTags: number;
}> {
  const user = await getCurrentUser();
  
  // Count total entries and tags
  const { count: totalEntries } = await supabase
    .from('entries')
    .select('*', { count: 'exact', head: true });

  const { count: totalTags } = await supabase
    .from('tags')
    .select('*', { count: 'exact', head: true });

  // Count entries and tags with user_id
  const { count: entriesWithUser } = await supabase
    .from('entries')
    .select('*', { count: 'exact', head: true })
    .not('user_id', 'is', null);

  const { count: tagsWithUser } = await supabase
    .from('tags')
    .select('*', { count: 'exact', head: true })
    .not('user_id', 'is', null);

  return {
    totalEntries: totalEntries || 0,
    totalTags: totalTags || 0,
    entriesWithUser: entriesWithUser || 0,
    tagsWithUser: tagsWithUser || 0,
    orphanedEntries: (totalEntries || 0) - (entriesWithUser || 0),
    orphanedTags: (totalTags || 0) - (tagsWithUser || 0)
  };
}

// Validate that all user data is properly isolated
export async function validateDataIsolation(): Promise<{
  isValid: boolean;
  issues: string[];
}> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      isValid: false,
      issues: ['No authenticated user']
    };
  }

  const issues: string[] = [];

  try {
    // Check entries
    const { data: entries } = await supabase
      .from('entries')
      .select('id, user_id');

    const entriesWithoutUser = entries?.filter(e => !e.user_id) || [];
    const entriesWithDifferentUser = entries?.filter(e => e.user_id && e.user_id !== user.id) || [];

    if (entriesWithoutUser.length > 0) {
      issues.push(`${entriesWithoutUser.length} entries without user_id`);
    }

    if (entriesWithDifferentUser.length > 0) {
      issues.push(`${entriesWithDifferentUser.length} entries belonging to other users are visible`);
    }

    // Check tags
    const { data: tags } = await supabase
      .from('tags')
      .select('id, user_id');

    const tagsWithoutUser = tags?.filter(t => !t.user_id) || [];
    const tagsWithDifferentUser = tags?.filter(t => t.user_id && t.user_id !== user.id) || [];

    if (tagsWithoutUser.length > 0) {
      issues.push(`${tagsWithoutUser.length} tags without user_id`);
    }

    if (tagsWithDifferentUser.length > 0) {
      issues.push(`${tagsWithDifferentUser.length} tags belonging to other users are visible`);
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  } catch (error) {
    return {
      isValid: false,
      issues: [`Error during validation: ${error}`]
    };
  }
}

// Test database operations with current user
export async function testDatabaseOperations(): Promise<{
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  errors: string[];
}> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false,
      errors: ['No authenticated user']
    };
  }

  const errors: string[] = [];
  let canCreate = false;
  let canRead = false;
  let canUpdate = false;
  let canDelete = false;

  try {
    // Test create
    const { data: testEntry, error: createError } = await supabase
      .from('entries')
      .insert([{
        title: 'Test Entry',
        content: 'Test content',
        summary: 'Test summary',
        user_id: user.id,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createError) {
      errors.push(`Create error: ${createError.message}`);
    } else {
      canCreate = true;

      // Test read
      const { data: readEntry, error: readError } = await supabase
        .from('entries')
        .select('*')
        .eq('id', testEntry.id)
        .single();

      if (readError) {
        errors.push(`Read error: ${readError.message}`);
      } else {
        canRead = true;
      }

      // Test update
      const { error: updateError } = await supabase
        .from('entries')
        .update({ title: 'Updated Test Entry' })
        .eq('id', testEntry.id);

      if (updateError) {
        errors.push(`Update error: ${updateError.message}`);
      } else {
        canUpdate = true;
      }

      // Test delete
      const { error: deleteError } = await supabase
        .from('entries')
        .delete()
        .eq('id', testEntry.id);

      if (deleteError) {
        errors.push(`Delete error: ${deleteError.message}`);
      } else {
        canDelete = true;
      }
    }
  } catch (error) {
    errors.push(`Unexpected error: ${error}`);
  }

  return {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    errors
  };
}

// Clean up test data
export async function cleanupTestData(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  try {
    // Delete any test entries
    await supabase
      .from('entries')
      .delete()
      .eq('user_id', user.id)
      .like('title', 'Test Entry%');

    // Delete any test tags
    await supabase
      .from('tags')
      .delete()
      .eq('user_id', user.id)
      .like('name', 'Test Tag%');
  } catch (error) {
    console.warn('Error cleaning up test data:', error);
  }
}