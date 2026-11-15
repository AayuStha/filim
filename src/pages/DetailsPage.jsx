import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Plus, Check, Star, ArrowLeft, Tv, Film, Eye, User, Sparkles, ChevronLeft, ChevronRight, ChevronDown, Clock, Calendar, X } from 'lucide-react';
import MovieRow from '../components/MovieRow';
import { findFranchiseForMedia } from '../services/timelineService';
import { isInMyList, toggleMyListStatus } from '../utils/myList';
import { playCinematicIntroSound } from '../utils/soundEffects';

const TMDB_API_KEY = 'f69f2c8f33e02716fb1c44a6941396f8';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_ORIGINAL_IMG = 'https://image.tmdb.org/t/p/original';
const TMDB_POSTER_IMG = 'https://image.tmdb.org/t/p/w500';
const TMDB_PROFILE_IMG = 'https://image.tmdb.org/t/p/w300';
const TMDB_STILL_IMG = 'https://image.tmdb.org/t/p/w400';

// Dynamic Movie-Adaptive Color Theming by Genre
function getAdaptiveTheme(genres = []) {
  if (!genres || genres.length === 0) {
    return { accent: '#e50914', glow: 'rgba(229, 9, 20, 0.4)', name: 'Crimson' };
  }
  const ids = genres.map(g => g.id);
  if (ids.includes(878)) return { accent: '#00f0ff', glow: 'rgba(0, 240, 255, 0.38)', name: 'Cyberpunk Cyan' };
  if (ids.includes(14) || ids.includes(9648)) return { accent: '#a855f7', glow: 'rgba(168, 85, 247, 0.38)', name: 'Mystic Violet' };
  if (ids.includes(16)) return { accent: '#f59e0b', glow: 'rgba(245, 158, 11, 0.38)', name: 'Solar Gold' };
  if (ids.includes(35)) return { accent: '#10b981', glow: 'rgba(16, 185, 129, 0.38)', name: 'Emerald' };
  if (ids.includes(10749)) return { accent: '#ec4899', glow: 'rgba(236, 72, 153, 0.38)', name: 'Neon Rose' };
  if (ids.includes(27) || ids.includes(53)) return { accent: '#ef4444', glow: 'rgba(239, 68, 68, 0.42)', name: 'Blood Crimson' };
  if (ids.includes(28)) return { accent: '#e50914', glow: 'rgba(229, 9, 20, 0.4)', name: 'Action Ember' };
  return { accent: '#38bdf8', glow: 'rgba(56, 189, 248, 0.36)', name: 'Deep Azure' };
}

