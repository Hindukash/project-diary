const { createClient } = require('@supabase/supabase-js');
const { config } = require('dotenv');

// Load environment variables
config({ path: '.env.local' });

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // This should be the service key, not anon key

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY');
  console.error('Note: You need the SERVICE KEY (not anon key) for migrations');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateToAuth() {
  try {
    console.log('🔐 Starting authentication migration...');

    // Step 1: Check current state
    console.log('📊 Checking current database state...');
    
    const { data: entries, error: entriesError } = await supabase
      .from('entries')
      .select('id, user_id')
      .limit(5);

    if (entriesError) {
      console.error('Error checking entries:', entriesError);
      throw entriesError;
    }

    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('id, user_id')
      .limit(5);

    if (tagsError) {
      console.error('Error checking tags:', tagsError);
      throw tagsError;
    }

    const entriesWithoutUser = entries.filter(entry => !entry.user_id);
    const tagsWithoutUser = tags.filter(tag => !tag.user_id);

    console.log(`📝 Found ${entriesWithoutUser.length} entries without user_id`);
    console.log(`🏷️  Found ${tagsWithoutUser.length} tags without user_id`);

    // Step 2: Create a migration user if needed
    if (entriesWithoutUser.length > 0 || tagsWithoutUser.length > 0) {
      console.log('👤 Creating migration user...');
      
      // Create a system user for orphaned data
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'migration@projectdiary.local',
        password: 'Migration2024!',
        email_confirm: true,
        user_metadata: {
          full_name: 'Migration User',
        },
      });

      if (authError) {
        console.error('Error creating migration user:', authError);
        throw authError;
      }

      const migrationUserId = authData.user.id;
      console.log(`✅ Created migration user with ID: ${migrationUserId}`);

      // Step 3: Assign orphaned entries to migration user
      if (entriesWithoutUser.length > 0) {
        console.log('📝 Assigning orphaned entries to migration user...');
        
        const { error: updateEntriesError } = await supabase
          .from('entries')
          .update({ user_id: migrationUserId })
          .is('user_id', null);

        if (updateEntriesError) {
          console.error('Error updating entries:', updateEntriesError);
          throw updateEntriesError;
        }

        console.log(`✅ Updated ${entriesWithoutUser.length} entries`);
      }

      // Step 4: Assign orphaned tags to migration user
      if (tagsWithoutUser.length > 0) {
        console.log('🏷️  Assigning orphaned tags to migration user...');
        
        const { error: updateTagsError } = await supabase
          .from('tags')
          .update({ user_id: migrationUserId })
          .is('user_id', null);

        if (updateTagsError) {
          console.error('Error updating tags:', updateTagsError);
          throw updateTagsError;
        }

        console.log(`✅ Updated ${tagsWithoutUser.length} tags`);
      }
    }

    // Step 5: Verify migration
    console.log('🔍 Verifying migration...');
    
    const { data: verifyEntries, error: verifyEntriesError } = await supabase
      .from('entries')
      .select('id')
      .is('user_id', null);

    if (verifyEntriesError) {
      console.error('Error verifying entries:', verifyEntriesError);
      throw verifyEntriesError;
    }

    const { data: verifyTags, error: verifyTagsError } = await supabase
      .from('tags')
      .select('id')
      .is('user_id', null);

    if (verifyTagsError) {
      console.error('Error verifying tags:', verifyTagsError);
      throw verifyTagsError;
    }

    if (verifyEntries.length === 0 && verifyTags.length === 0) {
      console.log('✅ Migration successful! All data has been assigned to users.');
    } else {
      console.warn(`⚠️  Migration incomplete: ${verifyEntries.length} entries and ${verifyTags.length} tags still without user_id`);
    }

    // Step 6: Show summary
    console.log('\n📊 Migration Summary:');
    console.log('='.repeat(50));
    console.log(`✅ Entries migrated: ${entriesWithoutUser.length}`);
    console.log(`✅ Tags migrated: ${tagsWithoutUser.length}`);
    console.log(`👤 Migration user created: ${entriesWithoutUser.length > 0 || tagsWithoutUser.length > 0 ? 'Yes' : 'No'}`);
    console.log('='.repeat(50));

    console.log('\n🔐 Authentication migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Apply the auth-schema.sql to your Supabase database');
    console.log('2. Test Row Level Security policies');
    console.log('3. Begin implementing authentication UI');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateToAuth()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });