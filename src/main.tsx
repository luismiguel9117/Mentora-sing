import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import ConfigView from './views/ConfigView.jsx';
import SubtitleEditor from './components/SubtitleEditor.jsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/config" element={<ConfigView />} />
        <Route path="/config/editor/:videoId" element={<SubtitleEditor />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
