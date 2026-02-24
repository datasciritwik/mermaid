import { useState, useEffect } from 'react';
import { DIAGRAM_HISTORY_KEY, MAX_HISTORY_ITEMS } from '../constants/config';

export const useDiagramHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(DIAGRAM_HISTORY_KEY) || '[]');
    setHistory(saved);
  }, []);

  const addToHistory = (code, encoded) => {
    const snippet = code.split('\n').slice(0, 2).join(' ') + '...';
    const newHistory = [
      { id: encoded, snippet, timestamp: Date.now() },
      ...history.filter(h => h.id !== encoded)
    ].slice(0, MAX_HISTORY_ITEMS);
    
    setHistory(newHistory);
    localStorage.setItem(DIAGRAM_HISTORY_KEY, JSON.stringify(newHistory));
  };

  const deleteFromHistory = (idToDelete) => {
    const updatedHistory = history.filter(item => item.id !== idToDelete);
    setHistory(updatedHistory);
    localStorage.setItem(DIAGRAM_HISTORY_KEY, JSON.stringify(updatedHistory));
  };

  return { history, addToHistory, deleteFromHistory };
};
