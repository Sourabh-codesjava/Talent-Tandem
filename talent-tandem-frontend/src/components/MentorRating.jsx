import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import './MentorRating.css';

const MentorRating = ({ mentorId }) => {
  const [rating, setRating] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMentorRating();
  }, [mentorId]);

  const loadMentorRating = async () => {
    try {
      setIsLoading(true);
      const ratingData = await ApiService.getMentorRating(mentorId);
      setRating(ratingData);
    } catch (error) {
      console.error('Error loading mentor rating:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (score) => {
    const stars = [];
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">★</span>);
      }
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="mentor-rating-card">
        <div className="rating-loader">Loading ratings...</div>
      </div>
    );
  }

  if (!rating || rating.totalReviews === 0) {
    return (
      <div className="mentor-rating-card">
        <div className="no-ratings">
          <span className="icon">⭐</span>
          <p>No ratings yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mentor-rating-card">
      <div className="rating-header">
        <h3>Mentor Rating</h3>
      </div>

      <div className="rating-overview">
        <div className="average-rating">
          <div className="rating-number">{rating.averageRating.toFixed(1)}</div>
          <div className="rating-stars">
            {renderStars(rating.averageRating)}
          </div>
          <div className="total-reviews">{rating.totalReviews} reviews</div>
        </div>
      </div>

      <div className="rating-details">
        <div className="rating-item">
          <span className="label">Clarity</span>
          <div className="rating-bar-container">
            <div 
              className="rating-bar" 
              style={{ width: `${(rating.averageClarity / 5) * 100}%` }}
            />
          </div>
          <span className="score">{rating.averageClarity.toFixed(1)}</span>
        </div>

        <div className="rating-item">
          <span className="label">Value</span>
          <div className="rating-bar-container">
            <div 
              className="rating-bar" 
              style={{ width: `${(rating.averageValue / 5) * 100}%` }}
            />
          </div>
          <span className="score">{rating.averageValue.toFixed(1)}</span>
        </div>

        <div className="rating-item">
          <span className="label">Difficulty</span>
          <div className="rating-bar-container">
            <div 
              className="rating-bar difficulty" 
              style={{ width: `${(rating.averageDifficulty / 5) * 100}%` }}
            />
          </div>
          <span className="score">{rating.averageDifficulty.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

export default MentorRating;
