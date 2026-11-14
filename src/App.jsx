import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DetailsPage from './pages/DetailsPage';
import WatchPage from './pages/WatchPage';
import GenrePage from './pages/GenrePage';
import ActorPage from './pages/ActorPage';
import SearchPage from './pages/SearchPage';
import TimelinesPage from './pages/TimelinesPage';
import MyListPage from './pages/MyListPage';
import NotFoundPage from './pages/NotFoundPage';

// Automatically scroll to the top of the window on route change
function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search]);

  return null;
}

export default function App() {
  const location = useLocation();
  const isWatchPage = location.pathname.startsWith('/watch');

  return (
    <div className="netflix-app-root">
      <ScrollToTop />

      {/* Navigation Bar (hidden during immersive watch mode) */}
      {!isWatchPage && <Navbar />}

      {/* Main Content Router */}
      <main className={`netflix-main-content ${isWatchPage ? 'watch-mode' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse/mylist" element={<MyListPage />} />
          <Route path="/mylist" element={<MyListPage />} />
          <Route path="/browse/:type" element={<HomePage />} />
          <Route path="/details/:type/:id" element={<DetailsPage />} />
          <Route path="/watch/:type/:id" element={<WatchPage />} />
          <Route path="/genre/:genreId" element={<GenrePage />} />
          <Route path="/actor/:actorId" element={<ActorPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/timelines" element={<TimelinesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Footer */}
      {!isWatchPage && <Footer />}
    </div>
  );
}
