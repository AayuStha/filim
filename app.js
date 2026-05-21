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
    fetchContent();
    setupEventListeners();
    fetchGenres();
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
        
        videoPlayer.src = 'about:blank';
        setTimeout(() => {
            videoPlayer.src = targetUrl;
            saveToHistory(item, isTV ? currentSeason : null, isTV ? currentEpisode : null);
        }, 100);
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
        opt.textContent = isKidsLocked ? `🔒 ${genre.name}` : genre.name;
        
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
            showKidsRestrictionToast(selectedOpt.textContent.replace('🔒 ', ''));
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
