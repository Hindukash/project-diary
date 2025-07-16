const { supabase } = require('../lib/supabase');

// Sample tags data
const SAMPLE_TAGS = [
  { name: 'Work', color: '#3B82F6' },
  { name: 'Personal', color: '#10B981' },
  { name: 'Ideas', color: '#F59E0B' },
  { name: 'Project', color: '#8B5CF6' },
  { name: 'Learning', color: '#EF4444' },
  { name: 'Travel', color: '#06B6D4' },
  { name: 'Health', color: '#84CC16' },
  { name: 'Goals', color: '#EC4899' },
  { name: 'Reflection', color: '#6B7280' },
  { name: 'Meeting', color: '#F97316' }
];

// Sample entries data
const SAMPLE_ENTRIES = [
  {
    title: 'Project Planning Session',
    content: `# Project Planning Session

Today we had our quarterly planning session. The team discussed several key initiatives:

## Key Discussions
- **Q1 Objectives**: Focus on user experience improvements
- **Resource Allocation**: Need to hire 2 more developers
- **Timeline**: Target completion by end of March

## Action Items
1. Review user feedback from last quarter
2. Create detailed project specifications
3. Set up weekly check-ins with stakeholders

The session was productive and everyone seems aligned on the direction.`,
    summary: 'Quarterly planning session covering Q1 objectives, resource allocation, and timeline discussions.',
    tags: ['Work', 'Project', 'Meeting'],
    images: [],
    version: 1
  },
  {
    title: 'Morning Meditation Practice',
    content: `# Morning Meditation Practice

Started my day with a 20-minute meditation session. This practice has been incredibly beneficial for my mental clarity and focus.

## Today's Session
- **Duration**: 20 minutes
- **Type**: Mindfulness meditation
- **Focus**: Breathing and present moment awareness

## Observations
- Mind was particularly active today
- Took about 8 minutes to settle into the practice
- Felt more centered and calm afterward

## Benefits I've Noticed
- Improved focus throughout the day
- Better emotional regulation
- Enhanced creativity
- Reduced stress levels

Planning to continue this practice and maybe extend to 25 minutes next week.`,
    summary: '20-minute morning meditation session focusing on mindfulness and breathing techniques.',
    tags: ['Personal', 'Health', 'Reflection'],
    images: [],
    version: 1
  },
  {
    title: 'Weekend Hiking Adventure',
    content: `# Weekend Hiking Adventure

Went on an amazing hike to Blue Ridge Trail today. The weather was perfect and the views were breathtaking.

## Trail Details
- **Location**: Blue Ridge Trail
- **Distance**: 8.5 miles
- **Elevation**: 1,200 feet
- **Duration**: 4 hours

## Highlights
- Spectacular sunrise at the summit
- Saw several wildlife species including deer and hawks
- Perfect weather conditions (65°F, sunny)
- Great company with Sarah and Mike

## Photos
Took tons of photos of the landscape and wildlife. The autumn colors were particularly stunning this year.

## Next Adventure
Planning to tackle the longer Mountain Peak Trail next month. Need to prepare better gear and conditioning.`,
    summary: '8.5-mile hike on Blue Ridge Trail with friends, featuring great weather and stunning views.',
    tags: ['Personal', 'Travel', 'Health'],
    images: [],
    version: 1
  },
  {
    title: 'Learning React Hooks',
    content: `# Learning React Hooks

Spent the afternoon diving deep into React Hooks. This is a game-changer for React development.

## What I Learned
- **useState**: Managing component state
- **useEffect**: Handling side effects and lifecycle events
- **useContext**: Sharing state across components
- **useCallback**: Optimizing performance with memoization

## Key Insights
- Hooks make functional components much more powerful
- Code is more readable and reusable
- Testing becomes easier with hooks
- Performance can be optimized with proper use

## Practice Project
Built a simple todo app using only hooks to practice:
\`\`\`javascript
const [todos, setTodos] = useState([]);
const [inputValue, setInputValue] = useState('');

useEffect(() => {
  // Load todos from localStorage
  const saved = localStorage.getItem('todos');
  if (saved) setTodos(JSON.parse(saved));
}, []);
\`\`\`

## Next Steps
- Learn custom hooks
- Practice with useReducer for complex state
- Build a larger project using hooks`,
    summary: 'Comprehensive learning session on React Hooks including useState, useEffect, and useContext.',
    tags: ['Learning', 'Work', 'Project'],
    images: [],
    version: 1
  },
  {
    title: 'Quarterly Goals Review',
    content: `# Quarterly Goals Review

Time for my quarterly review of personal and professional goals. Overall progress has been good but some areas need attention.

## Professional Goals
### ✅ Completed
- Learned React and Next.js
- Completed 2 major projects
- Improved code review process

### 🔄 In Progress
- Building portfolio website (80% complete)
- Learning TypeScript (60% complete)
- Networking in tech community (ongoing)

### ❌ Not Started
- Contributing to open source projects
- Starting a tech blog

## Personal Goals
### ✅ Completed
- Established daily meditation practice
- Read 12 books this year
- Improved fitness routine

### 🔄 In Progress
- Learning Spanish (intermediate level)
- Hiking 50 trails this year (32 completed)

### ❌ Behind Schedule
- Learning piano (only 2 lessons completed)
- Cooking more meals at home

## Adjustments for Next Quarter
1. Focus on completing portfolio website
2. Start contributing to open source
3. Dedicate more time to piano practice
4. Set realistic cooking goals

Overall satisfaction: 7/10. Good progress but need to prioritize better.`,
    summary: 'Quarterly review of personal and professional goals with progress assessment and next quarter planning.',
    tags: ['Goals', 'Reflection', 'Personal'],
    images: [],
    version: 1
  },
  {
    title: 'New App Idea: Task Manager',
    content: `# New App Idea: Task Manager

Had a great idea for a task management app that focuses on simplicity and productivity.

## Core Concept
A minimalist task manager that helps users focus on what matters most without overwhelming features.

## Key Features
- **Simple Interface**: Clean, distraction-free design
- **Smart Prioritization**: AI-powered task prioritization
- **Time Blocking**: Integrate with calendar for time management
- **Progress Tracking**: Visual progress indicators
- **Collaboration**: Share tasks with team members

## Technical Stack
- **Frontend**: React with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Authentication**: Auth0
- **Deployment**: Vercel for frontend, Railway for backend

## Target Audience
- Knowledge workers
- Students
- Small teams
- Freelancers

## Monetization
- Freemium model
- Premium features: advanced analytics, team collaboration
- Enterprise pricing for larger teams

## Next Steps
1. Create detailed wireframes
2. Build MVP with core features
3. Get feedback from potential users
4. Iterate based on feedback

This could be a great side project to work on over the next few months.`,
    summary: 'Detailed concept for a minimalist task management app with AI-powered prioritization and time blocking.',
    tags: ['Ideas', 'Project', 'Work'],
    images: [],
    version: 1
  }
];

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if database is already seeded
    const { data: existingTags } = await supabase
      .from('tags')
      .select('id')
      .limit(1);

    if (existingTags && existingTags.length > 0) {
      console.log('⚠️  Database already contains data. Skipping seeding.');
      return;
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
    insertedTags.forEach((tag: any) => {
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

    console.log(`✅ Inserted ${SAMPLE_ENTRIES.length} entries`);
    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Run seeding if this script is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}