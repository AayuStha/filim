import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bookmark, Film, Tv, Play, Trash2, ArrowLeft, Plus } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { getMyList, removeFromMyList } from '../utils/myList';

export default function MyListPage() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [filterType, setFilterType] = useState('all');

  const reloadList = () => {
    setList(getMyList());
  };

  useEffect(() => {
    reloadList();

    const handleUpdate = () => reloadList();
    window.addEventListener('aayush_mylist_changed', handleUpdate);
    return () => window.removeEventListener('aayush_mylist_changed', handleUpdate);
  }, []);

  const handleRemove = (e, id) => {
    e.stopPropagation();
    removeFromMyList(id);
  };

  const moviesCount = list.filter(item => item.type === 'movie').length;
  const tvCount = list.filter(item => item.type === 'tv').length;

  const filteredItems = list.filter(item => {
    if (filterType === 'movie') return item.type === 'movie';
    if (filterType === 'tv') return item.type === 'tv';
    return true;
  });

  return (
    <div className="netflix-browse-page my-list-page">
      <div className="browse-container">
        {/* Header */}
        <div className="browse-header-row">
          <button className="browse-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <div className="browse-title-group">
            <h1 className="browse-page-title">My List</h1>
            <p className="browse-page-subtitle">
              {list.length > 0 
                ? `You have ${list.length} saved ${list.length === 1 ? 'title' : 'titles'} in your personal watchlist.`
                : 'Your personal watchlist is currently empty.'}
            </p>
          </div>

          {/* Filter Pills */}
          {list.length > 0 && (
            <div className="browse-controls-row">
              <div className="type-toggle-pills">
                <button 
                  className={`type-pill ${filterType === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterType('all')}
                >
                  All ({list.length})
                </button>
                <button 
                  className={`type-pill ${filterType === 'movie' ? 'active' : ''}`}
                  onClick={() => setFilterType('movie')}
                >
                  <Film size={14} /> Movies ({moviesCount})
                </button>
                <button 
                  className={`type-pill ${filterType === 'tv' ? 'active' : ''}`}
                  onClick={() => setFilterType('tv')}
                >
                  <Tv size={14} /> TV Shows ({tvCount})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Media Grid */}
        {filteredItems.length > 0 ? (
          <div className="browse-media-grid">
            {filteredItems.map(item => (
              <div key={item.id} className="my-list-card-container">
                <MovieCard item={item} type={item.type || 'movie'} />
                <button 
                  className="quick-remove-btn"
                  onClick={(e) => handleRemove(e, item.id)}
                  title="Remove from My List"
                  aria-label="Remove from My List"
                >
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="my-list-empty-state">
            <Bookmark size={54} className="empty-bookmark-icon" />
            <h2>Your watchlist is waiting</h2>
            <p>
              Explore movies and TV shows across AAYUSH and click the <strong>+ Add to My List</strong> button to save titles you want to watch later.
            </p>
            <div className="empty-actions">
              <button className="netflix-action-btn play" onClick={() => navigate('/browse/movie')}>
                Explore Movies
              </button>
              <button className="netflix-action-btn list" onClick={() => navigate('/browse/tv')}>
                Explore TV Shows
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

