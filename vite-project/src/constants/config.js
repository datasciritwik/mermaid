export const DEFAULT_DIAGRAM = `graph TD\n    A[Start] --> B{Is it working?}\n    B -- Yes --> C[Great!]\n    B -- No --> D[Debug]`;

export const DEFAULT_MARKDOWN = `# Welcome to Markdown Editor\n\n## Start Writing\n\nThis is a markdown document. Use **bold** and *italic* text freely.\n\n### Features:\n- Live preview\n- Save and share\n- Simple formatting\n\n---\n\n*Edit the left pane to see live preview on the right.*`;

export const DIAGRAM_HISTORY_KEY = 'mermaid_history';
export const MARKDOWN_HISTORY_KEY = 'markdown_history';
export const MAX_HISTORY_ITEMS = 30;
