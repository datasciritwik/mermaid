import { useState, useEffect } from 'react';
import { MARKDOWN_HISTORY_KEY, MAX_HISTORY_ITEMS } from '../constants/config';

export const useMarkdownHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(MARKDOWN_HISTORY_KEY) || '[]');
    setHistory(saved);
  }, []);

  const addToHistory = (content, encoded, title = 'Untitled', link = `/markdown/edit?d=${encoded}`) => {
    const snippet = content.split('\n')[0].substring(0, 50) + (content.length > 50 ? '...' : '');
    const newHistory = [
      { id: encoded, snippet, title, link, timestamp: Date.now(), type: 'markdown' },
      ...history.filter(h => h.id !== encoded)
    ].slice(0, MAX_HISTORY_ITEMS);
    
    setHistory(newHistory);
    localStorage.setItem(MARKDOWN_HISTORY_KEY, JSON.stringify(newHistory));
  };

  const deleteFromHistory = (idToDelete) => {
    const updatedHistory = history.filter(item => item.id !== idToDelete);
    setHistory(updatedHistory);
    localStorage.setItem(MARKDOWN_HISTORY_KEY, JSON.stringify(updatedHistory));
  };

  return { history, addToHistory, deleteFromHistory };
};
