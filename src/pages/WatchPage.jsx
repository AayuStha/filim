import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Server, ChevronLeft, ChevronRight, RotateCcw, 
  List, Sparkles, Check, Play, Tv, X, ChevronDown 
} from 'lucide-react';
import { findFranchiseForMedia } from '../services/timelineService';

const TMDB_API_KEY = 'f69f2c8f33e02716fb1c44a6941396f8';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_STILL_IMG = 'https://image.tmdb.org/t/p/w300';

// High-speed, 4K & 1080p verified video streaming servers
const VIDEO_SERVERS = [
  {
    id: 'vidlink',
    name: 'Server 1 (VidLink 4K)',
    badge: '4K Ultra',
    quality: '4K UHD',
    getUrl: (type, id, s, e) => 
      type === 'tv' 
        ? `https://vidlink.pro/tv/${id}/${s}/${e}?primaryColor=e50914&autoplay=false`
        : `https://vidlink.pro/movie/${id}?primaryColor=e50914&autoplay=false`
  },
  {
    id: 'videasy',
    name: 'Server 2 (Videasy 4K)',
    badge: '4K Fast',
    quality: '4K UHD',
    getUrl: (type, id, s, e) => 
      type === 'tv'
        ? `https://player.videasy.net/tv/${id}/${s}/${e}`
        : `https://player.videasy.net/movie/${id}`
  },
  {
    id: 'vidsrc-cc',
    name: 'Server 3 (VidSrc CC)',
    badge: '1080p HD',
    quality: '1080p Multi-Sub',
    getUrl: (type, id, s, e) => 
      type === 'tv'
        ? `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`
        : `https://vidsrc.cc/v2/embed/movie/${id}`
  },
  {
    id: 'embed-su',
    name: 'Server 4 (Embed.su)',
    badge: '4K Multi',
    quality: '4K Multi-Source',
    getUrl: (type, id, s, e) => 
      type === 'tv'
        ? `https://embed.su/embed/tv/${id}/${s}/${e}`
        : `https://embed.su/embed/movie/${id}`
  },
  {
    id: 'autoembed',
    name: 'Server 5 (AutoEmbed)',
    badge: 'Smooth',
    quality: '1080p Smooth',
    getUrl: (type, id, s, e) => 
      type === 'tv'
        ? `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`
        : `https://player.autoembed.cc/embed/movie/${id}`
  },
  {
    id: 'multiembed',
    name: 'Server 6 (MultiEmbed)',
    badge: 'Multi-Audio',
    quality: 'Multi-Language',
    getUrl: (type, id, s, e) => 
      `https://multiembed.mov/?video_id=${id}&tmdb=1${type === 'tv' ? `&s=${s}&e=${e}` : ''}`
  },
  {
    id: 'vidsrc-vip',
    name: 'Server 7 (VidSrc VIP)',
    badge: 'VIP Fast',
    quality: 'HD VIP',
    getUrl: (type, id, s, e) => 
      `https://vidsrc.vip/embed/${type}/${id}${type === 'tv' ? `/${s}/${e}` : ''}`
  },
  {
    id: 'vidsrc-icu',
    name: 'Server 8 (VidSrc ICU)',
    badge: 'Backup HD',
    quality: 'HD Stream',
    getUrl: (type, id, s, e) => 
      type === 'tv'
        ? `https://vidsrc.icu/embed/tv?tmdb=${id}&s=${s}&e=${e}`
        : `https://vidsrc.icu/embed/movie?tmdb=${id}`
  },
  {
    id: 'vsembed',
    name: 'Server 9 (VSEmbed)',
    badge: 'Direct',
    quality: 'Ultra Direct',
    getUrl: (type, id, s, e) => 
      `https://vsembed.ru/embed/${type}/${id}${type === 'tv' ? `/${s}/${e}` : ''}`
  },
  {
    id: 'smashystream',
    name: 'Server 10 (SmashyStream)',
    badge: 'Alt HD',
    quality: 'Alt Player',
    getUrl: (type, id, s, e) => 
      `https://embed.smashystream.com/playere.php?tmdb=${id}${type === 'tv' ? `&s=${s}&e=${e}` : ''}`
  },
  {
    id: '2embed',
    name: 'Server 11 (2Embed)',
    badge: 'Global',
    quality: 'Global Mirror',
    getUrl: (type, id, s, e) => 
      type === 'tv'
        ? `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`
        : `https://www.2embed.cc/embed/${id}`
  }
];

