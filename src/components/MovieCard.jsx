import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Star } from 'lucide-react';

const TMDB_POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export default function MovieCard({ item, type = 'movie' }) {
  const navigate = useNavigate();
  if (!item || !item.poster_path) return null;

  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? releaseDate.split('-')[0] : 'N/A';
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

  const handleClick = () => {
    navigate(`/details/${type}/${item.id}`);
  };

  return (
    <div 
      className={`movie-card ${item.original_language === 'ne' ? 'nepali-highlight' : ''}`}
      onClick={handleClick}
    >
      <div className="poster-wrapper">
        <img 
          src={`${TMDB_POSTER_BASE_URL}${item.poster_path}`} 
          alt={title} 
          className="movie-poster" 
          loading="lazy" 
        />
        <div className="card-play-overlay">
          <div className="play-icon-circle">
            <Play fill="white" size={24} style={{ marginLeft: 3 }} />
          </div>
        </div>
      </div>

      <div className="movie-info">
        <h3>{title}</h3>
        <div className="movie-meta">
          <span>{year}</span>
          <span className="rating">
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
            {rating}
          </span>
        </div>
      </div>
    </div>
  );
}
