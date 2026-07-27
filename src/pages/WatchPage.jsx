import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Server, MessageSquare, Heart, ThumbsUp, Flame, Star, 
  Pause, Play, RefreshCw, Users, Link2, Copy, Shield, Film
} from 'lucide-react';
import CustomSelect from '../components/CustomSelect';
import CinePartySidebar from '../components/CinePartySidebar';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'f69f2c8f33e02716fb1c44a6941396f8';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const REACTION_ICONS = {
  love: Heart,
  like: ThumbsUp,
  fire: Flame,
  star: Star,
};

export default function WatchPage() {
  const { type = 'movie', id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const season = searchParams.get('s') || '1';
  const episode = searchParams.get('e') || '1';
  const roomParam = searchParams.get('room') || '';
  const isPartyHost = searchParams.get('party') === 'true' || !!roomParam;

  const [mediaDetails, setMediaDetails] = useState(null);
  const [selectedServer, setSelectedServer] = useState('SpeedoStream (Ultra)');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [floatingReactions, setFloatingReactions] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null); // null | 'paused'
  const [playerKey, setPlayerKey] = useState(Date.now());
  const [toastMsg, setToastMsg] = useState('');
  
  // HTML5 direct video player toggle option
  const [useDirectPlayer, setUseDirectPlayer] = useState(false);
  const videoRef = useRef(null);
  const iframeRef = useRef(null);

  const serverOptions = [
    { label: 'SpeedoStream (Ultra)', value: 'SpeedoStream (Ultra)' },
    { label: 'VsEmbed (Main)', value: 'VsEmbed (Main)' },
    { label: 'VidSrc.vip', value: 'VidSrc.vip' },
    { label: 'SmashyStream', value: 'SmashyStream' },
    { label: 'MultiEmbed', value: 'MultiEmbed' },
    { label: 'VidSrc.me', value: 'VidSrc.me' },
    { label: 'VidSrc.to', value: 'VidSrc.to' },
    { label: 'Embed.su', value: 'Embed.su' },
    { label: 'AutoEmbed', value: 'AutoEmbed' },
  ];

  useEffect(() => {
    async function fetchMedia() {
      try {
        const res = await fetch(`${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`);
        const data = await res.json();
        setMediaDetails(data);
        saveToHistory(data);
      } catch (err) {
        console.error('Error fetching media info:', err);
      }
    }
    if (id) fetchMedia();
  }, [type, id]);

  const saveToHistory = (item) => {
    let history = JSON.parse(localStorage.getItem('cinestream_history')) || [];
    history = history.filter(h => h.id !== item.id);
    history.unshift({
      id: item.id,
      type: type,
      title: item.title || item.name,
      poster_path: item.poster_path,
      season: type === 'tv' ? season : null,
      episode: type === 'tv' ? episode : null,
      timestamp: Date.now()
    });
    if (history.length > 20) history = history.slice(0, 20);
    localStorage.setItem('cinestream_history', JSON.stringify(history));
  };

  const getEmbedUrl = () => {
    const isTV = type === 'tv';
    const s = season;
    const e = episode;

    const urls = {
      'SpeedoStream (Ultra)': `https://vsembed.ru/embed/${type}/${id}${isTV ? `/${s}/${e}` : ''}`,
      'VsEmbed (Main)': `https://vsembed.ru/embed/${type}/${id}${isTV ? `/${s}/${e}` : ''}`,
      'VidSrc.vip': `https://vidsrc.vip/embed/${type}/${id}${isTV ? `/${s}/${e}` : ''}`,
      'SmashyStream': `https://embed.smashystream.com/playere.php?tmdb=${id}${isTV ? `&s=${s}&e=${e}` : ''}`,
      'MultiEmbed': `https://multiembed.mov/directstream.php?video_id=${id}${isTV ? `&s=${s}&e=${e}` : ''}`,
      'VidSrc.me': `https://vidsrc.me/embed/${type}/${id}${isTV ? `/${s}/${e}` : ''}`,
      'VidSrc.to': `https://vidsrc.to/embed/${type}/${id}${isTV ? `/${s}/${e}` : ''}`,
      'Embed.su': `https://embed.su/embed/${type}/${id}${isTV ? `/${s}/${e}` : ''}`,
      'AutoEmbed': `https://player.autoembed.cc/embed/${type}/${id}${isTV ? `/${s}/${e}` : ''}`
    };

    return urls[selectedServer] || urls['SpeedoStream (Ultra)'];
  };

  // Trigger postMessage or HTML5 video methods
  const triggerPlayerControl = useCallback((cmd) => {
    if (useDirectPlayer && videoRef.current) {
      if (cmd === 'pause') videoRef.current.pause();
      if (cmd === 'play' || cmd === 'resume') videoRef.current.play().catch(() => {});
      return;
    }

    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        const win = iframeRef.current.contentWindow;
        win.postMessage(JSON.stringify({ event: 'command', func: cmd === 'pause' ? 'pauseVideo' : 'playVideo' }), '*');
        win.postMessage(JSON.stringify({ event: cmd }), '*');
        win.postMessage(cmd, '*');
      }
    } catch (err) {
      console.warn('postMessage to video iframe failed:', err);
    }
  }, [useDirectPlayer]);

  const handleHostTogglePlayback = useCallback((action) => {
    if (action === 'pause') {
      setSyncStatus('paused');
      triggerPlayerControl('pause');
      showToast('Party Playback Paused by Watcher');
    } else if (action === 'resume') {
      setSyncStatus(null);
      triggerPlayerControl('resume');
      showToast('Party Playback Resumed');
    } else if (action === 'refresh') {
      setPlayerKey(Date.now());
      showToast('Video Stream Synced for Everyone');
    }
  }, [triggerPlayerControl]);

  const handleMediaSynced = useCallback(({ server }) => {
    if (server && serverOptions.some(s => s.value === server)) {
      setSelectedServer(server);
      showToast(`Party changed server to ${server}`);
    }
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSendReaction = useCallback((reactionKey) => {
    const newId = Date.now() + Math.random();
    const leftOffset = 10 + Math.random() * 80;
    setFloatingReactions(prev => [...prev, { id: newId, key: reactionKey, left: leftOffset }]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== newId));
    }, 3000);
  }, []);

  const title = mediaDetails ? (mediaDetails.title || mediaDetails.name) : 'Loading...';
  const detailsUrl = type === 'tv' 
    ? `/details/${type}/${id}?season=${season}`
    : `/details/${type}/${id}`;

  return (
    <div className="watch-page">
      <header className="watch-header">
        <div className="watch-header-inner">
          <div className="watch-header-left">
            <div className="logo" onClick={() => navigate('/')} style={{ fontSize: '1.2rem' }}>
              Cine<span>Stream</span>
            </div>
            <button className="back-link-btn" onClick={() => navigate(detailsUrl)}>
              <ArrowLeft size={15} /> Details
            </button>
          </div>

          <div className="watch-header-center">
            <h2 className="watch-media-title">
              {title} {type === 'tv' ? `· S${season} E${episode}` : ''}
            </h2>
          </div>

          <div className="watch-header-right">
            <div className="server-custom-select">
              <CustomSelect 
                options={serverOptions}
                value={selectedServer}
                onChange={setSelectedServer}
                icon={Server}
                placeholder="Server"
              />
            </div>

            <button 
              className="theme-toggle" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle CineParty Sidebar"
            >
              <MessageSquare size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="watch-workspace">
        <div className={`video-container ${!sidebarOpen ? 'full-width' : ''}`}>
          {/* Floating Reaction Icons */}
          <div className="emoji-blast-container">
            {floatingReactions.map(item => {
              const IconComp = REACTION_ICONS[item.key] || Star;
              return (
                <div key={item.id} className="floating-emoji" style={{ left: `${item.left}%` }}>
                  <IconComp size={18} fill="currentColor" color="white" />
                </div>
              );
            })}
          </div>

          {/* Sync Status Toast Banner */}
          {toastMsg && (
            <div className="sync-toast-banner">
              <RefreshCw size={14} className="spin-icon" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* Synchronized Playback Pause Overlay */}
          {syncStatus === 'paused' && (
            <div className="sync-status-overlay show">
              <div className="sync-status-card">
                <Pause size={48} style={{ color: 'var(--accent)', marginBottom: 12 }} />
                <h3>PARTY WATCH PAUSED</h3>
                <p>Playback is synchronized across all party tabs. Click "Resume Party Watch" to continue watching together.</p>
              </div>
            </div>
          )}

          {/* Main Video View Area */}
          <div className="video-wrapper">
            {useDirectPlayer ? (
              <video 
                ref={videoRef}
                controls 
                autoPlay
                className="direct-html5-player"
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                poster={mediaDetails ? `https://image.tmdb.org/t/p/w1280${mediaDetails.backdrop_path}` : ''}
              />
            ) : (
              <iframe 
                ref={iframeRef}
                key={`${getEmbedUrl()}_${playerKey}`}
                src={getEmbedUrl()} 
                title={title}
                frameBorder="0" 
                allowFullScreen 
                allow="autoplay; encrypted-media; fullscreen"
              />
            )}
          </div>

          {/* Real-Time Synchronized Player Control Bar (Overlaid on bottom of video container) */}
          <div className="realtime-player-bar">
            <div className="realtime-bar-left">
              <button 
                className={`sync-bar-btn ${syncStatus === 'paused' ? 'resume' : 'pause'}`}
                onClick={() => handleHostTogglePlayback(syncStatus === 'paused' ? 'resume' : 'pause')}
                title={syncStatus === 'paused' ? 'Resume Party Watch for All' : 'Pause Party Watch for All'}
              >
                {syncStatus === 'paused' ? (
                  <><Play size={14} fill="white" /> <span>Resume Party</span></>
                ) : (
                  <><Pause size={14} fill="white" /> <span>Pause Party</span></>
                )}
              </button>

              <button 
                className="sync-bar-btn secondary"
                onClick={() => handleHostTogglePlayback('refresh')}
                title="Sync Stream Timings Across All Tabs"
              >
                <RefreshCw size={14} /> <span>Sync All Tabs</span>
              </button>
            </div>

            <div className="realtime-bar-right">
              <button 
                className={`sync-bar-btn mode ${useDirectPlayer ? 'active' : ''}`}
                onClick={() => setUseDirectPlayer(!useDirectPlayer)}
                title="Toggle HTML5 Direct Player vs Stream Server"
              >
                <Film size={14} />
                <span>{useDirectPlayer ? 'HTML5 Mode' : 'Embed Mode'}</span>
              </button>
            </div>
          </div>
        </div>

        {sidebarOpen && (
          <CinePartySidebar 
            roomId={roomParam || null}
            onLeave={() => navigate('/')}
            onSendReaction={handleSendReaction}
            mediaDetails={mediaDetails}
            isHost={isPartyHost}
            mediaType={type}
            mediaId={id}
            selectedServer={selectedServer}
            season={season}
            episode={episode}
            onHostTogglePlayback={handleHostTogglePlayback}
            onMediaSynced={handleMediaSynced}
          />
        )}
      </div>
    </div>
  );
}
