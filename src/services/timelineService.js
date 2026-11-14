// Centralized Dynamic Cinematic Timelines & Franchise Service
// 100% Automatic: Fetches live from TMDB API with ZERO hardcoded movie arrays or mock data

const TMDB_API_KEY = 'f69f2c8f33e02716fb1c44a6941396f8';
const TMDB_BASE = 'https://api.themoviedb.org/3';

// Cache to prevent duplicate network calls across views
const timelineCache = new Map();

// Curated franchise gateways (only IDs/queries, NO hardcoded movie lists)
export const CINEMATIC_UNIVERSES_CONFIG = [
  {
    id: 'mcu',
    name: 'Marvel Cinematic Universe',
    franchise: 'Marvel Studios',
    tagline: 'The Infinity Saga, Multiverse, and beyond.',
    accentColor: '#e50914',
    themeColor: '#e50914',
    queryType: 'discover',
    companyId: 420, // Marvel Studios official company ID
    collectionId: 86311
  },
  {
    id: 'star-wars',
    name: 'Star Wars Saga',
    franchise: 'Lucasfilm',
    tagline: 'A long time ago in a galaxy far, far away...',
    accentColor: '#38bdf8',
    themeColor: '#0284c7',
    queryType: 'collection',
    collectionId: 10 // Star Wars Collection
  },
  {
    id: 'dune',
    name: 'Dune Saga',
    franchise: 'Legendary',
    tagline: 'Fear is the mind-killer.',
    accentColor: '#f59e0b',
    themeColor: '#d97706',
    queryType: 'collection',
    collectionId: 726871 // Dune Collection
  },
  {
    id: 'harry-potter',
    name: 'The Wizarding World',
    franchise: 'Wizarding World',
    tagline: 'The magic lives on.',
    accentColor: '#fbbf24',
    themeColor: '#b45309',
    queryType: 'collection',
    collectionId: 1241 // Harry Potter Collection
  },
  {
    id: 'middle-earth',
    name: 'Middle-earth Saga',
    franchise: 'Tolkien Universe',
    tagline: 'One Ring to rule them all.',
    accentColor: '#34d399',
    themeColor: '#059669',
    queryType: 'collection',
    collectionId: 119 // Lord of the Rings Collection
  },
  {
    id: 'batman',
    name: 'The Dark Knight Trilogy',
    franchise: 'DC Comics',
    tagline: 'It is not who I am underneath, but what I do that defines me.',
    accentColor: '#60a5fa',
    themeColor: '#2563eb',
    queryType: 'collection',
    collectionId: 263 // The Dark Knight Collection
  },
  {
    id: 'spider-man',
    name: 'Spider-Man Saga',
    franchise: 'Marvel / Sony',
    tagline: 'With great power comes great responsibility.',
    accentColor: '#ef4444',
    themeColor: '#dc2626',
    queryType: 'collection',
    collectionId: 556 // Spider-Man Collection
  },
  {
    id: 'fast-furious',
    name: 'Fast & Furious Saga',
    franchise: 'Universal Pictures',
    tagline: 'It is about family.',
    accentColor: '#06b6d4',
    themeColor: '#0891b2',
    queryType: 'collection',
    collectionId: 9485 // Fast and Furious Collection
  },
  {
    id: 'john-wick',
    name: 'John Wick Chapters',
    franchise: 'Lionsgate',
    tagline: 'Baba Yaga.',
    accentColor: '#c084fc',
    themeColor: '#7e22ce',
    queryType: 'collection',
    collectionId: 404609 // John Wick Collection
  },
  {
    id: 'mission-impossible',
    name: 'Mission: Impossible',
    franchise: 'Paramount',
    tagline: 'Your mission, should you choose to accept it.',
    accentColor: '#f43f5e',
    themeColor: '#e11d48',
    queryType: 'collection',
    collectionId: 87359 // Mission Impossible Collection
  },
  {
    id: 'avatar',
    name: 'Avatar Saga',
    franchise: '20th Century Studios',
    tagline: 'Return to Pandora.',
    accentColor: '#38bdf8',
    themeColor: '#0284c7',
    queryType: 'collection',
    collectionId: 87096 // Avatar Collection
  },
  {
    id: 'alien',
    name: 'Alien Anthology',
    franchise: '20th Century Studios',
    tagline: 'In space no one can hear you scream.',
    accentColor: '#2dd4bf',
    themeColor: '#0f766e',
    queryType: 'collection',
    collectionId: 8091 // Alien Collection
  }
];

/**
 * Live search for ANY franchise collection across TMDB
 */
export async function searchFranchiseCollections(query) {
  if (!query || !query.trim()) return [];
  try {
    const res = await fetch(`${TMDB_BASE}/search/collection?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query.trim())}`);
    const data = await res.json();
    return (data.results || []).filter(c => c.name);
  } catch (err) {
    console.error('Error searching collections:', err);
    return [];
  }
}

/**
 * Fetch complete franchise timeline automatically from TMDB
 * Automatically sorts by release date and structures real movie metadata
 */
