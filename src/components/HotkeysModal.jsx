import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Keyboard, Play, Tv, Sparkles, Server, Search, Volume2, Maximize, SunMedium } from 'lucide-react';

export default function HotkeysModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === '?') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcutSections = [
    {
      title: 'Navigation & Platform',
      icon: <Sparkles size={16} />,
      items: [
        { key: 'R', desc: 'Surprise Me (Film Roulette)' },
        { key: '/', desc: 'Instant Search Bar focus' },
        { key: '?', desc: 'Toggle this Shortcuts Guide' },
        { key: 'Esc', desc: 'Close any modal, drawer, or popover' }
      ]
    },
    {
      title: 'Player & Theater',
      icon: <Play size={16} />,
      items: [
        { key: 'G', desc: 'Toggle Dynamic Ambient Theater Glow' },
        { key: 'S', desc: 'Open 4K Video Server Switcher' },
        { key: 'M', desc: 'Toggle Audio Mute / Sound Stinger' },
        { key: 'F', desc: 'Toggle Fullscreen Mode' }
      ]
    },
    {
      title: 'Series & Episodes',
      icon: <Tv size={16} />,
      items: [
        { key: 'E', desc: 'Open / Close TV Episode Drawer' },
        { key: 'N', desc: 'Next Episode' },
        { key: 'P', desc: 'Previous Episode' },
        { key: 'Space', desc: 'Quick View Preview Modal' }
      ]
    }
  ];

  return createPortal(
    <div className="hotkeys-modal-overlay" onClick={onClose}>
      <div className="hotkeys-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="hotkeys-header">
          <div className="hotkeys-title-wrap">
            <Keyboard size={20} className="hotkeys-icon" />
            <h3>Keyboard Shortcuts</h3>
          </div>
          <button className="hotkeys-close-btn" onClick={onClose} aria-label="Close shortcuts">
            <X size={18} />
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div className="hotkeys-content">
          {shortcutSections.map((section, idx) => (
            <div key={idx} className="hotkeys-section">
              <div className="hotkeys-section-header">
                {section.icon}
                <h4>{section.title}</h4>
              </div>
              <div className="hotkeys-list">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="hotkeys-item-row">
                    <span className="hotkeys-desc">{item.desc}</span>
                    <kbd className="hotkeys-badge">{item.key}</kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div className="hotkeys-footer">
          <span>Pro tip: Press <kbd className="hotkeys-mini-kbd">?</kbd> anywhere on AAYUSH to toggle this cheat sheet.</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
