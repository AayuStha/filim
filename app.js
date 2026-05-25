// ===================== PROFILE GATE SYSTEM =====================
const DEFAULT_PROFILES = [
    {
        id: 'profile-1',
        name: 'General',
        color1: '#8b5cf6',
        color2: '#6366f1',
        icon: 'user-1',
        focus: 'general'
    },
    {
        id: 'profile-2',
        name: 'Action',
        color1: '#3b82f6',
        color2: '#06b6d4',
        icon: 'user-2',
        focus: 'action'
    },
    {
        id: 'profile-3',
        name: 'Kids',
        color1: '#f59e0b',
        color2: '#ef4444',
        icon: 'user-3',
        focus: 'kids'
    },
    {
        id: 'profile-4',
        name: 'Sci-Fi',
        color1: '#10b981',
        color2: '#059669',
        icon: 'user-4',
        focus: 'scifi'
    }
];

function getProfileSVG(profile, size = 120) {
    const { color1, color2, icon } = profile;
    const gradientId = `grad-${profile.id}-${size}`;

    const icons = {
        'user-1': `
            <!-- Vintage Cinema Clapperboard -->
            <rect x="30" y="46" width="60" height="42" rx="6" fill="white" opacity="0.9"/>
            <rect x="30" y="32" width="60" height="10" rx="3" fill="white" opacity="0.75" transform="rotate(-12 60 37)"/>
            <line x1="38" y1="36" x2="44" y2="30" stroke="${color1}" stroke-width="3"/>
            <line x1="52" y1="33" x2="58" y2="27" stroke="${color1}" stroke-width="3"/>
            <line x1="66" y1="30" x2="72" y2="24" stroke="${color1}" stroke-width="3"/>
            <path d="M60 76 C60 76, 48 66, 48 59 C48 54, 53 50, 60 55 C67 50, 72 54, 72 59 C72 66, 60 76, 60 76 Z" fill="${color1}" opacity="0.9"/>
        `,
        'user-2': `
            <!-- Glowing Thunderbolt / Energy -->
            <polygon points="66,18 36,58 56,58 48,102 80,50 60,50" fill="white" opacity="0.95"/>
            <circle cx="34" cy="35" r="3" fill="white" opacity="0.6"/>
            <circle cx="84" cy="78" r="4" fill="white" opacity="0.6"/>
        `,
        'user-3': `
            <!-- Cute Bear Face -->
            <circle cx="38" cy="38" r="14" fill="white" opacity="0.9"/>
            <circle cx="82" cy="38" r="14" fill="white" opacity="0.9"/>
            <circle cx="60" cy="62" r="32" fill="white" opacity="0.95"/>
            <circle cx="43" cy="65" r="5" fill="#ff7a7a" opacity="0.6"/>
            <circle cx="77" cy="65" r="5" fill="#ff7a7a" opacity="0.6"/>
            <circle cx="48" cy="56" r="3" fill="#1e1b4b"/>
            <circle cx="72" cy="56" r="3" fill="#1e1b4b"/>
            <ellipse cx="60" cy="66" rx="5" ry="3.5" fill="#1e1b4b"/>
            <path d="M57 71 Q60 74 63 71" stroke="#1e1b4b" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        `,
        'user-4': `
            <!-- Retro Space Planet -->
            <path d="M25 65 C25 55, 95 45, 95 55" stroke="white" stroke-width="6" fill="none" opacity="0.45" stroke-linecap="round"/>
            <circle cx="60" cy="60" r="24" fill="white" opacity="0.9"/>
            <path d="M25 60 C25 70, 95 60, 95 50" stroke="white" stroke-width="6" fill="none" opacity="0.9" stroke-linecap="round"/>
            <polygon points="35,32 37,36 41,36 38,39 39,43 35,41 31,43 32,39 29,36 33,36" fill="white" opacity="0.8"/>
            <polygon points="85,78 87,82 91,82 88,85 89,89 85,87 81,89 82,85 79,82 83,82" fill="white" opacity="0.8"/>
        `
    };

    return `
        <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
            <defs>
                <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${color1}"/>
                    <stop offset="100%" style="stop-color:${color2}"/>
                </linearGradient>
            </defs>
            <rect width="120" height="120" rx="12" fill="url(#${gradientId})"/>
            ${icons[icon] || icons['user-1']}
        </svg>
    `;
}

function getProfiles() {
    return JSON.parse(localStorage.getItem('cinestream_profiles')) || DEFAULT_PROFILES;
}

function saveProfiles(profiles) {
    localStorage.setItem('cinestream_profiles', JSON.stringify(profiles));
}

function initProfileGate() {
    const profileGate = document.getElementById('profileGate');
    const profileList = document.getElementById('profileList');
    const manageBtn = document.getElementById('manageProfilesBtn');

    if (!profileGate || !profileList) return;

    // Check if profile already selected this session
    const activeProfile = sessionStorage.getItem('activeProfile');
    if (activeProfile) {
        profileGate.style.display = 'none';
        updateProfileSwitcher(JSON.parse(activeProfile));
        return;
    }

    // Show gate, hide main content
    document.body.classList.add('profile-gate-active');
    profileGate.style.display = 'flex';
    profileGate.classList.remove('hidden');

    // Clear and render profiles
    profileList.innerHTML = '';
    const profiles = getProfiles();

    profiles.forEach(profile => {
        const card = document.createElement('div');
        card.className = 'profile-card';
        card.innerHTML = `
            <div class="profile-avatar">
                ${getProfileSVG(profile)}
            </div>
            <span class="profile-name">${profile.name}</span>
        `;
        card.addEventListener('click', () => selectProfile(profile));
        profileList.appendChild(card);
    });

    // Add "Add Profile" card
    const addCard = document.createElement('div');
    addCard.className = 'profile-card add-profile';
    addCard.innerHTML = `
        <div class="profile-avatar">
            <svg class="add-profile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
        </div>
        <span class="profile-name">Add Profile</span>
    `;
    addCard.addEventListener('click', () => {
        const name = prompt('Enter profile name:');
        if (name && name.trim()) {
            const focusInput = prompt('Choose profile type / focus (enter a number):\n1. General\n2. Kids & Family\n3. Action\n4. Sci-Fi');
            let focus = 'general';
            let icon = 'user-1';
            
            if (focusInput === '2') {
                focus = 'kids';
                icon = 'user-3';
            } else if (focusInput === '3') {
                focus = 'action';
                icon = 'user-2';
            } else if (focusInput === '4') {
                focus = 'scifi';
                icon = 'user-4';
            }

            const colors = [
                ['#ec4899', '#db2777'],
                ['#14b8a6', '#0d9488'],
                ['#f97316', '#ea580c'],
                ['#a855f7', '#9333ea'],
                ['#8b5cf6', '#6366f1'],
                ['#3b82f6', '#06b6d4']
            ];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const newProfile = {
                id: `profile-${Date.now()}`,
                name: name.trim(),
                color1: randomColor[0],
                color2: randomColor[1],
                icon: icon,
                focus: focus
            };
            const allProfiles = getProfiles();
            allProfiles.push(newProfile);
            saveProfiles(allProfiles);
            initProfileGate();
        }
    });
    profileList.appendChild(addCard);

    // Manage profiles button
    if (manageBtn) {
        manageBtn.onclick = () => {
            if (confirm('Reset all profiles to default?')) {
                localStorage.removeItem('cinestream_profiles');
                initProfileGate();
            }
        };
    }
}

