import { HashRouter, Routes, Route } from 'react-router-dom';
import { initializeMermaid } from './utils/mermaid';
import Home from './components/Home';
import Workspace from './components/Workspace';
import MarkdownWorkspace from './components/MarkdownWorkspace';

// Initialize Mermaid on app start
initializeMermaid();

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Mermaid Diagram Routes */}
        <Route path="/edit/:encodedData?" element={<Workspace />} />
        <Route path="/view/:encodedData" element={<Workspace fullscreen={true} />} />
        {/* Markdown Document Routes */}
        <Route path="/markdown/edit/:encodedData?" element={<MarkdownWorkspace />} />
        <Route path="/markdown/view/:encodedData" element={<MarkdownWorkspace fullscreen={true} />} />
      </Routes>
    </HashRouter>
  );
}