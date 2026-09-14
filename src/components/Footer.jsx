import React, { useState } from 'react';
import { Film, Send } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setMsg('Thank you for subscribing to CineStream!');
      setEmail('');
      setTimeout(() => setMsg(''), 4000);
    }
  };

  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <div className="logo">Cine<span>Stream</span></div>
          <p>Your premium destination for high quality streaming and multi-season series.</p>
        </div>

        <div className="footer-links">
          <h4>Explore</h4>
          <ul>
            <li><a href="/">Trending Movies</a></li>
            <li><a href="/?type=tv">Popular TV Shows</a></li>
            <li><a href="/?category=hi">Hindi Cinema</a></li>
            <li><a href="/?category=ne">Nepali Movies</a></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Features</h4>
          <ul>
            <li><a href="#">SpeedoStream Ultra Servers</a></li>
            <li><a href="#">Custom React UI Dropdowns</a></li>
            <li><a href="#">Local Watch History</a></li>
          </ul>
        </div>

        <div className="footer-newsletter">
          <h4>Stay Updated</h4>
          <p>Subscribe for upcoming release alerts.</p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input 
              type="email" 
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <button type="submit">
              <Send size={15} />
            </button>
          </form>
          {msg && <div className="newsletter-message">{msg}</div>}
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} CineStream. Built with React & Vite for cinema lovers.</p>
      </div>
    </footer>
  );
}