export default function WatchPage() {
  const { type = 'movie', id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const season = searchParams.get('s') || '1';
  const episode = searchParams.get('e') || '1';

  const [currentServerIndex, setCurrentServerIndex] = useState(0);
  const [mediaDetails, setMediaDetails] = useState(null);
  const [seasonEpisodes, setSeasonEpisodes] = useState([]);
  const [isEpisodeDrawerOpen, setIsEpisodeDrawerOpen] = useState(false);
  const [isServerMenuOpen, setIsServerMenuOpen] = useState(false);
  const [iframeKey, setIframeKey] = useState(Date.now());
  const [timelineData, setTimelineData] = useState(null);

  // Episode Browser State
  const [activeDrawerSeason, setActiveDrawerSeason] = useState(Number(season));
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const activeEpisodeCardRef = useRef(null);

  // Sync drawer season with URL season
  useEffect(() => {
    setActiveDrawerSeason(Number(season));
  }, [season]);

  // Fetch title and details
  useEffect(() => {
    fetch(`${TMDB_BASE}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`)
      .then(res => res.json())
      .then(data => {
        setMediaDetails(data);
        saveWatchHistory(data);

        // Check if part of cinematic timeline dynamically
        findFranchiseForMedia(data.id, type).then(franchise => {
          if (franchise) setTimelineData(franchise);
        }).catch(() => {});
      })
      .catch(err => console.error('Error fetching media details:', err));
  }, [type, id, season, episode]);

  // Fetch episodes for active drawer season
  useEffect(() => {
    if (type !== 'tv' || !id || !activeDrawerSeason) return;

    setIsLoadingEpisodes(true);
    fetch(`${TMDB_BASE}/tv/${id}/season/${activeDrawerSeason}?api_key=${TMDB_API_KEY}`)
      .then(res => res.json())
      .then(data => {
        setSeasonEpisodes(data.episodes || []);
        setIsLoadingEpisodes(false);
      })
      .catch(err => {
        console.error('Error fetching season episodes:', err);
        setIsLoadingEpisodes(false);
      });
  }, [type, id, activeDrawerSeason]);

  // Auto-scroll to currently playing episode when drawer opens
  useEffect(() => {
    if (isEpisodeDrawerOpen && activeDrawerSeason === Number(season) && activeEpisodeCardRef.current) {
      const timer = setTimeout(() => {
        activeEpisodeCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 160);
      return () => clearTimeout(timer);
    }
  }, [isEpisodeDrawerOpen, activeDrawerSeason, season, episode]);

  // Escape key listener to close drawer & server popover
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsEpisodeDrawerOpen(false);
        setIsServerMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save progress to local storage
  const saveWatchHistory = (data) => {
    if (!data || !data.id) return;
    try {
      let history = JSON.parse(localStorage.getItem('aayush_watch_history') || localStorage.getItem('cinestream_history') || '[]');
      history = history.filter(item => !(item.id === data.id && item.type === type));

      history.unshift({
        id: data.id,
        type,
        title: data.title || data.name || 'Untitled',
        poster_path: data.poster_path,
        backdrop_path: data.backdrop_path,
        season: type === 'tv' ? season : null,
        episode: type === 'tv' ? episode : null,
        vote_average: data.vote_average,
        timestamp: Date.now()
      });

      if (history.length > 25) history = history.slice(0, 25);
      localStorage.setItem('aayush_watch_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  };

  const currentServer = VIDEO_SERVERS[currentServerIndex] || VIDEO_SERVERS[0];
  const embedUrl = currentServer.getUrl(type, id, season, episode);

  const title = mediaDetails ? (mediaDetails.title || mediaDetails.name) : 'Loading...';
  const currentEpNum = parseInt(episode, 10);
  const totalEpsInSeason = seasonEpisodes.length;

  const navigateEpisode = (delta) => {
    const nextEp = currentEpNum + delta;
    if (nextEp >= 1 && (totalEpsInSeason === 0 || nextEp <= totalEpsInSeason)) {
      setSearchParams({ s: season, e: String(nextEp) });
      setIframeKey(Date.now());
    }
  };

  const handleSelectEpisode = (seasonNum, epNum) => {
    setSearchParams({ s: String(seasonNum), e: String(epNum) });
    setIsEpisodeDrawerOpen(false);
    setIframeKey(Date.now());
  };

  const handleServerChange = (index) => {
    setCurrentServerIndex(index);
    setIsServerMenuOpen(false);
    setIframeKey(Date.now());
  };

  const reloadPlayer = () => {
    setIframeKey(Date.now());
  };

  const availableSeasons = (mediaDetails?.seasons || []).filter(s => s.season_number > 0);

  return (
    <div className="aayush-watch-page">
      {/* Sleek Minimalist Watch Top Bar */}
      <header className="aayush-watch-topbar">
        <div className="watch-bar-left">
          <button 
            className="watch-nav-back-btn"
            onClick={() => navigate(-1)}
            title="Go back"
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <Link to="/" className="aayush-brand-logo" aria-label="AAYUSH Home">
            AAYUSH
          </Link>
        </div>

        <div className="watch-bar-center">
          <div className="watch-title-wrapper">
            <span className="watch-film-title">{title}</span>
            {type === 'tv' && (
              <span className="watch-ep-indicator">
                S{season} : E{episode}
              </span>
            )}
          </div>
        </div>

        <div className="watch-bar-right">
          {/* TV Next/Prev & Redesigned Episodes Button */}
          {type === 'tv' && (
            <div className="watch-tv-controls">
              <button 
                className="minimal-icon-btn"
                onClick={() => navigateEpisode(-1)}
                disabled={currentEpNum <= 1}
                title="Previous Episode"
                aria-label="Previous Episode"
              >
                <ChevronLeft size={17} />
              </button>

              <button 
                className={`episodes-pill-btn ${isEpisodeDrawerOpen ? 'active' : ''}`}
                onClick={() => setIsEpisodeDrawerOpen(!isEpisodeDrawerOpen)}
                title="Browse All Episodes"
                aria-label="Browse Episodes"
              >
                <List size={14} />
                <span>Season {season} • Ep {episode}</span>
                <ChevronDown size={13} className={`pill-chevron ${isEpisodeDrawerOpen ? 'rotate' : ''}`} />
              </button>

              <button 
                className="minimal-icon-btn"
                onClick={() => navigateEpisode(1)}
                disabled={totalEpsInSeason > 0 && currentEpNum >= totalEpsInSeason}
                title="Next Episode"
                aria-label="Next Episode"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          )}

          {/* Player Reload */}
          <button 
            className="minimal-icon-btn"
            onClick={reloadPlayer}
            title="Reload Video Player"
            aria-label="Reload Player"
          >
            <RotateCcw size={16} />
          </button>

          {/* Minimal Server Selector Button & Popover */}
          <div className="minimal-server-wrapper">
            <button 
              className="server-badge-toggle"
              onClick={() => setIsServerMenuOpen(!isServerMenuOpen)}
              title="Change Video Server"
              aria-label="Select Video Server"
            >
              <span className="server-dot" />
              <span className="server-name-label">{currentServer.badge}</span>
              <span className="server-quality-pill">{currentServer.quality}</span>
            </button>

            {/* Dropdown Menu */}
            {isServerMenuOpen && (
              <div className="server-popover-menu">
                <div className="server-popover-title">
                  <Server size={14} /> Select 4K Server
                </div>
                <div className="server-list-items">
                  {VIDEO_SERVERS.map((srv, idx) => (
                    <button
                      key={srv.id}
                      className={`server-menu-item ${idx === currentServerIndex ? 'active' : ''}`}
                      onClick={() => handleServerChange(idx)}
                    >
                      <div className="server-item-left">
                        <span className={`status-indicator ${idx === currentServerIndex ? 'active' : ''}`} />
                        <span>{srv.name}</span>
                      </div>
                      <span className="server-item-tag">{srv.badge}</span>
                      {idx === currentServerIndex && <Check size={14} className="check-mark" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Video Viewport & Episode Browser Drawer */}
      <div className="watch-player-stage">
        <iframe 
          key={iframeKey}
          src={embedUrl} 
          title={title}
          frameBorder="0" 
          allowFullScreen 
          referrerPolicy="origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          className="watch-cinema-iframe"
        />

        {/* Ambient Blurred Backdrop when Episode Browser is open */}
        {type === 'tv' && isEpisodeDrawerOpen && (
          <div 
            className="watch-episodes-backdrop"
            onClick={() => setIsEpisodeDrawerOpen(false)}
            aria-label="Close episode selector"
          />
        )}

        {/* Sleek Minimalist Episode Drawer */}
        {type === 'tv' && isEpisodeDrawerOpen && (
          <aside className="watch-episodes-drawer minimalist-drawer">
            {/* Header */}
            <div className="drawer-header-clean">
              <div className="drawer-header-info">
                <h3 className="drawer-clean-title">Episodes</h3>
                <span className="drawer-clean-subtitle">{title} • Season {activeDrawerSeason}</span>
              </div>
              <button 
                className="drawer-close-clean-btn"
                onClick={() => setIsEpisodeDrawerOpen(false)}
                title="Close (Esc)"
                aria-label="Close episode drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Season Switcher (Only if multi-season) */}
            {availableSeasons.length > 1 && (
              <div className="drawer-seasons-bar">
                {availableSeasons.map(s => {
                  const isActive = s.season_number === activeDrawerSeason;
                  return (
                    <button
                      key={s.id}
                      className={`drawer-season-tab ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveDrawerSeason(s.season_number)}
                    >
                      Season {s.season_number}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Loading state */}
            {isLoadingEpisodes ? (
              <div className="drawer-loading-minimal">
                <div className="minimal-spinner" />
              </div>
            ) : (
              <div className="drawer-episodes-scroller">
                {seasonEpisodes.map(ep => {
                  const isCurrentlyPlaying = 
                    activeDrawerSeason === Number(season) && 
                    ep.episode_number === currentEpNum;

                  return (
                    <div 
                      key={ep.id}
                      ref={isCurrentlyPlaying ? activeEpisodeCardRef : null}
                      className={`drawer-episode-item ${isCurrentlyPlaying ? 'active' : ''}`}
                      onClick={() => handleSelectEpisode(activeDrawerSeason, ep.episode_number)}
                    >
                      {/* Compact 16:9 Thumbnail */}
                      <div className="drawer-ep-thumb-box">
                        {ep.still_path ? (
                          <img 
                            src={`${TMDB_STILL_IMG}${ep.still_path}`}
                            alt={ep.name}
                            className="drawer-ep-img"
                            loading="lazy"
                          />
                        ) : (
                          <div className="drawer-ep-placeholder">
                            <Tv size={18} />
                          </div>
                        )}
                        {ep.runtime && (
                          <span className="drawer-ep-time">{ep.runtime}m</span>
                        )}
                        <div className="drawer-ep-hover-play">
                          <Play size={16} fill="white" />
                        </div>
                      </div>

                      {/* Episode Title & Status */}
                      <div className="drawer-ep-content">
                        <div className="drawer-ep-headline">
                          <span className="drawer-ep-number">{ep.episode_number}.</span>
                          <span className="drawer-ep-name">{ep.name || `Episode ${ep.episode_number}`}</span>
                        </div>
                        {isCurrentlyPlaying && (
                          <div className="drawer-ep-now-playing">
                            <span className="now-playing-equalizer">
                              <span className="bar b1" />
                              <span className="bar b2" />
                              <span className="bar b3" />
                            </span>
                            <span>NOW PLAYING</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Next in Timeline / Franchise Recommendation Bar */}
      {timelineData?.nextItem && (
        <aside className="watch-timeline-next-bar">
          <div className="next-bar-content">
            <div className="next-bar-left">
              <span className="next-saga-badge">
                <Sparkles size={13} /> NEXT IN {timelineData.universe.name.toUpperCase()}
              </span>
              <h4 className="next-saga-title">
                {timelineData.nextItem.title} ({timelineData.nextItem.year})
              </h4>
              {timelineData.nextItem.overview && (
                <p className="next-saga-note">
                  {timelineData.nextItem.overview.length > 90 ? timelineData.nextItem.overview.slice(0, 90) + '...' : timelineData.nextItem.overview}
                </p>
              )}
            </div>

            <button 
              className="next-saga-play-btn"
              onClick={() => navigate(`/watch/${timelineData.nextItem.type}/${timelineData.nextItem.id}`)}
            >
              <Play size={16} fill="black" />
              <span>Watch Next Title</span>
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
