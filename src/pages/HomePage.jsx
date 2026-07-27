import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Play, Info, TrendingUp, Star, Clock, Zap } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';
import MovieCard from '../components/MovieCard';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'f69f2c8f33e02716fb1c44a6941396f8';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

export default function HomePage({ currentType }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchQuery = searchParams.get('query') || '';
  const [category, setCategory] = useState('trending');
  const [genre, setGenre] = useState('');
  const [genreOptions, setGenreOptions] = useState([{ label: 'All Genres', value: '' }]);
  const [heroItem, setHeroItem] = useState(null);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // Fetch Genres for CustomSelect dropdown
  useEffect(() => {
    async function fetchGenres() {
      try {
        const res = await fetch(`${TMDB_BASE_URL}/genre/${currentType}/list?api_key=${TMDB_API_KEY}`);
        const data = await res.json();
        const opts = [{ label: 'All Genres', value: '' }].concat(
          (data.genres || []).map(g => ({ label: g.name, value: String(g.id) }))
        );
        setGenreOptions(opts);
      } catch (err) {
        console.error('Error fetching genres:', err);
      }
    }
    fetchGenres();
    setGenre('');
  }, [currentType]);

  // Load history
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('cinestream_history')) || [];
    setHistory(saved.filter(h => h.type === currentType));
  }, [currentType]);

  // Fetch Items
  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true);
      try {
        let url;
        if (searchQuery) {
          url = `${TMDB_BASE_URL}/search/${currentType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}&page=${page}`;
        } else if (category === 'trending' && !genre) {
          url = `${TMDB_BASE_URL}/trending/${currentType}/week?api_key=${TMDB_API_KEY}&page=${page}`;
        } else {
          url = `${TMDB_BASE_URL}/discover/${currentType}?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${page}`;
          if (category !== 'trending') url += `&with_original_language=${category}`;
          if (genre) url += `&with_genres=${genre}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        const results = data.results || [];

        if (page === 1) {
          setItems(results);
          if (results.length > 0 && !searchQuery) {
            setHeroItem(results[0]);
          } else {
            setHeroItem(null);
          }
        } else {
          setItems(prev => [...prev, ...results]);
        }
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        console.error('Error fetching content:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchContent();
  }, [currentType, category, genre, searchQuery, page]);

  const handleGenreChange = (val) => {
    setGenre(val);
    setPage(1);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setGenre('');
    setPage(1);
  };

  return (
    <div className="home-page">
      <div className="container">
      {/* Hero Banner */}
      {heroItem && !searchQuery && (
        <section className="hero-section">
          <div className="hero-banner">
            <div 
              className="hero-backdrop"
              style={{ backgroundImage: `url('${TMDB_IMAGE_BASE_URL}${heroItem.backdrop_path}')` }}
            >
              <div className="hero-backdrop-overlay" />
            </div>
            <div className="hero-content">
              <div className="hero-badge">
                <Zap size={12} />
                SPOTLIGHT FEATURED
              </div>
              <h1 className="hero-title">{heroItem.title || heroItem.name}</h1>
              <div className="hero-meta">
                <span>{(heroItem.release_date || heroItem.first_air_date || '').split('-')[0]}</span>
                <span className="hero-meta-item rating">
                  <Star size={15} fill="#f59e0b" color="#f59e0b" style={{ marginRight: 4 }} />
                  {heroItem.vote_average ? heroItem.vote_average.toFixed(1) : 'N/A'}
                </span>
                <span className="hero-meta-item type">{currentType === 'movie' ? 'Movie' : 'TV Series'}</span>
              </div>
              <p className="hero-overview">
                {heroItem.overview ? (heroItem.overview.length > 180 ? heroItem.overview.substring(0, 180) + '...' : heroItem.overview) : ''}
              </p>
              <div className="hero-actions">
                <button 
                  className="btn-hero-primary"
                  onClick={() => navigate(`/watch/${currentType}/${heroItem.id}`)}
                >
                  <Play fill="white" size={18} /> Watch Now
                </button>
                <button 
                  className="btn-hero-secondary"
                  onClick={() => navigate(`/details/${currentType}/${heroItem.id}`)}
                >
                  <Info size={18} /> Details
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter Bar with Custom Select Dropdown */}
      <div className="filter-strip">
        <div className="sub-tabs">
          <button 
            className={`sub-tab ${category === 'trending' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('trending')}
          >
            <TrendingUp size={14} /> Trending
          </button>
          <button 
            className={`sub-tab ${category === 'en' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('en')}
          >
            English
          </button>
          <button 
            className={`sub-tab ${category === 'hi' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('hi')}
          >
            Hindi
          </button>
          <button 
            className={`sub-tab ${category === 'ne' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('ne')}
          >
            Nepali
          </button>
        </div>

        <div className="genre-custom-select">
          <CustomSelect 
            options={genreOptions}
            value={genre}
            onChange={handleGenreChange}
            placeholder="Select Genre"
          />
        </div>
      </div>

      {/* Continue Watching Row */}
      {history.length > 0 && !searchQuery && category === 'trending' && (
        <section className="recently-watched-section">
          <div className="section-header">
            <h2><Clock size={20} /> Continue Watching</h2>
          </div>
          <div className="recent-grid">
            {history.map((item) => (
              <div 
                key={item.id} 
                className="recent-card"
                onClick={() => navigate(`/watch/${item.type}/${item.id}${item.season ? `?s=${item.season}&e=${item.episode}` : ''}`)}
              >
                <img 
                  src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/140x210'} 
                  alt={item.title} 
                />
                <div className="recent-info">
                  <h4>{item.title}</h4>
                  {item.season && <div className="recent-meta">S{item.season} E{item.episode}</div>}
                </div>
                <div className="recent-progress-container">
                  <div className="recent-progress-bar" style={{ width: `${Math.floor(Math.random() * 50) + 40}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Results Grid */}
      <section className="results-section">
        <div className="section-header">
          <h2>
            {searchQuery ? `Results for "${searchQuery}"` : `${currentType === 'movie' ? 'Movies' : 'TV Shows'}`}
          </h2>
        </div>

        <div className="movie-grid">
          {items.map((item) => (
            <MovieCard key={item.id} item={item} type={currentType} />
          ))}
        </div>

        {page < totalPages && (
          <div className="load-more-container">
            <button 
              className="btn-primary" 
              onClick={() => setPage(prev => prev + 1)}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load More Content'}
            </button>
          </div>
        )}
      </section>
      </div>
    </div>
  );
}
