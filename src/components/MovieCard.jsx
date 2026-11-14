import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Check, ChevronDown, Star } from 'lucide-react';
import { isInMyList, toggleMyListStatus } from '../utils/myList';

const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/w500';

export default function MovieCard({ item, type = 'movie', rank = null, isLandscape = false }) {
  const navigate = useNavigate();
  const [inList, setInList] = useState(false);

  useEffect(() => {
    if (item?.id) setInList(isInMyList(item.id));

    const handleUpdate = () => {
      if (item?.id) setInList(isInMyList(item.id));
    };
    window.addEventListener('aayush_mylist_changed', handleUpdate);
    return () => window.removeEventListener('aayush_mylist_changed', handleUpdate);
  }, [item?.id]);

  if (!item) return null;

  const title = item.title || item.name || 'Untitled';
  const mediaType = item.media_type || type;
  const year = (item.release_date || item.first_air_date || '').split('-')[0] || '2024';
  const rating = item.vote_average ? item.vote_average.toFixed(1) : '7.8';
  const matchScore = Math.min(99, Math.max(82, Math.round((item.vote_average || 7.5) * 10) + 12));

  const imageSrc = isLandscape && item.backdrop_path 
    ? `${TMDB_BACKDROP_BASE}${item.backdrop_path}` 
    : (item.poster_path ? `${TMDB_POSTER_BASE}${item.poster_path}` : (item.backdrop_path ? `${TMDB_BACKDROP_BASE}${item.backdrop_path}` : null));

  if (!imageSrc) return null;

  const handleToggleMyList = (e) => {
    e.stopPropagation();
    const updated = toggleMyListStatus(item, mediaType);
    setInList(updated);
  };

  const handleCardClick = () => {
    navigate(`/details/${mediaType}/${item.id}`);
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    navigate(`/watch/${mediaType}/${item.id}`);
  };

  return (
    <div 
      className={`netflix-movie-card ${isLandscape ? 'landscape' : ''} ${rank ? 'has-rank' : ''}`}
      onClick={handleCardClick}
    >
      {/* Top 10 Giant Rank Number */}
      {rank && (
        <div className="rank-number-svg-wrap">
          <span className="rank-number-text">{rank}</span>
        </div>
      )}

      <div className="card-media-wrapper">
        <img 
          src={imageSrc} 
          alt={title}
          loading="lazy"
          className="card-image"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect width="300" height="450" fill="%2314141e"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2371717a" font-family="sans-serif" font-size="16">No Poster Available</text></svg>';
          }}
        />

        {/* Hover Mini-Card Popup */}
        <div className="card-hover-overlay">
          <div className="hover-actions-row">
            <div className="actions-left">
              <button 
                className="hover-btn play-btn" 
                onClick={handlePlayClick} 
                title="Play"
                aria-label="Play"
              >
                <Play size={15} fill="black" color="black" />
              </button>
              <button 
                className={`hover-btn icon-outline-btn ${inList ? 'in-list' : ''}`} 
                onClick={handleToggleMyList}
                title={inList ? 'Remove from My List' : 'Add to My List'}
                aria-label="Toggle My List"
              >
                {inList ? <Check size={15} /> : <Plus size={15} />}
              </button>
            </div>
            <div className="actions-right">
              <button 
                className="hover-btn icon-outline-btn" 
                onClick={handleCardClick}
                title="Details & info"
                aria-label="More Info"
              >
                <ChevronDown size={15} />
              </button>
            </div>
          </div>

          <div className="hover-info">
            <h4 className="hover-title">{title}</h4>
            <div className="hover-meta-row">
              <span className="match-score">{matchScore}%</span>
              <span className="age-badge">16+</span>
              <span className="media-year">{year}</span>
              <span className="quality-badge">HD</span>
            </div>
            <div className="hover-genres-row">
              <span className="rating-tag">
                <Star size={11} fill="#e50914" color="#e50914" /> {rating}
              </span>
              <span className="dot-sep">•</span>
              <span className="type-tag">{mediaType === 'tv' ? 'Series' : 'Movie'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
