// TMDB API Configuration
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w1280'; // Higher res for modal

// DOM Elements
const movieGrid = document.getElementById('movieGrid');
const movieSearch = document.getElementById('movieSearch');
const searchBtn = document.getElementById('searchBtn');
const sectionTitle = document.getElementById('sectionTitle');
const playerModal = document.getElementById('playerModal');
const videoPlayer = document.getElementById('videoPlayer');
const movieDetails = document.getElementById('movieDetails');
const closeModal = document.querySelector('.close-modal');
const tabs = document.querySelectorAll('.tab');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const searchSuggestions = document.getElementById('searchSuggestions');
const loader = document.getElementById('loader');

// State
let currentPage = 1;
let currentType = 'movie'; // 'movie' or 'tv'
let currentCategory = 'trending'; // 'trending', 'en', 'hi', 'ne'
let currentQuery = '';
let isLoading = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchContent();
    setupEventListeners();
});

function setupEventListeners() {
    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        sunIcon.style.display = isLight ? 'none' : 'block';
        moonIcon.style.display = isLight ? 'block' : 'none';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });

    // Load saved theme
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-theme');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }

    // Search Events
    searchBtn.addEventListener('click', handleSearch);
    movieSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    movieSearch.addEventListener('input', debounce(() => {
        handleAutocomplete();
    }, 300));

    // Close suggestions on click outside
    document.addEventListener('click', (e) => {
        if (!movieSearch.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.classList.remove('active');
        }
    });

    // Main Tab Switching (Movie/TV)
    document.querySelectorAll('.main-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('active')) return;
            document.querySelectorAll('.main-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentType = tab.dataset.type;
            resetAndFetch();
        });
    });

    // Sub Tab Switching (Trending/Language)
    document.querySelectorAll('.sub-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('active')) return;
            document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            resetAndFetch();
        });
    });

    // Load More
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        fetchContent(true);
    });

    // Modal Close
    closeModal.addEventListener('click', () => toggleModal(false));
    document.querySelector('.modal-overlay').addEventListener('click', () => toggleModal(false));
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') toggleModal(false);
    });

    // Newsletter Handling
    const newsletterForm = document.getElementById('newsletterForm');
    const newsletterEmail = document.getElementById('newsletterEmail');
    const newsletterMessage = document.getElementById('newsletterMessage');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterEmail.value.trim();
            if (email) {
                saveSubscriber(email);
                newsletterEmail.value = '';
                newsletterMessage.textContent = 'Successfully joined the newsletter!';
                newsletterMessage.className = 'newsletter-message success';
                setTimeout(() => {
                    newsletterMessage.textContent = '';
                    newsletterMessage.className = 'newsletter-message';
                }, 5000);
            }
        });
    }
}

function saveSubscriber(email) {
    let subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
    if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('subscribers', JSON.stringify(subscribers));
        console.log('New subscriber added:', email);
        // Here you would normally call your backend or EmailJS
        notifyNewSubscriber(email);
    }
}

function notifyNewSubscriber(email) {
    // Mock email sending
    console.log(`Sending welcome email to: ${email}`);
}

function notifySubscribersOfNewContent(contentTitle) {
    const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
    if (subscribers.length > 0) {
        console.log(`Alerting ${subscribers.length} subscribers about new content: ${contentTitle}`);
        // In a real app, this would trigger an automated email blast
    }
}

function handleSearch() {
    currentQuery = movieSearch.value.trim();
    searchSuggestions.classList.remove('active');
    resetAndFetch();
}

async function handleAutocomplete() {
    const query = movieSearch.value.trim();
    if (query.length < 2) {
        searchSuggestions.classList.remove('active');
        return;
    }

    try {
        const url = `${TMDB_BASE_URL}/search/${currentType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`;
        const response = await fetch(url);
        const data = await response.json();
        renderSuggestions(data.results.slice(0, 8));
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }
}

