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

// Sample tags data
const SAMPLE_TAGS = [
  { name: 'Welcome', color: '#3B82F6' },
  { name: 'Getting Started', color: '#10B981' }
];

// Sample entries data
const SAMPLE_ENTRIES = [
  {
    title: 'Welcome to Project Diary',
    content: `# Welcome to Project Diary! 🎉

Your personal diary application is ready to use. This is your first entry to help you get started.

## Key Features
- **Create entries** with rich text formatting
- **Organize** with tags and categories  
- **Search** through all your content
- **Track** your progress with version history

## Getting Started
1. Click the **"+"** button to create new entries
2. Use **tags** to organize your thoughts
3. **Search** to find past entries quickly
4. **Edit** or delete this welcome entry when ready

## Tips
- Write regularly, even short entries are valuable
- Use tags consistently to stay organized
- Review past entries to see your growth

**Ready to start your journey?** Create your first entry and make this space your own! ✨`,
    summary: 'Welcome message explaining Project Diary features and how to get started.',
    tags: ['Welcome', 'Getting Started'],
    images: [],
    version: 1
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if database is already seeded
    const { data: existingTags } = await supabase
      .from('tags')
      .select('id')
      .limit(1);

    if (existingTags && existingTags.length > 0) {
      console.log('⚠️  Database already contains data. Forcing reseed...');
      
      // Clear existing data first
      await supabase.from('entry_tags').delete().neq('entry_id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('entry_history').delete().neq('entry_id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('entries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('tags').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      console.log('🧹 Existing data cleared');
    }

    // Insert tags
    console.log('📝 Inserting tags...');
    const { data: insertedTags, error: tagError } = await supabase
      .from('tags')
      .insert(SAMPLE_TAGS.map(tag => ({
        name: tag.name,
        color: tag.color,
        created_at: new Date().toISOString()
      })))
      .select();

    if (tagError) {
      throw new Error(`Failed to insert tags: ${tagError.message}`);
    }

    console.log(`✅ Inserted ${insertedTags.length} tags`);

    // Create a map of tag names to IDs
    const tagMap = new Map();
    insertedTags.forEach(tag => {
      tagMap.set(tag.name, tag.id);
    });

    // Insert entries
    console.log('📚 Inserting entries...');
    const now = new Date().toISOString();
    
    for (const entry of SAMPLE_ENTRIES) {
      // Insert entry
      const { data: insertedEntry, error: entryError } = await supabase
        .from('entries')
        .insert({
          title: entry.title,
          content: entry.content,
          summary: entry.summary,
          images: entry.images,
          version: entry.version,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (entryError) {
        throw new Error(`Failed to insert entry "${entry.title}": ${entryError.message}`);
      }

      // Insert entry-tag relationships
      if (entry.tags.length > 0) {
        const entryTags = entry.tags.map(tagName => ({
          entry_id: insertedEntry.id,
          tag_id: tagMap.get(tagName)
        }));

        const { error: relationError } = await supabase
          .from('entry_tags')
          .insert(entryTags);

        if (relationError) {
          console.warn(`Failed to insert tag relationships for "${entry.title}": ${relationError.message}`);
        }
      }
    }

    console.log(`✅ Inserted ${SAMPLE_ENTRIES.length} entry`);
    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Run seeding
seedDatabase()
  .then(() => {
    console.log('Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });