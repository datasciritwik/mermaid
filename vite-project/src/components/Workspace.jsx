import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { DEFAULT_DIAGRAM } from '../constants/config';
import { compressCode, decompressCode } from '../utils/compression';
import { renderMermaid } from '../utils/mermaid';
import { useDiagramHistory } from '../hooks/useDiagramHistory';
import globalStyles from '../styles/global.css?raw';

export default function Workspace({ fullscreen = false }) {
  const { encodedData: pathEncoded } = useParams();
  const { search } = useLocation();
  const qs = new URLSearchParams(search);
  const encodedData = pathEncoded || qs.get('d');
  const navigate = useNavigate();
  const { addToHistory } = useDiagramHistory();
  
  const [code, setCode] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const mermaidRef = useRef(null);

  // Decode URL on load
  useEffect(() => {
    if (encodedData) {
      const decoded = decompressCode(encodedData);
      if (decoded) setCode(decoded);
    } else {
      setCode(DEFAULT_DIAGRAM);
    }
  }, [encodedData]);

  // Live render (no auto-save)
  useEffect(() => {
    if (!code) {
      if (mermaidRef.current) mermaidRef.current.innerHTML = '';
      return;
    }
    
    const renderDiagram = async () => {
      if (mermaidRef.current) {
        try {
          mermaidRef.current.innerHTML = '';
          const svg = await renderMermaid(code, 'mermaid-diagram');
          mermaidRef.current.innerHTML = svg;
        } catch (error) {
          // Ignore syntax errors while typing
        }
      }
    };
    
    const timer = setTimeout(renderDiagram, 300);
    return () => clearTimeout(timer);
  }, [code]);

  // Editor handlers
  const handleEditorChange = (value) => {
    setCode(value);
    setIsSaved(false);
  };

  const handleSave = () => {
    if (!code) return;
    const encoded = compressCode(code);
    const link = fullscreen ? `/view?d=${encoded}` : `/edit?d=${encoded}`;
    addToHistory(code, encoded, link);
    navigate(link, { replace: true });
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

  // Fullscreen view
  if (fullscreen) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#ffffff', overflow: 'auto', zIndex: 9999 }}>
        <style>{globalStyles}</style>
        <Link 
          to={`/edit/${encodedData}`} 
          style={{ position: 'fixed', top: 20, right: 20, padding: '10px 20px', background: '#333', textDecoration: 'none', color: '#fff', borderRadius: '6px', zIndex: 10000, fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
        >
          ← Back to Editor
        </Link>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', padding: '4rem' }}>
          <div ref={mermaidRef} />
        </div>
      </div>
    );
  }

  // Split-pane editor view
  return (
    <div className="workspace-container">
      <style>{globalStyles}</style>
      
      {/* Left pane: Editor */}
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

      {/* Right pane: Preview */}
      <div className="preview-pane">
        <div style={{ position: 'absolute', top: 15, right: 15, display: 'flex', gap: '10px', zIndex: 10 }}>
          <Link to="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Dashboard</Link>
            <Link to={encodedData ? `/view?d=${encodedData}` : '/view'} className="btn btn-primary" style={{ textDecoration: 'none' }}>Fullscreen</Link>
            <button
              onClick={async () => {
                try {
                  const url = `${window.location.origin}${window.location.pathname}#/edit?d=${encodeURIComponent(encodedData || compressCode(code))}`;
                  await navigator.clipboard.writeText(url);
                  const btn = document.createElement('span');
                  btn.textContent = `${url.slice(0,6)}...${url.slice(-6)}`;
                  alert('Link copied: ' + btn.textContent);
                } catch (e) {
                  alert('Copy failed.');
                }
              }}
              className="btn btn-secondary"
            >
              Share
            </button>
        </div>
        <div ref={mermaidRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />
      </div>
    </div>
  );
}
