import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, Plus, Check, Volume2, VolumeX, Flame } from 'lucide-react';
import { isInMyList, toggleMyListStatus } from '../utils/myList';
import { playCinematicIntroSound } from '../utils/soundEffects';

const TMDB_API_KEY = 'f69f2c8f33e02716fb1c44a6941396f8';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_ORIGINAL_IMG = 'https://image.tmdb.org/t/p/original';

export default function HeroBillboard({ item, type = 'movie', onOpenQuickView }) {
  const navigate = useNavigate();
  const [trailerKey, setTrailerKey] = useState(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [inList, setInList] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!item?.id) return;

    setInList(isInMyList(item.id));
    setTrailerKey(null);
    setIsPlayingVideo(false);
    setIsVideoReady(false);
    setIsMuted(true);

    // Fetch trailer from TMDB
    const mediaType = item.name ? 'tv' : (item.media_type || type);
    fetch(`${TMDB_BASE}/${mediaType}/${item.id}/videos?api_key=${TMDB_API_KEY}`)
      .then(res => res.json())
      .then(data => {
        const videos = data.results || [];
        // Look for official trailer first, then teaser, then clip
        const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube')
          || videos.find(v => v.type === 'Teaser' && v.site === 'YouTube')
          || videos.find(v => v.type === 'Clip' && v.site === 'YouTube')
          || videos.find(v => v.site === 'YouTube');

        if (trailer?.key) {
          setTrailerKey(trailer.key);
          // Auto-start video trailer silently behind poster, fade in only after buffering finishes
          const startTimer = setTimeout(() => {
            setIsPlayingVideo(true);
          }, 1000);

          // Grace period: Wait until YouTube starts rendering video frames to hide player controls
          const readyTimer = setTimeout(() => {
            setIsVideoReady(true);
          }, 2400);

          return () => {
            clearTimeout(startTimer);
            clearTimeout(readyTimer);
          };
        }
      })
      .catch(() => {});
  }, [item, type]);

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
  const matchScore = Math.min(99, Math.round((item.vote_average || 7.8) * 10) + 12);

  const handleToggleList = () => {
    const newStatus = toggleMyListStatus(item, mediaType);
    setInList(newStatus);
  };

  const handlePlayClick = () => {
    playCinematicIntroSound();
    navigate(`/watch/${mediaType}/${item.id}`);
  };

  // Toggle audio seamlessly via postMessage without reloading iframe (which causes YouTube to show controls)
  const handleToggleMute = (e) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: nextMuted ? 'mute' : 'unMute',
            args: []
          }),
          '*'
        );
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <section className="netflix-billboard">
      {/* Background Media Container (Backdrop Image & YouTube Autoplay Trailer) */}
      <div className="billboard-backdrop-container">
        {/* High-Res Static Backdrop Poster (stays visible until video is buffered to prevent controls flash) */}
        <img 
          src={item.backdrop_path ? `${TMDB_ORIGINAL_IMG}${item.backdrop_path}` : (item.poster_path ? `${TMDB_ORIGINAL_IMG}${item.poster_path}` : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><rect width="1920" height="1080" fill="%230b0b12"/></svg>')} 
          alt={title} 
          className={`billboard-backdrop-img ${isVideoReady ? 'video-active' : ''}`}
        />

        {/* Netflix Auto-playing Video Trailer (Guarded against any play/pause/seek controls) */}
        {isPlayingVideo && trailerKey && (
          <div className={`billboard-video-wrapper ${isVideoReady ? 'ready' : 'buffering'}`}>
            <iframe
              ref={iframeRef}
              src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${trailerKey}&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&autohide=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : ''}`}
              title={title}
              frameBorder="0"
              tabIndex="-1"
              aria-hidden="true"
              allow="autoplay; encrypted-media"
              className="billboard-iframe"
            />
          </div>
        )}

        {/* Transparent Touch/Click Guard that completely blocks hover/click events from reaching YouTube iframe */}
        <div className="billboard-touch-guard" aria-hidden="true" />

        {/* Ambient Vignettes & Dark Gradient Overlays */}
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
          <span className="billboard-match">{matchScore}% Match</span>
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

          {/* Sound Mute / Unmute Button for Trailer */}
          {trailerKey && isPlayingVideo && (
            <button 
              className="billboard-sound-btn" 
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute Trailer Audio' : 'Mute Trailer Audio'}
              aria-label="Toggle Mute"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
