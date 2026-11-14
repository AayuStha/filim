import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Search, ArrowLeft, Film, Tv, User, X, Sparkles, Star, TrendingUp, Calendar, ArrowUpDown } from 'lucide-react';
import MovieCard from '../components/MovieCard';

const TMDB_API_KEY = 'f69f2c8f33e02716fb1c44a6941396f8';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_PROFILE_IMG = 'https://image.tmdb.org/t/p/w300';

const POPULAR_SEARCH_PILLS = [
  'Avengers',
  'The Batman',
  'Stranger Things',
  'Deadpool & Wolverine',
  'Breaking Bad',
  'Spider-Man',
  'Game of Thrones',
  'The Penguin',
  'Dune',
  'Interstellar',
  'Oppenheimer',
  'House of the Dragon'
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryParam = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(queryParam);
  const [results, setResults] = useState([]);
  const [mediaFilter, setMediaFilter] = useState('all'); // 'all', 'movie', 'tv', 'person'
  const [sortBy, setSortBy] = useState('date_desc'); // 'date_desc' (default: newest first) | 'date_asc' | 'rating' | 'popularity'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef(null);

  // Sync state if URL query param changes from external navigation
  useEffect(() => {
    if (queryParam !== searchInput) {
      setSearchInput(queryParam);
    }
  }, [queryParam]);

  // LIVE INSTANT AS-YOU-TYPE SEARCH (Triggered even if half-typed)
  useEffect(() => {
    const trimmed = searchInput.trim();

    if (!trimmed) {
      setResults([]);
      setTotalResults(0);
      setTotalPages(1);
      setIsLoading(false);
      setSearchParams({}, { replace: true });
      return;
    }

    setIsLoading(true);

    const debounceTimer = setTimeout(() => {
      // Update URL silently
      setSearchParams({ q: trimmed }, { replace: true });

      fetch(`${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(trimmed)}&page=1&include_adult=false`)
        .then(res => res.json())
        .then(data => {
          const items = (data.results || []).filter(item => {
            if (item.media_type === 'person') return item.profile_path;
            return item.poster_path || item.backdrop_path;
          });

          setResults(items);
          setTotalPages(data.total_pages || 1);
          setTotalResults(data.total_results || items.length);
          setPage(1);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Search error:', err);
          setIsLoading(false);
        });
    }, 220); // 220ms debounce for rapid response

    return () => clearTimeout(debounceTimer);
  }, [searchInput]);

  // Handle pagination load more
  const loadMoreResults = () => {
    const nextPage = page + 1;
    const trimmed = searchInput.trim();
    if (!trimmed || nextPage > totalPages) return;

    setIsLoading(true);
    fetch(`${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(trimmed)}&page=${nextPage}&include_adult=false`)
      .then(res => res.json())
      .then(data => {
        const validItems = (data.results || []).filter(item => {
          if (item.media_type === 'person') return item.profile_path;
          return item.poster_path || item.backdrop_path;
        });

        setResults(prev => {
          const existing = new Set(prev.map(p => `${p.media_type}-${p.id}`));
          const uniqueNew = validItems.filter(i => !existing.has(`${i.media_type}-${i.id}`));
          return [...prev, ...uniqueNew];
        });

        setPage(nextPage);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  const handleClear = () => {
    setSearchInput('');
    setResults([]);
    setSearchParams({}, { replace: true });
    if (inputRef.current) inputRef.current.focus();
  };

  const handlePillClick = (term) => {
    setSearchInput(term);
    if (inputRef.current) inputRef.current.focus();
  };

  // Filter items by active media tab
  const filteredResults = results.filter(item => {
    if (mediaFilter === 'movie') return item.media_type === 'movie';
    if (mediaFilter === 'tv') return item.media_type === 'tv';
    if (mediaFilter === 'person') return item.media_type === 'person';
    return true;
  });

  // Sort items (Default: DESCENDING by Release Date -> Newest First)
  const sortedAndFilteredResults = [...filteredResults].sort((a, b) => {
    const isPersonA = a.media_type === 'person';
    const isPersonB = b.media_type === 'person';

    if (sortBy === 'date_desc') {
      if (isPersonA && isPersonB) return (b.popularity || 0) - (a.popularity || 0);
      if (isPersonA) return 1;
      if (isPersonB) return -1;

      const dateA = a.release_date || a.first_air_date || '';
      const dateB = b.release_date || b.first_air_date || '';

      if (dateA && dateB) return dateB.localeCompare(dateA); // newest date first (descending)
      if (dateA && !dateB) return -1;
      if (!dateA && dateB) return 1;
      return (b.popularity || 0) - (a.popularity || 0);
    }

    if (sortBy === 'date_asc') {
      if (isPersonA && isPersonB) return (a.popularity || 0) - (b.popularity || 0);
      if (isPersonA) return 1;
      if (isPersonB) return -1;

      const dateA = a.release_date || a.first_air_date || '';
      const dateB = b.release_date || b.first_air_date || '';

      if (dateA && dateB) return dateA.localeCompare(dateB); // oldest date first (ascending)
      if (dateA && !dateB) return 1;
      if (!dateA && dateB) return -1;
      return (a.popularity || 0) - (b.popularity || 0);
    }

    if (sortBy === 'rating') {
      return (b.vote_average || 0) - (a.vote_average || 0);
    }

    if (sortBy === 'popularity') {
      return (b.popularity || 0) - (a.popularity || 0);
    }

    return 0;
  });

  const countMovies = results.filter(i => i.media_type === 'movie').length;
  const countTv = results.filter(i => i.media_type === 'tv').length;
  const countPeople = results.filter(i => i.media_type === 'person').length;

  return (
    <div className="netflix-search-page">
      <div className="search-page-container">
        {/* Search Header Bar */}
        <div className="search-page-header">
          <button className="search-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <div className="search-page-form-wrapper">
            <div className="search-page-form">
              <Search size={20} className="search-input-icon" />
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Type movie, TV series, franchise or cast name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="search-large-input"
                autoFocus
              />
              {searchInput && (
                <button 
                  type="button" 
                  className="search-clear-large"
                  onClick={handleClear}
                  aria-label="Clear search input"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Trending Searches Bar (When input is empty or few characters) */}
        {!searchInput && (
          <div className="search-suggestions-prompt-box">
            <div className="suggestions-prompt-title">
              <TrendingUp size={16} className="trending-icon" />
              <span>Trending & Popular Searches</span>
            </div>
            <div className="search-trending-pills">
              {POPULAR_SEARCH_PILLS.map(pill => (
                <button 
                  key={pill} 
                  className="trending-search-chip"
                  onClick={() => handlePillClick(pill)}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter Chips, Sorting & Result Counter Strip */}
        {searchInput.trim() && (
          <div className="search-meta-filter-strip">
            <div className="search-results-summary">
              <h2>
                {isLoading ? (
                  <span>Searching for <span className="highlighted-query">"{searchInput}"</span>...</span>
                ) : (
                  <span>
                    Found {sortedAndFilteredResults.length} {sortedAndFilteredResults.length === 1 ? 'match' : 'matches'} for{' '}
                    <span className="highlighted-query">"{searchInput}"</span>
                  </span>
                )}
              </h2>
            </div>

            {results.length > 0 && (
              <div className="search-controls-cluster">
                {/* Media Filter Tabs */}
                <div className="search-type-filters">
                  <button 
                    className={`search-filter-chip ${mediaFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setMediaFilter('all')}
                  >
                    All ({results.length})
                  </button>
                  {countMovies > 0 && (
                    <button 
                      className={`search-filter-chip ${mediaFilter === 'movie' ? 'active' : ''}`}
                      onClick={() => setMediaFilter('movie')}
                    >
                      <Film size={13} /> Movies ({countMovies})
                    </button>
                  )}
                  {countTv > 0 && (
                    <button 
                      className={`search-filter-chip ${mediaFilter === 'tv' ? 'active' : ''}`}
                      onClick={() => setMediaFilter('tv')}
                    >
                      <Tv size={13} /> TV Shows ({countTv})
                    </button>
                  )}
                  {countPeople > 0 && (
                    <button 
                      className={`search-filter-chip ${mediaFilter === 'person' ? 'active' : ''}`}
                      onClick={() => setMediaFilter('person')}
                    >
                      <User size={13} /> Cast & Actors ({countPeople})
                    </button>
                  )}
                </div>

                {/* Sort Order Selector (Defaults to Newest First) */}
                <div className="search-sort-dropdown-wrap">
                  <Calendar size={13} className="sort-icon" />
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="search-sort-select"
                    title="Sort search results"
                  >
                    <option value="date_desc">Newest First (Date ↓)</option>
                    <option value="date_asc">Oldest First (Date ↑)</option>
                    <option value="rating">Top Rated (Rating ★)</option>
                    <option value="popularity">Most Popular</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Media Grid */}
        {sortedAndFilteredResults.length > 0 && (
          <div className="browse-media-grid search-grid">
            {sortedAndFilteredResults.map(item => {
              if (item.media_type === 'person') {
                return (
                  <div 
                    key={`person-${item.id}`} 
                    className="search-actor-card"
                    onClick={() => navigate(`/actor/${item.id}`)}
                  >
                    <div className="actor-card-photo-wrap">
                      <img 
                        src={item.profile_path ? `${TMDB_PROFILE_IMG}${item.profile_path}` : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect width="300" height="450" fill="%2314141e"/><circle cx="150" cy="170" r="60" fill="%233f3f46"/><path d="M70,360 C70,270 230,270 230,360 Z" fill="%233f3f46"/></svg>'}
                        alt={item.name}
                        className="actor-card-photo"
                        loading="lazy"
                      />
                      <span className="actor-pill-tag">ACTOR</span>
                    </div>
                    <div className="actor-card-info">
                      <h4 className="actor-card-name">{item.name}</h4>
                      {item.known_for && (
                        <p className="actor-card-known">
                          {item.known_for.slice(0, 2).map(k => k.title || k.name).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <MovieCard 
                  key={`${item.media_type}-${item.id}`} 
                  item={item} 
                  type={item.media_type || (item.name ? 'tv' : 'movie')} 
                />
              );
            })}
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="browse-loading-wrap">
            <div className="netflix-spinner" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && searchInput.trim() && sortedAndFilteredResults.length === 0 && (
          <div className="search-empty-state">
            <Film size={44} className="empty-icon" />
            <h3>No titles found for "{searchInput}"</h3>
            <p>Try searching for a different keyword, popular actor, or explore these popular titles:</p>
            <div className="empty-suggestions-pills">
              {POPULAR_SEARCH_PILLS.slice(0, 6).map(pill => (
                <button 
                  key={pill} 
                  className="trending-search-chip"
                  onClick={() => handlePillClick(pill)}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Load More Button */}
        {!isLoading && page < totalPages && sortedAndFilteredResults.length > 0 && (
          <div className="browse-load-more-wrap">
            <button 
              className="netflix-load-more-btn"
              onClick={loadMoreResults}
            >
              Load More Results
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
