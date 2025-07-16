const { createClient } = require('@supabase/supabase-js');
const { config } = require('dotenv');

// Load environment variables
config({ path: '.env.local' });

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clearDatabase() {
  try {
    console.log('🧹 Clearing database...');

    // Delete in order due to foreign key constraints
    
    // 1. Delete entry-tag relationships
    const { error: entryTagsError } = await supabase
      .from('entry_tags')
      .delete()
      .neq('entry_id', 'nonexistent'); // Delete all

    if (entryTagsError) {
      console.warn('Warning clearing entry_tags:', entryTagsError);
    }

    // 2. Delete entry history
    const { error: historyError } = await supabase
      .from('entry_history')
      .delete()
      .neq('entry_id', 'nonexistent'); // Delete all

    if (historyError) {
      console.warn('Warning clearing entry_history:', historyError);
    }

    // 3. Delete entries
    const { error: entriesError } = await supabase
      .from('entries')
      .delete()
      .neq('id', 'nonexistent'); // Delete all

    if (entriesError) {
      console.warn('Warning clearing entries:', entriesError);
    }

    // 4. Delete tags
    const { error: tagsError } = await supabase
      .from('tags')
      .delete()
      .neq('id', 'nonexistent'); // Delete all

    if (tagsError) {
      console.warn('Warning clearing tags:', tagsError);
    }

    console.log('✅ Database cleared successfully!');

  } catch (error) {
    console.error('❌ Database clearing failed:', error);
    throw error;
  }
}

// Run clearing
clearDatabase()
  .then(() => {
    console.log('Clearing completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Clearing failed:', error);
    process.exit(1);
  });