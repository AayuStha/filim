import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Play, Star, ArrowLeft, Send, Tv, UserCircle } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'f69f2c8f33e02716fb1c44a6941396f8';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w1280';
const TMDB_POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

function StarRating({ count }) {
  return (
    <span className="review-stars">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={13}
          fill={i < count ? '#f59e0b' : 'transparent'}
          color="#f59e0b"
        />
      ))}
    </span>
  );
}

export default function DetailsPage() {
  const { type = 'movie', id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read season from URL params (for back-button preservation)
  const seasonFromUrl = searchParams.get('season') || '';

  const [details, setDetails] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('1');
  const [seasonOptions, setSeasonOptions] = useState([]);
  const [reviews, setReviews] = useState([]);
  
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewText, setReviewText] = useState('');

  const ratingOptions = [
    { label: '5 Stars — Exceptional', value: '5' },
    { label: '4 Stars — Great', value: '4' },
    { label: '3 Stars — Good', value: '3' },
    { label: '2 Stars — Fair', value: '2' },
    { label: '1 Star — Poor', value: '1' }
  ];

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch(`${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos,external_ids,credits`);
        const data = await res.json();
        setDetails(data);

        // Setup seasons for TV
        if (type === 'tv' && data.seasons) {
          const validSeasons = data.seasons.filter(s => s.season_number > 0);
          const sOpts = validSeasons.map(s => ({
            label: s.name || `Season ${s.season_number}`,
            value: String(s.season_number)
          }));
          setSeasonOptions(sOpts);

          // Use season from URL if provided, otherwise default to first season
          if (seasonFromUrl && sOpts.some(s => s.value === seasonFromUrl)) {
            setSelectedSeason(seasonFromUrl);
          } else if (sOpts.length > 0) {
            setSelectedSeason(sOpts[0].value);
          }
        }
      } catch (err) {
        console.error('Error fetching details:', err);
      }
    }

    if (id) fetchDetails();
  }, [type, id, seasonFromUrl]);

  // Fetch episodes when selectedSeason changes
  useEffect(() => {
    if (type !== 'tv' || !id || !selectedSeason) return;

    async function fetchEpisodes() {
      try {
        const res = await fetch(`${TMDB_BASE_URL}/tv/${id}/season/${selectedSeason}?api_key=${TMDB_API_KEY}`);
        const data = await res.json();
        setEpisodes(data.episodes || []);
      } catch (err) {
        console.error('Error fetching episodes:', err);
      }
    }
    fetchEpisodes();
  }, [type, id, selectedSeason]);

  // Load reviews
  useEffect(() => {
    if (id) {
      const saved = JSON.parse(localStorage.getItem(`cinestream_reviews_${id}`)) || [];
      setReviews(saved);
    }
  }, [id]);

  const handleAddReview = (e) => {
    e.preventDefault();
    if (reviewName.trim() && reviewText.trim()) {
      const newReview = {
        author: reviewName.trim(),
        rating: reviewRating,
        text: reviewText.trim(),
        timestamp: Date.now()
      };
      const updated = [newReview, ...reviews];
      setReviews(updated);
      localStorage.setItem(`cinestream_reviews_${id}`, JSON.stringify(updated));
      setReviewName('');
      setReviewText('');
    }
  };

  if (!details) return <div className="loading-container"><div className="loader" /></div>;

  const title = details.title || details.name;
  const releaseDate = details.release_date || details.first_air_date;
  const year = releaseDate ? releaseDate.split('-')[0] : 'N/A';
  const duration = type === 'tv' 
    ? (details.number_of_seasons ? `${details.number_of_seasons} Season${details.number_of_seasons > 1 ? 's' : ''}` : 'TV Series') 
    : (details.runtime ? `${details.runtime} min` : 'Movie');
  const rating = details.vote_average ? details.vote_average.toFixed(1) : 'N/A';

  return (
    <div className="details-page">
      {/* Backdrop */}
      <div 
        className="details-backdrop"
        style={{ backgroundImage: details.backdrop_path ? `url('${TMDB_IMAGE_BASE_URL}${details.backdrop_path}')` : 'none' }}
      >
        <div className="backdrop-overlay" />
      </div>

      <div className="container details-content-wrapper">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={15} /> Back
        </button>

        {/* Details Header Card */}
        <div className="details-header-card">
          <img 
            src={details.poster_path ? `${TMDB_POSTER_BASE_URL}${details.poster_path}` : 'https://via.placeholder.com/240x360'} 
            alt={title} 
            className="details-poster" 
          />

          <div className="details-info-col">
            <h1 className="details-title">{title}</h1>
            {details.tagline && <p className="details-tagline">"{details.tagline}"</p>}

            <div className="details-meta-row">
              <span className="meta-badge">{year}</span>
              <span className="meta-badge">{duration}</span>
              <span className="meta-badge rating">
                <Star size={12} fill="#f59e0b" color="#f59e0b" />
                {rating}
              </span>
              <span className="meta-badge">{type === 'tv' ? 'TV Series' : 'Movie'}</span>
            </div>

            <div className="genres-row">
              {(details.genres || []).map(g => (
                <span key={g.id} className="genre-pill">{g.name}</span>
              ))}
            </div>

            <p className="details-overview">{details.overview || 'No overview available.'}</p>

            <div className="details-actions-row">
              <button 
                className="btn-play-action primary"
                onClick={() => navigate(`/watch/${type}/${id}${type === 'tv' ? `?s=${selectedSeason}&e=1` : ''}`)}
              >
                <Play fill="white" size={17} /> Watch Now
              </button>
            </div>
          </div>
        </div>

        {/* TV Show Seasons & Episodes — Clean List Layout */}
        {type === 'tv' && seasonOptions.length > 0 && (
          <section className="tv-episodes-section">
            <div className="section-header">
              <h2><Tv size={18} /> Episodes</h2>
              <div className="season-select-wrapper">
                <CustomSelect 
                  options={seasonOptions}
                  value={selectedSeason}
                  onChange={setSelectedSeason}
                  placeholder="Select Season"
                />
              </div>
            </div>

            <div className="episodes-list">
              {episodes.map(ep => (
                <div 
                  key={ep.id} 
                  className="episode-row"
                  onClick={() => navigate(`/watch/tv/${id}?s=${selectedSeason}&e=${ep.episode_number}`)}
                >
                  <div className="episode-number">{ep.episode_number}</div>
                  <img 
                    src={ep.still_path ? `${TMDB_POSTER_BASE_URL}${ep.still_path}` : 'https://via.placeholder.com/100x56?text=N/A'} 
                    alt={ep.name} 
                    className="episode-row-thumb" 
                  />
                  <div className="episode-row-info">
                    <div className="episode-row-title">{ep.name || `Episode ${ep.episode_number}`}</div>
                    <div className="episode-row-meta">
                      {ep.air_date || ''}{ep.runtime ? ` · ${ep.runtime} min` : ''}
                    </div>
                    {ep.overview && (
                      <div className="episode-row-overview">{ep.overview}</div>
                    )}
                  </div>
                  <div className="episode-row-play">
                    <Play fill="white" size={14} style={{ marginLeft: 1 }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cast Grid */}
        {details.credits && details.credits.cast && details.credits.cast.length > 0 && (
          <section className="cast-section">
            <div className="section-header">
              <h2><UserCircle size={18} /> Cast</h2>
            </div>
            <div className="cast-grid">
              {details.credits.cast.slice(0, 12).map(actor => (
                <div 
                  key={actor.id} 
                  className="cast-card"
                  onClick={() => navigate(`/?query=${encodeURIComponent(actor.name)}`)}
                >
                  <img 
                    src={actor.profile_path ? `${TMDB_POSTER_BASE_URL}${actor.profile_path}` : 'https://via.placeholder.com/72x72?text=N/A'} 
                    alt={actor.name} 
                    className="cast-avatar" 
                  />
                  <div className="cast-name">{actor.name}</div>
                  <div className="cast-character">{actor.character || ''}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Local Reviews Section */}
        <section className="reviews-section">
          <div className="section-header">
            <h2><Star size={18} /> Reviews</h2>
          </div>

          <form className="review-form" onSubmit={handleAddReview}>
            <h3>Write a Review</h3>
            <div className="form-group">
              <label>Your Name</label>
              <input 
                type="text" 
                placeholder="Enter your name..."
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label>Rating</label>
              <CustomSelect 
                options={ratingOptions}
                value={reviewRating}
                onChange={setReviewRating}
              />
            </div>
            <div className="form-group">
              <label>Comments</label>
              <textarea 
                rows="3" 
                placeholder="Share your thoughts..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className="btn-primary">
              <Send size={14} /> Post Review
            </button>
          </form>

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to post one!</p>
            ) : (
              reviews.map((rev, idx) => (
                <div key={idx} className="review-item">
                  <div className="review-header">
                    <span className="review-author">{rev.author}</span>
                    <StarRating count={parseInt(rev.rating)} />
                  </div>
                  <div className="review-date">{new Date(rev.timestamp).toLocaleDateString()}</div>
                  <p className="review-body">{rev.text}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
