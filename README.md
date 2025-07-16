# Project Diary

A modern, feature-rich diary application built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

[![Version](https://img.shields.io/badge/version-0.0.3-blue.svg)](https://github.com/Hindukash/project-diary/releases/tag/v0.0.3)
[![Supabase](https://img.shields.io/badge/database-Supabase-green.svg)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/framework-Next.js%2014-black.svg)](https://nextjs.org/)

## Features

### 🗄️ **Database Integration (NEW in v0.0.3)**
- **Supabase database** for persistent data storage
- **Real-time data synchronization** across sessions
- **Full-text search** capabilities with database indexing
- **Entry versioning** and history tracking
- **Production-ready** relational schema

### 📝 Entry Management
- Create, edit, and delete diary entries with **persistent storage**
- Rich text editor with markdown support
- **Database-driven** entry versioning and history tracking
- Advanced search through entries by title or content
- **Smart data switching** between database and mock data modes

### 🖼️ Media Support
- Drag & drop image uploads
- Image preview and management
- Full-screen image viewer with zoom and pan
- Download images functionality

### 🏷️ Organization
- Create and manage colored tags with **database persistence**
- Filter entries by tags with **optimized queries**
- **Real-time tag synchronization** across components
- Tag-based organization system with **relational integrity**
- Automatic tag cleanup and usage tracking

### 🔍 Search & Filter
- Advanced search functionality
- Period filters (Last week, Last month, etc.)
- Tag-based filtering
- Sort by date, title, or relevance

### 📤 Export Options
- Export individual entries (Markdown, JSON, TXT)
- Bulk export functionality
- Customizable export formats

### 🎨 User Experience
- Dark/Light theme toggle
- Responsive design
- Clean, modern interface
- Keyboard shortcuts and navigation

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Development**: Docker support
- **ORM**: Supabase Client with TypeScript

## Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase account (for database)
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

4. Initialize database:
```bash
# Run the SQL schema in your Supabase dashboard
# Then seed with sample data
npm run seed
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
├── components/
│   ├── layout/          # Layout components (sidebar, app-layout, etc.)
│   └── ui/              # UI components (forms, modals, etc.)
├── database/
│   └── schema.sql       # Supabase database schema
├── docs/
│   └── supabase-setup.md # Database setup guide
├── data/
│   ├── types.ts         # TypeScript type definitions
│   ├── database.types.ts # Generated database types
│   └── mockData.ts      # Mock data for development
├── lib/
│   ├── entries.ts       # Entry management functions (mock data)
│   ├── entries-db.ts    # Entry database operations (Supabase)
│   ├── tags.ts          # Tag management functions (mock data)
│   ├── tags-db.ts       # Tag database operations (Supabase)
│   ├── supabase.ts      # Supabase client configuration
│   └── utils.ts         # Utility functions
├── scripts/
│   ├── seed-database.js # Database seeding utility
│   └── clear-database.js # Database cleanup utility
├── app/                 # Next.js app directory
└── public/              # Static assets
```

### Database Setup

For detailed database setup instructions, see [docs/supabase-setup.md](docs/supabase-setup.md).

Quick setup:
1. Create a Supabase project
2. Copy your project URL and anon key to `.env.local`
3. Run the SQL schema from `database/schema.sql` in Supabase SQL Editor
4. Seed with sample data: `npm run seed`

### Environment Variables

Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_USE_DATABASE=true
```

## Key Components

### Entry Management
- **EntryViewer**: Display and edit individual entries
- **EntryForm**: Create and edit entry form
- **EntryCard**: Entry list item component

### Tag System
- **TagManager**: Create, edit, and delete tags
- **SearchFilters**: Advanced filtering interface

### Layout
- **AppLayout**: Main application layout
- **Sidebar**: Navigation and tag management
- **ContentListPanel**: Entry listing with filters

## Features in Detail

### Entry Creation
- Rich text editor with markdown support
- Image upload via drag & drop
- Tag assignment and creation
- Automatic summary generation

### Search & Filter
- Real-time search across titles and content
- Time-based filtering (Last week, month, etc.)
- Tag-based filtering
- Sortable results

### Tag Management
- Create tags with custom colors
- Edit existing tags
- Delete unused tags
- Automatic tag creation from entries

### Export System
- Multiple export formats
- Individual and bulk export
- Customizable export options

## Development

### Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database with sample data
npm run clear-db     # Clear database (development only)
```

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
5. Submit a pull request

## Changelog

### v0.0.3 (Latest) - Database Integration
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

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with Next.js and TypeScript
- Database powered by Supabase
- Icons by Lucide React
- Styled with Tailwind CSS
- Inspired by modern note-taking applications
