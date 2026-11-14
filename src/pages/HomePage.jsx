import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import HeroBillboard from '../components/HeroBillboard';
import MovieRow from '../components/MovieRow';
import { getMyList } from '../utils/myList';

const TMDB_API_KEY = 'f69f2c8f33e02716fb1c44a6941396f8';
const TMDB_BASE = 'https://api.themoviedb.org/3';

export default function HomePage() {
  const { type: routeType } = useParams();

  // Mode: 'movie', 'tv', 'trending'
  const currentMode = routeType || 'all';
  const defaultType = currentMode === 'tv' ? 'tv' : 'movie';

  const [heroItem, setHeroItem] = useState(null);
  const [continueWatching, setContinueWatching] = useState([]);
  const [myList, setMyList] = useState([]);

  // Fetch Hero Banner item based on current page mode
  useEffect(() => {
    let endpoint = `${TMDB_BASE}/trending/${defaultType}/week?api_key=${TMDB_API_KEY}`;
    if (currentMode === 'movie') endpoint = `${TMDB_BASE}/movie/popular?api_key=${TMDB_API_KEY}`;
    if (currentMode === 'tv') endpoint = `${TMDB_BASE}/tv/popular?api_key=${TMDB_API_KEY}`;

    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        const results = (data.results || []).filter(item => item.backdrop_path && item.overview);
        if (results.length > 0) {
          const selected = results[Math.floor(Math.random() * Math.min(6, results.length))];
          setHeroItem(selected);
        }
      })
      .catch(err => console.error('Error fetching hero:', err));
  }, [currentMode, defaultType]);

  // Load Continue Watching & My List
  useEffect(() => {
    try {
      const savedHistory = JSON.parse(
        localStorage.getItem('aayush_watch_history') || 
        localStorage.getItem('cinestream_history') || 
        '[]'
      );
      setContinueWatching(savedHistory);
      setMyList(getMyList());
    } catch (e) {
      console.error(e);
    }

    const handleListChange = () => setMyList(getMyList());
    window.addEventListener('aayush_mylist_changed', handleListChange);
    return () => window.removeEventListener('aayush_mylist_changed', handleListChange);
  }, []);

  return (
    <div className="netflix-home-page">
      {/* Auto-playing Trailer Hero Billboard */}
      {heroItem && (
        <HeroBillboard item={heroItem} type={defaultType} />
      )}

      {/* Quick Category Chips Strip */}
      <div className="genres-strip-container">
        <div className="genres-strip">
          <Link to="/timelines" className="genre-nav-pill highlight-timeline">
            <Sparkles size={14} /> Franchise Timelines
          </Link>
          <Link to="/genre/28?name=Action&type=movie" className="genre-nav-pill">Action</Link>
          <Link to="/genre/35?name=Comedy&type=movie" className="genre-nav-pill">Comedy</Link>
          <Link to="/genre/878?name=Sci-Fi&type=movie" className="genre-nav-pill">Sci-Fi</Link>
          <Link to="/genre/18?name=Drama&type=movie" className="genre-nav-pill">Drama</Link>
          <Link to="/genre/27?name=Horror&type=movie" className="genre-nav-pill">Horror</Link>
          <Link to="/genre/16?name=Animation&type=movie" className="genre-nav-pill">Animation</Link>
          <Link to="/genre/53?name=Thriller&type=movie" className="genre-nav-pill">Thriller</Link>
          <Link to="/genre/9648?name=Mystery&type=movie" className="genre-nav-pill">Mystery</Link>
        </div>
      </div>

      {/* Rows Container */}
      <div className="netflix-rows-section">
        {/* Continue Watching Row */}
        {continueWatching.length > 0 && (
          <MovieRow 
            title="Continue Watching"
            items={continueWatching.map(c => ({
              ...c,
              media_type: c.type || 'movie'
            }))}
            isLandscape={false}
          />
        )}

        {/* My List Row */}
        {myList.length > 0 && (
          <MovieRow 
            title="My List"
            items={myList}
            isLandscape={false}
            seeMoreLink="/browse/mylist"
          />
        )}

        {/* Top 10 Row */}
        <MovieRow 
          title={`Top 10 ${currentMode === 'tv' ? 'TV Shows' : 'Movies'} Today`}
          fetchUrl={`${TMDB_BASE}/trending/${defaultType}/day?api_key=${TMDB_API_KEY}`}
          type={defaultType}
          isTop10={true}
        />

        {/* Trending Now */}
        <MovieRow 
          title="Trending Now"
          fetchUrl={`${TMDB_BASE}/trending/${defaultType}/week?api_key=${TMDB_API_KEY}`}
          type={defaultType}
        />

        {/* Popular on AAYUSH */}
        <MovieRow 
          title="Popular on AAYUSH"
          fetchUrl={`${TMDB_BASE}/${defaultType}/popular?api_key=${TMDB_API_KEY}`}
          type={defaultType}
        />

        {/* Blockbuster Action Thrillers */}
        <MovieRow 
          title="Blockbuster Action Thrillers"
          fetchUrl={`${TMDB_BASE}/discover/${defaultType}?api_key=${TMDB_API_KEY}&with_genres=28&sort_by=popularity.desc`}
          type={defaultType}
          seeMoreLink="/genre/28?name=Action&type=movie"
        />

        {/* Top Rated Masterpieces */}
        <MovieRow 
          title="Critically Acclaimed Masterpieces"
          fetchUrl={`${TMDB_BASE}/${defaultType}/top_rated?api_key=${TMDB_API_KEY}`}
          type={defaultType}
        />

        {/* Sci-Fi & Cyberpunk Hits */}
        <MovieRow 
          title="Sci-Fi & Mind-Bending Realities"
          fetchUrl={`${TMDB_BASE}/discover/${defaultType}?api_key=${TMDB_API_KEY}&with_genres=878&sort_by=popularity.desc`}
          type={defaultType}
          seeMoreLink="/genre/878?name=Sci-Fi&type=movie"
        />

        {/* Comedies & Feel-Good */}
        <MovieRow 
          title="Laugh-Out-Loud Comedies"
          fetchUrl={`${TMDB_BASE}/discover/${defaultType}?api_key=${TMDB_API_KEY}&with_genres=35&sort_by=popularity.desc`}
          type={defaultType}
          seeMoreLink="/genre/35?name=Comedy&type=movie"
        />

        {/* Psychological Horror & Suspense */}
        <MovieRow 
          title="Chilling Horror & Suspense"
          fetchUrl={`${TMDB_BASE}/discover/${defaultType}?api_key=${TMDB_API_KEY}&with_genres=27&sort_by=popularity.desc`}
          type={defaultType}
          seeMoreLink="/genre/27?name=Horror&type=movie"
        />
      </div>
    </div>
  );
}
