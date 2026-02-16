# Anime Story Writer

A comprehensive web application for writing and managing your anime stories, complete with chapter management, character profiles, world building tools, and export capabilities.

## Features

### Chapter Management
- Create and organize chapters with episode numbers and story arcs
- Rich text editor with auto-save functionality
- Track chapter status (draft, in-progress, completed)
- Word count tracking per chapter
- Add notes and ideas for each chapter

### Character Management
- Comprehensive character profiles with detailed attributes:
  - Name, age, and role (protagonist, antagonist, supporting, minor)
  - Physical appearance and personality traits
  - Special abilities and power levels
  - Character backstory and relationships
- Visual organization by character role
- Easy editing and deletion

### World Building
- Document four types of world elements:
  - **Locations**: Cities, landmarks, environments
  - **Magic Systems**: Power systems, rules, limitations
  - **Factions**: Organizations, groups, allegiances
  - **Lore**: History, myths, background information
- Filter and organize by element type
- Detailed descriptions and notes for each element

### Export Functionality
- Export your story in multiple formats:
  - **Text (.txt)**: Plain text format
  - **Markdown (.md)**: Formatted markdown
  - **JSON (.json)**: Structured data format
- Select specific chapters to export
- Include/exclude character profiles and world building elements
- Perfect for sharing, backups, or publishing

### Dashboard
- Quick overview of your story statistics
- Recent chapters list
- Total word count and chapter progress
- Quick action buttons for common tasks

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
anime-story-writing/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Dashboard page
│   ├── chapters/          # Chapter management pages
│   ├── characters/        # Character management page
│   ├── world/             # World building page
│   ├── export/            # Export functionality page
│   ├── api/               # API routes for data operations
│   ├── layout.tsx         # Root layout with navigation
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   └── Navigation.tsx     # Main navigation component
├── lib/                   # Utility libraries
│   ├── types.ts          # TypeScript type definitions
│   └── fileSystem.ts     # File system operations
├── story-data/           # Your story data (auto-created)
│   ├── chapters/         # Chapter JSON files
│   ├── characters/       # Character data
│   ├── world/            # World building data
│   └── metadata.json     # Story metadata
└── public/               # Static assets
```

## Data Storage

All your story data is stored locally in the `story-data` directory as JSON files. This means:
- Your data stays on your computer
- No internet connection required
- Easy to backup (just copy the directory)
- Version control friendly (use git)
- No database setup needed

### Backing Up Your Story

Simply copy the entire `story-data` directory to backup your work:

```bash
cp -r story-data ~/backups/my-anime-story-backup
```

Or use git for version control:

```bash
git init
git add story-data
git commit -m "Backup my story"
```

## Technology Stack

- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Node.js File System**: Local data persistence

## Tips for Writing Your Anime Story

1. **Start with Characters**: Build your main characters first to understand their motivations
2. **Define Your World**: Establish your magic system and world rules early
3. **Plan Story Arcs**: Organize chapters into meaningful story arcs
4. **Use Notes**: Add notes to chapters for future plot points or ideas
5. **Regular Exports**: Export your work regularly as backups
6. **Track Power Levels**: Keep character power levels consistent throughout your story
7. **Build Relationships**: Document character relationships to maintain consistency

## Keyboard Shortcuts

- Auto-save is enabled every 30 seconds while editing chapters
- Use the manual Save button for immediate saves

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, Next.js will automatically use the next available port (e.g., 3001).

### Data Not Saving

Make sure the `story-data` directory has write permissions:

```bash
chmod -R 755 story-data
```

### Missing Dependencies

If you encounter errors, try reinstalling dependencies:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Future Enhancement Ideas

- Rich text formatting (bold, italic, headings)
- Character relationship graph visualization
- Timeline view for story events
- PDF export with custom formatting
- EPUB export for e-readers
- Cloud sync for multiple devices
- Collaboration features
- Image uploads for characters and locations
- Scene-by-scene planning
- Storyboard view

## License

ISC

## Support

For issues or questions, please check the documentation or create an issue in the repository.

---

Happy writing! Create amazing anime stories!
