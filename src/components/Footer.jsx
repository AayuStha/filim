import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Globe, MessageSquare, PlayCircle, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="netflix-footer">
      <div className="footer-container">
        {/* Social Icons */}
        <div className="footer-social-row">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
            <Globe size={20} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" title="Twitter">
            <MessageSquare size={20} />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" title="YouTube">
            <PlayCircle size={20} />
          </a>
          <Link to="/" aria-label="AAYUSH Movies" title="AAYUSH">
            <Film size={20} />
          </Link>
        </div>

        {/* Links Grid */}
        <div className="footer-links-grid">
          <ul className="footer-column">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/timelines">Franchise Timelines</Link></li>
            <li><Link to="/browse/movie">Trending Movies</Link></li>
          </ul>

          <ul className="footer-column">
            <li><Link to="/browse/tv">Popular TV Shows</Link></li>
            <li><Link to="/genre/28?name=Action&type=movie">Action Movies</Link></li>
            <li><Link to="/genre/878?name=Sci-Fi&type=movie">Sci-Fi Cinema</Link></li>
          </ul>

          <ul className="footer-column">
            <li><Link to="/browse/mylist">My Watchlist</Link></li>
            <li><Link to="/genre/35?name=Comedy&type=movie">Comedies</Link></li>
            <li><Link to="/genre/27?name=Horror&type=movie">Horror Thrillers</Link></li>
          </ul>

          <ul className="footer-column">
            <li><Link to="/browse/trending">New & Popular</Link></li>
            <li><Link to="/timelines">Marvel Watch Order</Link></li>
            <li><Link to="/timelines">DC Chronology</Link></li>
          </ul>
        </div>

        {/* Copyright & Disclaimer */}
        <div className="footer-disclaimer-wrapper">
          <p className="copyright-text">
            © {new Date().getFullYear()} AAYUSH. Built for cinema enthusiasts worldwide.
          </p>
          <p className="disclaimer-text">
            AAYUSH does not store any files on its servers. All streams are embedded from external non-affiliated providers.
          </p>
        </div>
      </div>
    </footer>
  );
}
