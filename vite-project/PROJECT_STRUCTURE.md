# Project Structure

## Directory Layout

```
src/
├── components/           # React Components
│   ├── Home.jsx         # Dashboard/Home view
│   └── Workspace.jsx    # Editor and Fullscreen view
├── hooks/               # Custom React Hooks
│   └── useDiagramHistory.js  # History management hook
├── utils/               # Utility Functions
│   ├── compression.js   # LZ-String compression/decompression
│   └── mermaid.js       # Mermaid rendering utilities
├── constants/           # Constants
│   └── config.js        # App configuration (default diagram, keys, limits)
├── styles/              # Stylesheets
│   └── global.css       # Global styles and responsive design
├── App.jsx              # Main app component with router
├── main.jsx             # React entry point
├── index.css            # Index styles
└── assets/              # Static assets
```

## File Organization

### Components (`/components`)
- **Home.jsx**: Dashboard page showing diagram history with create, edit, and delete options
- **Workspace.jsx**: Split-pane editor with live preview, supports fullscreen mode

### Hooks (`/hooks`)
- **useDiagramHistory.js**: Custom hook for managing diagram history in localStorage

### Utils (`/utils`)
- **compression.js**: Wraps LZ-String for encoding/decoding diagrams in URLs
- **mermaid.js**: Initializes and renders Mermaid diagrams

### Constants (`/constants`)
- **config.js**: Stores default diagram, localStorage keys, and configuration limits

### Styles (`/styles`)
- **global.css**: Centralized stylesheet with responsive design for all views

## Key Features

✅ **Component Isolation**: Each component has a single responsibility
✅ **Reusable Hooks**: Custom hooks for common logic patterns
✅ **Utility Functions**: Pure functions for compression and mermaid rendering
✅ **Centralized Configuration**: All constants in one place
✅ **Clean Imports**: Clear dependency paths throughout the app
✅ **Responsive Design**: Mobile-friendly layout in global styles
✅ **Build Tool**: Configured with Vite for fast development and optimized builds

## Development

- **Hot Module Replacement**: Vite enables fast refresh during development
- **Dashboard**: View and manage saved diagrams
- **Split-Pane Editor**: Edit Mermaid diagrams with live preview
- **Fullscreen Mode**: View diagrams in fullscreen
- **URL Compression**: Diagrams encoded in URLs for easy sharing

## Build Output

The project builds successfully to the `dist/` folder with optimized chunks for production deployment.