function renderSuggestions(results) {
    if (results.length === 0) {
        searchSuggestions.classList.remove('active');
        return;
    }

    searchSuggestions.innerHTML = '';
    results.forEach(item => {
        const title = item.title || item.name;
        const year = (item.release_date || item.first_air_date || '').split('-')[0];
        
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `
            <img src="${item.poster_path ? TMDB_IMAGE_BASE_URL + item.poster_path : 'https://via.placeholder.com/40x60'}" alt="${title}">
            <div class="suggestion-info">
                <h4>${title}</h4>
                <p>${year ? year : ''} • ${currentType === 'movie' ? 'Movie' : 'TV Show'}</p>
            </div>
        `;
        div.addEventListener('click', () => {
            movieSearch.value = title;
            searchSuggestions.classList.remove('active');
            fetchDetailsAndOpen(item.id, currentType);
        });
        searchSuggestions.appendChild(div);
    });
    searchSuggestions.classList.add('active');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function resetAndFetch() {
    currentPage = 1;
    movieGrid.innerHTML = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (currentQuery) {
        sectionTitle.textContent = `Search Results for "${currentQuery}"`;
    } else {
        const typeLabel = currentType === 'movie' ? 'Movies' : 'TV Shows';
        const categoryLabels = {
            'trending': 'Trending',
            'en': 'English',
            'hi': 'Hindi',
            'ne': 'Nepali'
        };
        sectionTitle.textContent = `${categoryLabels[currentCategory]} ${typeLabel}`;
    }
    
    fetchContent();
}

function showLoading() {
    loader.classList.add('active');
}

function hideLoading() {
    loader.classList.remove('active');
}

async function fetchContent(isLoadMore = false) {
    if (isLoading) return;
    isLoading = true;
    
    if (!isLoadMore) {
        showLoading();
        showSkeletons();
    }
    
    try {
        let url;
        if (currentQuery) {
            url = `${TMDB_BASE_URL}/search/${currentType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(currentQuery)}&page=${currentPage}`;
        } else {
            if (currentCategory === 'trending') {
                url = `${TMDB_BASE_URL}/trending/${currentType}/week?api_key=${TMDB_API_KEY}&page=${currentPage}`;
            } else {
                // Discover by language for current type
                url = `${TMDB_BASE_URL}/discover/${currentType}?api_key=${TMDB_API_KEY}&with_original_language=${currentCategory}&sort_by=popularity.desc&page=${currentPage}`;
            }
        }

        const response = await fetch(url);
        const data = await response.json();
        
        if (!isLoadMore) movieGrid.innerHTML = '';
        renderItems(data.results);
        
        // Notify subscribers if new content was found (for demo)
        if (data.results.length > 0 && !isLoadMore && currentCategory === 'trending') {
            notifySubscribersOfNewContent(data.results[0].title || data.results[0].name);
        }
        
        loadMoreBtn.style.display = (data.page < data.total_pages) ? 'block' : 'none';
    } catch (error) {
        console.error('Error fetching content:', error);
    } finally {
        isLoading = false;
        if (!isLoadMore) hideLoading();
    }
}

function showSkeletons() {
    movieGrid.innerHTML = '';
    for (let i = 0; i < 12; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton';
        movieGrid.appendChild(skeleton);
    }
}

function renderItems(items) {
    items.forEach(item => {
        if (!item.poster_path) return;

        const title = item.title || item.name;
        const releaseDate = item.release_date || item.first_air_date;
        const year = releaseDate ? releaseDate.split('-')[0] : 'N/A';

        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${title}" class="movie-poster" loading="lazy">
            <div class="movie-info">
                <h3>${title}</h3>
                <div class="movie-meta">
                    <span>${year}</span>
                    <span class="rating">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        ${item.vote_average.toFixed(1)}
                    </span>
                </div>
            </div>
        `;
        card.addEventListener('click', () => fetchDetailsAndOpen(item.id, currentType));
        movieGrid.appendChild(card);
    });
}

async function fetchDetailsAndOpen(id, type) {
    if (!id || !type) return;
    
    // Reset modal content and show loading
    movieDetails.innerHTML = '<div class="loading-details"><h3>Loading details...</h3></div>';
    videoPlayer.src = 'about:blank';
    toggleModal(true);
    
    try {
        const response = await fetch(`${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos,external_ids`);
        if (!response.ok) throw new Error('Failed to fetch details');
        const details = await response.json();
        openPlayer(details, type);
    } catch (error) {
        console.error('Error fetching details:', error);
        movieDetails.innerHTML = '<div class="error-details"><h3>Error loading details</h3><p>Please try again later.</p></div>';
    }
}

function openPlayer(item, type) {
    if (!item || (!item.title && !item.name)) {
        console.error('Invalid item object:', item);
        movieDetails.innerHTML = '<div class="error-details"><h3>Invalid Content</h3><p>We couldn\'t find the details for this item.</p></div>';
        return;
    }

    const isTV = type === 'tv' || !!item.first_air_date;
    const typePath = isTV ? 'tv' : 'movie';
    const id = item.id;
    const imdbId = item.external_ids ? item.external_ids.imdb_id : null;
    
    let currentSeason = 1;
    let currentEpisode = 1;

    const getUrls = (s = 1, e = 1) => {
        const urls = {
            'VsEmbed (Main)': `https://vsembed.ru/embed/${typePath}/${id}${isTV ? `/${s}/${e}` : ''}`,
            'VidSrc.ru': `https://vidsrc-embed.ru/embed/${typePath}/${id}${isTV ? `/${s}/${e}` : ''}`,
            'VidSrc.me': `https://vidsrc.me/embed/${typePath}/${id}${isTV ? `/${s}/${e}` : ''}`,
            'VidSrc.to': `https://vidsrc.to/embed/${typePath}/${id}${isTV ? `/${s}/${e}` : ''}`,
            'VidSrc.xyz': `https://vidsrc.xyz/embed/${typePath}/${id}${isTV ? `/${s}/${e}` : ''}`,
            'VidSrc.pm': `https://vidsrc.pm/embed/${typePath}/${id}${isTV ? `/${s}/${e}` : ''}`,
            'VidSrc.in': `https://vidsrc.in/embed/${typePath}/${id}${isTV ? `/${s}/${e}` : ''}`,
            'Embed.su': `https://embed.su/embed/${typePath}/${id}${isTV ? `/${s}/${e}` : ''}`,
            'AutoEmbed': `https://player.autoembed.cc/embed/${typePath}/${id}${isTV ? `/${s}/${e}` : ''}`
        };

        if (imdbId) {
            urls['VidSrc.me (IMDB)'] = isTV ? `https://vidsrc.me/embed/tv?imdb=${imdbId}&s=${s}&e=${e}` : `https://vidsrc.me/embed/${imdbId}`;
            urls['VidSrc.in (IMDB)'] = isTV ? `https://vidsrc.in/embed/tv?imdb=${imdbId}&s=${s}&e=${e}` : `https://vidsrc.in/embed/${imdbId}`;
            urls['2Embed'] = isTV ? `https://www.2embed.cc/embedtv/${imdbId}&s=${s}&e=${e}` : `https://www.2embed.cc/embed/${imdbId}`;
        }

        // Add YouTube fallback for Nepali movies or others if available
        if (item.videos && item.videos.results) {
            const trailers = item.videos.results.filter(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Featurette'));
            trailers.forEach((video, index) => {
                urls[`YouTube Source ${index + 1}`] = `https://www.youtube.com/embed/${video.key}?autoplay=1`;
            });
        }

        return urls;
    };

    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date;
    const genres = item.genres ? item.genres.map(g => g.name).join(', ') : 'N/A';
    
    const initialServers = getUrls(1, 1);
    let serverOptions = '';
    for (const [name, url] of Object.entries(initialServers)) {
        serverOptions += `<option value="${name}">${name}</option>`;
    }
    
    movieDetails.innerHTML = `
        <h2>${title}</h2>
        ${item.tagline ? `<p class="tagline">"${item.tagline}"</p>` : ''}
        <div class="meta-row">
            <span class="meta-item">${releaseDate ? releaseDate.split('-')[0] : 'N/A'}</span>
            <span class="meta-item">${isTV ? (item.number_of_seasons ? `${item.number_of_seasons} Seasons` : 'TV Series') : (item.runtime ? `${item.runtime} min` : 'Movie')}</span>
            <span class="meta-item">${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'} Rating</span>
        </div>
        <p><strong>Genres:</strong> ${genres || 'N/A'}</p>
        <div class="overview">
            <p>${item.overview || 'No overview available for this title.'}</p>
        </div>
        
        <div class="server-selection">
            <div class="server-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                Change Server:
            </div>
            <div class="custom-select-wrapper">
                <select id="serverSelect">
                    ${serverOptions}
                </select>
                <div class="select-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
            </div>
        </div>

        ${isTV ? `
            <div class="tv-controls">
                <div class="season-select-wrapper">
                    <label for="seasonSelect">Select Season:</label>
                    <select id="seasonSelect" style="width: 100%; padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: white; outline: none; cursor: pointer;">
                        ${item.seasons.map(s => `<option value="${s.season_number}">${s.name || `Season ${s.season_number}`}</option>`).join('')}
                    </select>
                </div>
                <div class="episodes-container">
                    <h3>Episodes</h3>
                    <div id="episodesList" class="episodes-list">
                        <p>Loading episodes...</p>
                    </div>
                </div>
            </div>
        ` : ''}

        <p style="margin-top: 20px; font-size: 0.8rem; color: var(--text-secondary);">Tip: If the video doesn't load or shows a black screen, try switching to another server.</p>
    `;
    
    toggleModal(true);
    
    const updatePlayer = () => {
        const serverName = document.getElementById('serverSelect').value;
        const urls = getUrls(currentSeason, currentEpisode);
        const targetUrl = urls[serverName];
        
        videoPlayer.src = 'about:blank';
        setTimeout(() => {
            videoPlayer.src = targetUrl;
        }, 100);
    };

    // Initial Load
    setTimeout(() => {
        const serverSelect = document.getElementById('serverSelect');
        if (!serverSelect) return;

        updatePlayer();
        
        serverSelect.addEventListener('change', updatePlayer);
        
        if (isTV) {
            const seasonSelect = document.getElementById('seasonSelect');
            if (seasonSelect) {
                seasonSelect.addEventListener('change', (e) => {
                    currentSeason = parseInt(e.target.value);
                    currentEpisode = 1; // Reset to first episode of new season
                    fetchAndRenderEpisodes(id, currentSeason);
                });
                
                fetchAndRenderEpisodes(id, currentSeason);
            }
        }
    }, 400);

    async function fetchAndRenderEpisodes(tvId, seasonNum) {
        const episodesList = document.getElementById('episodesList');
        episodesList.innerHTML = '<p>Loading episodes...</p>';
        
        try {
            const response = await fetch(`${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNum}?api_key=${TMDB_API_KEY}`);
            const data = await response.json();
            
            episodesList.innerHTML = '';
            data.episodes.forEach(ep => {
                const epItem = document.createElement('div');
                epItem.className = `episode-item ${ep.episode_number === currentEpisode ? 'active' : ''}`;
                epItem.innerHTML = `
                    <img src="${ep.still_path ? TMDB_IMAGE_BASE_URL + ep.still_path : 'https://via.placeholder.com/120x68?text=No+Image'}" class="episode-thumb" alt="${ep.name}">
                    <div class="episode-info">
                        <div class="episode-number">E${ep.episode_number}</div>
                        <h4>${ep.name}</h4>
                        <p>${ep.air_date || 'N/A'}</p>
                    </div>
                `;
                
                epItem.addEventListener('click', () => {
                    currentEpisode = ep.episode_number;
                    document.querySelectorAll('.episode-item').forEach(el => el.classList.remove('active'));
                    epItem.classList.add('active');
                    updatePlayer();
                });
                
                episodesList.appendChild(epItem);
            });
        } catch (error) {
            console.error('Error fetching episodes:', error);
            episodesList.innerHTML = '<p>Error loading episodes.</p>';
        }
    }
}

function toggleModal(show) {
    if (show) {
        playerModal.style.display = 'block';
        // Trigger reflow for animation
        playerModal.offsetHeight;
        playerModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    } else {
        playerModal.classList.remove('show');
        setTimeout(() => {
            playerModal.style.display = 'none';
            videoPlayer.src = '';
        }, 500);
        document.body.style.overflow = 'auto';
    }
}
