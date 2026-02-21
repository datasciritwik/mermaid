import { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import mermaid from 'mermaid';
import Editor from '@monaco-editor/react';
import LZString from 'lz-string';

// Initialize Mermaid
mermaid.initialize({ startOnLoad: false, theme: 'default' });

const DEFAULT_DIAGRAM = `graph TD\n    A[Start] --> B{Is it working?}\n    B -- Yes --> C[Great!]\n    B -- No --> D[Debug]`;

// --- RESPONSIVE CSS INJECTION ---
const globalStyles = `
  body, html, #root { margin: 0; padding: 0; width: 100%; height: 100%; }
  .workspace-container { display: flex; height: 100vh; width: 100vw; position: fixed; top: 0; left: 0; }
  .editor-pane { width: 40%; border-right: 1px solid #ccc; display: flex; flex-direction: column; background: #1e1e1e; }
  .preview-pane { width: 60%; padding: 2rem; overflow: auto; position: relative; display: flex; justify-content: center; align-items: center; background-color: #fff; }
  .toolbar { padding: 10px; background: #2d2d2d; display: flex; gap: 10px; align-items: center; border-bottom: 1px solid #444; }
  .btn { padding: 6px 12px; cursor: pointer; border: none; border-radius: 4px; font-weight: bold; font-size: 13px; color: white; transition: opacity 0.2s; }
  .btn:hover { opacity: 0.8; }
  .btn-primary { background: #0066cc; }
  .btn-success { background: #28a745; }
  .btn-danger { background: #dc3545; }
  .btn-secondary { background: #555; }
  
  @media (max-width: 768px) {
    .workspace-container { flex-direction: column; }
    .editor-pane { width: 100%; height: 50%; border-right: none; border-bottom: 2px solid #ccc; }
    .preview-pane { width: 100%; height: 50%; padding: 1rem; }
  }
`;

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
      <style>{globalStyles}</style>
      <h1>Mermaid Viewer</h1>
      <button onClick={createNew} className="btn btn-primary" style={{ marginBottom: '20px', padding: '10px 20px', fontSize: '16px' }}>
        + New Diagram
      </button>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {history.length === 0 && <p style={{ color: '#666' }}>No previous diagrams found. Create one!</p>}
        {history.map(item => (
          <div key={item.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9', flexWrap: 'wrap', gap: '10px' }}>
            <pre style={{ fontSize: '13px', margin: 0, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: '200px' }}>
              {item.snippet}
            </pre>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <Link to={`/edit/${item.id}`} style={{ textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' }}>Edit</Link>
              <Link to={`/view/${item.id}`} style={{ textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' }}>Fullscreen</Link>
              <button onClick={() => deleteDiagram(item.id)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#dc3545', fontWeight: 'bold', padding: 0 }}>
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
  const [isSaved, setIsSaved] = useState(true);
  const mermaidRef = useRef(null);

  // 1. Decode URL on load
  useEffect(() => {
    if (encodedData) {
      const decoded = LZString.decompressFromEncodedURIComponent(encodedData);
      if (decoded) setCode(decoded);
    } else {
      setCode(DEFAULT_DIAGRAM);
    }
  }, [encodedData]);

  // 2. LIVE RENDER (No Auto-Save)
  useEffect(() => {
    if (!code) {
      if (mermaidRef.current) mermaidRef.current.innerHTML = '';
      return;
    }
    
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

  // 3. EDITOR ACTIONS
  const handleEditorChange = (value) => {
    setCode(value);
    setIsSaved(false);
  };

  const handleSave = () => {
    if (!code) return;
    const encoded = LZString.compressToEncodedURIComponent(code);
    
    // Save to LocalStorage
    const saved = JSON.parse(localStorage.getItem('mermaid_history') || '[]');
    const snippet = code.split('\n').slice(0, 2).join(' ') + '...';
    const newHistory = [{ id: encoded, snippet, timestamp: Date.now() }, ...saved.filter(h => h.id !== encoded)].slice(0, 30);
    localStorage.setItem('mermaid_history', JSON.stringify(newHistory));

    // Update URL quietly
    navigate(fullscreen ? `/view/${encoded}` : `/edit/${encoded}`, { replace: true });
    setIsSaved(true);
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear the editor?")) {
      setCode('');
      setIsSaved(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setCode(text);
        setIsSaved(false);
      }
    } catch (err) {
      alert("Please allow clipboard permissions to use this feature.");
    }
  };

  // FULLSCREEN VIEW
  if (fullscreen) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#ffffff', overflow: 'auto', zIndex: 9999 }}>
        <style>{globalStyles}</style>
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
    <div className="workspace-container">
      <style>{globalStyles}</style>
      
      {/* LEFT PANE: EDITOR */}
      <div className="editor-pane">
        <div className="toolbar">
          <button onClick={handleSave} className={`btn ${isSaved ? 'btn-success' : 'btn-primary'}`}>
            {isSaved ? 'Saved ✓' : 'Save'}
          </button>
          <button onClick={handlePaste} className="btn btn-secondary">Paste</button>
          <button onClick={handleClear} className="btn btn-danger" style={{ marginLeft: 'auto' }}>Clear</button>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Editor 
            height="100%" 
            defaultLanguage="markdown" 
            value={code} 
            onChange={handleEditorChange} 
            theme="vs-dark"
            options={{ minimap: { enabled: false }, wordWrap: 'on' }}
          />
        </div>
      </div>

      {/* RIGHT PANE: PREVIEW */}
      <div className="preview-pane">
        <div style={{ position: 'absolute', top: 15, right: 15, display: 'flex', gap: '10px', zIndex: 10 }}>
          <Link to="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Dashboard</Link>
          <Link to={`/view/${encodedData || ''}`} className="btn btn-primary" style={{ textDecoration: 'none' }}>Fullscreen</Link>
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