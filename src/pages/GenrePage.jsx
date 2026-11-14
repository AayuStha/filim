import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Film, Tv, SlidersHorizontal } from 'lucide-react';
import MovieCard from '../components/MovieCard';

const TMDB_API_KEY = 'f69f2c8f33e02716fb1c44a6941396f8';
const TMDB_BASE = 'https://api.themoviedb.org/3';

export default function GenrePage() {
  const { genreId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const genreName = searchParams.get('name') || 'Genre';
  const [mediaType, setMediaType] = useState(searchParams.get('type') || 'movie');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // When genreId or mediaType or sortBy changes, reset page to 1
  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [genreId, mediaType, sortBy]);

  useEffect(() => {
    setIsLoading(true);

    const url = `${TMDB_BASE}/discover/${mediaType}?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=${sortBy}&page=${page}&vote_count.gte=20`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const results = (data.results || []).filter(item => item.poster_path);
        if (page === 1) {
          setItems(results);
        } else {
          setItems(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newItems = results.filter(r => !existingIds.has(r.id));
            return [...prev, ...newItems];
          });
        }
        setTotalPages(data.total_pages || 1);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching genre items:', err);
        setIsLoading(false);
      });
  }, [genreId, mediaType, sortBy, page]);

  const handleTypeChange = (newType) => {
    setMediaType(newType);
    setSearchParams({ name: genreName, type: newType });
  };

  return (
    <div className="netflix-browse-page">
      <div className="browse-container">
        {/* Top Navigation Row */}
        <div className="browse-header-row">
          <button className="browse-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <div className="browse-title-group">
            <h1 className="browse-page-title">
              {genreName} {mediaType === 'tv' ? 'Series' : 'Movies'}
            </h1>
            <p className="browse-page-subtitle">
              Browse top-rated & trending {genreName.toLowerCase()} titles available to stream instantly.
            </p>
          </div>

          {/* Type Toggle & Sort Filter */}
          <div className="browse-controls-row">
            <div className="type-toggle-pills">
              <button 
                className={`type-pill ${mediaType === 'movie' ? 'active' : ''}`}
                onClick={() => handleTypeChange('movie')}
              >
                <Film size={14} /> Movies
              </button>
              <button 
                className={`type-pill ${mediaType === 'tv' ? 'active' : ''}`}
                onClick={() => handleTypeChange('tv')}
              >
                <Tv size={14} /> TV Series
              </button>
            </div>

            <div className="sort-dropdown-wrap">
              <SlidersHorizontal size={14} className="sort-icon" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="popularity.desc">Most Popular</option>
                <option value="vote_average.desc">Highest Rated</option>
                <option value="primary_release_date.desc">Latest Releases</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="browse-media-grid">
          {items.map(item => (
            <MovieCard 
              key={item.id} 
              item={item} 
              type={mediaType} 
            />
          ))}
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="browse-loading-wrap">
            <div className="netflix-spinner" />
          </div>
        )}

        {/* Load More Button */}
        {!isLoading && page < totalPages && (
          <div className="browse-load-more-wrap">
            <button 
              className="netflix-load-more-btn" 
              onClick={() => setPage(prev => prev + 1)}
            >
              Load More {genreName} Titles
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

