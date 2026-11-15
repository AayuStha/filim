import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, Play, Plus, Check, Star, Volume2, VolumeX, Film, Tv, ArrowRight, User } from 'lucide-react';
import { isInMyList, toggleMyListStatus } from '../utils/myList';
import { playCinematicIntroSound } from '../utils/soundEffects';

const TMDB_API_KEY = 'f69f2c8f33e02716fb1c44a6941396f8';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_ORIGINAL_IMG = 'https://image.tmdb.org/t/p/original';
const TMDB_POSTER_IMG = 'https://image.tmdb.org/t/p/w500';
const TMDB_PROFILE_IMG = 'https://image.tmdb.org/t/p/w185';

export default function QuickViewModal({ item, type = 'movie', isOpen, onClose }) {
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [inList, setInList] = useState(false);
  const iframeRef = useRef(null);

  const mediaType = item?.media_type || (item?.name ? 'tv' : type);
  const itemId = item?.id;

  // Fetch full details & trailer when modal opens
  useEffect(() => {
    if (!isOpen || !itemId) return;

    setInList(isInMyList(itemId));
    setTrailerKey(null);
    setIsPlayingTrailer(false);

    fetch(`${TMDB_BASE}/${mediaType}/${itemId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`)
      .then(r => r.json())
      .then(data => {
        setDetails(data);

        // Find official trailer
        if (data.videos?.results) {
          const trailer = data.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube')
            || data.videos.results.find(v => v.site === 'YouTube');
          if (trailer?.key) {
            setTrailerKey(trailer.key);
            // Autoplay after small pause
            const timer = setTimeout(() => setIsPlayingTrailer(true), 800);
            return () => clearTimeout(timer);
          }
        }
      })
      .catch(err => console.error('Quick view fetch error:', err));
  }, [isOpen, itemId, mediaType]);

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const currentData = details || item;
  const title = currentData.title || currentData.name || 'Untitled';
  const year = (currentData.release_date || currentData.first_air_date || '').split('-')[0];
  const rating = currentData.vote_average ? currentData.vote_average.toFixed(1) : '7.8';
  const runtime = currentData.runtime 
    ? `${Math.floor(currentData.runtime / 60)}h ${currentData.runtime % 60}m` 
    : (currentData.number_of_seasons ? `${currentData.number_of_seasons} Season${currentData.number_of_seasons > 1 ? 's' : ''}` : null);
  const cast = (currentData.credits?.cast || []).slice(0, 6);

  const handlePlayNow = () => {
    playCinematicIntroSound();
    onClose();
    navigate(`/watch/${mediaType}/${itemId}`);
  };

  const handleToggleList = () => {
    const status = toggleMyListStatus(currentData, mediaType);
    setInList(status);
  };

  const handleGoToDetails = () => {
    onClose();
    navigate(`/details/${mediaType}/${itemId}`);
  };

  return (
    <div className="quick-view-overlay" onClick={onClose}>
      <div className="quick-view-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Dismiss Button */}
        <button className="quick-view-close-btn" onClick={onClose} aria-label="Close preview">
          <X size={20} />
        </button>

        {/* Video / Backdrop Stage */}
        <div className="quick-view-media-wrap">
          <img 
            src={currentData.backdrop_path ? `${TMDB_ORIGINAL_IMG}${currentData.backdrop_path}` : `${TMDB_POSTER_IMG}${currentData.poster_path}`} 
            alt={title}
            className={`quick-view-backdrop ${isPlayingTrailer ? 'trailer-active' : ''}`}
          />

          {isPlayingTrailer && trailerKey && (
            <div className="quick-view-iframe-box">
              <iframe
                ref={iframeRef}
                src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&showinfo=0&rel=0&loop=1&playlist=${trailerKey}&modestbranding=1&iv_load_policy=3&disablekb=1&enablejsapi=1`}
                title={title}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                className="quick-view-iframe"
              />
            </div>
          )}

          <div className="quick-view-vignette-bottom" />
          <div className="quick-view-vignette-left" />

          {/* Sound Mute/Unmute */}
          {trailerKey && isPlayingTrailer && (
            <button 
              className="quick-view-sound-btn"
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          )}

          {/* Floating Title and Fast Actions inside Stage */}
          <div className="quick-view-stage-content">
            <span className="quick-view-brand-tag">
              {mediaType === 'tv' ? <Tv size={12} /> : <Film size={12} />}
              {mediaType === 'tv' ? 'TELEVISION SERIES' : 'FEATURE FILM'}
            </span>
            <h2 className="quick-view-title">{title}</h2>

            <div className="quick-view-primary-buttons">
              <button className="qv-action-btn play" onClick={handlePlayNow}>
                <Play size={18} fill="black" />
                <span>Play</span>
              </button>

              <button className={`qv-action-btn icon ${inList ? 'active' : ''}`} onClick={handleToggleList} title="My List">
                {inList ? <Check size={18} /> : <Plus size={18} />}
              </button>

              <button className="qv-action-btn details-link" onClick={handleGoToDetails}>
                <span>More Details</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Info Body */}
        <div className="quick-view-body">
          <div className="quick-view-columns">
            {/* Left Column: Synopsis & Genres */}
            <div className="qv-left-col">
              <div className="qv-metrics-row">
                <span className="qv-age-badge">16+</span>
                {year && <span className="qv-meta-year">{year}</span>}
                {runtime && <span className="qv-meta-runtime">{runtime}</span>}
                <span className="qv-badge-4k">Ultra HD 4K</span>
                <span className="qv-rating-val">
                  <Star size={12} fill="#e50914" color="#e50914" /> {rating}
                </span>
              </div>

              {currentData.tagline && (
                <p className="qv-tagline">"{currentData.tagline}"</p>
              )}

              <p className="qv-overview-text">
                {currentData.overview || 'Available to stream in Ultra HD 4K on AAYUSH.'}
              </p>

              {/* Clickable Genre Badges */}
              {currentData.genres?.length > 0 && (
                <div className="qv-genres-row">
                  {currentData.genres.map(g => (
                    <Link 
                      key={g.id} 
                      to={`/genre/${g.id}?name=${encodeURIComponent(g.name)}&type=${mediaType}`}
                      onClick={onClose}
                      className="qv-genre-pill"
                    >
                      {g.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Cast Previews */}
            {cast.length > 0 && (
              <div className="qv-right-col">
                <span className="qv-cast-heading">
                  <User size={14} /> Cast
                </span>
                <div className="qv-cast-list">
                  {cast.map(actor => (
                    <div 
                      key={actor.id} 
                      className="qv-cast-item"
                      onClick={() => {
                        onClose();
                        navigate(`/actor/${actor.id}`);
                      }}
                      title={`View ${actor.name}`}
                    >
                      <img 
                        src={actor.profile_path ? `${TMDB_PROFILE_IMG}${actor.profile_path}` : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} 
                        alt={actor.name} 
                        className="qv-cast-avatar"
                        loading="lazy"
                      />
                      <div className="qv-cast-info">
                        <span className="qv-actor-name">{actor.name}</span>
                        {actor.character && (
                          <span className="qv-character-name">{actor.character}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
