// Centralized My List (Watchlist) Manager
// Synchronizes state across all components and windows

const STORAGE_KEY = 'aayush_mylist';
const LEGACY_KEY = 'cinestream_mylist';

// High-quality starter items so new users immediately see how My List works
const STARTER_ITEMS = [
  {
    id: 299534,
    title: 'Avengers: Endgame',
    poster_path: '/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    backdrop_path: '/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
    vote_average: 8.3,
    release_date: '2019-04-24',
    type: 'movie',
    added_at: Date.now() - 3600000
  },
  {
    id: 155,
    title: 'The Dark Knight',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: '/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    vote_average: 8.5,
    release_date: '2008-07-16',
    type: 'movie',
    added_at: Date.now() - 7200000
  },
  {
    id: 66732,
    title: 'Stranger Things',
    poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdrop_path: '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    vote_average: 8.6,
    release_date: '2016-07-15',
    type: 'tv',
    added_at: Date.now() - 10800000
  }
];

export function getMyList() {
  try {
    const data = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
    if (!data) {
      // Initialize with starter items
      localStorage.setItem(STORAGE_KEY, JSON.stringify(STARTER_ITEMS));
      return STARTER_ITEMS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load My List:', err);
    return [];
  }
}

export function isInMyList(id) {
  if (!id) return false;
  const list = getMyList();
  return list.some(item => Number(item.id) === Number(id));
}

export function addToMyList(item, type = 'movie') {
  if (!item || !item.id) return false;
  try {
    let list = getMyList();
    if (list.some(existing => Number(existing.id) === Number(item.id))) {
      return true;
    }
    
    const newItem = {
      id: item.id,
      title: item.title || item.name || 'Untitled',
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      vote_average: item.vote_average || 7.5,
      release_date: item.release_date || item.first_air_date || '',
      type: item.media_type || type || 'movie',
      added_at: Date.now()
    };

    list.unshift(newItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    localStorage.setItem(LEGACY_KEY, JSON.stringify(list));
    
    // Broadcast update to all components
    window.dispatchEvent(new CustomEvent('aayush_mylist_changed', { detail: { action: 'add', item: newItem } }));
    return true;
  } catch (err) {
    console.error('Failed to add to My List:', err);
    return false;
  }
}

export function removeFromMyList(id) {
  if (!id) return false;
  try {
    let list = getMyList();
    list = list.filter(item => Number(item.id) !== Number(id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    localStorage.setItem(LEGACY_KEY, JSON.stringify(list));
    
    // Broadcast update to all components
    window.dispatchEvent(new CustomEvent('aayush_mylist_changed', { detail: { action: 'remove', id } }));
    return true;
  } catch (err) {
    console.error('Failed to remove from My List:', err);
    return false;
  }
}

export function toggleMyListStatus(item, type = 'movie') {
  if (!item || !item.id) return false;
  if (isInMyList(item.id)) {
    removeFromMyList(item.id);
    return false;
  } else {
    addToMyList(item, type);
    return true;
  }
}

