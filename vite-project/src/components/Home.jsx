import { useNavigate, Link } from 'react-router-dom';
import { DEFAULT_DIAGRAM, DEFAULT_MARKDOWN } from '../constants/config';
import { compressCode } from '../utils/compression';
import { useDiagramHistory } from '../hooks/useDiagramHistory';
import { useMarkdownHistory } from '../hooks/useMarkdownHistory';
import globalStyles from '../styles/global.css?raw';

export default function Home() {
  const navigate = useNavigate();
  const { history: diagrams, deleteFromHistory: deleteDiagram } = useDiagramHistory();
  const { history: markdowns, deleteFromHistory: deleteMarkdown } = useMarkdownHistory();

  const createNewDiagram = () => {
    const encoded = compressCode(DEFAULT_DIAGRAM);
    navigate(`/edit?d=${encoded}`);
  };

  const createNewMarkdown = () => {
    const data = JSON.stringify({ title: 'New Document', content: DEFAULT_MARKDOWN });
    const encoded = compressCode(data);
    navigate(`/markdown/edit?d=${encoded}`);
  };

  const allItems = [
    ...diagrams.map(item => ({ ...item, docType: 'diagram' })),
    ...markdowns.map(item => ({ ...item, docType: 'markdown' }))
  ].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <style>{globalStyles}</style>
      <h1>Document Center</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={createNewDiagram} 
          className="btn btn-primary" 
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          + New Diagram
        </button>
        <button 
          onClick={createNewMarkdown} 
          className="btn btn-primary" 
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          + New Markdown
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {allItems.length === 0 && (
          <p style={{ color: '#666' }}>No documents found. Create one to get started!</p>
        )}
        {allItems.map(item => (
          <div 
            key={item.id} 
            style={{ 
              border: '1px solid #ddd', 
              padding: '1rem', 
              borderRadius: '8px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              background: '#f9f9f9', 
              flexWrap: 'wrap', 
              gap: '10px',
              borderLeft: `4px solid ${item.docType === 'diagram' ? '#0066cc' : '#28a745'}`
            }}
          >
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>
                {item.docType === 'diagram' ? '📊 Diagram' : '📝 Markdown'}: {item.title || 'Untitled'}
              </div>
              <pre style={{ 
                fontSize: '12px', 
                margin: 0, 
                color: '#666', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap'
              }}>
                {item.snippet}
              </pre>
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              {item.docType === 'diagram' ? (
                <>
                  <Link 
                    to={item.link || `/edit?d=${item.id}`} 
                    style={{ textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' }}
                  >
                    Edit
                  </Link>
                  <Link 
                    to={item.link ? item.link.replace('/edit', '/view') : `/view?d=${item.id}`} 
                    style={{ textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' }}
                  >
                    Fullscreen
                  </Link>
                  <button 
                    onClick={() => deleteDiagram(item.id)} 
                    style={{ 
                      cursor: 'pointer', 
                      background: 'none', 
                      border: 'none', 
                      color: '#dc3545', 
                      fontWeight: 'bold', 
                      padding: 0 
                    }}
                  >
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to={item.link || `/markdown/edit?d=${item.id}`} 
                    style={{ textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' }}
                  >
                    Edit
                  </Link>
                  <Link 
                    to={item.link ? item.link.replace('/edit', '/view') : `/markdown/view?d=${item.id}`} 
                    style={{ textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' }}
                  >
                    Fullscreen
                  </Link>
                  <button 
                    onClick={() => deleteMarkdown(item.id)} 
                    style={{ 
                      cursor: 'pointer', 
                      background: 'none', 
                      border: 'none', 
                      color: '#dc3545', 
                      fontWeight: 'bold', 
                      padding: 0 
                    }}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
