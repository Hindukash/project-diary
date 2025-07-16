# Project Diary

A secure, multi-user diary application built with Next.js 14, TypeScript, Tailwind CSS, and Supabase authentication.

[![Version](https://img.shields.io/badge/version-0.0.4-blue.svg)](https://github.com/Hindukash/project-diary/releases/tag/v0.0.4)
[![Supabase](https://img.shields.io/badge/database-Supabase-green.svg)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/framework-Next.js%2014-black.svg)](https://nextjs.org/)
[![Production Ready](https://img.shields.io/badge/status-Production%20Ready-green.svg)](https://github.com/Hindukash/project-diary)

## Features

### 🔐 **Multi-User Authentication (NEW in v0.0.4)**
- **Complete authentication system** with email/password signup and signin
- **User profile management** with customizable preferences
- **Row Level Security (RLS)** for complete data isolation between users
- **Secure session management** with automatic token handling
- **Password reset flow** with email-based recovery
- **Email confirmation** with account verification
- **Remember me functionality** for extended sessions

### 🛡️ **Enterprise-Grade Security**
- **Row Level Security policies** ensuring users only see their own data
- **Multi-user database architecture** with complete data isolation
- **Secure authentication context** with centralized state management
- **Protected routes** requiring authentication
- **Password strength validation** with real-time feedback
- **Automatic user profile creation** via database triggers

### 📝 **Entry Management**
- Create, edit, and delete diary entries with **user-specific storage**
- Rich text editor with markdown support and live preview
- **User-isolated** entry versioning and history tracking
- Advanced search through your own entries by title or content
- **Database-driven** operations with optimized queries

### 🖼️ **Media Support**
- Drag & drop image uploads with preview
- Image management and full-screen viewer
- Zoom and pan functionality
- Download images capability
- **User-specific** image storage

### 🏷️ **Personal Organization**
- Create and manage colored tags **per user**
- Filter entries by your own tags with **optimized queries**
- **User-specific** tag synchronization across components
- Personal tag-based organization system
- Automatic tag cleanup and usage tracking

### 🔍 **Advanced Search & Filter**
- Full-text search within your own entries
- Period filters (Last week, Last month, etc.)
- Tag-based filtering with user isolation
- Sort by date, title, or relevance
- **Real-time search** with database indexing

### 📤 **Export Options**
- Export your individual entries (Markdown, JSON, TXT)
- Bulk export functionality for your data
- Customizable export formats
- **User-specific** export operations

### 🎨 **Professional User Experience**
- **Toast notifications** for real-time feedback
- **Dark/Light theme** toggle with persistence
- **Responsive design** for all device sizes
- **Loading states** and smooth transitions
- **Professional landing page** for unauthenticated users
- **Clean, modern interface** with intuitive navigation

### ✨ **Enhanced UX Features (NEW in v0.0.4)**
- **Password strength indicator** with visual feedback
- **Enhanced error handling** with user-friendly messages
- **Smooth authentication flow** with proper redirects
- **Professional forms** with validation and loading states
- **Real-time notifications** for all user actions

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict type checking
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with email/password
- **Styling**: Tailwind CSS with dark/light theme support
- **Icons**: Lucide React
- **State Management**: React Context for authentication
- **Development**: Docker support with hot reload
- **Security**: Row Level Security (RLS) for data isolation

## Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase account (for database and authentication)
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Hindukash/project-diary.git
cd project-diary
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase database:
```bash
# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
# See docs/supabase-setup.md for detailed instructions
```

4. Initialize database schema:
```bash
# Apply the authentication schema in your Supabase dashboard
# Copy and run database/auth-schema.sql in Supabase SQL Editor

# Then create an admin user for testing
npm run create-admin
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Setup

1. Build and run with Docker:
```bash
docker-compose up -d
```

2. Access the application at [http://localhost:3002](http://localhost:3002)

## Project Structure

```
project-diary/
├── app/                     # Next.js app directory
│   ├── layout.tsx          # Root layout with auth provider
│   ├── page.tsx            # Home page
│   └── reset-password/     # Password reset page
├── components/
│   ├── auth/               # Authentication components
│   │   ├── auth-modal.tsx  # Authentication modal
│   │   ├── login-form.tsx  # Login form
│   │   ├── signup-form.tsx # Signup form
│   │   ├── forgot-password-form.tsx # Password reset form
│   │   ├── user-profile.tsx # User profile management
│   │   └── protected-route.tsx # Route protection
│   ├── landing/            # Landing page components
│   ├── layout/             # Layout components (sidebar, header, etc.)
│   └── ui/                 # Reusable UI components
├── contexts/
│   └── AuthContext.tsx     # Authentication state management
├── lib/
│   ├── auth.ts            # Authentication functions
│   ├── auth-db.ts         # Database authentication helpers
│   ├── multi-user-db.ts   # Multi-user database operations
│   ├── entries.ts         # Entry management functions
│   ├── tags.ts            # Tag management functions
│   ├── supabase.ts        # Supabase client configuration
│   └── utils.ts           # Utility functions
├── database/
│   ├── schema.sql         # Main database schema
│   └── auth-schema.sql    # Authentication schema
├── scripts/
│   ├── create-admin-user.js # Admin user creation utility
│   ├── migrate-to-auth.js   # Migration to multi-user
│   └── seed-database.js     # Database seeding utility
├── data/
│   ├── types.ts           # TypeScript type definitions
│   └── database.types.ts  # Generated database types
└── docs/                  # Documentation
```

## Authentication Setup

Project Diary v0.0.4 features complete multi-user authentication:

### Quick Setup
1. Create a Supabase project
2. Copy your project URL and anon key to `.env.local`
3. Run the authentication schema from `database/auth-schema.sql`
4. Create an admin user: `npm run create-admin`

### Environment Variables

Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
NEXT_PUBLIC_USE_DATABASE=true
```

### Default Admin Account
After running `npm run create-admin`:
- **Email**: admin@projectdiary.local
- **Password**: Admin123!

## Key Features in Detail

### Multi-User Authentication
- Complete signup/signin flow with email verification
- Automatic user profile creation via database triggers
- Secure session management with token refresh
- Password reset with email-based recovery
- User profile management with preferences

### Data Security
- Row Level Security (RLS) policies ensure complete data isolation
- Each user can only access their own entries and tags
- Database-level security with automatic user filtering
- Secure authentication context with proper state management

### Entry Management
- Rich text editor with markdown support
- User-specific entry creation, editing, and deletion
- Entry versioning and history tracking per user
- Advanced search within user's own data
- Tag-based organization with user isolation

### Tag System
- User-specific tag creation and management
- Color-coded tags with customizable colors
- Tag usage statistics and cleanup
- Automatic tag filtering by user

## Development

### Commands
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run create-admin     # Create admin user for testing
npm run migrate-auth     # Migrate existing data to multi-user
npm run seed             # Seed database with sample data
npm run clear-db         # Clear database (development only)
```

### Testing Authentication
1. Run the application: `npm run dev`
2. Visit the landing page
3. Sign up for a new account or use admin credentials
4. Test entry creation, editing, and data isolation
5. Try signing out and back in with different users

### Docker Commands
```bash
docker-compose up -d    # Start in detached mode
docker-compose down     # Stop and remove containers
docker-compose logs     # View logs
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Ensure authentication and security work correctly
6. Submit a pull request

## Changelog

### v0.0.4 (Latest) - Multi-User Authentication & Security
- ✨ **NEW**: Complete multi-user authentication system
- ✨ **NEW**: Row Level Security (RLS) for data isolation
- ✨ **NEW**: User profile management
- ✨ **NEW**: Password reset flow with email recovery
- ✨ **NEW**: Professional landing page for unauthenticated users
- ✨ **NEW**: Toast notifications for real-time feedback
- ✨ **NEW**: Password strength validation with visual indicators
- ✨ **NEW**: Enhanced error handling and user experience
- ✨ **NEW**: Remember me functionality
- ✨ **NEW**: Email confirmation flow
- 🔧 **IMPROVED**: Database architecture for multi-user support
- 🔧 **IMPROVED**: Security with enterprise-grade RLS policies
- 🔧 **IMPROVED**: Performance with optimized database queries
- 🔧 **IMPROVED**: User interface with professional design
- 📚 **DOCS**: Comprehensive authentication and setup documentation
- 🛠️ **DEV**: Admin user creation and migration utilities

### v0.0.3 - Database Integration
- ✨ **NEW**: Full Supabase database integration
- ✨ **NEW**: Persistent data storage across sessions
- ✨ **NEW**: Real-time data synchronization
- ✨ **NEW**: Full-text search with database indexing
- ✨ **NEW**: Entry versioning and history tracking
- ✨ **NEW**: Database seeding and management scripts
- 🔧 **IMPROVED**: Performance with optimized queries
- 🔧 **IMPROVED**: Tag management with relational integrity
- 📚 **DOCS**: Complete Supabase setup guide
- 🛠️ **DEV**: Environment-based data source switching

### v0.0.2 - Dashboard Layout
- 🎨 **IMPROVED**: Dashboard-style layout restructuring
- 🔧 **ENHANCED**: UI components and navigation

### v0.0.1 - Initial Release
- 📝 **NEW**: Basic entry management
- 🏷️ **NEW**: Tag system
- 🔍 **NEW**: Search functionality
- 🎨 **NEW**: Modern UI with Tailwind CSS

## Security

Project Diary v0.0.4 implements enterprise-grade security:

- **Row Level Security (RLS)**: Database-level data isolation
- **User Authentication**: Secure email/password system
- **Session Management**: Token-based authentication with refresh
- **Data Isolation**: Complete separation of user data
- **Password Security**: Strength validation and secure hashing
- **Email Verification**: Account confirmation for security

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with Next.js 14 and TypeScript
- Database and authentication powered by Supabase
- Icons by Lucide React
- Styled with Tailwind CSS
- Inspired by modern journaling applications

---

**Project Diary v0.0.4** - Your secure, personal digital journal with multi-user support and enterprise-grade security.