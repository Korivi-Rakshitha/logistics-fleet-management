import React, { useState } from 'react';
import { Star } from 'lucide-react';
import './RatingComponent.css';

const RatingComponent = ({ rating, onRatingChange, readonly = false, size = 'medium' }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };



  return (
    <div className={`rating-component ${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`star ${readonly ? 'readonly' : 'interactive'}`}
          fill={star <= (hoverRating || rating) ? '#ffc107' : 'none'}
          stroke={star <= (hoverRating || rating) ? '#ffc107' : '#e4e5e9'}
          size={size === 'small' ? 16 : size === 'large' ? 32 : 24}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: readonly ? 'default' : 'pointer' }}
        />
      ))}
      {rating > 0 && (
        <span className="rating-text">
          {rating} out of 5 stars
        </span>
      )}
    </div>
  );
};

export default RatingComponent;
