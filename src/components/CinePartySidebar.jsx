import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, Info, Copy, LogOut, Bot, Pause, Play, 
  Heart, ThumbsUp, Flame, Star, Send, Link2, Users, User, Edit2, Check, RefreshCw
} from 'lucide-react';
import { io } from 'socket.io-client';

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function getUserName() {
  let name = localStorage.getItem('cinestream_username');
  if (!name) {
    name = 'User_' + Math.floor(Math.random() * 9000 + 1000);
    localStorage.setItem('cinestream_username', name);
  }
  return name;
}

export default function CinePartySidebar({ 
  roomId: initialRoomId, 
  onLeave, 
  onSendReaction, 
  mediaDetails,
  isHost = false,
  mediaType,
  mediaId,
  selectedServer,
  season,
  episode,
  onHostTogglePlayback,
  onMediaSynced
}) {
  const [activeTab, setActiveTab] = useState('chat');
  const [roomId, setRoomId] = useState(initialRoomId || '');
  const [isInRoom, setIsInRoom] = useState(false);
  const [joinInput, setJoinInput] = useState('');
  
  // User name state
  const [userName, setUserName] = useState(getUserName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const chatBottomRef = useRef(null);
  const socketRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ---------- Socket.io Real-Time Connection ----------
  const connectSocket = useCallback((code) => {
    if (!code) return;
    const roomCode = code.toUpperCase();

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-room', { roomCode, userName });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('room-updated', ({ members: roomMembers, messages: roomMsgs }) => {
      setMembers(roomMembers || []);
      if (roomMsgs && roomMsgs.length > 0) {
        setMessages(roomMsgs);
      }
    });

    socket.on('new-message', (msg) => {
      setMessages(prev => {
        if (msg.type === 'system' && prev.some(m => m.type === 'system' && m.text === msg.text)) {
          return prev;
        }
        return [...prev, msg];
      });
    });

    socket.on('new-reaction', ({ reaction }) => {
      if (onSendReaction) onSendReaction(reaction);
    });

    socket.on('playback-synced', ({ action }) => {
      if (onHostTogglePlayback) onHostTogglePlayback(action);
    });

    socket.on('media-synced', ({ server, season: s, episode: e }) => {
      if (onMediaSynced) onMediaSynced({ server, season: s, episode: e });
    });

    return socket;
  }, [userName, onSendReaction, onHostTogglePlayback, onMediaSynced]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Auto-create room if host
  useEffect(() => {
    if (isHost && !isInRoom) {
      const code = initialRoomId || generateRoomCode();
      setRoomId(code);
      setIsInRoom(true);
      connectSocket(code);
    }
  }, [isHost, isInRoom, initialRoomId, connectSocket]);

  // Auto-join if roomId was passed via URL
  useEffect(() => {
    if (initialRoomId && !isInRoom && !isHost) {
      setRoomId(initialRoomId);
      setIsInRoom(true);
      connectSocket(initialRoomId);
    }
  }, [initialRoomId, isInRoom, isHost, connectSocket]);

  // ---------- Name Change Handler ----------
  const handleSaveName = (e) => {
    if (e) e.preventDefault();
    const newName = nameInput.trim();
    if (!newName) return;

    const oldName = userName;
    setUserName(newName);
    localStorage.setItem('cinestream_username', newName);
    setIsEditingName(false);

    if (socketRef.current && isConnected && isInRoom) {
      socketRef.current.emit('change-name', { roomCode: roomId, oldName, newName });
    }
  };

  // ---------- User Actions ----------
  const handleCreateRoom = () => {
    const code = generateRoomCode();
    setRoomId(code);
    setIsInRoom(true);
    connectSocket(code);
  };

  const handleJoinRoom = () => {
    const code = joinInput.trim().toUpperCase();
    if (code.length < 4) return;
    setRoomId(code);
    setIsInRoom(true);
    connectSocket(code);
    setJoinInput('');
  };

  const handleLeaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsInRoom(false);
    setRoomId('');
    setMembers([]);
    setMessages([]);
    if (onLeave) onLeave();
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const text = chatInput.trim();
    setChatInput('');

    if (socketRef.current && isConnected) {
      socketRef.current.emit('send-chat', { roomCode: roomId, text });
    } else {
      setMessages(prev => [...prev, { type: 'user', sender: userName, text, timestamp: Date.now() }]);
    }

    // AI bot replies
    if (members.some(m => m.id.startsWith('bot-'))) {
      setTimeout(() => {
        const botNames = ['PopcornQueen Emma', 'MovieBuff Dan', 'SciFiNerd Leo'];
        const randomBot = botNames[Math.floor(Math.random() * botNames.length)];
        let reply = 'This scene is epic!';
        const lower = text.toLowerCase();
        if (lower.includes('hi') || lower.includes('hey') || lower.includes('hello')) {
          reply = 'Hey! Super excited to co-watch this with you!';
        } else if (lower.includes('good') || lower.includes('nice') || lower.includes('great')) {
          reply = 'Totally agree! Awesome pick for tonight.';
        }
        setMessages(prev => [...prev, { type: 'user', sender: randomBot, text: reply, timestamp: Date.now() }]);
      }, 1200);
    }
  };

  const handleReaction = (key) => {
    if (onSendReaction) onSendReaction(key);
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send-reaction', { roomCode: roomId, reaction: key });
    }
  };

  const handleAddBots = () => {
    if (members.some(m => m.id.startsWith('bot-'))) return;
    const newBots = [
      { id: 'bot-1', name: 'PopcornQueen Emma' },
      { id: 'bot-2', name: 'MovieBuff Dan' },
      { id: 'bot-3', name: 'SciFiNerd Leo' }
    ];
    setMembers(prev => [...prev, ...newBots]);
    setMessages(prev => [
      ...prev,
      { type: 'system', text: 'PopcornQueen Emma, MovieBuff Dan, and SciFiNerd Leo joined!' },
      { type: 'user', sender: 'PopcornQueen Emma', text: 'Hey everyone! Ready for movie night!' }
    ]);
  };

  const copyInviteLink = () => {
    const url = `${window.location.origin}/watch/${mediaType || 'movie'}/${mediaId || '0'}?room=${roomId}`;
    navigator.clipboard.writeText(url).then(() => {
      setMessages(prev => [...prev, { type: 'system', text: 'Invite link copied to clipboard!' }]);
    }).catch(() => {
      setMessages(prev => [...prev, { type: 'system', text: `Share Code: ${roomId}` }]);
    });
  };

  const handleHostSync = (action) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('sync-action', { roomCode: roomId, action });
    }
    if (onHostTogglePlayback) onHostTogglePlayback(action);
  };

  const handleSyncServerToRoom = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('sync-media', { 
        roomCode: roomId, 
        server: selectedServer, 
        season, 
        episode 
      });
    }
  };

  // ---------- Pre-Room Lobby ----------
  if (!isInRoom) {
    return (
      <aside className="player-sidebar">
        <div className="sidebar-tabs">
          <button className="sidebar-tab active">
            <Users size={14} />
            <span>CineParty Watch Together</span>
          </button>
        </div>
        <div className="party-lobby">
          <div className="party-lobby-header">
            <Users size={36} style={{ color: 'var(--accent)' }} />
            <h3>Real-Time Watch Party</h3>
            <p>Sync playback & chat across any browser window, incognito tab, or mobile device!</p>
          </div>

          {/* User Name Config Strip */}
          <div className="party-user-name-config">
            <label className="party-name-label">
              <User size={12} /> Display Name:
            </label>
            <form onSubmit={handleSaveName} className="party-name-form">
              <input 
                type="text" 
                value={nameInput} 
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your name..." 
                maxLength={20}
              />
              {nameInput !== userName && (
                <button type="submit" className="save-name-btn" title="Save Name">
                  <Check size={13} />
                </button>
              )}
            </form>
          </div>

          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCreateRoom}>
            <Play size={15} /> Host New Party Room
          </button>

          <div className="party-divider">
            <div className="party-divider-line" />
            <span>or join with code</span>
            <div className="party-divider-line" />
          </div>

          <div className="party-join-input-group">
            <input 
              type="text" 
              placeholder="ENTER ROOM CODE" 
              maxLength={6}
              value={joinInput}
              onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
            />
            <button className="party-action-btn" onClick={handleJoinRoom}>
              <Link2 size={13} /> Join
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // ---------- Active Room ----------
  return (
    <aside className="player-sidebar">
      <div className="sidebar-tabs">
        <button 
          className={`sidebar-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageSquare size={14} />
          <span>Party Chat</span>
        </button>
        <button 
          className={`sidebar-tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          <Info size={14} />
          <span>Info & Controls</span>
        </button>
      </div>

      {activeTab === 'chat' && (
        <div className="tab-panel active">
          <div className="room-status-bar">
            <div className="room-info">
              <span className="room-tag">{isConnected ? 'LIVE SYNC' : 'OFFLINE'}</span>
              <span className="room-code">{roomId}</span>
            </div>
            <div className="room-actions">
              <button className="room-control-mini" onClick={copyInviteLink} title="Copy Invite Link">
                <Copy size={12} />
              </button>
              <button className="room-control-mini danger" onClick={handleLeaveRoom} title="Leave Room">
                <LogOut size={12} />
              </button>
            </div>
          </div>

          {/* User Name Bar with Edit Option */}
          <div className="active-user-bar">
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="active-name-form">
                <input 
                  type="text" 
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoFocus
                  maxLength={20}
                />
                <button type="submit" className="save-name-mini"><Check size={12} /></button>
              </form>
            ) : (
              <div className="active-name-display" onClick={() => setIsEditingName(true)} title="Click to change your display name">
                <span>You: <strong>{userName}</strong></span>
                <Edit2 size={11} className="edit-icon" />
              </div>
            )}
          </div>

          <div className="room-members-container">
            <div className="room-members-label">Watchers ({members.length}):</div>
            <div className="room-members-list">
              {members.map((m, idx) => (
                <span key={m.id || idx} className="member-chip">
                  {m.name} {m.isHost ? '(Host)' : ''}
                </span>
              ))}
            </div>
          </div>

          <div className="chat-messages-container">
            {messages.map((m, idx) => (
              m.type === 'system' ? (
                <div key={idx} className="chat-system-msg">{m.text}</div>
              ) : (
                <div key={idx} className={`chat-msg ${m.sender === userName || m.sender === 'You' ? 'self' : 'other'}`}>
                  {m.sender !== userName && m.sender !== 'You' && <span className="chat-sender">{m.sender}</span>}
                  <span>{m.text}</span>
                </div>
              )
            ))}
            <div ref={chatBottomRef} />
          </div>

          <div className="chat-reactions-strip">
            <button className="reaction-btn" onClick={() => handleReaction('love')} title="Love">
              <Heart size={15} />
            </button>
            <button className="reaction-btn" onClick={() => handleReaction('like')} title="Like">
              <ThumbsUp size={15} />
            </button>
            <button className="reaction-btn" onClick={() => handleReaction('fire')} title="Fire">
              <Flame size={15} />
            </button>
            <button className="reaction-btn" onClick={() => handleReaction('star')} title="Star">
              <Star size={15} />
            </button>
          </div>

          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              placeholder="Type a message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              maxLength={200}
            />
            <button type="submit">
              <Send size={13} />
            </button>
          </form>

          {!members.some(m => m.id && m.id.startsWith('bot-')) && (
            <div className="bot-invite-banner">
              <span>Watching alone?</span>
              <button className="invite-bots-btn" onClick={handleAddBots}>
                <Bot size={12} style={{ marginRight: 3 }} />
                Add AI Friends
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'details' && (
        <div className="tab-panel active">
          <div className="host-controls-panel">
            <div className="host-controls-label">Synchronized Party Controls</div>
            <div className="host-controls-row" style={{ flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="host-btn" onClick={() => handleHostSync('pause')}>
                  <Pause size={12} /> Pause Party Watch
                </button>
                <button className="host-btn" onClick={() => handleHostSync('resume')}>
                  <Play size={12} /> Resume Party Watch
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="host-btn" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} onClick={() => handleHostSync('refresh')}>
                  <RefreshCw size={12} /> Sync Streams
                </button>
                <button className="host-btn" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} onClick={handleSyncServerToRoom}>
                  Sync Server to Room
                </button>
              </div>
            </div>
          </div>

          <div className="sidebar-media-details">
            {mediaDetails ? (
              <>
                <h3 className="sidebar-media-title">{mediaDetails.title || mediaDetails.name}</h3>
                <div className="sidebar-meta-row">
                  <span>{(mediaDetails.release_date || mediaDetails.first_air_date || '').split('-')[0]}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Star size={11} fill="#f59e0b" color="#f59e0b" /> 
                    {mediaDetails.vote_average ? mediaDetails.vote_average.toFixed(1) : 'N/A'}
                  </span>
                </div>
                <p className="sidebar-overview">{mediaDetails.overview || 'No description available.'}</p>
              </>
            ) : (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Loading media details...</p>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
