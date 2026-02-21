import { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import mermaid from 'mermaid';
import Editor from '@monaco-editor/react';
import LZString from 'lz-string';

// Initialize Mermaid
mermaid.initialize({ startOnLoad: false, theme: 'default' });

const DEFAULT_DIAGRAM = `graph TD\n    A[Start] --> B{Is it working?}\n    B -- Yes --> C[Great!]\n    B -- No --> D[Debug]`;

// --- VIEW 1: DASHBOARD ---
function Home() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('mermaid_history') || '[]');
    setHistory(saved);
  }, []);

  const createNew = () => {
    const encoded = LZString.compressToEncodedURIComponent(DEFAULT_DIAGRAM);
    navigate(`/edit/${encoded}`);
  };

  const deleteDiagram = (idToDelete) => {
    const updatedHistory = history.filter(item => item.id !== idToDelete);
    setHistory(updatedHistory);
    localStorage.setItem('mermaid_history', JSON.stringify(updatedHistory));
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Mermaid Viewer</h1>
      <button onClick={createNew} style={{ padding: '10px 20px', marginBottom: '20px', cursor: 'pointer', background: '#0066cc', color: 'white', border: 'none', borderRadius: '4px' }}>+ New Diagram</button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {history.length === 0 && <p style={{ color: '#666' }}>No previous diagrams found. Create one!</p>}
        {history.map(item => (
          <div key={item.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9' }}>
            <pre style={{ fontSize: '13px', margin: 0, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '55%' }}>
              {item.snippet}
            </pre>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <Link to={`/edit/${item.id}`} style={{ textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' }}>Edit</Link>
              <Link to={`/view/${item.id}`} style={{ textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' }}>Fullscreen</Link>
              <button 
                onClick={() => deleteDiagram(item.id)} 
                style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#dc3545', fontWeight: 'bold', padding: 0 }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- VIEW 2 & 3: WORKSPACE (Edit & Fullscreen) ---
function Workspace({ fullscreen = false }) {
  const { encodedData } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const mermaidRef = useRef(null);

  useEffect(() => {
    if (encodedData) {
      const decoded = LZString.decompressFromEncodedURIComponent(encodedData);
      if (decoded) setCode(decoded);
    } else {
      setCode(DEFAULT_DIAGRAM);
    }
  }, [encodedData]);

  useEffect(() => {
    if (!code) return;
    
    const encoded = LZString.compressToEncodedURIComponent(code);
    const saved = JSON.parse(localStorage.getItem('mermaid_history') || '[]');
    const snippet = code.split('\n').slice(0, 2).join(' ') + '...';
    
    const newHistory = [{ id: encoded, snippet, timestamp: Date.now() }, ...saved.filter(h => h.id !== encoded)].slice(0, 30);
    localStorage.setItem('mermaid_history', JSON.stringify(newHistory));

    const renderDiagram = async () => {
      if (mermaidRef.current) {
        try {
          mermaidRef.current.innerHTML = '';
          const { svg } = await mermaid.render('mermaid-svg-' + Date.now(), code);
          mermaidRef.current.innerHTML = svg;
        } catch (error) {
          // Ignore syntax errors while typing
        }
      }
    };
    
    const timer = setTimeout(renderDiagram, 300);
    return () => clearTimeout(timer);
  }, [code]);

  const handleEditorChange = (value) => {
    setCode(value);
    const encoded = LZString.compressToEncodedURIComponent(value);
    navigate(fullscreen ? `/view/${encoded}` : `/edit/${encoded}`, { replace: true });
  };

  // FULLSCREEN VIEW
  if (fullscreen) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#ffffff', overflow: 'auto', zIndex: 9999 }}>
        <Link to={`/edit/${encodedData}`} style={{ position: 'fixed', top: 20, right: 20, padding: '10px 20px', background: '#333', textDecoration: 'none', color: '#fff', borderRadius: '6px', zIndex: 10000, fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          ← Back to Editor
        </Link>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', padding: '4rem' }}>
          <div ref={mermaidRef} />
        </div>
      </div>
    );
  }

  // SPLIT-PANE EDITOR VIEW
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', margin: 0, position: 'fixed', top: 0, left: 0 }}>
      <div style={{ width: '40%', borderRight: '1px solid #ccc' }}>
        <Editor 
          height="100%" 
          defaultLanguage="markdown" 
          value={code} 
          onChange={handleEditorChange} 
          theme="vs-dark"
          options={{ minimap: { enabled: false }, wordWrap: 'on' }}
        />
      </div>
      <div style={{ width: '60%', padding: '2rem', overflow: 'auto', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <div style={{ position: 'absolute', top: 15, right: 15, display: 'flex', gap: '10px', zIndex: 10 }}>
          <Link to="/" style={{ padding: '8px 15px', background: '#eee', textDecoration: 'none', color: '#333', borderRadius: '4px', fontWeight: 'bold' }}>Dashboard</Link>
          <Link to={`/view/${encodedData}`} style={{ padding: '8px 15px', background: '#0066cc', textDecoration: 'none', color: '#fff', borderRadius: '4px', fontWeight: 'bold' }}>Fullscreen</Link>
        </div>
        <div ref={mermaidRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />
      </div>
    </div>
  );
}

// --- ROUTER SETUP ---
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/edit/:encodedData?" element={<Workspace />} />
        <Route path="/view/:encodedData" element={<Workspace fullscreen={true} />} />
      </Routes>
    </HashRouter>
  );
}