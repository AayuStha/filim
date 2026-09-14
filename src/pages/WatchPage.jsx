import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Server } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'f69f2c8f33e02716fb1c44a6941396f8';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export default function WatchPage() {
  const { type = 'movie', id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const season = searchParams.get('s') || '1';
  const episode = searchParams.get('e') || '1';
  const [mediaDetails, setMediaDetails] = useState(null);
  const [selectedServer, setSelectedServer] = useState('SpeedoStream (Ultra)');

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

          </div>
        </div>
      </header>

      <div className="watch-workspace">
        <div className="video-container full-width">
          {/* Main Video View Area */}
          <div className="video-wrapper">
            <iframe 
              src={getEmbedUrl()} 
              title={title}
              frameBorder="0" 
              allowFullScreen 
              allow="autoplay; encrypted-media; fullscreen"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
