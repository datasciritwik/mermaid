import mermaid from 'mermaid';

export const initializeMermaid = () => {
  mermaid.initialize({ startOnLoad: false, theme: 'default' });
};

export const renderMermaid = async (code, containerId) => {
  try {
    const { svg } = await mermaid.render(`mermaid-svg-${Date.now()}`, code);
    return svg;
  } catch (error) {
    console.error('Mermaid render error:', error);
    throw error;
  }
};
