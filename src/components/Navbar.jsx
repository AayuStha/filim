import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, Compass, Film, Tv, Play, Check, Sparkles, Star, User, ArrowRight, Loader2 } from 'lucide-react';

const TMDB_API_KEY = 'f69f2c8f33e02716fb1c44a6941396f8';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_POSTER_THUMB = 'https://image.tmdb.org/t/p/w92';
const TMDB_PROFILE_THUMB = 'https://image.tmdb.org/t/p/w185';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const searchBoxRef = useRef(null);

  // Scroll listener for glassmorphism styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus and suggestions on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowSuggestions(false);
  }, [location.pathname]);

  // Focus input when search bar opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Click outside to dismiss suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        if (isSearchOpen && !searchQuery.trim()) setIsSearchOpen(false);
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, searchQuery, isMobileMenuOpen]);

  // Live suggestions query (Triggered as soon as 1+ characters are typed)
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    const timer = setTimeout(() => {
      fetch(`${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}&include_adult=false&page=1`)
        .then(res => res.json())
        .then(data => {
          const raw = data.results || [];

          // Sort by release date in DESCENDING order (newest dates first)
          const sorted = [...raw].sort((a, b) => {
            const isPersonA = a.media_type === 'person';
            const isPersonB = b.media_type === 'person';
            if (isPersonA && isPersonB) return (b.popularity || 0) - (a.popularity || 0);
            if (isPersonA) return 1;
            if (isPersonB) return -1;

            const dateA = a.release_date || a.first_air_date || '';
            const dateB = b.release_date || b.first_air_date || '';

            if (dateA && dateB) return dateB.localeCompare(dateA);
            if (dateA && !dateB) return -1;
            if (!dateA && dateB) return 1;
            return (b.popularity || 0) - (a.popularity || 0);
          });

          setSuggestions(sorted.slice(0, 7));
          setShowSuggestions(true);
          setIsLoadingSuggestions(false);
        })
        .catch(() => {
          setIsLoadingSuggestions(false);
        });
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setIsSearchOpen(false);
    }
  };

  const handleSelectSuggestion = (item) => {
    setShowSuggestions(false);
    setIsSearchOpen(false);
    setSearchQuery('');

    if (item.media_type === 'person') {
      navigate(`/actor/${item.id}`);
    } else {
      const type = item.media_type || (item.name ? 'tv' : 'movie');
      navigate(`/details/${type}/${item.id}`);
    }
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname === path) return true;
    return false;
  };

  // Check if search matches known major franchise
  const matchedFranchise = (() => {
    const lower = searchQuery.trim().toLowerCase();
    if (!lower || lower.length < 2) return null;
    if (lower.includes('marv') || lower.includes('mcu') || lower.includes('aveng')) return 'Marvel Cinematic Universe (MCU)';
    if (lower.includes('star') || lower.includes('wars') || lower.includes('mando')) return 'Star Wars Saga';
    if (lower.includes('dc') || lower.includes('batm') || lower.includes('superm')) return 'DC Universe & Elseworlds';
    if (lower.includes('harry') || lower.includes('potter') || lower.includes('wizard')) return 'The Wizarding World';
    if (lower.includes('ring') || lower.includes('hobbit') || lower.includes('tolkien')) return 'Middle-earth Universe';
    if (lower.includes('conjur') || lower.includes('nun') || lower.includes('annab')) return 'The Conjuring Universe';
    if (lower.includes('godzi') || lower.includes('kong') || lower.includes('titan')) return 'MonsterVerse';
    if (lower.includes('break') || lower.includes('saul') || lower.includes('walt')) return 'Breaking Bad & Better Call Saul';
    if (lower.includes('throne') || lower.includes('dragon') || lower.includes('westeros')) return 'Game of Thrones Universe';
    if (lower.includes('fast') || lower.includes('furi')) return 'Fast & Furious Saga';
    return null;
  })();

  return (
    <header className={`netflix-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Left Section: Logo & Nav Links */}
        <div className="navbar-left">
          <Link to="/" className="netflix-logo" aria-label="AAYUSH Home">
            <span className="logo-brand">AAYUSH</span>
          </Link>

          <nav className="navbar-links" aria-label="Main Navigation">
            <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>Home</Link>
            <Link to="/browse/tv" className={`nav-item ${isActive('/browse/tv') ? 'active' : ''}`}>TV Shows</Link>
            <Link to="/browse/movie" className={`nav-item ${isActive('/browse/movie') ? 'active' : ''}`}>Movies</Link>
            <Link to="/timelines" className={`nav-item ${isActive('/timelines') ? 'active' : ''}`}>
              <Sparkles size={14} className="nav-sparkle-icon" />
              Timelines
            </Link>
            <Link to="/browse/trending" className={`nav-item ${isActive('/browse/trending') ? 'active' : ''}`}>New & Popular</Link>
            <Link to="/browse/mylist" className={`nav-item ${isActive('/browse/mylist') ? 'active' : ''}`}>My List</Link>
          </nav>
        </div>

        {/* Right Section: Minimal Search & Live Suggestions */}
        <div className="navbar-right">
          <div 
            ref={searchBoxRef}
            className={`nav-search-box ${isSearchOpen ? 'open' : ''}`}
          >
            <button 
              className="search-icon-btn" 
              onClick={() => {
                if (isSearchOpen && searchQuery.trim()) {
                  handleSearchSubmit();
                } else {
                  setIsSearchOpen(!isSearchOpen);
                }
              }}
              title="Search"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search movies, TV, actors..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!isSearchOpen) setIsSearchOpen(true);
                }}
                onFocus={() => {
                  if (suggestions.length > 0 && searchQuery.trim()) {
                    setShowSuggestions(true);
                  }
                }}
              />
              {isLoadingSuggestions && (
                <Loader2 size={14} className="search-loading-spinner" />
              )}
              {searchQuery && (
                <button 
                  type="button" 
                  className="search-clear-btn" 
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                    if (searchInputRef.current) searchInputRef.current.focus();
                  }}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </form>

            {/* LIVE AUTOCOMPLETE / SEARCH SUGGESTIONS DROPDOWN */}
            {showSuggestions && isSearchOpen && (
              <div className="navbar-suggestions-dropdown">
                {/* Franchise Match Pill */}
                {matchedFranchise && (
                  <div 
                    className="suggestion-franchise-match"
                    onClick={() => {
                      navigate('/timelines');
                      setShowSuggestions(false);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    <div className="match-pill-left">
                      <Sparkles size={14} className="sparkle-gold" />
                      <span>Explore <strong>{matchedFranchise}</strong> Story Timeline</span>
                    </div>
                    <ArrowRight size={13} />
                  </div>
                )}

                {/* Suggestions List */}
                {suggestions.length > 0 ? (
                  <div className="suggestions-list-scroll">
                    {suggestions.map(item => {
                      const isPerson = item.media_type === 'person';
                      const title = item.title || item.name;
                      const year = (item.release_date || item.first_air_date || '').split('-')[0];
                      const typeLabel = isPerson ? 'ACTOR' : (item.media_type === 'tv' ? 'TV' : 'MOVIE');
                      const thumb = isPerson
                        ? (item.profile_path ? `${TMDB_PROFILE_THUMB}${item.profile_path}` : null)
                        : (item.poster_path ? `${TMDB_POSTER_THUMB}${item.poster_path}` : null);

                      return (
                        <div 
                          key={`${item.media_type}-${item.id}`}
                          className="suggestion-row-item"
                          onClick={() => handleSelectSuggestion(item)}
                        >
                          <div className="suggestion-thumb-wrap">
                            {thumb ? (
                              <img src={thumb} alt={title} className="suggestion-thumb-img" />
                            ) : (
                              <div className="suggestion-thumb-placeholder">
                                {isPerson ? <User size={16} /> : <Film size={16} />}
                              </div>
                            )}
                          </div>

                          <div className="suggestion-info-col">
                            <div className="suggestion-title-row">
                              <span className="suggestion-item-title">{title}</span>
                              <span className={`suggestion-type-tag ${typeLabel.toLowerCase()}`}>
                                {typeLabel}
                              </span>
                            </div>

                            <div className="suggestion-meta-row">
                              {year && <span className="suggestion-year">{year}</span>}
                              {item.vote_average > 0 && !isPerson && (
                                <span className="suggestion-rating">
                                  <Star size={11} fill="#eab308" color="#eab308" /> {item.vote_average.toFixed(1)}
                                </span>
                              )}
                              {isPerson && item.known_for && (
                                <span className="suggestion-known-for">
                                  Known for: {item.known_for.slice(0, 2).map(k => k.title || k.name).join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  !isLoadingSuggestions && (
                    <div className="suggestions-empty">
                      <span>No quick matches. Press Enter to search all.</span>
                    </div>
                  )
                )}

                {/* Bottom View All Results */}
                {searchQuery.trim() && (
                  <div 
                    className="suggestions-footer-bar"
                    onClick={handleSearchSubmit}
                  >
                    <span>View all results for "<strong>{searchQuery}</strong>"</span>
                    <ArrowRight size={14} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-hamburger-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <span className="logo-brand">AAYUSH</span>
              <button className="icon-btn" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="mobile-drawer-nav">
              <Link to="/" className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}>
                <Compass size={18} /> Home
              </Link>
              <Link to="/browse/tv" className={`mobile-nav-link ${isActive('/browse/tv') ? 'active' : ''}`}>
                <Tv size={18} /> TV Shows
              </Link>
              <Link to="/browse/movie" className={`mobile-nav-link ${isActive('/browse/movie') ? 'active' : ''}`}>
                <Film size={18} /> Movies
              </Link>
              <Link to="/timelines" className={`mobile-nav-link ${isActive('/timelines') ? 'active' : ''}`}>
                <Sparkles size={18} /> Franchise Timelines
              </Link>
              <Link to="/browse/trending" className={`mobile-nav-link ${isActive('/browse/trending') ? 'active' : ''}`}>
                <Play size={18} /> New & Popular
              </Link>
              <Link to="/browse/mylist" className={`mobile-nav-link ${isActive('/browse/mylist') ? 'active' : ''}`}>
                <Check size={18} /> My List
              </Link>
            </div>

            <div className="mobile-drawer-genres">
              <span className="drawer-section-title">Explore Franchises & Genres</span>
              <div className="drawer-genre-grid">
                <Link to="/timelines">Marvel MCU</Link>
                <Link to="/timelines">Star Wars</Link>
                <Link to="/timelines">DC Universe</Link>
                <Link to="/genre/28?name=Action&type=movie">Action</Link>
                <Link to="/genre/878?name=Sci-Fi&type=movie">Sci-Fi</Link>
                <Link to="/genre/35?name=Comedy&type=movie">Comedy</Link>
                <Link to="/genre/18?name=Drama&type=movie">Drama</Link>
                <Link to="/genre/27?name=Horror&type=movie">Horror</Link>
                <Link to="/genre/16?name=Animation&type=movie">Animation</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
