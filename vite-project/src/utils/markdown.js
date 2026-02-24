import { marked } from 'marked';

export const parseMarkdown = (content) => {
  try {
    return marked(content);
  } catch (error) {
    console.error('Markdown parse error:', error);
    return '<p>Error rendering markdown</p>';
  }
};