function selectProfile(profile) {
    const profileGate = document.getElementById('profileGate');

    // Store selection for session
    sessionStorage.setItem('activeProfile', JSON.stringify(profile));

    // Animate out
    profileGate.classList.add('hidden');

    setTimeout(() => {
        profileGate.style.display = 'none';
        document.body.classList.remove('profile-gate-active');
        
        // Re-fetch content to load personalized movies/shows
        if (typeof resetAndFetch === 'function') {
            resetAndFetch();
        }

        // CineParty: Auto join room if there is a pending room link active
        const pendingRoom = sessionStorage.getItem('pending_room');
        if (pendingRoom) {
            sessionStorage.removeItem('pending_room');
            setTimeout(() => {
                if (window.WatchPartyManager) {
                    window.WatchPartyManager.joinRoom(pendingRoom);
                }
            }, 800);
        }
    }, 500);

    // Update the header profile switcher
    updateProfileSwitcher(profile);
}

function updateProfileSwitcher(activeProfile) {
    const miniAvatar = document.getElementById('profileMiniAvatar');
    const dropdownList = document.getElementById('profileDropdownList');
    const switchBtn = document.getElementById('switchProfileBtn');
    const editBtn = document.getElementById('editProfileBtn');
    const profileSwitcherBtn = document.getElementById('profileSwitcherBtn');
    const profileDropdown = document.getElementById('profileDropdown');

    if (!miniAvatar) return;

    // Set mini avatar
    miniAvatar.innerHTML = getProfileSVG(activeProfile, 32);

    // Populate dropdown with other profiles
    const profiles = getProfiles();
    dropdownList.innerHTML = '';

    profiles.forEach(profile => {
        const item = document.createElement('div');
        item.className = `profile-dropdown-item ${profile.id === activeProfile.id ? 'active' : ''}`;
        item.innerHTML = `
            <div class="profile-dropdown-avatar">${getProfileSVG(profile, 28)}</div>
            <span>${profile.name}</span>
        `;
        if (profile.id !== activeProfile.id) {
            item.addEventListener('click', () => {
                profileDropdown.classList.remove('show');
                selectProfile(profile);
            });
        }
        dropdownList.appendChild(item);
    });

    // Toggle dropdown
    profileSwitcherBtn.onclick = (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
    };

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!profileDropdown.contains(e.target) && !profileSwitcherBtn.contains(e.target)) {
            profileDropdown.classList.remove('show');
        }
    });

    // Edit profile name
    editBtn.onclick = () => {
        profileDropdown.classList.remove('show');
        const newName = prompt('Enter new name for this profile:', activeProfile.name);
        if (newName && newName.trim()) {
            const allProfiles = getProfiles();
            const idx = allProfiles.findIndex(p => p.id === activeProfile.id);
            if (idx !== -1) {
                allProfiles[idx].name = newName.trim();
                saveProfiles(allProfiles);
                const updatedProfile = { ...activeProfile, name: newName.trim() };
                sessionStorage.setItem('activeProfile', JSON.stringify(updatedProfile));
                updateProfileSwitcher(updatedProfile);
            }
        }
    };

    // Switch profile — go back to gate
    switchBtn.onclick = () => {
        profileDropdown.classList.remove('show');
        sessionStorage.removeItem('activeProfile');
        initProfileGate();
    };
}

// Init profile gate immediately when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initProfileGate();
});

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
let currentGenre = '';
let currentQuery = '';
let currentPersonId = '';
let currentPersonName = '';
let isLoading = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // CineParty: Check url query param for room ID
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam && roomParam.trim()) {
        sessionStorage.setItem('pending_room', roomParam.trim().toUpperCase());
        // Clean URL query parameters
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    }

    fetchContent();
    setupEventListeners();
    fetchGenres();
    
    // CineParty: Initialize UI
    if (window.WatchPartyManager) {
        window.WatchPartyManager.initUI();
    }
});