export async function getUniverseTimeline(universeIdOrCollectionId) {
  const cacheKey = `universe_${universeIdOrCollectionId}`;
  if (timelineCache.has(cacheKey)) {
    return timelineCache.get(cacheKey);
  }

  try {
    const config = CINEMATIC_UNIVERSES_CONFIG.find(u => u.id === universeIdOrCollectionId);
    let collectionId = config ? config.collectionId : Number(universeIdOrCollectionId);
    let collectionData = null;
    let rawItems = [];

    if (config && config.queryType === 'discover' && config.companyId) {
      // Dynamic fetch from TMDB discover API for Marvel Studios
      const res = await fetch(`${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&with_companies=${config.companyId}&sort_by=primary_release_date.asc&vote_count.gte=100`);
      const data = await res.json();
      rawItems = (data.results || []).filter(m => m.poster_path && m.release_date);
      collectionData = {
        name: config.name,
        overview: config.tagline,
        backdrop_path: rawItems[rawItems.length - 1]?.backdrop_path || rawItems[0]?.backdrop_path,
        poster_path: rawItems[0]?.poster_path
      };
    } else if (collectionId) {
      // Fetch collection dynamically from TMDB
      const res = await fetch(`${TMDB_BASE}/collection/${collectionId}?api_key=${TMDB_API_KEY}`);
      collectionData = await res.json();
      rawItems = (collectionData.parts || []).filter(m => m.release_date);
    }

    if (!rawItems || rawItems.length === 0) return null;

    // Automatically sort chronologically by release_date
    rawItems.sort((a, b) => (a.release_date || '').localeCompare(b.release_date || ''));

    const items = rawItems.map((item, idx) => {
      const year = item.release_date ? item.release_date.split('-')[0] : '';
      return {
        id: item.id,
        title: item.title || item.name || 'Untitled',
        type: 'movie',
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        release_date: item.release_date,
        year: year,
        storyYear: year,
        vote_average: item.vote_average ? Number(item.vote_average.toFixed(1)) : null,
        vote_count: item.vote_count,
        overview: item.overview || 'Available to stream on AAYUSH in 4K Ultra HD.',
        order: idx + 1
      };
    });

    const earliestYear = items[0]?.year || '';
    const latestYear = items[items.length - 1]?.year || '';
    const yearSpan = earliestYear && latestYear ? (earliestYear === latestYear ? earliestYear : `${earliestYear}–${latestYear}`) : '';

    const payload = {
      id: universeIdOrCollectionId,
      name: collectionData?.name || config?.name || 'Cinematic Saga',
      franchise: config?.franchise || collectionData?.name?.split(' Collection')[0] || 'Franchise',
      tagline: config?.tagline || `Complete ${items.length}-film chronological saga (${yearSpan}).`,
      description: collectionData?.overview || config?.tagline || `Follow the complete franchise story across ${items.length} cinematic chapters.`,
      coverBackdrop: collectionData?.backdrop_path 
        ? `https://image.tmdb.org/t/p/original${collectionData.backdrop_path}` 
        : (items[items.length - 1]?.backdrop_path ? `https://image.tmdb.org/t/p/original${items[items.length - 1].backdrop_path}` : ''),
      themeColor: config?.themeColor || '#e50914',
      accentColor: config?.accentColor || '#38bdf8',
      yearSpan,
      totalMovies: items.length,
      totalTv: 0,
      items
    };

    timelineCache.set(cacheKey, payload);
    return payload;
  } catch (err) {
    console.error('Error fetching universe timeline:', err);
    return null;
  }
}

/**
 * 100% AUTOMATIC: Check if ANY movie in TMDB belongs to a franchise collection
 * Used on DetailsPage and WatchPage with ZERO hardcoding!
 */
export async function findFranchiseForMedia(mediaId, mediaType = 'movie') {
  if (!mediaId) return null;
  const cacheKey = `franchise_${mediaType}_${mediaId}`;
  if (timelineCache.has(cacheKey)) {
    return timelineCache.get(cacheKey);
  }

  try {
    const res = await fetch(`${TMDB_BASE}/${mediaType}/${mediaId}?api_key=${TMDB_API_KEY}`);
    const details = await res.json();

    // Check if TMDB says it belongs to a collection
    if (details.belongs_to_collection && details.belongs_to_collection.id) {
      const colRes = await fetch(`${TMDB_BASE}/collection/${details.belongs_to_collection.id}?api_key=${TMDB_API_KEY}`);
      const collection = await colRes.json();
      const rawParts = (collection.parts || []).filter(p => p.release_date);
      rawParts.sort((a, b) => (a.release_date || '').localeCompare(b.release_date || ''));

      const allItems = rawParts.map((part, idx) => ({
        id: part.id,
        title: part.title,
        type: 'movie',
        year: part.release_date ? part.release_date.split('-')[0] : '',
        release_date: part.release_date,
        storyYear: part.release_date ? part.release_date.split('-')[0] : '',
        poster_path: part.poster_path,
        backdrop_path: part.backdrop_path,
        vote_average: part.vote_average ? Number(part.vote_average.toFixed(1)) : null,
        overview: part.overview,
        order: idx + 1
      }));

      const currentIndex = allItems.findIndex(item => item.id === Number(mediaId));

      const result = {
        universe: {
          id: details.belongs_to_collection.id,
          name: details.belongs_to_collection.name,
          backdrop_path: details.belongs_to_collection.backdrop_path,
          poster_path: details.belongs_to_collection.poster_path
        },
        currentIndex: currentIndex !== -1 ? currentIndex : 0,
        currentItem: currentIndex !== -1 ? allItems[currentIndex] : allItems[0],
        previousItem: currentIndex > 0 ? allItems[currentIndex - 1] : null,
        nextItem: currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null,
        allItems
      };

      timelineCache.set(cacheKey, result);
      return result;
    }

    return null;
  } catch (err) {
    console.error('Error in findFranchiseForMedia:', err);
    return null;
  }
}
