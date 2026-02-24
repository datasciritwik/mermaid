import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { DEFAULT_MARKDOWN } from '../constants/config';
import { compressCode, decompressCode } from '../utils/compression';
import { parseMarkdown } from '../utils/markdown';
import { useMarkdownHistory } from '../hooks/useMarkdownHistory';
import globalStyles from '../styles/global.css?raw';
import markdownStyles from '../styles/markdown.css?raw';

export default function MarkdownWorkspace({ fullscreen = false }) {
  const { encodedData: pathEncoded } = useParams();
  const { search } = useLocation();
  const qs = new URLSearchParams(search);
  const encodedData = pathEncoded || qs.get('d');
  const navigate = useNavigate();
  const { addToHistory } = useMarkdownHistory();
  
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const previewRef = useRef(null);

  // Decode URL on load
  useEffect(() => {
    if (encodedData) {
      const decoded = decompressCode(encodedData);
      if (decoded) {
        try {
          const parsed = JSON.parse(decoded);
          setContent(parsed.content || '');
          setTitle(parsed.title || 'Untitled');
        } catch {
          setContent(decoded);
          setTitle('Untitled');
        }
      }
    } else {
      setContent(DEFAULT_MARKDOWN);
      setTitle('New Document');
    }
  }, [encodedData]);

  // Live preview
  useEffect(() => {
    if (previewRef.current && content) {
      try {
        previewRef.current.innerHTML = parseMarkdown(content);
      } catch (error) {
        console.error('Preview error:', error);
      }
    }
  }, [content]);

  // Editor handlers
  const handleEditorChange = (value) => {
    setContent(value);
    setIsSaved(false);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setIsSaved(false);
  };

  const handleSave = () => {
    if (!content) return;
    const data = JSON.stringify({ title, content });
    const encoded = compressCode(data);
    const link = fullscreen ? `/markdown/view?d=${encoded}` : `/markdown/edit?d=${encoded}`;
    addToHistory(content, encoded, title, link);
    navigate(link, { replace: true });
    setIsSaved(true);
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear the editor?")) {
      setContent('');
      setTitle('');
      setIsSaved(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setContent(text);
        setIsSaved(false);
      }
    } catch (err) {
      alert("Please allow clipboard permissions to use this feature.");
    }
  };

  // Fullscreen view
  if (fullscreen) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#fff', overflow: 'auto', zIndex: 9999 }}>
        <style>{globalStyles}</style>
        <style>{markdownStyles}</style>
        <Link 
          to={`/markdown/edit/${encodedData}`} 
          style={{ position: 'fixed', top: 20, right: 20, padding: '10px 20px', background: '#333', textDecoration: 'none', color: '#fff', borderRadius: '6px', zIndex: 10000, fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
        >
          ← Back to Editor
        </Link>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>
          <h1>{title}</h1>
          <div className="markdown-preview" ref={previewRef} />
        </div>
      </div>
    );
  }

  // Split-pane editor view
  return (
    <div className="workspace-container">
      <style>{globalStyles}</style>
      <style>{markdownStyles}</style>
      
      {/* Left pane: Editor */}
      <div className="editor-pane">
        <div className="toolbar">
          <input 
            type="text" 
            value={title} 
            onChange={handleTitleChange}
            placeholder="Document title..."
            style={{ 
              flex: 1, 
              padding: '6px 12px', 
              border: 'none', 
              borderRadius: '4px',
              background: '#333',
              color: '#fff',
              marginRight: '10px',
              fontSize: '14px'
            }}
          />
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
            value={content} 
            onChange={handleEditorChange} 
            theme="vs-dark"
            options={{ minimap: { enabled: false }, wordWrap: 'on' }}
          />
        </div>
      </div>

      {/* Right pane: Preview */}
      <div className="preview-pane" style={{ background: '#fafafa' }}>
        <div style={{ position: 'absolute', top: 15, right: 15, display: 'flex', gap: '10px', zIndex: 10 }}>
          <Link to="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Dashboard</Link>
          <Link to={encodedData ? `/markdown/view?d=${encodedData}` : '/markdown/view'} className="btn btn-primary" style={{ textDecoration: 'none' }}>Fullscreen</Link>
          <button
            onClick={async () => {
              try {
                const url = `${window.location.origin}${window.location.pathname}#/markdown/edit?d=${encodeURIComponent(encodedData || compressCode(data))}`;
                await navigator.clipboard.writeText(url);
                alert('Link copied: ' + `${url.slice(0,6)}...${url.slice(-6)}`);
              } catch (e) {
                alert('Copy failed.');
              }
            }}
            className="btn btn-secondary"
          >
            Share
          </button>
        </div>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem', overflow: 'auto', width: '100%' }}>
          <div className="markdown-preview" ref={previewRef} />
        </div>
      </div>
    </div>
  );
}
