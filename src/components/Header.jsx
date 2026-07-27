import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Sun, Moon, Film, Tv, X } from 'lucide-react';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'f69f2c8f33e02716fb1c44a6941396f8';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export default function Header({ currentType, setCurrentType, theme, toggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${TMDB_BASE_URL}/search/${currentType || 'movie'}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`);
        const data = await res.json();
        setSuggestions((data.results || []).slice(0, 7));
        setShowSuggestions(true);
      } catch (err) {
        console.error('Autocomplete error:', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, currentType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      navigate(`/?query=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Brand Logo */}
        <div className="logo" onClick={() => navigate('/')} title="CineStream Home">
          Cine<span>Stream</span>
        </div>

        {/* Main Tabs */}
        <div className="main-tabs">
          <button 
            className={`main-tab ${currentType === 'movie' ? 'active' : ''}`}
            onClick={() => {
              setCurrentType('movie');
              if (location.pathname !== '/') navigate('/');
            }}
          >
            <Film size={14} />
            <span>Movies</span>
          </button>
          <button 
            className={`main-tab ${currentType === 'tv' ? 'active' : ''}`}
            onClick={() => {
              setCurrentType('tv');
              if (location.pathname !== '/') navigate('/');
            }}
          >
            <Tv size={14} />
            <span>TV Shows</span>
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="search-container" ref={searchRef}>
          <Search size={15} className="search-icon" />
          <form onSubmit={handleSearchSubmit} style={{ flex: 1, display: 'flex' }}>
            <input 
              type="text" 
              placeholder="Search movies, TV series..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setShowSuggestions(true)}
              autoComplete="off"
            />
          </form>
          {query && (
            <X size={14} className="clear-search" onClick={() => { setQuery(''); setSuggestions([]); setShowSuggestions(false); }} />
          )}

          {/* Search Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions active">
              {suggestions.map((item) => {
                const title = item.title || item.name;
                const year = (item.release_date || item.first_air_date || '').split('-')[0];
                return (
                  <div 
                    key={item.id} 
                    className="suggestion-item"
                    onClick={() => {
                      setShowSuggestions(false);
                      setQuery('');
                      navigate(`/details/${currentType || 'movie'}/${item.id}`);
                    }}
                  >
                    <img 
                      src={item.poster_path ? `${TMDB_POSTER_BASE_URL}${item.poster_path}` : 'https://via.placeholder.com/40x60?text=N/A'} 
                      alt={title} 
                    />
                    <div className="suggestion-info">
                      <h4>{title}</h4>
                      <p>{year || 'N/A'} &middot; {currentType === 'movie' ? 'Movie' : 'TV Show'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Header Actions */}
        <div className="nav-actions">
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