export default function DetailsPage() {
  const { type = 'movie', id } = useParams();
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [isEpisodesLoading, setIsEpisodesLoading] = useState(false);
  const [isInList, setIsInList] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Franchise & Cinematic Timeline State
  const [universeTimeline, setUniverseTimeline] = useState(null);

  // Scroll refs for horizontal carousels
  const castScrollRef = useRef(null);
  const timelineScrollRef = useRef(null);

  const scrollCarousel = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -520 : 520;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Fetch movie/TV details
  useEffect(() => {
    setIsLoading(true);
    setUniverseTimeline(null);

    fetch(`${TMDB_BASE}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,similar,recommendations`)
      .then(res => res.json())
      .then(data => {
        setDetails(data);
        setIsLoading(false);
        setIsInList(isInMyList(data.id));

        // Find official YouTube trailer
        if (data.videos?.results) {
          const trailer = data.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube') 
            || data.videos.results.find(v => v.site === 'YouTube');
          if (trailer) setTrailerKey(trailer.key);
        }

        // Set default season for TV
        if (type === 'tv' && data.seasons?.length > 0) {
          const valid = data.seasons.find(s => s.season_number > 0);
          if (valid) setSelectedSeason(valid.season_number);
        }

        // Check Cinematic Universe Timeline (both Movies and TV Series supported dynamically)
        findFranchiseForMedia(data.id, type).then(timeline => {
          if (timeline) {
            setUniverseTimeline(timeline);
          }
        }).catch(() => {});
      })
      .catch(err => {
        console.error('Error fetching details:', err);
        setIsLoading(false);
      });
  }, [type, id]);

  // Sync My List state
  useEffect(() => {
    const handleListChange = () => {
      if (details?.id) setIsInList(isInMyList(details.id));
    };
    window.addEventListener('aayush_mylist_changed', handleListChange);
    return () => window.removeEventListener('aayush_mylist_changed', handleListChange);
  }, [details?.id]);

  // Fetch episodes for TV series when season changes
  useEffect(() => {
    if (type !== 'tv' || !id || !selectedSeason) return;

    setIsEpisodesLoading(true);
    fetch(`${TMDB_BASE}/tv/${id}/season/${selectedSeason}?api_key=${TMDB_API_KEY}`)
      .then(res => res.json())
      .then(data => {
        setEpisodes(data.episodes || []);
        setIsEpisodesLoading(false);
      })
      .catch(err => {
        console.error('Error fetching episodes:', err);
        setIsEpisodesLoading(false);
      });
  }, [type, id, selectedSeason]);

  const handleToggleMyList = () => {
    if (!details) return;
    const newStatus = toggleMyListStatus(details, type);
    setIsInList(newStatus);
  };

  if (isLoading) {
    return (
      <div className="netflix-details-loading">
        <div className="netflix-spinner" />
      </div>
    );
  }

  if (!details || details.success === false) {
    return (
      <div className="details-error-container">
        <h2>Content not found</h2>
        <button className="netflix-action-btn play" onClick={() => navigate('/')}>
          Return to Home
        </button>
      </div>
    );
  }

  const title = details.title || details.name || '';
  const releaseDate = details.release_date || details.first_air_date || '';
  const year = releaseDate ? releaseDate.split('-')[0] : '';
  const rating = details.vote_average ? details.vote_average.toFixed(1) : null;
  const runtime = type === 'movie' 
    ? (details.runtime ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m` : null)
    : (details.number_of_seasons ? `${details.number_of_seasons} Season${details.number_of_seasons > 1 ? 's' : ''}` : null);

  const cast = (details.credits?.cast || []).slice(0, 24);
  const directors = (details.credits?.crew || []).filter(c => c.job === 'Director');
  const similarItems = details.similar?.results || [];
  const theme = getAdaptiveTheme(details.genres);

  const handleWatchNow = () => {
    playCinematicIntroSound();
    navigate(`/watch/${type}/${id}${type === 'tv' ? `?s=${selectedSeason}&e=1` : ''}`);
  };

  return (
    <div 
      className="netflix-details-page"
      style={{
        '--theme-accent': theme.accent,
        '--theme-glow': theme.glow
      }}
    >
      {/* Immersive Backdrop Section with Movie-Adaptive Glow */}
      <div className="details-hero-backdrop">
        {details.backdrop_path ? (
          <img 
            src={`${TMDB_ORIGINAL_IMG}${details.backdrop_path}`} 
            alt={title} 
            className="details-backdrop-img"
          />
        ) : (
          <div className="details-backdrop-fallback" />
        )}
        {/* Dynamic Genre Palette Halo */}
        <div 
          className="details-adaptive-halo" 
          style={{ background: `radial-gradient(circle at 45% 25%, ${theme.glow} 0%, transparent 68%)` }} 
        />
        <div className="details-vignette-overlay" />
        <div className="details-gradient-bottom" />
      </div>

      <div className="details-body-container">
        {/* Back navigation button */}
        <button className="details-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        {/* Main Title & Action Row */}
        <div className="details-header-layout">
          {/* Poster Card */}
          <div className="details-poster-wrap">
            {details.poster_path ? (
              <img 
                src={`${TMDB_POSTER_IMG}${details.poster_path}`} 
                alt={title} 
                className="details-poster-img"
              />
            ) : (
              <div className="details-poster-fallback">
                <Film size={48} />
                <span>{title}</span>
              </div>
            )}
          </div>

          {/* Info Column */}
          <div className="details-info-column">
            <div className="details-brand-pill">
              <Film size={13} />
              <span>{type === 'tv' ? 'TELEVISION SERIES' : 'FEATURE FILM'}</span>
            </div>

            <h1 className="details-main-title">{title}</h1>
            {details.tagline && <p className="details-tagline">"{details.tagline}"</p>}

            {/* Metadata Badges */}
            <div className="details-metrics-row">
              <span className="badge-age">16+</span>
              {year && <span className="meta-text">{year}</span>}
              {runtime && <span className="meta-text">{runtime}</span>}
              <span className="badge-hd">Ultra HD 4K</span>
              {rating && (
                <span className="meta-rating">
                  <Star size={14} fill="#e50914" color="#e50914" />
                  {rating} / 10
                </span>
              )}
            </div>

            {/* Clickable Genre Pills */}
            <div className="details-genres-list">
              {(details.genres || []).map(g => (
                <Link 
                  key={g.id} 
                  to={`/genre/${g.id}?name=${encodeURIComponent(g.name)}&type=${type}`}
                  className="genre-clickable-pill"
                >
                  {g.name}
                </Link>
              ))}
            </div>

            {/* Main Action Buttons */}
            <div className="details-primary-actions">
              <button 
                className="netflix-action-btn play"
                onClick={handleWatchNow}
              >
                <Play size={20} fill="black" color="black" />
                <span>Watch Now</span>
              </button>

              <button 
                className={`netflix-action-btn list ${isInList ? 'active' : ''}`}
                onClick={handleToggleMyList}
              >
                {isInList ? <Check size={18} /> : <Plus size={18} />}
                <span>{isInList ? 'In My List' : 'Add to My List'}</span>
              </button>

              {trailerKey && (
                <button 
                  type="button"
                  onClick={() => setShowTrailerModal(true)}
                  className="netflix-action-btn trailer"
                >
                  <Eye size={18} />
                  <span>Trailer</span>
                </button>
              )}
            </div>

            {/* Overview / Storyline */}
            <div className="details-story-block">
              <h3>Storyline</h3>
              <p className="details-story-text">
                {details.overview || 'No synopsis available for this title.'}
              </p>
            </div>

            {/* Directors / Creators */}
            {type === 'tv' && details.created_by?.length > 0 ? (
              <div className="details-crew-row">
                <span className="crew-label">Created by:</span>
                <span className="crew-value">
                  {details.created_by.map(c => c.name).join(', ')}
                </span>
              </div>
            ) : directors.length > 0 ? (
              <div className="details-crew-row">
                <span className="crew-label">Directed by:</span>
                <span className="crew-value">
                  {directors.map(d => d.name).join(', ')}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* ========================================================
            CINEMATIC TIMELINE & "WHAT TO WATCH AFTER" FEATURE
           ======================================================== */}
        {/* Case 1: Curated Cinematic Universe (Marvel MCU, Star Wars, DC, etc.) */}
        {universeTimeline && (
          <section className="timeline-section-card">
            <div className="section-header-with-arrows">
              <div className="timeline-header-box">
                <div className="timeline-badge-tag">
                  <Sparkles size={14} />
                  <span>{universeTimeline.universe.name.toUpperCase()} TIMELINE</span>
                </div>
                <h2 className="timeline-main-heading">
                  Chronological Watch Order & Saga Bridge
                </h2>
                <p className="timeline-subheading">
                  Chapter <strong>{universeTimeline.currentIndex + 1}</strong> of <strong>{universeTimeline.allItems.length}</strong> in the {universeTimeline.universe.name}.
                </p>
              </div>

              <div className="carousel-nav-arrows">
                <button 
                  className="arrow-circle-btn" 
                  onClick={() => scrollCarousel(timelineScrollRef, 'left')}
                  aria-label="Previous timeline movies"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  className="arrow-circle-btn" 
                  onClick={() => scrollCarousel(timelineScrollRef, 'right')}
                  aria-label="Next timeline movies"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* What to Watch Next Banner */}
            {universeTimeline.nextItem && (
              <div className="next-up-banner">
                <div className="next-up-text">
                  <span className="next-up-small-tag">WHAT TO WATCH NEXT</span>
                  <h4 className="next-up-title">
                    {universeTimeline.nextItem.title} ({universeTimeline.nextItem.year})
                    <span className="next-up-type-pill">{universeTimeline.nextItem.type === 'tv' ? 'TV SERIES' : 'MOVIE'}</span>
                  </h4>
                  <p className="next-up-note">
                    {universeTimeline.nextItem.overview 
                      ? (universeTimeline.nextItem.overview.length > 130 ? universeTimeline.nextItem.overview.slice(0, 130) + '...' : universeTimeline.nextItem.overview) 
                      : 'Stream the next chapter in the canonical saga.'}
                  </p>
                </div>
                <button 
                  className="next-up-play-btn"
                  onClick={() => navigate(`/watch/${universeTimeline.nextItem.type}/${universeTimeline.nextItem.id}`)}
                >
                  <Play size={18} fill="black" />
                  <span>Watch Next</span>
                </button>
              </div>
            )}

            {/* Interactive Timeline Track with Real Posters */}
            <div className="timeline-scroll-track" ref={timelineScrollRef}>
              {universeTimeline.allItems.map((entry, idx) => {
                const isCurrent = entry.id === Number(id);
                const isNext = universeTimeline.nextItem?.id === entry.id;

                return (
                  <div 
                    key={entry.id}
                    className={`timeline-film-node visual-node ${isCurrent ? 'current' : ''} ${isNext ? 'next' : ''}`}
                    onClick={() => navigate(`/details/${entry.type}/${entry.id}`)}
                  >
                    <div className="timeline-step-marker">
                      {isCurrent ? 'NOW PLAYING' : (isNext ? 'NEXT IN SAGA' : `#${idx + 1}`)}
                    </div>
                    <div className="timeline-node-card-visual">
                      <div className="node-poster-thumb-wrap">
                        {entry.poster_path ? (
                          <img 
                            src={`${TMDB_PROFILE_IMG}${entry.poster_path}`} 
                            alt={entry.title} 
                            className="node-poster-thumb"
                            loading="lazy"
                          />
                        ) : (
                          <div className="node-poster-placeholder">
                            <Film size={28} />
                            <span>{entry.title}</span>
                          </div>
                        )}
                        <div className="node-hover-play">
                          <Play size={18} fill="white" />
                        </div>
                        <span className="node-type-pill">{entry.type === 'tv' ? 'TV' : 'MOVIE'}</span>
                      </div>
                      <div className="node-info-content">
                        <div className="node-top-tags">
                          <span className="node-film-year">{entry.storyYear || entry.year}</span>
                          {entry.vote_average && (
                            <span className="node-rating"><Star size={11} fill="#eab308" color="#eab308" /> {entry.vote_average}</span>
                          )}
                        </div>
                        <h5 className="node-film-title">{entry.title}</h5>
                        {entry.overview && (
                          <span className="node-film-note">
                            {entry.overview.length > 80 ? entry.overview.slice(0, 80) + '...' : entry.overview}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TV Series Seasons & Episodes Section */}
        {type === 'tv' && details.seasons && (
          <section className="tv-episodes-browser">
            <div className="episodes-header-row">
              <div className="episodes-heading-left">
                <h2 className="section-heading">
                  <Tv size={22} className="heading-icon" /> Episodes
                </h2>
                {episodes.length > 0 && !isEpisodesLoading && (
                  <span className="episodes-total-count">
                    {episodes.length} Episode{episodes.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Season Selector */}
              {details.seasons.length > 0 && (
                <div className="season-selector-wrapper">
                  <div className="custom-season-select-box">
                    <select 
                      value={selectedSeason} 
                      onChange={(e) => setSelectedSeason(Number(e.target.value))}
                      className="season-dropdown-select"
                      aria-label="Select season"
                    >
                      {details.seasons
                        .filter(s => s.season_number > 0 || details.seasons.length === 1)
                        .map(s => (
                          <option key={s.id} value={s.season_number}>
                            {s.name || `Season ${s.season_number}`} ({s.episode_count || 0} Episodes)
                          </option>
                        ))}
                    </select>
                    <ChevronDown size={15} className="season-select-chevron" />
                  </div>
                </div>
              )}
            </div>

            {/* Skeletons while loading */}
            {isEpisodesLoading ? (
              <div className="episodes-cards-list">
                {[1, 2, 3, 4].map(idx => (
                  <div key={idx} className="episode-item-skeleton">
                    <div className="skeleton-num" />
                    <div className="skeleton-thumb" />
                    <div className="skeleton-info">
                      <div className="skeleton-line title" />
                      <div className="skeleton-line sub" />
                      <div className="skeleton-line text" />
                    </div>
                  </div>
                ))}
              </div>
            ) : episodes.length > 0 ? (
              <div className="episodes-cards-list">
                {episodes.map(ep => (
                  <div 
                    key={ep.id} 
                    className="episode-item-card"
                    onClick={() => navigate(`/watch/tv/${id}?s=${selectedSeason}&e=${ep.episode_number}`)}
                  >
                    {/* Bold clean episode index number on the left */}
                    <div className="episode-index-number">
                      {ep.episode_number}
                    </div>

                    {/* 16:9 Thumbnail container */}
                    <div className="episode-thumbnail-wrap">
                      <img 
                        src={ep.still_path ? `${TMDB_STILL_IMG}${ep.still_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80'} 
                        alt={ep.name || `Episode ${ep.episode_number}`} 
                        className="episode-thumbnail"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div className="episode-play-overlay">
                        <div className="episode-play-btn-circle">
                          <Play size={18} fill="white" color="white" />
                        </div>
                      </div>
                      {ep.runtime ? (
                        <span className="episode-thumb-duration">{ep.runtime}m</span>
                      ) : null}
                    </div>

                    {/* Episode details: title, rating, duration, date, overview */}
                    <div className="episode-details-info">
                      <div className="episode-title-row">
                        <h4 className="episode-name">
                          <span className="episode-inline-num">E{ep.episode_number}.</span> {ep.name || `Episode ${ep.episode_number}`}
                        </h4>
                        <div className="episode-meta-badges">
                          {ep.vote_average > 0 && (
                            <span className="episode-rating-pill">
                              <Star size={11} fill="#eab308" color="#eab308" /> {ep.vote_average.toFixed(1)}
                            </span>
                          )}
                          {ep.runtime ? (
                            <span className="episode-duration-pill">
                              <Clock size={12} /> {ep.runtime}m
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {ep.air_date && (
                        <div className="episode-air-date-row">
                          <Calendar size={12} />
                          <span>{ep.air_date}</span>
                        </div>
                      )}

                      <p className="episode-synopsis">
                        {ep.overview || 'Stream this episode in full HD on AAYUSH.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="episodes-empty-state">
                <Tv size={36} className="empty-icon" />
                <p>No episodes available for this season yet.</p>
              </div>
            )}
          </section>
        )}

        {/* Cast & Real Character Names (Clickable to ActorPage) */}
        {cast.length > 0 && (
          <section className="cast-members-section">
            <div className="section-header-with-arrows">
              <div>
                <h2 className="section-heading">
                  <User size={22} className="heading-icon" /> Cast & Characters
                </h2>
                <p className="section-subheading">Click any actor or character to explore their complete filmography.</p>
              </div>
              <div className="carousel-nav-arrows">
                <button 
                  className="arrow-circle-btn" 
                  onClick={() => scrollCarousel(castScrollRef, 'left')}
                  aria-label="Scroll cast left"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  className="arrow-circle-btn" 
                  onClick={() => scrollCarousel(castScrollRef, 'right')}
                  aria-label="Scroll cast right"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="cast-scroll-track" ref={castScrollRef}>
              {cast.map(actor => (
                <div 
                  key={actor.id} 
                  className="cast-profile-card"
                  onClick={() => navigate(`/actor/${actor.id}`)}
                  title={`View all movies with ${actor.name}`}
                >
                  <div className="cast-avatar-wrap">
                    {actor.profile_path ? (
                      <img 
                        src={`${TMDB_PROFILE_IMG}${actor.profile_path}`} 
                        alt={actor.name} 
                        className="cast-avatar-img"
                        loading="lazy"
                      />
                    ) : (
                      <div className="cast-avatar-placeholder">
                        <span className="cast-avatar-initials">
                          {(actor.name || '').split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('')}
                        </span>
                      </div>
                    )}
                    <div className="cast-avatar-hover-overlay">
                      <span>View Actor →</span>
                    </div>
                  </div>
                  <div className="cast-names-box">
                    <div className="cast-real-name">{actor.name}</div>
                    <div className="cast-character-name">
                      {actor.character ? (
                        <>
                          <span className="character-as-label">as</span> {actor.character}
                        </>
                      ) : (
                        'Cast Member'
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* More Like This (Similar Movies) */}
        {similarItems.length > 0 && (
          <div className="details-similar-section">
            <MovieRow 
              title="More Like This"
              items={similarItems}
              type={type}
            />
          </div>
        )}
      </div>

      {/* In-App YouTube Trailer Modal */}
      {showTrailerModal && trailerKey && (
        <div className="trailer-modal-overlay" onClick={() => setShowTrailerModal(false)}>
          <div className="trailer-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="trailer-modal-header">
              <h4>{title} — Official Trailer</h4>
              <button 
                className="trailer-modal-close" 
                onClick={() => setShowTrailerModal(false)}
                aria-label="Close trailer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="trailer-video-stage">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
                title={`${title} Trailer`}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                className="trailer-iframe"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
