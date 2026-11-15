import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, Play, RotateCw, Sparkles, Star, Film, Check, Plus } from 'lucide-react';
import { playRouletteClickSound, playWinnerChimeSound, playCinematicIntroSound } from '../utils/soundEffects';
import { isInMyList, toggleMyListStatus } from '../utils/myList';

const TMDB_API_KEY = 'f69f2c8f33e02716fb1c44a6941396f8';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_BACKDROP = 'https://image.tmdb.org/t/p/w1280';
const TMDB_POSTER = 'https://image.tmdb.org/t/p/w500';

export default function FilmRouletteModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [inList, setInList] = useState(false);

  // Load a curated pool of top-rated blockbusters
  useEffect(() => {
    if (!isOpen) return;

    // Fetch popular & top rated pool
    Promise.all([
      fetch(`${TMDB_BASE}/trending/all/week?api_key=${TMDB_API_KEY}`).then(r => r.json()),
      fetch(`${TMDB_BASE}/movie/top_rated?api_key=${TMDB_API_KEY}`).then(r => r.json()),
      fetch(`${TMDB_BASE}/tv/top_rated?api_key=${TMDB_API_KEY}`).then(r => r.json())
    ]).then(([trending, topMovies, topTv]) => {
      const combined = [
        ...(trending.results || []),
        ...(topMovies.results || []).map(m => ({ ...m, media_type: 'movie' })),
        ...(topTv.results || []).map(t => ({ ...t, media_type: 'tv' }))
      ].filter(item => item.backdrop_path && item.poster_path && item.overview && item.vote_average >= 7.2);

      // Shuffle array
      const shuffled = combined.sort(() => 0.5 - Math.random());
      setCandidates(shuffled);
      startSpin(shuffled);
    }).catch(err => {
      console.error('Roulette fetch error:', err);
    });
  }, [isOpen]);

  // Sync in-list status
  useEffect(() => {
    if (selectedItem?.id) {
      setInList(isInMyList(selectedItem.id));
    }
  }, [selectedItem]);

  const startSpin = (pool = candidates) => {
    if (pool.length === 0) return;
    setIsSpinning(true);
    setSelectedItem(null);

    let step = 0;
    const totalSteps = 24 + Math.floor(Math.random() * 8);
    let speed = 40; // initial speed ms

    const tick = () => {
      step++;
      const nextIdx = Math.floor(Math.random() * pool.length);
      setCurrentIndex(nextIdx);
      playRouletteClickSound();

      if (step < totalSteps) {
        // Decelerate as it nears the target
        if (step > totalSteps - 12) {
          speed += 22;
        } else if (step > totalSteps - 6) {
          speed += 50;
        }
        setTimeout(tick, speed);
      } else {
        // Settled on winner
        setIsSpinning(false);
        const winner = pool[nextIdx];
        setSelectedItem(winner);
        playWinnerChimeSound();
      }
    };

    tick();
  };

  const handleWatchNow = () => {
    if (!selectedItem) return;
    playCinematicIntroSound();
    onClose();
    const mediaType = selectedItem.media_type || (selectedItem.name ? 'tv' : 'movie');
    navigate(`/watch/${mediaType}/${selectedItem.id}`);
  };

  const handleToggleMyList = () => {
    if (!selectedItem) return;
    const mediaType = selectedItem.media_type || (selectedItem.name ? 'tv' : 'movie');
    const status = toggleMyListStatus(selectedItem, mediaType);
    setInList(status);
  };

  if (!isOpen) return null;

  const currentDisplay = selectedItem || candidates[currentIndex] || null;
  const title = currentDisplay?.title || currentDisplay?.name || 'Rolling...';
  const mediaType = currentDisplay?.media_type || (currentDisplay?.name ? 'tv' : 'movie');
  const year = (currentDisplay?.release_date || currentDisplay?.first_air_date || '').split('-')[0];
  const rating = currentDisplay?.vote_average ? currentDisplay.vote_average.toFixed(1) : '8.5';
  const matchScore = Math.min(99, Math.max(88, Math.round((currentDisplay?.vote_average || 8) * 10) + 12));

  return createPortal(
    <div className="roulette-modal-overlay" onClick={onClose}>
      <div className="roulette-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="roulette-close-btn" onClick={onClose} aria-label="Close roulette">
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="roulette-top-tag">
          <Sparkles size={16} className="tag-sparkle-icon" />
          <span>CINEMATIC FILM ROULETTE</span>
        </div>

        {/* Backdrop Visual Container */}
        <div className="roulette-stage">
          {currentDisplay?.backdrop_path && (
            <img 
              src={`${TMDB_BACKDROP}${currentDisplay.backdrop_path}`} 
              alt={title}
              className={`roulette-backdrop-img ${isSpinning ? 'spinning' : 'settled'}`} 
            />
          )}
          <div className="roulette-vignette" />

          {/* Center Poster Card (Flipping reel effect while spinning) */}
          <div className={`roulette-poster-wrapper ${isSpinning ? 'blur-pulse' : 'winner-glow'}`}>
            {currentDisplay?.poster_path ? (
              <img 
                src={`${TMDB_POSTER}${currentDisplay.poster_path}`} 
                alt={title} 
                className="roulette-poster-img"
              />
            ) : (
              <div className="roulette-poster-placeholder">
                <Film size={48} />
              </div>
            )}
            {isSpinning && (
              <div className="roulette-rolling-indicator">
                <RotateCw size={28} className="rolling-spinner" />
                <span>ROLLING...</span>
              </div>
            )}
            {!isSpinning && selectedItem && (
              <div className="winner-badge-pill">
                <span>TODAY'S PICK</span>
              </div>
            )}
          </div>
        </div>

        {/* Content & Details Section */}
        <div className="roulette-content-box">
          <div className="roulette-meta-bar">
            <span className="roulette-match">{matchScore}% Match</span>
            <span className="roulette-badge-type">{mediaType === 'tv' ? 'Series' : 'Movie'}</span>
            {year && <span className="roulette-year">{year}</span>}
            <span className="roulette-badge-uhd">4K UHD</span>
            <span className="roulette-rating">
              <Star size={13} fill="#f5c518" color="#f5c518" /> {rating}
            </span>
          </div>

          <h2 className="roulette-title">{title}</h2>

          <p className="roulette-overview">
            {currentDisplay?.overview 
              ? (currentDisplay.overview.length > 180 ? currentDisplay.overview.slice(0, 180) + '...' : currentDisplay.overview)
              : 'Handpicked award-winning feature film streaming in full 4K on AAYUSH.'}
          </p>

          {/* Action Row */}
          <div className="roulette-actions-row">
            <button 
              className="roulette-btn play-btn"
              onClick={handleWatchNow}
              disabled={isSpinning}
            >
              <Play size={18} fill="black" />
              <span>Watch Now</span>
            </button>

            <button 
              className={`roulette-btn list-btn ${inList ? 'in-list' : ''}`}
              onClick={handleToggleMyList}
              disabled={isSpinning}
            >
              {inList ? <Check size={17} /> : <Plus size={17} />}
              <span>{inList ? 'In My List' : 'Add to List'}</span>
            </button>

            <button 
              className="roulette-btn respin-btn"
              onClick={() => startSpin()}
              disabled={isSpinning}
              title="Spin Again"
            >
              <RotateCw size={17} className={isSpinning ? 'spinning-icon' : ''} />
              <span>{isSpinning ? 'Rolling...' : 'Spin Again'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
