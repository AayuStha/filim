import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Play, Info, ArrowLeft, Film, Clock, 
  Check, Star, ChevronRight, ChevronLeft, Search, X,
  Compass, Grid, Compass as RiverIcon, Shield, Zap, Crown, Flame, Eye
} from 'lucide-react';
import { 
  CINEMATIC_UNIVERSES_CONFIG, 
  getUniverseTimeline, 
  searchFranchiseCollections 
} from '../services/timelineService';

const TMDB_POSTER_IMG = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_IMG = 'https://image.tmdb.org/t/p/original';

export default function TimelinesPage() {
  const navigate = useNavigate();
  const [activeUniverseId, setActiveUniverseId] = useState('mcu');
  const [universeData, setUniverseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Search Collections Live
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // View Mode: 'river' (Natural Flowing Timeline) | 'matrix' (Poster Grid) | 'navigator' (Smart Next Up)
  const [viewMode, setViewMode] = useState('river');
  const [sortOrder, setSortOrder] = useState('chronological'); // 'chronological' | 'reverse'

  // Selected Movie for Cinematic Spotlight Drawer
  const [spotlightMovie, setSpotlightMovie] = useState(null);

  // Watched state persisted in localStorage
  const [watchedIds, setWatchedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('aayush_timeline_watched') || '[]');
    } catch {
      return [];
    }
  });

  // Navigator selection
  const [lastWatchedId, setLastWatchedId] = useState(null);

  // Horizontal scroll ref for the natural timeline river
  const riverScrollRef = useRef(null);

  // Fetch universe timeline data dynamically from TMDB
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getUniverseTimeline(activeUniverseId).then(data => {
      if (isMounted && data) {
        setUniverseData(data);
        setIsLoading(false);
      }
    });

    return () => { isMounted = false; };
  }, [activeUniverseId]);

  // Live search for ANY franchise in TMDB
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      searchFranchiseCollections(searchQuery.trim()).then(res => {
        setSearchResults(res || []);
        setIsSearching(false);
      });
    }, 320);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Switch to selected universe
  const handleSelectUniverse = (id) => {
    setActiveUniverseId(id);
    setSearchQuery('');
    setSearchResults([]);
    setLastWatchedId(null);
    setSpotlightMovie(null);
  };

  // Toggle watched state
  const toggleWatched = (id, e) => {
    if (e) e.stopPropagation();
    setWatchedIds(prev => {
      const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('aayush_timeline_watched', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  };

  // Horizontal scroll helper
  const scrollRiver = (direction) => {
    if (riverScrollRef.current) {
      const amount = direction === 'left' ? -650 : 650;
      riverScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Franchise icon getter
  const getFranchiseIcon = (id) => {
    switch (id) {
      case 'mcu': return <Shield size={16} />;
      case 'star-wars': return <Compass size={16} />;
      case 'batman': return <Zap size={16} />;
      case 'middle-earth': return <Crown size={16} />;
      case 'dune': return <Flame size={16} />;
      case 'harry-potter': return <Sparkles size={16} />;
      default: return <Film size={16} />;
    }
  };

  const items = universeData?.items || [];

  // Sort items
  let displayItems = [...items];
  if (sortOrder === 'reverse') {
    displayItems.reverse();
  }

  // Calculated Stats
  const totalCount = items.length;
  const watchedCount = items.filter(i => watchedIds.includes(i.id)).length;
  const progressPercent = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;
  const nextToWatch = items.find(i => !watchedIds.includes(i.id)) || items[0];

  // Navigator target calculation
  const navigatorBase = lastWatchedId 
    ? items.find(i => i.id === Number(lastWatchedId))
    : nextToWatch;
  const baseIdx = navigatorBase ? items.findIndex(i => i.id === navigatorBase.id) : -1;
  const nextChapters = baseIdx !== -1 ? items.slice(baseIdx + 1, baseIdx + 4) : [];

  return (
    <div className="netflix-browse-page cinematic-timelines-page">
      <div className="timelines-universe-canvas">
        {/* Top Floating Control Bar */}
        <div className="timelines-topbar">
          <button className="browse-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          {/* Live Franchise Search Bar */}
          <div className="franchise-live-search">
            <Search size={16} className="search-lens-icon" />
            <input 
              type="text" 
              placeholder="Search any saga (Matrix, Alien, Indiana Jones, Dune...)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                <X size={14} />
              </button>
            )}

            {/* Live Search Results Popover */}
            {searchResults.length > 0 && (
              <div className="franchise-search-dropdown">
                <span className="dropdown-title">Matching Franchises on TMDB</span>
                {searchResults.slice(0, 8).map(col => (
                  <div 
                    key={col.id} 
                    className="dropdown-item"
                    onClick={() => handleSelectUniverse(col.id)}
                  >
                    <Film size={16} className="dropdown-film-icon" />
                    <span className="dropdown-item-name">{col.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Franchise Showcase Hero Banner */}
        {universeData && (
          <div 
            className="timeline-hero-showcase"
            style={{ 
              backgroundImage: universeData.coverBackdrop ? `url(${universeData.coverBackdrop})` : 'none' 
            }}
          >
            <div className="hero-showcase-vignette" />
            <div className="hero-showcase-body">
              <div className="hero-badge-row">
                <span className="hero-franchise-tag" style={{ background: universeData.accentColor }}>
                  <Sparkles size={12} /> {universeData.franchise}
                </span>
                {universeData.yearSpan && (
                  <span className="hero-years-tag">
                    <Clock size={12} /> {universeData.yearSpan}
                  </span>
                )}
                <span className="hero-total-tag">
                  <Film size={12} /> {universeData.totalMovies} Movies
                </span>
              </div>

              <h1 className="hero-universe-title">{universeData.name}</h1>
              <p className="hero-universe-tagline">{universeData.tagline}</p>
              <p className="hero-universe-desc">{universeData.description}</p>

              {/* Real-time Watch Progress Tracker */}
              <div className="hero-progress-meter">
                <div className="meter-header">
                  <span className="meter-label">
                    <Check size={14} /> Saga Completion: {watchedCount} of {totalCount} Watched ({progressPercent}%)
                  </span>
                  {nextToWatch && (
                    <button 
                      className="meter-next-btn"
                      onClick={() => navigate(`/watch/${nextToWatch.type}/${nextToWatch.id}`)}
                    >
                      <Play size={14} fill="currentColor" />
                      <span>Next Up: {nextToWatch.title}</span>
                    </button>
                  )}
                </div>
                <div className="meter-bar-track">
                  <div 
                    className="meter-bar-fill"
                    style={{ width: `${progressPercent}%`, background: universeData.accentColor || '#e50914' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Curated Popular Franchises Selector Carousel */}
        <div className="popular-franchises-selector">
          <div className="selector-title-row">
            <span className="selector-label">SELECT FRANCHISE SAGA</span>
          </div>
          <div className="franchises-pill-scroll">
            {CINEMATIC_UNIVERSES_CONFIG.map(f => {
              const isActive = f.id === activeUniverseId;
              return (
                <button
                  key={f.id}
                  className={`franchise-portal-pill ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectUniverse(f.id)}
                  style={isActive ? { 
                    borderColor: f.accentColor, 
                    boxShadow: `0 0 20px ${f.accentColor}44`,
                    background: `linear-gradient(135deg, #181822 0%, ${f.accentColor}26 100%)`
                  } : {}}
                >
                  <span className="portal-icon" style={{ color: isActive ? f.accentColor : '#94a3b8' }}>
                    {getFranchiseIcon(f.id)}
                  </span>
                  <span className="portal-name">{f.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive View Mode & Sorting Toolbar */}
        <div className="timeline-interactive-toolbar">
          {/* View Mode Switcher */}
          <div className="mode-switcher-group">
            <button 
              className={`mode-btn ${viewMode === 'river' ? 'active' : ''}`}
              onClick={() => setViewMode('river')}
            >
              <RiverIcon size={15} />
              <span>Timeline River</span>
            </button>
            <button 
              className={`mode-btn ${viewMode === 'matrix' ? 'active' : ''}`}
              onClick={() => setViewMode('matrix')}
            >
              <Grid size={15} />
              <span>Saga Matrix</span>
            </button>
            <button 
              className={`mode-btn ${viewMode === 'navigator' ? 'active' : ''}`}
              onClick={() => setViewMode('navigator')}
            >
              <Sparkles size={15} />
              <span>Next Navigator</span>
            </button>
          </div>

          {/* Sort Order Toggle */}
          <div className="sort-order-toggle">
            <button 
              className={`sort-pill ${sortOrder === 'chronological' ? 'active' : ''}`}
              onClick={() => setSortOrder('chronological')}
            >
              Chronological
            </button>
            <button 
              className={`sort-pill ${sortOrder === 'reverse' ? 'active' : ''}`}
              onClick={() => setSortOrder('reverse')}
            >
              Latest First
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="timeline-dynamic-loading">
            <div className="quantum-spinner" />
            <p>Fetching real saga timeline from TMDB...</p>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 1: THE NATURAL TIMELINE RIVER (Flowing Cinema Stream)    */}
        {/* ============================================================ */}
        {!isLoading && viewMode === 'river' && (
          <div className="timeline-river-wrapper">
            {/* Carousel Arrow Controls */}
            <button 
              className="river-arrow left" 
              onClick={() => scrollRiver('left')}
              aria-label="Scroll timeline back"
            >
              <ChevronLeft size={22} />
            </button>
            <button 
              className="river-arrow right" 
              onClick={() => scrollRiver('right')}
              aria-label="Scroll timeline forward"
            >
              <ChevronRight size={22} />
            </button>

            {/* The Horizontal Flowing Stream */}
            <div className="timeline-river-track" ref={riverScrollRef}>
              {displayItems.map((movie, index) => {
                const isWatched = watchedIds.includes(movie.id);
                const isNext = nextToWatch?.id === movie.id;

                return (
                  <div 
                    key={movie.id} 
                    className={`river-milestone-node ${isWatched ? 'watched' : ''} ${isNext ? 'is-next' : ''}`}
                    onClick={() => setSpotlightMovie(movie)}
                  >
                    {/* Upper Year & Chapter Flag */}
                    <div className="river-node-flag">
                      <span className="river-chapter-tag">
                        #{String(index + 1).padStart(2, '0')}
                      </span>
                      {movie.year && (
                        <span className="river-year-tag">{movie.year}</span>
                      )}
                    </div>

                    {/* Glowing Energy Node Dot */}
                    <div 
                      className={`river-dot ${isWatched ? 'watched' : ''} ${isNext ? 'pulse' : ''}`}
                      onClick={(e) => toggleWatched(movie.id, e)}
                      title={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
                    >
                      {isWatched ? <Check size={12} /> : <div className="dot-core" />}
                    </div>

                    {/* Movie Poster Card */}
                    <div className="river-card-body">
                      <div className="river-poster-wrap">
                        {movie.poster_path ? (
                          <img 
                            src={`${TMDB_POSTER_IMG}${movie.poster_path}`} 
                            alt={movie.title} 
                            className="river-poster-img"
                            loading="lazy"
                          />
                        ) : (
                          <div className="river-poster-placeholder">
                            <Film size={32} />
                          </div>
                        )}
                        <div className="river-play-hover">
                          <Play size={26} fill="white" />
                        </div>
                        {movie.vote_average && (
                          <span className="river-rating-tag">
                            <Star size={11} fill="#eab308" color="#eab308" /> {movie.vote_average}
                          </span>
                        )}
                      </div>

                      <div className="river-meta-info">
                        <h4 className="river-movie-title">{movie.title}</h4>
                        {movie.release_date && (
                          <span className="river-release-date">{movie.release_date}</span>
                        )}
                        <div className="river-card-actions">
                          <button 
                            className="river-stream-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/watch/${movie.type}/${movie.id}`);
                            }}
                          >
                            <Play size={13} fill="currentColor" /> Play
                          </button>
                          <button 
                            className={`river-watched-btn ${isWatched ? 'active' : ''}`}
                            onClick={(e) => toggleWatched(movie.id, e)}
                            title={isWatched ? 'Watched' : 'Mark as watched'}
                          >
                            <Check size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: SAGA MATRIX (Responsive Visual Poster Wall)          */}
        {/* ============================================================ */}
        {!isLoading && viewMode === 'matrix' && (
          <div className="saga-matrix-grid">
            {displayItems.map((movie, idx) => {
              const isWatched = watchedIds.includes(movie.id);
              return (
                <div 
                  key={movie.id} 
                  className={`matrix-movie-card ${isWatched ? 'watched' : ''}`}
                  onClick={() => setSpotlightMovie(movie)}
                >
                  <div className="matrix-poster-wrap">
                    {movie.poster_path ? (
                      <img 
                        src={`${TMDB_POSTER_IMG}${movie.poster_path}`} 
                        alt={movie.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="matrix-poster-fallback">
                        <Film size={32} />
                      </div>
                    )}
                    <span className="matrix-order-badge">#{idx + 1}</span>
                    {movie.vote_average && (
                      <span className="matrix-rating-badge">
                        <Star size={11} fill="#eab308" color="#eab308" /> {movie.vote_average}
                      </span>
                    )}
                    <div className="matrix-hover-actions">
                      <button 
                        className="matrix-action-play"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/watch/${movie.type}/${movie.id}`);
                        }}
                      >
                        <Play size={16} fill="white" />
                      </button>
                      <button 
                        className={`matrix-action-check ${isWatched ? 'active' : ''}`}
                        onClick={(e) => toggleWatched(movie.id, e)}
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="matrix-card-details">
                    <span className="matrix-movie-year">{movie.year}</span>
                    <h4 className="matrix-movie-title">{movie.title}</h4>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 3: NEXT CHAPTER NAVIGATOR (Dynamic Story Step-Through) */}
        {/* ============================================================ */}
        {!isLoading && viewMode === 'navigator' && (
          <div className="timeline-navigator-wrapper">
            <div className="navigator-selector-box">
              <span className="navigator-box-label">WHERE ARE YOU IN THIS SAGA?</span>
              <h3 className="navigator-box-title">Select the last movie you watched</h3>
              <p className="navigator-box-desc">
                We will automatically calculate your exact chronological next chapters with zero spoilers.
              </p>

              <select 
                className="navigator-select-element"
                value={lastWatchedId || (navigatorBase?.id || '')}
                onChange={(e) => setLastWatchedId(Number(e.target.value))}
              >
                {items.map((m, idx) => (
                  <option key={m.id} value={m.id}>
                    #{idx + 1} — {m.title} ({m.year})
                  </option>
                ))}
              </select>
            </div>

            {/* Next Canonical Chapters */}
            <div className="navigator-steps-column">
              <h3 className="navigator-results-heading">
                <ChevronRight size={20} /> Your Canonical Next Chapters
              </h3>

              {nextChapters.length > 0 ? (
                <div className="navigator-steps-grid">
                  {nextChapters.map((nxt, stepIdx) => (
                    <div key={nxt.id} className="navigator-step-card">
                      <div className="step-number-tag">
                        STEP {stepIdx + 1}
                      </div>

                      <div className="step-card-content">
                        <img 
                          src={nxt.poster_path ? `${TMDB_POSTER_IMG}${nxt.poster_path}` : ''} 
                          alt={nxt.title} 
                          className="step-poster"
                        />
                        <div className="step-info">
                          <span className="step-year">Release: {nxt.year}</span>
                          <h4 className="step-title">{nxt.title}</h4>
                          <p className="step-overview">
                            {nxt.overview ? (nxt.overview.length > 140 ? nxt.overview.slice(0, 140) + '...' : nxt.overview) : ''}
                          </p>

                          <div className="step-actions">
                            <button 
                              className="step-play-btn"
                              onClick={() => navigate(`/watch/${nxt.type}/${nxt.id}`)}
                            >
                              <Play size={14} fill="currentColor" /> Stream in 4K
                            </button>
                            <button 
                              className="step-info-btn"
                              onClick={() => navigate(`/details/${nxt.type}/${nxt.id}`)}
                            >
                              <Info size={14} /> Full Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="navigator-finished-card">
                  <Sparkles size={32} />
                  <h4>You are completely caught up with this saga!</h4>
                  <p>Explore another universe from the catalog above or rewatch your favorite chapters.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* CINEMATIC SPOTLIGHT MODAL / DRAWER                           */}
        {/* ============================================================ */}
        {spotlightMovie && (
          <div className="spotlight-modal-overlay" onClick={() => setSpotlightMovie(null)}>
            <div className="spotlight-modal-content" onClick={(e) => e.stopPropagation()}>
              {/* Modal Backdrop Banner */}
              <div 
                className="spotlight-backdrop-frame"
                style={{
                  backgroundImage: spotlightMovie.backdrop_path 
                    ? `url(${TMDB_BACKDROP_IMG}${spotlightMovie.backdrop_path})` 
                    : 'none'
                }}
              >
                <button className="spotlight-close-btn" onClick={() => setSpotlightMovie(null)}>
                  <X size={20} />
                </button>
                <div className="spotlight-backdrop-vignette" />
              </div>

              <div className="spotlight-modal-body">
                <div className="spotlight-title-row">
                  <div>
                    <span className="spotlight-franchise-tag">
                      {universeData?.name}
                    </span>
                    <h2 className="spotlight-heading">{spotlightMovie.title}</h2>
                    <div className="spotlight-meta-tags">
                      {spotlightMovie.year && <span className="meta-pill">{spotlightMovie.year}</span>}
                      {spotlightMovie.vote_average && (
                        <span className="meta-pill rating">
                          <Star size={12} fill="#eab308" color="#eab308" /> {spotlightMovie.vote_average} / 10
                        </span>
                      )}
                      <span className="meta-pill uhd-4k">Ultra HD 4K</span>
                    </div>
                  </div>

                  <div className="spotlight-modal-actions">
                    <button 
                      className="spotlight-primary-play"
                      onClick={() => navigate(`/watch/${spotlightMovie.type}/${spotlightMovie.id}`)}
                    >
                      <Play size={18} fill="currentColor" /> Play in 4K
                    </button>
                    <button 
                      className="spotlight-secondary-details"
                      onClick={() => navigate(`/details/${spotlightMovie.type}/${spotlightMovie.id}`)}
                    >
                      <Info size={16} /> Details & Cast
                    </button>
                  </div>
                </div>

                <p className="spotlight-full-overview">
                  {spotlightMovie.overview}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