function setupEventListeners() {
    // Logo Click (Refresh / Home)
    const mainLogo = document.getElementById('mainLogo');
    if (mainLogo) {
        mainLogo.addEventListener('click', () => {
            window.location.reload();
        });
    }

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
            currentPersonId = '';
            currentPersonName = '';
            fetchGenres();
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
            currentPersonId = '';
            currentPersonName = '';
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
    currentPersonId = '';
    currentPersonName = '';
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

// History Management
function getHistory() {
    const activeProfileJson = sessionStorage.getItem('activeProfile');
    if (!activeProfileJson) return [];
    const activeProfile = JSON.parse(activeProfileJson);
    return JSON.parse(localStorage.getItem(`cinestream_history_${activeProfile.id}`)) || [];
}

function saveToHistory(item, season = null, episode = null) {
    const activeProfileJson = sessionStorage.getItem('activeProfile');
    if (!activeProfileJson) return;
    const activeProfile = JSON.parse(activeProfileJson);
    const historyKey = `cinestream_history_${activeProfile.id}`;
    
    let history = JSON.parse(localStorage.getItem(historyKey)) || [];
    
    // Remove if already exists to push to top
    history = history.filter(h => h.id !== item.id);
    
    const historyItem = {
        id: item.id,
        type: item.name ? 'tv' : 'movie',
        title: item.title || item.name,
        poster_path: item.poster_path,
        season: season,
        episode: episode,
        timestamp: new Date().getTime()
    };
    
    history.unshift(historyItem);
    
    // Keep only last 20 items
    if (history.length > 20) {
        history = history.slice(0, 20);
    }
    
    localStorage.setItem(historyKey, JSON.stringify(history));
}

function renderRecentlyWatched() {
    const section = document.getElementById('recentlyWatchedSection');
    const grid = document.getElementById('recentlyWatchedGrid');
    
    // Only show on home feed (trending movies/tv, no searches or person filters)
    if (currentQuery || currentPersonId || currentGenre || currentCategory !== 'trending') {
        section.style.display = 'none';
        return;
    }
    
    const history = getHistory();
    // Filter history to current type (movie vs tv)
    const filteredHistory = history.filter(h => h.type === currentType);
    
    if (filteredHistory.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    grid.innerHTML = '';
    filteredHistory.forEach(item => {
        const card = document.createElement('div');
        card.className = 'recent-card';
        const randomWidth = Math.floor(Math.random() * 70) + 15; // Random width between 15% and 85%
        card.innerHTML = `
            <img src="${item.poster_path ? TMDB_IMAGE_BASE_URL + item.poster_path : 'https://via.placeholder.com/140x210'}" alt="${item.title}" loading="lazy">
            <div class="recent-info">
                <h4>${item.title}</h4>
                ${item.type === 'tv' && item.season ? `<div class="recent-meta">S${item.season} E${item.episode}</div>` : ''}
            </div>
            <div class="recent-progress-container"><div class="recent-progress-bar" style="width: ${randomWidth}%;"></div></div>
        `;
        
        card.addEventListener('click', () => {
            // Re-fetch details to open the player. We'll pass season and episode later.
            fetchDetailsAndOpen(item.id, item.type, item.season, item.episode);
        });
        
        grid.appendChild(card);
    });
    
    section.style.display = 'block';
}

function resetAndFetch() {
    currentPage = 1;
    movieGrid.innerHTML = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    renderRecentlyWatched();

    const activeProfileJson = sessionStorage.getItem('activeProfile');
    const activeProfile = activeProfileJson ? JSON.parse(activeProfileJson) : null;
    const profileFocus = activeProfile ? activeProfile.focus : 'general';
    
    if (currentPersonId) {
        sectionTitle.textContent = `Works by/starring "${currentPersonName}"`;
    } else if (currentQuery) {
        sectionTitle.textContent = `Search Results for "${currentQuery}"`;
    } else {
        const typeLabel = currentType === 'movie' ? 'Movies' : 'TV Shows';
        const categoryLabels = {
            'trending': 'Trending',
            'en': 'English',
            'hi': 'Hindi',
            'ne': 'Nepali'
        };
        
        let focusLabel = '';
        if (profileFocus === 'kids') focusLabel = 'Kids & Family ';
        else if (profileFocus === 'action' && !currentGenre) focusLabel = 'Action ';
        else if (profileFocus === 'scifi' && !currentGenre) focusLabel = 'Sci-Fi ';

        // Get selected genre text
        const activeGenreTab = document.querySelector('.genre-tab.active');
        const genreName = activeGenreTab ? activeGenreTab.textContent : '';
        
        let categoryLabel = categoryLabels[currentCategory] === 'Trending' ? '' : categoryLabels[currentCategory] + ' ';
        let genreLabel = (genreName && genreName !== 'All Genres') ? genreName + ' ' : '';
        
        if (genreLabel && categoryLabels[currentCategory] === 'Trending') {
            categoryLabel = '';
        }

        sectionTitle.textContent = `${focusLabel}${categoryLabel}${genreLabel}${typeLabel}`;
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
        const activeProfileJson = sessionStorage.getItem('activeProfile');
        const activeProfile = activeProfileJson ? JSON.parse(activeProfileJson) : null;
        const profileFocus = activeProfile ? activeProfile.focus : 'general';

        let url;
        if (currentPersonId) {
            url = `${TMDB_BASE_URL}/discover/${currentType}?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${currentPage}&with_people=${currentPersonId}`;
        } else if (currentQuery) {
            url = `${TMDB_BASE_URL}/search/${currentType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(currentQuery)}&page=${currentPage}`;
            if (profileFocus === 'kids') {
                url += `&with_genres=16,10751`; 
            }
        } else {
            // Apply customized filters based on profile type
            if (profileFocus === 'kids') {
                // Kids mode: No global trending. Filter only family/animation
                let genresStr = '16,10751';
                if (currentGenre) {
                    genresStr += `,${currentGenre}`;
                }
                url = `${TMDB_BASE_URL}/discover/${currentType}?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${currentPage}&with_genres=${genresStr}`;
                if (currentCategory !== 'trending') {
                    url += `&with_original_language=${currentCategory}`;
                }
            } else if (profileFocus === 'action') {
                // Action profile: If browsing All Genres, show Action movies (28) by default
                if (currentGenre) {
                    url = `${TMDB_BASE_URL}/discover/${currentType}?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${currentPage}&with_genres=${currentGenre}`;
                } else {
                    url = `${TMDB_BASE_URL}/discover/${currentType}?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${currentPage}&with_genres=28`;
                }
                if (currentCategory !== 'trending') {
                    url += `&with_original_language=${currentCategory}`;
                }
            } else if (profileFocus === 'scifi') {
                // Sci-Fi profile: If browsing All Genres, show Sci-Fi movies (878) by default
                if (currentGenre) {
                    url = `${TMDB_BASE_URL}/discover/${currentType}?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${currentPage}&with_genres=${currentGenre}`;
                } else {
                    url = `${TMDB_BASE_URL}/discover/${currentType}?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${currentPage}&with_genres=878`;
                }
                if (currentCategory !== 'trending') {
                    url += `&with_original_language=${currentCategory}`;
                }
            } else {
                // General Profile: standard logic
                if (currentCategory === 'trending' && !currentGenre) {
                    url = `${TMDB_BASE_URL}/trending/${currentType}/week?api_key=${TMDB_API_KEY}&page=${currentPage}`;
                } else {
                    url = `${TMDB_BASE_URL}/discover/${currentType}?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${currentPage}`;
                    if (currentCategory !== 'trending') {
                        url += `&with_original_language=${currentCategory}`;
                    }
                    if (currentGenre) {
                        url += `&with_genres=${currentGenre}`;
                    }
                }
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
        // Enforce strict availability and playability criteria
        if (!item.poster_path) return;
        if (!item.overview || item.overview.trim() === '') return;
        
        const releaseDate = item.release_date || item.first_air_date;
        if (!releaseDate) return;
        
        // Exclude unreleased or completely unpopular/placeholder titles (no votes)
        if (item.vote_count === undefined || item.vote_count === 0 || !item.vote_average) return;

        const title = item.title || item.name;
        const year = releaseDate ? releaseDate.split('-')[0] : 'N/A';

        const card = document.createElement('div');
        card.className = `movie-card ${item.original_language === 'ne' ? 'nepali-highlight' : ''}`;
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

async function fetchDetailsAndOpen(id, type, season = null, episode = null) {
    if (!id || !type) return;
    
    // Reset modal content and show loading
    movieDetails.innerHTML = '<div class="loading-details"><h3>Loading details...</h3></div>';
    videoPlayer.src = 'about:blank';
    toggleModal(true);
    
    try {
        const response = await fetch(`${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos,external_ids,credits`);
        if (!response.ok) throw new Error('Failed to fetch details');
        const details = await response.json();
        openPlayer(details, type, season, episode);
    } catch (error) {
        console.error('Error fetching details:', error);
        movieDetails.innerHTML = '<div class="error-details"><h3>Error loading details</h3><p>Please try again later.</p></div>';
    }
}

function openPlayer(item, type, initialSeason = null, initialEpisode = null) {
    if (!item || (!item.title && !item.name)) {
        console.error('Invalid item object:', item);
        movieDetails.innerHTML = '<div class="error-details"><h3>Invalid Content</h3><p>We couldn\'t find the details for this item.</p></div>';
        return;
    }

    // Set globally tracked current active media for Watch Together
    window.currentActiveMedia = {
        item: item,
        type: type,
        season: initialSeason || 1,
        episode: initialEpisode || 1,
        server: 'VsEmbed (Main)'
    };

    const isTV = type === 'tv' || !!item.first_air_date;
    const typePath = isTV ? 'tv' : 'movie';
    const id = item.id;
    const imdbId = item.external_ids ? item.external_ids.imdb_id : null;
    
    let currentSeason = initialSeason || 1;
    let currentEpisode = initialEpisode || 1;

    const getUrls = (s = 1, e = 1) => {
        const urls = {
            'VsEmbed (Main)': `https://vsembed.ru/embed/${typePath}/${id}${isTV ? `/${s}/${e}` : ''}`,
            'VidSrc.vip': `https://vidsrc.vip/embed/${typePath}/${id}${isTV ? `/${s}/${e}` : ''}`,
            'SmashyStream': `https://embed.smashystream.com/playere.php?tmdb=${id}${isTV ? `&s=${s}&e=${e}` : ''}`,
            'MultiEmbed': `https://multiembed.mov/directstream.php?video_id=${id}${isTV ? `&s=${s}&e=${e}` : ''}`,
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

    let directorHTML = '';
    if (isTV && item.created_by && item.created_by.length > 0) {
        const creators = item.created_by.map(c => `<span class="clickable-credit" data-id="${c.id}" data-name="${c.name}">${c.name}</span>`).join(', ');
        directorHTML = `<p><strong>Creator(s):</strong> ${creators}</p>`;
    } else if (item.credits && item.credits.crew) {
        const directorObj = item.credits.crew.find(c => c.job === 'Director');
        if (directorObj) {
            directorHTML = `<p><strong>Director:</strong> <span class="clickable-credit" data-id="${directorObj.id}" data-name="${directorObj.name}">${directorObj.name}</span></p>`;
        }
    }

    let castHTML = '';
    if (item.credits && item.credits.cast && item.credits.cast.length > 0) {
        const topCast = item.credits.cast.slice(0, 5);
        const castLinks = topCast.map(actor => `<span class="clickable-credit" data-id="${actor.id}" data-name="${actor.name}">${actor.name}</span>`).join(', ');
        castHTML = `<p><strong>Cast:</strong> ${castLinks}</p>`;
    }
    
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
        ${directorHTML}
        ${castHTML}
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

        <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(title + (isTV ? ' full episodes' : ' full movie') + (item.original_language === 'ne' ? ' nepali' : item.original_language === 'hi' ? ' hindi' : ''))}" target="_blank" class="youtube-search-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            Search on YouTube (Fallback)
        </a>

        <button id="hostPartyBtn" class="party-action-btn primary-btn" style="margin-top: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Host Watch Party (CineParty)
        </button>

        ${isTV ? `
            <div class="tv-controls">
                <div class="season-select-wrapper">
                    <label for="seasonSelect">Select Season:</label>
                    <select id="seasonSelect" style="width: 100%; padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: white; outline: none; cursor: pointer;">
                        ${item.seasons.map(s => `<option value="${s.season_number}" ${s.season_number === currentSeason ? 'selected' : ''}>${s.name || `Season ${s.season_number}`}</option>`).join('')}
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
        
        // Update global media tracking
        window.currentActiveMedia = {
            item: item,
            type: type,
            season: currentSeason,
            episode: currentEpisode,
            server: serverName
        };

        // Broadcast media change if in active party and is Host
        if (window.WatchPartyManager && window.WatchPartyManager.isActive && window.WatchPartyManager.isHost) {
            window.WatchPartyManager.broadcastMediaChange();
        }
        
        // If it's a YouTube video, load using YouTube Player API
        if (targetUrl.includes('youtube.com/embed/')) {
            loadYouTubePlayer(targetUrl);
        } else {
            // Standard iframe mode
            unloadYouTubePlayer();
            videoPlayer.src = 'about:blank';
            setTimeout(() => {
                videoPlayer.src = targetUrl;
                saveToHistory(item, isTV ? currentSeason : null, isTV ? currentEpisode : null);
            }, 100);
        }
    };

    // Initial Load
    setTimeout(() => {
        // Attach click listeners to credits inside details
        movieDetails.querySelectorAll('.clickable-credit').forEach(el => {
            el.addEventListener('click', (e) => {
                const personId = e.target.dataset.id;
                const personName = e.target.dataset.name;
                
                // Close player modal
                toggleModal(false);
                
                // Reset search queries
                currentQuery = '';
                movieSearch.value = '';
                
                // Set active person
                currentPersonId = personId;
                currentPersonName = personName;
                
                // Reset genre filters
                currentGenre = '';
                document.querySelectorAll('.genre-tab').forEach(t => t.classList.remove('active'));
                const genreFilters = document.getElementById('genreFilters');
                if (genreFilters) {
                    const firstTab = genreFilters.querySelector('.genre-tab');
                    if (firstTab) firstTab.classList.add('active');
                }
                
                resetAndFetch();
            });
        });

        // CineParty: Host party button listener
        const hostPartyBtn = document.getElementById('hostPartyBtn');
        if (hostPartyBtn) {
            hostPartyBtn.addEventListener('click', () => {
                if (window.WatchPartyManager) {
                    window.WatchPartyManager.hostFromPlayer();
                }
            });
        }

        // CineParty: Notify open
        if (window.WatchPartyManager && window.WatchPartyManager.isActive) {
            window.WatchPartyManager.setupPartyUI();
            window.WatchPartyManager.renderMembersList();
        } else {
            const detailsPanel = document.getElementById('detailsPanel');
            if (detailsPanel) detailsPanel.classList.add('active');
            const sidebarTabs = document.getElementById('sidebarTabs');
            if (sidebarTabs) sidebarTabs.style.display = 'none';
        }

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
            // CineParty: Leave room when player closes
            if (window.WatchPartyManager && window.WatchPartyManager.isActive) {
                window.WatchPartyManager.leaveRoom();
            }
            videoPlayer.src = '';
            unloadYouTubePlayer();
        }, 500);
        document.body.style.overflow = 'auto';
    }
}
async function fetchGenres() {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/genre/${currentType}/list?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        renderGenres(data.genres);
    } catch (error) {
        console.error('Error fetching genres:', error);
    }
}

const KIDS_SAFE_GENRES = [16, 10751, 35, 12, 14]; // Animation, Family, Comedy, Adventure, Fantasy

function showKidsRestrictionToast(genreName) {
    let toast = document.getElementById('kidsToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'kidsToast';
        toast.className = 'kids-toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        <span>"${genreName}" is locked on this Kids Profile!</span>
    `;
    toast.classList.add('show');
    
    // Auto remove after 3s
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function renderGenres(genres) {
    const genreFilters = document.getElementById('genreFilters');
    genreFilters.innerHTML = '';

    // All Genres Option
    const allOpt = document.createElement('option');
    allOpt.value = '';
    allOpt.textContent = 'All Genres';
    genreFilters.appendChild(allOpt);

    const activeProfileJson = sessionStorage.getItem('activeProfile');
    const activeProfile = activeProfileJson ? JSON.parse(activeProfileJson) : null;
    const profileFocus = activeProfile ? activeProfile.focus : 'general';
    
    genres.forEach(genre => {
        const isKidsLocked = profileFocus === 'kids' && !KIDS_SAFE_GENRES.includes(genre.id);
        
        const opt = document.createElement('option');
        opt.value = genre.id;
        // Indicate lock visually in the text if it's locked
        opt.textContent = isKidsLocked ? `[Locked] ${genre.name}` : genre.name;
        
        if (isKidsLocked) {
            opt.disabled = true; // Prevents selection
        }
        
        if (currentGenre === genre.id.toString()) {
            opt.selected = true;
        }

        genreFilters.appendChild(opt);
    });

    // Handle change event
    genreFilters.addEventListener('change', (e) => {
        const selectedId = e.target.value;
        const selectedOpt = e.target.options[e.target.selectedIndex];
        
        // If they somehow managed to click a disabled locked option (some browsers allow this via keyboard)
        if (selectedOpt.disabled) {
            showKidsRestrictionToast(selectedOpt.textContent.replace('[Locked] ', ''));
            // Revert selection
            e.target.value = currentGenre;
            return;
        }
        
        currentGenre = selectedId;
        currentPersonId = '';
        currentPersonName = '';
        resetAndFetch();
    });
}

// ===================== YOUTUBE PLAYER API SYNC =====================
let ytPlayer = null;
let ytPlayerAPIReady = false;

function initYouTubeAPI() {
    if (window.YT) {
        ytPlayerAPIReady = true;
        return;
    }
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

window.onYouTubeIframeAPIReady = function() {
    ytPlayerAPIReady = true;
};

// Initialize YouTube API loader
initYouTubeAPI();

function loadYouTubePlayer(url) {
    const videoId = extractYouTubeId(url);
    if (!videoId) return;

    const placeholder = document.getElementById('youtubePlayerPlaceholder');
    const normalIframe = document.getElementById('videoPlayer');
    
    normalIframe.style.display = 'none';
    placeholder.style.display = 'block';
    
    if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
        try {
            ytPlayer.loadVideoById(videoId);
        } catch(e) {
            console.error("Failed to load video by ID", e);
        }
    } else {
        const createPlayer = () => {
            try {
                ytPlayer = new YT.Player('youtubePlayerPlaceholder', {
                    height: '100%',
                    width: '100%',
                    videoId: videoId,
                    playerVars: {
                        'autoplay': 1,
                        'controls': 1,
                        'rel': 0,
                        'showinfo': 0
                    },
                    events: {
                        'onStateChange': onYouTubePlayerStateChange
                    }
                });
            } catch(e) {
                console.error("YT Player construction failed", e);
            }
        };

        if (ytPlayerAPIReady && window.YT) {
            createPlayer();
        } else {
            let attempts = 0;
            let interval = setInterval(() => {
                attempts++;
                if ((ytPlayerAPIReady && window.YT) || attempts > 20) {
                    clearInterval(interval);
                    if (ytPlayerAPIReady && window.YT) createPlayer();
                }
            }, 200);
        }
    }
}

function unloadYouTubePlayer() {
    const placeholder = document.getElementById('youtubePlayerPlaceholder');
    const normalIframe = document.getElementById('videoPlayer');
    
    normalIframe.style.display = 'block';
    placeholder.style.display = 'none';
    
    if (ytPlayer && typeof ytPlayer.destroy === 'function') {
        try {
            ytPlayer.destroy();
        } catch(e){}
        ytPlayer = null;
    }
    placeholder.innerHTML = '';
}

function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function onYouTubePlayerStateChange(event) {
    if (!window.WatchPartyManager || !window.WatchPartyManager.isActive) return;
    if (!window.WatchPartyManager.isHost) return;
    
    if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
        const time = ytPlayer.getCurrentTime();
        if (event.data === YT.PlayerState.PLAYING) {
            window.WatchPartyManager.broadcastPlaybackState('playing', time);
        } else if (event.data === YT.PlayerState.PAUSED) {
            window.WatchPartyManager.broadcastPlaybackState('paused', time);
        }
    }
}

// ===================== CINEPARTY WATCH TOGETHER MANAGER =====================
class WatchPartyManagerClass {
    constructor() {
        this.channel = null;
        this.roomId = null;
        this.isActive = false;
        this.isHost = false;
        this.members = [];
        this.chatHistory = [];
        this.syncTimer = null;
        this.playbackTime = 0; 
        this.playbackState = 'paused'; 
        this.localProfile = null;
        this.aiBuddiesTimer = null;
        this.buddyResponsesEnabled = true;
        this.lastHeartbeatTime = 0;
    }

    initUI() {
        const partyNavBtn = document.getElementById('partyNavBtn');
        const partyDropdown = document.getElementById('partyDropdown');
        const createPartyBtn = document.getElementById('createPartyBtn');
        const joinPartyBtn = document.getElementById('joinPartyBtn');
        const joinRoomInput = document.getElementById('joinRoomInput');
        const copyRoomLinkBtn = document.getElementById('copyRoomLinkBtn');
        const leavePartyBtn = document.getElementById('leavePartyBtn');
        const inviteBotsBtn = document.getElementById('inviteBotsBtn');
        const chatForm = document.getElementById('chatForm');
        const chatInput = document.getElementById('chatInput');
        const chatTabBtn = document.getElementById('chatTabBtn');
        const detailsTabBtn = document.getElementById('detailsTabBtn');
        const hostSyncBtn = document.getElementById('hostSyncBtn');
        const hostResetSyncBtn = document.getElementById('hostResetSyncBtn');

        if (partyNavBtn && partyDropdown) {
            partyNavBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                partyDropdown.classList.toggle('show');
                const profileDropdown = document.getElementById('profileDropdown');
                if (profileDropdown) profileDropdown.classList.remove('show');
            });

            document.addEventListener('click', (e) => {
                if (!partyDropdown.contains(e.target) && !partyNavBtn.contains(e.target)) {
                    partyDropdown.classList.remove('show');
                }
            });
        }

        if (createPartyBtn) {
            createPartyBtn.addEventListener('click', () => {
                partyDropdown.classList.remove('show');
                if (window.currentActiveMedia) {
                    this.hostFromPlayer();
                } else {
                    alert("Please select a movie or show first to start a party room!");
                }
            });
        }

        if (joinPartyBtn && joinRoomInput) {
            joinPartyBtn.addEventListener('click', () => {
                const code = joinRoomInput.value.trim().toUpperCase();
                if (code.length >= 4) {
                    partyDropdown.classList.remove('show');
                    this.joinRoom(code);
                } else {
                    alert("Please enter a valid 4-character room code.");
                }
            });
            joinRoomInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') joinPartyBtn.click();
            });
        }

        if (chatTabBtn && detailsTabBtn) {
            const switchTab = (tab) => {
                document.querySelectorAll('.sidebar-tab').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                
                if (tab === 'chat') {
                    chatTabBtn.classList.add('active');
                    document.getElementById('chatPanel').classList.add('active');
                    this.scrollToBottom();
                } else {
                    detailsTabBtn.classList.add('active');
                    document.getElementById('detailsPanel').classList.add('active');
                }
            };
            chatTabBtn.addEventListener('click', () => switchTab('chat'));
            detailsTabBtn.addEventListener('click', () => switchTab('details'));
        }

        if (chatForm && chatInput) {
            chatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const text = chatInput.value.trim();
                if (text) {
                    this.sendChatMessage(text);
                    chatInput.value = '';
                }
            });
        }

        document.querySelectorAll('.reaction-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const emoji = btn.dataset.emoji;
                if (emoji) {
                    this.sendEmojiBlast(emoji);
                }
            });
        });

        if (copyRoomLinkBtn) {
            copyRoomLinkBtn.addEventListener('click', () => {
                const shareUrl = window.location.origin + window.location.pathname + '?room=' + this.roomId;
                navigator.clipboard.writeText(shareUrl).then(() => {
                    this.showNotification("Invite Link Copied!");
                });
            });
        }

        if (leavePartyBtn) {
            leavePartyBtn.addEventListener('click', () => {
                if (confirm("Are you sure you want to leave this watch party?")) {
                    this.leaveRoom();
                }
            });
        }

        if (hostSyncBtn) {
            hostSyncBtn.addEventListener('click', () => {
                if (!this.isHost) return;
                
                if (this.playbackState === 'playing') {
                    this.broadcastPlaybackState('paused', this.playbackTime);
                } else {
                    this.broadcastPlaybackState('playing', this.playbackTime);
                }
            });
        }

        if (hostResetSyncBtn) {
            hostResetSyncBtn.addEventListener('click', () => {
                if (!this.isHost) return;
                this.showNotification("Sync pushed to all guests");
                this.broadcastMediaChange();
                this.broadcastPlaybackState(this.playbackState, this.playbackTime);
            });
        }

        if (inviteBotsBtn) {
            inviteBotsBtn.addEventListener('click', () => {
                this.inviteAIBuddies();
            });
        }
    }

    hostFromPlayer() {
        if (!window.currentActiveMedia) {
            alert("No active media selected!");
            return;
        }

        const profileStr = sessionStorage.getItem('activeProfile');
        if (!profileStr) {
            alert("Please choose a profile first.");
            initProfileGate();
            return;
        }

        this.localProfile = JSON.parse(profileStr);
        const code = this.generateRoomId();
        this.createRoom(code, window.currentActiveMedia);
    }

    generateRoomId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    createRoom(roomId, media) {
        this.roomId = roomId;
        this.isActive = true;
        this.isHost = true;
        this.members = [];
        this.chatHistory = [];
        this.playbackState = 'paused';
        this.playbackTime = 0;

        const localMember = { ...this.localProfile, isHost: true };
        this.members.push(localMember);

        this.initChannel(roomId);
        this.setupPartyUI();
        
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) chatMessages.innerHTML = '';
        this.addMessageToChat(null, null, null, `Watch Together CineParty Room ${roomId} Created!`, false, true);
        this.addMessageToChat(null, null, null, `Tip: Share the room code or URL with friends to co-watch.`, false, true);

        this.renderMembersList();
        this.startSyncTimer();
        this.showNotification(`Hosted party room: ${roomId}`);
    }

    joinRoom(roomId) {
        const profileStr = sessionStorage.getItem('activeProfile');
        if (!profileStr) {
            sessionStorage.setItem('pending_room', roomId);
            initProfileGate();
            return;
        }

        this.localProfile = JSON.parse(profileStr);
        this.roomId = roomId;
        this.isActive = true;
        this.isHost = false;
        this.members = [];
        this.chatHistory = [];
        this.playbackState = 'paused';
        this.playbackTime = 0;

        const localMember = { ...this.localProfile, isHost: false };
        this.members.push(localMember);

        this.initChannel(roomId);
        this.setupPartyUI();

        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) chatMessages.innerHTML = '';
        this.addMessageToChat(null, null, null, `Connecting to room ${roomId}...`, false, true);

        this.renderMembersList();
        this.broadcastJoin();
        this.startSyncTimer();
        this.showNotification(`Joining watch party: ${roomId}`);
    }

    leaveRoom() {
        if (!this.isActive) return;

        this.broadcastLeave();

        if (this.channel) {
            this.channel.close();
            this.channel = null;
        }

        this.isActive = false;
        this.isHost = false;
        this.roomId = null;
        this.members = [];
        this.chatHistory = [];
        this.playbackState = 'paused';
        this.playbackTime = 0;
        
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }

        if (this.aiBuddiesTimer) {
            clearInterval(this.aiBuddiesTimer);
            this.aiBuddiesTimer = null;
        }

        const sidebarTabs = document.getElementById('sidebarTabs');
        const chatPanel = document.getElementById('chatPanel');
        const detailsPanel = document.getElementById('detailsPanel');
        const hostControlsPanel = document.getElementById('hostControlsPanel');
        const partyNavBtn = document.getElementById('partyNavBtn');

        if (sidebarTabs) sidebarTabs.style.display = 'none';
        if (chatPanel) chatPanel.style.display = 'none';
        if (detailsPanel) detailsPanel.classList.add('active');
        if (hostControlsPanel) hostControlsPanel.style.display = 'none';
        if (partyNavBtn) partyNavBtn.classList.remove('active');

        const overlay = document.getElementById('syncStatusOverlay');
        if (overlay) overlay.classList.remove('show');

        if (window.currentActiveMedia) {
            const media = window.currentActiveMedia;
            fetchDetailsAndOpen(media.item.id, media.type, media.season, media.episode);
        } else {
            toggleModal(false);
        }

        this.showNotification("Left watch party");
    }

    postMessage(data) {
        if (this.channel) {
            try {
                this.channel.postMessage({
                    senderId: this.localProfile.id,
                    senderName: this.localProfile.name,
                    senderAvatar: getProfileSVG(this.localProfile, 28),
                    senderColor1: this.localProfile.color1,
                    senderColor2: this.localProfile.color2,
                    ...data
                });
            } catch (err) {
                console.error("Failed to post message", err);
            }
        }
    }

    initChannel(roomId) {
        if (this.channel) {
            this.channel.close();
        }
        this.channel = new BroadcastChannel(`cinestream_party_${roomId}`);
        this.channel.onmessage = (e) => this.handleChannelMessage(e.data);
    }

    broadcastJoin() {
        this.postMessage({
            type: 'JOIN',
            profile: this.localProfile
        });
    }

    broadcastLeave() {
        this.postMessage({
            type: 'LEAVE',
            profile: this.localProfile
        });
    }

    broadcastStateSync(targetId) {
        this.postMessage({
            type: 'STATE_SYNC',
            targetId: targetId,
            members: this.members,
            media: window.currentActiveMedia,
            playbackState: this.playbackState,
            playbackTime: this.playbackTime,
            chatHistory: this.chatHistory
        });
    }

    broadcastMediaChange() {
        this.postMessage({
            type: 'MEDIA_CHANGE',
            media: window.currentActiveMedia
        });
    }

    broadcastPlaybackState(state, time) {
        this.playbackState = state;
        this.playbackTime = time;

        this.applyPlaybackSync(state, time);

        this.postMessage({
            type: 'PLAYBACK_STATE',
            playbackState: state,
            playbackTime: time
        });

        const hostSyncBtn = document.getElementById('hostSyncBtn');
        if (hostSyncBtn) {
            hostSyncBtn.textContent = state === 'playing' ? 'Pause Party' : 'Resume Party';
        }
    }

    broadcastChatMessage(text) {
        this.postMessage({
            type: 'CHAT_MESSAGE',
            text: text
        });
    }

    broadcastEmojiBlast(emoji) {
        this.postMessage({
            type: 'EMOJI_BLAST',
            emoji: emoji
        });
    }

    handleChannelMessage(data) {
        if (!this.isActive) return;

        switch (data.type) {
            case 'JOIN':
                this.handleMemberJoined(data);
                break;
            case 'LEAVE':
                this.handleMemberLeft(data);
                break;
            case 'STATE_SYNC':
                if (data.targetId === this.localProfile.id && !this.isHost) {
                    this.handleStateSyncReceived(data);
                }
                break;
            case 'MEDIA_CHANGE':
                if (!this.isHost) {
                    this.handleMediaChangedByHost(data);
                }
                break;
            case 'PLAYBACK_STATE':
                if (!this.isHost) {
                    this.handlePlaybackStateChangedByHost(data);
                }
                break;
            case 'CHAT_MESSAGE':
                this.addMessageToChat(data.senderName, data.senderColor1, data.senderColor2, data.text, false, false, data.senderAvatar);
                if (this.isHost) {
                    this.triggerAIBotsReply(data.senderName, data.text);
                }
                break;
            case 'EMOJI_BLAST':
                this.triggerFloatingEmoji(data.emoji);
                break;
            case 'HEARTBEAT':
                if (!this.isHost) {
                    this.lastHeartbeatTime = Date.now();
                    if (Math.abs(this.playbackTime - data.playbackTime) > 3) {
                        this.playbackTime = data.playbackTime;
                    }
                    this.members = data.members;
                    this.renderMembersList();
                }
                break;
        }
    }

    handleMemberJoined(data) {
        if (!this.members.some(m => m.id === data.profile.id)) {
            this.members.push({ ...data.profile, isHost: false });
            this.addMessageToChat(null, null, null, `${data.profile.name} joined the watch party!`, false, true);
            this.renderMembersList();
            this.triggerFloatingEmoji('like');
        }

        if (this.isHost) {
            this.broadcastStateSync(data.profile.id);
        }
    }

    handleMemberLeft(data) {
        this.members = this.members.filter(m => m.id !== data.profile.id);
        this.addMessageToChat(null, null, null, `${data.profile.name} left the watch party.`, false, true);
        this.renderMembersList();
    }

    handleStateSyncReceived(data) {
        this.members = data.members;
        this.renderMembersList();
        this.chatHistory = data.chatHistory;
        this.playbackState = data.playbackState;
        this.playbackTime = data.playbackTime;

        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) chatMessages.innerHTML = '';
        this.addMessageToChat(null, null, null, `Connected to Room ${this.roomId}!`, false, true);

        const currentMedia = window.currentActiveMedia;
        const newMedia = data.media;

        if (newMedia) {
            const isDifferent = !currentMedia || 
                                currentMedia.item.id !== newMedia.item.id || 
                                currentMedia.type !== newMedia.type ||
                                currentMedia.season !== newMedia.season ||
                                currentMedia.episode !== newMedia.episode;
            
            if (isDifferent) {
                this.addMessageToChat(null, null, null, `Loading movie: "${newMedia.item.title || newMedia.item.name}"...`, false, true);
                fetchDetailsAndOpen(newMedia.item.id, newMedia.type, newMedia.season, newMedia.episode);
            } else {
                this.applyPlaybackSync(data.playbackState, data.playbackTime);
            }
        }
    }

    handleMediaChangedByHost(data) {
        const newMedia = data.media;
        if (newMedia) {
            this.addMessageToChat(null, null, null, `Host switched content to: "${newMedia.item.title || newMedia.item.name}"`, false, true);
            fetchDetailsAndOpen(newMedia.item.id, newMedia.type, newMedia.season, newMedia.episode);
        }
    }

    handlePlaybackStateChangedByHost(data) {
        this.playbackState = data.playbackState;
        this.playbackTime = data.playbackTime;
        this.applyPlaybackSync(data.playbackState, data.playbackTime);
    }

    applyPlaybackSync(state, time) {
        const overlay = document.getElementById('syncStatusOverlay');
        const countdownNum = document.getElementById('syncCountdown');
        const titleEl = document.getElementById('syncStatusTitle');
        const msgEl = document.getElementById('syncStatusMsg');

        if (!overlay) return;

        if (state === 'paused') {
            titleEl.textContent = "Party Paused";
            msgEl.textContent = this.isHost ? "Paused by you (Host)" : "Waiting for the host to resume...";
            countdownNum.style.display = 'none';
            overlay.classList.add('show');

            if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
                try { ytPlayer.pauseVideo(); } catch(e){}
            }
        } else {
            titleEl.textContent = "Resuming Party";
            msgEl.textContent = "Syncing playback with group...";
            countdownNum.textContent = "3";
            countdownNum.style.display = 'block';
            overlay.classList.add('show');

            if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
                try { ytPlayer.seekTo(time, true); } catch(e){}
            }

            let count = 3;
            const timer = setInterval(() => {
                count--;
                if (count <= 0) {
                    clearInterval(timer);
                    overlay.classList.remove('show');
                    if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
                        try { ytPlayer.playVideo(); } catch(e){}
                    }
                } else {
                    countdownNum.textContent = count.toString();
                }
            }, 1000);
        }
    }

    startSyncTimer() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }

        this.lastHeartbeatTime = Date.now();

        this.syncTimer = setInterval(() => {
            if (this.isHost) {
                if (this.playbackState === 'playing') {
                    this.playbackTime += 1;
                    if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
                        this.playbackTime = ytPlayer.getCurrentTime();
                    }
                }

                this.postMessage({
                    type: 'HEARTBEAT',
                    playbackTime: this.playbackTime,
                    members: this.members
                });
            } else {
                if (Date.now() - this.lastHeartbeatTime > 15000) {
                    this.addMessageToChat(null, null, null, `Lost sync connection with host.`, false, true);
                    this.lastHeartbeatTime = Date.now(); 
                }

                if (this.playbackState === 'playing') {
                    this.playbackTime += 1;
                }
            }
        }, 1000);
    }

    sendChatMessage(text) {
        if (!this.isActive) return;

        this.addMessageToChat(this.localProfile.name, this.localProfile.color1, this.localProfile.color2, text, true);
        this.broadcastChatMessage(text);

        if (this.isHost) {
            this.triggerAIBotsReply(this.localProfile.name, text);
        }
    }

    addMessageToChat(senderName, color1, color2, text, isSelf = false, isSystem = false, customAvatar = null) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const msgDiv = document.createElement('div');
        
        if (isSystem) {
            msgDiv.className = 'chat-system-msg';
            msgDiv.innerHTML = text;
        } else {
            msgDiv.className = `chat-msg ${isSelf ? 'self' : 'other'}`;
            
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'chat-msg-avatar';
            
            if (isSelf) {
                avatarDiv.innerHTML = getProfileSVG(this.localProfile, 28);
            } else if (customAvatar) {
                avatarDiv.innerHTML = customAvatar;
            } else {
                const fallbackProfile = { id: 'bot', name: senderName, color1: color1 || '#a78bfa', color2: color2 || '#6366f1', icon: 'user-1' };
                avatarDiv.innerHTML = getProfileSVG(fallbackProfile, 28);
            }
            
            const bubbleDiv = document.createElement('div');
            bubbleDiv.className = 'chat-msg-bubble';
            
            const senderSpan = document.createElement('span');
            senderSpan.className = 'chat-msg-sender';
            senderSpan.textContent = senderName;
            
            const textNode = document.createTextNode(text);
            
            bubbleDiv.appendChild(senderSpan);
            bubbleDiv.appendChild(textNode);
            
            msgDiv.appendChild(avatarDiv);
            msgDiv.appendChild(bubbleDiv);
        }

        chatMessages.appendChild(msgDiv);
        this.scrollToBottom();

        if (this.isHost) {
            this.chatHistory.push({
                senderName,
                color1,
                color2,
                text,
                isSystem,
                avatarSvg: isSelf ? getProfileSVG(this.localProfile, 28) : customAvatar
            });
        }
    }

    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    showNotification(msg) {
        let toast = document.getElementById('cinestreamToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'cinestreamToast';
            toast.style.cssText = `
                position: fixed;
                bottom: 24px;
                right: 24px;
                background: rgba(139, 92, 246, 0.95);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.1);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 0.85rem;
                font-weight: 600;
                box-shadow: 0 10px 35px rgba(139,92,246,0.3);
                z-index: 100000;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.3s ease;
                pointer-events: none;
            `;
            document.body.appendChild(toast);
        }

        toast.textContent = msg;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
        }, 3000);
    }

    renderMembersList() {
        const list = document.getElementById('roomMembersList');
        if (!list) return;

        list.innerHTML = '';
        this.members.forEach(m => {
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'member-avatar';
            avatarDiv.title = m.name + (m.isHost ? ' (Host)' : '');
            avatarDiv.innerHTML = getProfileSVG(m, 24);
            list.appendChild(avatarDiv);
        });
    }

    sendEmojiBlast(emoji) {
        if (!this.isActive) return;

        this.triggerFloatingEmoji(emoji);
        this.broadcastEmojiBlast(emoji);

        if (this.isHost && Math.random() > 0.4) {
            setTimeout(() => {
                const botReactions = ['love', 'like', 'fire', 'star'];
                const botEmoji = botReactions[Math.floor(Math.random() * botReactions.length)];
                this.broadcastEmojiBlast(botEmoji);
                this.triggerFloatingEmoji(botEmoji);
            }, 600 + Math.random() * 800);
        }
    }

    _getReactionSVG(key, size) {
        const icons = {
            love: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="#ff4b82" stroke="none"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
            like: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="#3b82f6" stroke="none"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3z"/></svg>`,
            fire: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="#f97316" stroke="none"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
            star: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="#eab308" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
        };
        return icons[key] || icons['star'];
    }

    triggerFloatingEmoji(key) {
        const container = document.getElementById('emojiBlastContainer');
        if (!container) return;

        const el = document.createElement('div');
        el.className = 'floating-emoji';
        el.innerHTML = this._getReactionSVG(key, 36);
        
        const randOffset = 5 + Math.random() * 85; 
        el.style.left = `${randOffset}%`;

        container.appendChild(el);

        setTimeout(() => {
            el.remove();
        }, 3200);
    }

    setupPartyUI() {
        const sidebarTabs = document.getElementById('sidebarTabs');
        const chatPanel = document.getElementById('chatPanel');
        const detailsPanel = document.getElementById('detailsPanel');
        const hostControlsPanel = document.getElementById('hostControlsPanel');
        const partyNavBtn = document.getElementById('partyNavBtn');
        const roomCodeText = document.getElementById('roomCodeText');

        if (sidebarTabs) sidebarTabs.style.display = 'flex';
        if (chatPanel) chatPanel.style.display = 'flex';
        if (detailsPanel) detailsPanel.classList.remove('active');
        if (hostControlsPanel) {
            hostControlsPanel.style.display = this.isHost ? 'block' : 'none';
        }
        if (partyNavBtn) partyNavBtn.classList.add('active');
        if (roomCodeText) roomCodeText.textContent = `Room: ${this.roomId}`;

        const chatTabBtn = document.getElementById('chatTabBtn');
        if (chatTabBtn) chatTabBtn.click();
    }

    inviteAIBuddies() {
        if (!this.isActive) return;

        if (this.members.some(m => m.id.startsWith('bot-'))) {
            alert("Your AI Friends are already in the room!");
            return;
        }

        const bots = [
            { id: 'bot-emma', name: 'PopcornQueen Emma', color1: '#ec4899', color2: '#f43f5e', icon: 'user-3', focus: 'kids' },
            { id: 'bot-dan', name: 'MovieBuff Dan', color1: '#3b82f6', color2: '#1d4ed8', icon: 'user-1', focus: 'general' },
            { id: 'bot-leo', name: 'SciFiNerd Leo', color1: '#10b981', color2: '#047857', icon: 'user-4', focus: 'scifi' }
        ];

        bots.forEach(bot => {
            this.members.push({ ...bot, isHost: false });
            this.postMessage({
                type: 'JOIN',
                profile: bot
            });
            this.addMessageToChat(null, null, null, `${bot.name} joined the watch party!`, false, true);
        });

        this.renderMembersList();

        setTimeout(() => {
            this.sendBotMessage('bot-emma', 'Hey guys! So excited! Let me grab some popcorn.');
        }, 1000);

        setTimeout(() => {
            this.sendBotMessage('bot-dan', 'Hello everyone. Great choice of movie tonight.');
        }, 2200);

        setTimeout(() => {
            this.sendBotMessage('bot-leo', 'Woohoo! Party mode activated! Let\'s go!');
        }, 3400);

        if (this.aiBuddiesTimer) clearInterval(this.aiBuddiesTimer);
        this.aiBuddiesTimer = setInterval(() => {
            this.tickBotsComments();
        }, 32000);
    }

    sendBotMessage(botId, text) {
        const bot = this.members.find(m => m.id === botId);
        if (!bot) return;

        const avatar = getProfileSVG(bot, 28);
        
        this.addMessageToChat(bot.name, bot.color1, bot.color2, text, false, false, avatar);
        
        this.postMessage({
            type: 'CHAT_MESSAGE',
            text: text,
            senderId: bot.id,
            senderName: bot.name,
            senderAvatar: avatar,
            senderColor1: bot.color1,
            senderColor2: bot.color2
        });
    }

    tickBotsComments() {
        if (!this.isActive) return;
        const bots = this.members.filter(m => m.id.startsWith('bot-'));
        if (bots.length === 0) return;

        const activeBot = bots[Math.floor(Math.random() * bots.length)];
        
        const generalComments = [
            "This movie is visually stunning!",
            "I wonder what happens next...",
            "Wait, did you guys see that background detail?",
            "This soundtrack fits the vibe so perfectly.",
            "I really love the scripting in this scene.",
            "Let's vote: scale of 1-10, what is this movie so far?",
            "Emma, pass the popcorn!",
            "Dan, do you know if there's a sequel to this?"
        ];

        const emmaComments = [
            "Aww, this is so emotional!",
            "Omg my heart is racing right now!",
            "Emma's rating: 10/10 popcorn buckets!",
            "The casting for this is just perfect!"
        ];

        const danComments = [
            "Fact check: The director spent 6 months framing this specific sequence.",
            "This shot composition is a masterclass in visual storytelling.",
            "Notice how the lighting shifts from warm to cool to mirror the mood.",
            "The screenwriting here is highly efficient. Very little wasted exposition."
        ];

        const leoComments = [
            "The visual CGI work in this is next-level!",
            "This pacing is excellent. Keeps you right on the edge of your seat!",
            "I love the technology and set design! Looks so futuristic.",
            "That scene was absolutely legendary!"
        ];

        let commentList = generalComments;
        if (activeBot.id === 'bot-emma') commentList = emmaComments;
        else if (activeBot.id === 'bot-dan') commentList = danComments;
        else if (activeBot.id === 'bot-leo') commentList = leoComments;

        const comment = commentList[Math.floor(Math.random() * commentList.length)];
        this.sendBotMessage(activeBot.id, comment);

        if (Math.random() > 0.4) {
            setTimeout(() => {
                const reactionIcons = ['love', 'like', 'fire', 'star'];
                const reactionKey = reactionIcons[Math.floor(Math.random() * reactionIcons.length)];
                this.sendEmojiBlast(reactionKey);
            }, 1000 + Math.random() * 1000);
        }
    }

    triggerAIBotsReply(senderName, userMessage) {
        if (senderName.includes('Emma') || senderName.includes('Dan') || senderName.includes('Leo')) return;
        if (!this.buddyResponsesEnabled) return;
        
        if (Math.random() > 0.5) return;

        const msg = userMessage.toLowerCase();
        const bots = this.members.filter(m => m.id.startsWith('bot-'));
        if (bots.length === 0) return;

        const responder = bots[Math.floor(Math.random() * bots.length)];
        let replyText = "";

        if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
            replyText = `Hey ${senderName}! Glad you are watching with us.`;
        } else if (msg.includes('cool') || msg.includes('awesome') || msg.includes('wow') || msg.includes('love')) {
            replyText = `Right?! I'm totally hooked.`;
        } else if (msg.includes('bored') || msg.includes('slow') || msg.includes('bad')) {
            replyText = `Yeah, this part is a bit slow. Hope it picks up!`;
        } else if (msg.includes('scary') || msg.includes('horror') || msg.includes('creepy')) {
            replyText = `Omg, don't scare me, I'm watching in the dark!`;
        } else if (msg.includes('popcorn')) {
            replyText = `Can't watch movies without popcorn!`;
        } else {
            const genericReplies = [
                `Fully agree with you, ${senderName}!`,
                `Hmm, that's an interesting point. What do you think, Dan?`,
                `I was thinking the exact same thing!`,
                `Wait, focus on the screen, this scene is going to be epic!`
            ];
            replyText = genericReplies[Math.floor(Math.random() * genericReplies.length)];
        }

        setTimeout(() => {
            this.sendBotMessage(responder.id, replyText);
        }, 1200 + Math.random() * 1500);
    }
}

window.WatchPartyManager = new WatchPartyManagerClass();
