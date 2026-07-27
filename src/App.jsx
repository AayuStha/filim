import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DetailsPage from './pages/DetailsPage';
import WatchPage from './pages/WatchPage';

export default function App() {
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [currentType, setCurrentType] = useState('movie');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isWatchPage = location.pathname.startsWith('/watch');

  return (
    <div className={`app-root ${theme}`}>
      {!isWatchPage && (
        <Header 
          currentType={currentType} 
          setCurrentType={setCurrentType} 
          theme={theme} 
          toggleTheme={toggleTheme} 
        />
      )}

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage currentType={currentType} />} />
          <Route path="/details/:type/:id" element={<DetailsPage />} />
          <Route path="/watch/:type/:id" element={<WatchPage />} />
        </Routes>
      </main>

      {!isWatchPage && <Footer />}
    </div>
  );
}
