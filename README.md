# Project Diary

A modern, feature-rich diary application built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### 📝 Entry Management
- Create, edit, and delete diary entries
- Rich text editor with markdown support
- Entry versioning and history tracking
- Search entries by title or content

### 🖼️ Media Support
- Drag & drop image uploads
- Image preview and management
- Full-screen image viewer with zoom and pan
- Download images functionality

### 🏷️ Organization
- Create and manage colored tags
- Filter entries by tags
- Tag-based organization system
- Real-time tag synchronization

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
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Development**: Docker support

## Getting Started

### Prerequisites
- Node.js 18+ 
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

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

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
├── data/
│   ├── types.ts         # TypeScript type definitions
│   └── mockData.ts      # Mock data for development
├── lib/
│   ├── entries.ts       # Entry management functions
│   ├── tags.ts          # Tag management functions
│   └── utils.ts         # Utility functions
├── app/                 # Next.js app directory
└── public/              # Static assets
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
npm run type-check   # Run TypeScript checks
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

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with Next.js and TypeScript
- Icons by Lucide React
- Styled with Tailwind CSS
