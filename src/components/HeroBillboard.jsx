import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, Plus, Check, Flame } from 'lucide-react';
import { isInMyList, toggleMyListStatus } from '../utils/myList';
import { playCinematicIntroSound } from '../utils/soundEffects';

const TMDB_ORIGINAL_IMG = 'https://image.tmdb.org/t/p/original';

export default function HeroBillboard({ item, type = 'movie', onOpenQuickView }) {
  const navigate = useNavigate();
  const [inList, setInList] = useState(false);

  useEffect(() => {
    if (!item?.id) return;
    setInList(isInMyList(item.id));
  }, [item]);

  // Listen to My List updates
  useEffect(() => {
    const handleListChange = () => {
      if (item?.id) setInList(isInMyList(item.id));
    };
    window.addEventListener('aayush_mylist_changed', handleListChange);
    return () => window.removeEventListener('aayush_mylist_changed', handleListChange);
  }, [item]);

  if (!item) return null;

  const mediaType = item.name ? 'tv' : (item.media_type || type);
  const title = item.title || item.name || 'Featured Title';
  const year = (item.release_date || item.first_air_date || '').split('-')[0] || '2024';

  const handleToggleList = () => {
    const newStatus = toggleMyListStatus(item, mediaType);
    setInList(newStatus);
  };

  const handlePlayClick = () => {
    playCinematicIntroSound();
    navigate(`/watch/${mediaType}/${item.id}`);
  };

  return (
    <section className="netflix-billboard">
      {/* Background Media Container (Vivid 4K High-Res Cinematic Backdrop Poster) */}
      <div className="billboard-backdrop-container">
        <img 
          src={item.backdrop_path ? `${TMDB_ORIGINAL_IMG}${item.backdrop_path}` : (item.poster_path ? `${TMDB_ORIGINAL_IMG}${item.poster_path}` : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><rect width="1920" height="1080" fill="%230b0b12"/></svg>')} 
          alt={title} 
          className="billboard-backdrop-img"
        />

        {/* Cinematic Vignettes & Gradient Overlays */}
        <div className="billboard-vignette-left" />
        <div className="billboard-vignette-bottom" />
        <div className="billboard-vignette-top" />
      </div>

      {/* Billboard Hero Content */}
      <div className="billboard-content">
        <div className="billboard-badge-row">
          <span className="netflix-series-badge">
            <Flame size={14} className="badge-flame" />
            #1 IN STREAMING TODAY
          </span>
        </div>

        <h1 className="billboard-title">{title}</h1>

        <div className="billboard-meta-row">
          <span className="billboard-badge">TV-MA</span>
          <span className="billboard-year">{year}</span>
          <span className="billboard-badge ultra-hd">4K Ultra HD</span>
          <span className="billboard-badge">{mediaType === 'tv' ? 'Series' : 'Movie'}</span>
        </div>

        <p className="billboard-overview">
          {item.overview ? (
            item.overview.length > 200 
              ? item.overview.substring(0, 200) + '...' 
              : item.overview
          ) : 'Stream high definition unlimited movies and series on AAYUSH.'}
        </p>

        <div className="billboard-actions">
          <button 
            className="billboard-btn play-btn"
            onClick={handlePlayClick}
          >
            <Play size={20} fill="black" color="black" />
            <span>Play</span>
          </button>

          <button 
            className="billboard-btn info-btn"
            onClick={() => {
              if (onOpenQuickView) onOpenQuickView(item, mediaType);
              else navigate(`/details/${mediaType}/${item.id}`);
            }}
          >
            <Info size={20} />
            <span>More Info</span>
          </button>

          <button 
            className={`billboard-btn list-btn ${inList ? 'in-list' : ''}`}
            onClick={handleToggleList}
            title={inList ? 'Remove from My List' : 'Add to My List'}
            aria-label="Toggle My List"
          >
            {inList ? <Check size={18} /> : <Plus size={18} />}
            <span>{inList ? 'In My List' : 'My List'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
