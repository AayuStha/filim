import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Film } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="netflix-404-page">
      <div className="netflix-404-content">
        <div className="error-badge-tag">
          <Film size={14} /> ERROR CODE: <strong>AAYUSH-404</strong>
        </div>

        <h1 className="netflix-404-title">Lost your way?</h1>

        <p className="netflix-404-description">
          Sorry, we can't find that page. You'll find lots of movies, series, and timelines to explore on the AAYUSH home page.
        </p>

        <div className="netflix-404-actions">
          <button className="netflix-404-btn primary" onClick={() => navigate('/')}>
            <Home size={18} />
            <span>AAYUSH Home</span>
          </button>

          <button className="netflix-404-btn secondary" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
