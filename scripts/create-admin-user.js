const { createClient } = require('@supabase/supabase-js');
const { config } = require('dotenv');

// Load environment variables
config({ path: '.env.local' });

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Admin user configuration
const ADMIN_CONFIG = {
  email: 'admin@projectdiary.local',
  password: 'Admin123!',
  fullName: 'Admin User',
  role: 'admin'
};

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user for development...');
    
    // Check if admin user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error checking existing users:', listError);
      throw listError;
    }
    
    const existingAdmin = existingUsers.users.find(user => user.email === ADMIN_CONFIG.email);
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log(`📧 Email: ${ADMIN_CONFIG.email}`);
      console.log(`🔑 Password: ${ADMIN_CONFIG.password}`);
      console.log(`🆔 User ID: ${existingAdmin.id}`);
      return existingAdmin;
    }
    
    // Create admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_CONFIG.email,
      password: ADMIN_CONFIG.password,
      email_confirm: true, // Skip email confirmation for development
      user_metadata: {
        full_name: ADMIN_CONFIG.fullName,
        role: ADMIN_CONFIG.role
      }
    });
    
    if (authError) {
      console.error('Error creating admin user:', authError);
      throw authError;
    }
    
    const adminUser = authData.user;
    console.log('✅ Admin user created successfully!');
    console.log(`🆔 User ID: ${adminUser.id}`);
    console.log(`📧 Email: ${adminUser.email}`);
    
    // Create sample entries for admin user
    console.log('📝 Creating sample entries for admin user...');
    
    const sampleEntries = [
      {
        title: 'Welcome to Project Diary v0.0.4',
        content: `# Welcome to Project Diary v0.0.4! 🎉

This is your admin account for testing the new authentication and multi-user features.

## What's New in v0.0.4:
- **Multi-User Support**: Each user has their own private diary
- **Secure Authentication**: Email/password with form validation
- **Row Level Security**: Database-level data isolation
- **User Profiles**: Customizable user information
- **Protected Routes**: Authentication-required access

## Admin Features:
- Quick login with: admin@projectdiary.local
- Password: Admin123!
- Full access to all diary features
- Testing environment ready

Start exploring the new features! 🚀`,
        tags: ['admin', 'welcome', 'v0.0.4'],
        summary: 'Welcome message for Project Diary v0.0.4 with admin account information.',
        images: []
      },
      {
        title: 'Authentication Testing Notes',
        content: `# Authentication Testing Checklist

## ✅ Features to Test:
- [x] User registration (signup)
- [x] User login (signin)
- [x] Profile management
- [x] Data isolation between users
- [x] Protected routes
- [x] Session management

## 🔐 Security Features:
- Row Level Security (RLS) policies
- User-specific data filtering
- Secure password handling
- Session persistence

## 🧪 Test Scenarios:
1. Create multiple user accounts
2. Verify data isolation
3. Test sign out/sign in flow
4. Check profile updates
5. Validate security policies

## 📊 Admin Tools:
- Security validation component
- Database statistics
- Migration utilities
- User management

Use this account for comprehensive testing!`,
        tags: ['testing', 'security', 'development'],
        summary: 'Testing checklist and notes for authentication features.',
        images: []
      }
    ];
    
    // Create tags first
    const tagNames = ['admin', 'welcome', 'v0.0.4', 'testing', 'security', 'development'];
    const createdTags = [];
    
    for (const tagName of tagNames) {
      const { data: existingTag, error: tagCheckError } = await supabase
        .from('tags')
        .select('*')
        .eq('name', tagName)
        .eq('user_id', adminUser.id)
        .single();
      
      if (tagCheckError && tagCheckError.code === 'PGRST116') {
        // Tag doesn't exist, create it
        const { data: newTag, error: tagCreateError } = await supabase
          .from('tags')
          .insert([{
            name: tagName,
            color: getRandomColor(),
            user_id: adminUser.id,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();
        
        if (tagCreateError) {
          console.error(`Error creating tag ${tagName}:`, tagCreateError);
        } else {
          createdTags.push(newTag);
        }
      } else if (!tagCheckError) {
        createdTags.push(existingTag);
      }
    }
    
    // Create sample entries
    for (const entry of sampleEntries) {
      const { data: newEntry, error: entryError } = await supabase
        .from('entries')
        .insert([{
          title: entry.title,
          content: entry.content,
          summary: entry.summary,
          images: entry.images,
          version: 1,
          user_id: adminUser.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (entryError) {
        console.error(`Error creating entry "${entry.title}":`, entryError);
        continue;
      }
      
      // Add tags to entry
      const entryTags = entry.tags.map(tagName => {
        const tag = createdTags.find(t => t.name === tagName);
        return tag ? { entry_id: newEntry.id, tag_id: tag.id } : null;
      }).filter(Boolean);
      
      if (entryTags.length > 0) {
        const { error: tagLinkError } = await supabase
          .from('entry_tags')
          .insert(entryTags);
        
        if (tagLinkError) {
          console.error(`Error linking tags to entry "${entry.title}":`, tagLinkError);
        }
      }
    }
    
    console.log('✅ Sample entries created successfully!');
    
    // Summary
    console.log('\n🎯 Admin Account Summary:');
    console.log('=' .repeat(50));
    console.log(`📧 Email: ${ADMIN_CONFIG.email}`);
    console.log(`🔑 Password: ${ADMIN_CONFIG.password}`);
    console.log(`👤 Full Name: ${ADMIN_CONFIG.fullName}`);
    console.log(`🆔 User ID: ${adminUser.id}`);
    console.log(`📝 Sample Entries: ${sampleEntries.length}`);
    console.log(`🏷️  Tags Created: ${createdTags.length}`);
    console.log('=' .repeat(50));
    console.log('\n🚀 Ready for testing! Use these credentials to sign in.');
    
    return adminUser;
    
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    throw error;
  }
}

// Helper function to get random tag colors
function getRandomColor() {
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280', // Gray
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('✅ Admin user setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Admin user setup failed:', error);
    process.exit(1);
  });