import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Award, Film, Tv, ChevronDown, ChevronUp } from 'lucide-react';
import MovieCard from '../components/MovieCard';

const TMDB_API_KEY = 'f69f2c8f33e02716fb1c44a6941396f8';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_PROFILE_IMG = 'https://image.tmdb.org/t/p/h632';

export default function ActorPage() {
  const { actorId } = useParams();
  const navigate = useNavigate();

  const [actor, setActor] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${TMDB_BASE}/person/${actorId}?api_key=${TMDB_API_KEY}&append_to_response=combined_credits,external_ids`)
      .then(res => res.json())
      .then(data => {
        setActor(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching actor:', err);
        setIsLoading(false);
      });
  }, [actorId]);

  if (isLoading) {
    return (
      <div className="netflix-details-loading">
        <div className="netflix-spinner" />
      </div>
    );
  }

  if (!actor || actor.success === false) {
    return (
      <div className="details-error-container">
        <h2>Actor details not found</h2>
        <button className="netflix-btn primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  // Deduplicate and sort credits by popularity
  const rawCredits = actor.combined_credits?.cast || [];
  const creditMap = new Map();

  rawCredits.forEach(c => {
    if (!c.poster_path) return;
    if (!creditMap.has(c.id) || (c.popularity || 0) > (creditMap.get(c.id).popularity || 0)) {
      creditMap.set(c.id, c);
    }
  });

  let creditsList = Array.from(creditMap.values()).sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

  if (filterType === 'movie') {
    creditsList = creditsList.filter(c => c.media_type === 'movie');
  } else if (filterType === 'tv') {
    creditsList = creditsList.filter(c => c.media_type === 'tv');
  }

  const bioText = actor.biography || 'No biography available for this artist.';
  const shouldTruncateBio = bioText.length > 400;

  return (
    <div className="netflix-actor-page">
      <div className="actor-page-container">
        {/* Back Button */}
        <button className="actor-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        {/* Actor Bio Header Card */}
        <div className="actor-bio-card">
          <div className="actor-photo-frame">
            <img 
              src={actor.profile_path ? `${TMDB_PROFILE_IMG}${actor.profile_path}` : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect width="300" height="450" fill="%2314141e"/><circle cx="150" cy="170" r="60" fill="%233f3f46"/><path d="M70,360 C70,270 230,270 230,360 Z" fill="%233f3f46"/></svg>'} 
              alt={actor.name} 
              className="actor-headshot"
            />
          </div>

          <div className="actor-info-box">
            <div className="actor-pill-badge">
              <Award size={13} />
              <span>STAR ARTIST & FILMOGRAPHY</span>
            </div>

            <h1 className="actor-full-name">{actor.name}</h1>

            <div className="actor-vitals-row">
              {actor.birthday && (
                <span className="vital-item">
                  <Calendar size={14} className="vital-icon" />
                  Born: {actor.birthday}
                </span>
              )}
              {actor.place_of_birth && (
                <span className="vital-item">
                  <MapPin size={14} className="vital-icon" />
                  {actor.place_of_birth}
                </span>
              )}
              {actor.known_for_department && (
                <span className="vital-item">
                  <Award size={14} className="vital-icon" />
                  {actor.known_for_department}
                </span>
              )}
            </div>

            {/* Biography */}
            <div className="actor-biography-block">
              <p className="actor-bio-paragraph">
                {shouldTruncateBio && !isBioExpanded 
                  ? `${bioText.substring(0, 400)}...` 
                  : bioText}
              </p>
              {shouldTruncateBio && (
                <button 
                  className="actor-bio-toggle-btn"
                  onClick={() => setIsBioExpanded(!isBioExpanded)}
                >
                  {isBioExpanded ? (
                    <>Show Less <ChevronUp size={14} /></>
                  ) : (
                    <>Read Full Biography <ChevronDown size={14} /></>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filmography Section */}
        <div className="actor-filmography-section">
          <div className="filmography-header">
            <div>
              <h2 className="filmography-title">
                Starring Roles & Movies ({creditsList.length})
              </h2>
              <p className="filmography-subtitle">
                Titles featuring {actor.name} available to watch on AAYUSH.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="filmography-filter-pills">
              <button 
                className={`filmo-pill ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                All
              </button>
              <button 
                className={`filmo-pill ${filterType === 'movie' ? 'active' : ''}`}
                onClick={() => setFilterType('movie')}
              >
                <Film size={13} /> Movies
              </button>
              <button 
                className={`filmo-pill ${filterType === 'tv' ? 'active' : ''}`}
                onClick={() => setFilterType('tv')}
              >
                <Tv size={13} /> TV Series
              </button>
            </div>
          </div>

          {/* Credits Media Grid */}
          <div className="browse-media-grid">
            {creditsList.map(item => (
              <div key={`${item.id}-${item.media_type}`} className="actor-credit-card-wrapper">
                <MovieCard 
                  item={item} 
                  type={item.media_type || 'movie'} 
                />
                {item.character && (
                  <div className="actor-credit-character-tag" title={item.character}>
                    as {item.character}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

