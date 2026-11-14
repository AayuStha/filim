import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronRight as ArrowLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import MovieCard from './MovieCard';

export default function MovieRow({ 
  title, 
  fetchUrl = null, 
  items: propItems = null, 
  type = 'movie', 
  isTop10 = false,
  isLandscape = false,
  seeMoreLink = null 
}) {
  const [items, setItems] = useState(propItems || []);
  const [isLoading, setIsLoading] = useState(!propItems && !!fetchUrl);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const rowSliderRef = useRef(null);

  useEffect(() => {
    if (propItems) {
      setItems(propItems);
      setIsLoading(false);
      return;
    }

    if (!fetchUrl) return;

    let isMounted = true;
    setIsLoading(true);

    fetch(fetchUrl)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          const results = data.results || [];
          setItems(results);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error(`Error loading row [${title}]:`, err);
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [fetchUrl, propItems, title]);

  const updateScrollButtons = () => {
    if (!rowSliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowSliderRef.current;
    setCanScrollLeft(scrollLeft > 20);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 20);
  };

  const handleScroll = (direction) => {
    if (!rowSliderRef.current) return;
    const container = rowSliderRef.current;
    const scrollAmount = container.clientWidth * 0.85;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const slider = rowSliderRef.current;
    if (!slider) return;
    slider.addEventListener('scroll', updateScrollButtons, { passive: true });
    updateScrollButtons();
    return () => slider.removeEventListener('scroll', updateScrollButtons);
  }, [items]);

  if (!isLoading && items.length === 0) return null;

  return (
    <div className={`netflix-movie-row ${isTop10 ? 'top10-row' : ''}`}>
      <div className="row-header">
        <h3 className="row-title">
          {seeMoreLink ? (
            <Link to={seeMoreLink} className="row-title-link">
              <span>{title}</span>
              <span className="explore-all">Explore All <ArrowLink size={14} /></span>
            </Link>
          ) : (
            title
          )}
        </h3>
      </div>

      <div className="row-slider-container">
        {canScrollLeft && (
          <button 
            className="row-nav-arrow arrow-left" 
            onClick={() => handleScroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft size={36} />
          </button>
        )}

        <div className="row-items-scroller" ref={rowSliderRef}>
          {isLoading ? (
            Array.from({ length: 7 }).map((_, idx) => (
              <div key={idx} className={`skeleton-movie-card ${isLandscape ? 'landscape' : ''}`} />
            ))
          ) : (
            items.map((item, index) => (
              <MovieCard 
                key={`${item.id}-${index}`} 
                item={item} 
                type={item.media_type || type}
                rank={isTop10 ? index + 1 : null}
                isLandscape={isLandscape}
              />
            ))
          )}
        </div>

        {canScrollRight && (
          <button 
            className="row-nav-arrow arrow-right" 
            onClick={() => handleScroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight size={36} />
          </button>
        )}
      </div>
    </div>
  );
}

