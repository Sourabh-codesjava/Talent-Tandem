import React, { useState } from 'react';
import ApiService from '../services/api';
import { useUser } from '../context/UserContext';
import './FeedbackForm.css';

const FeedbackForm = ({ sessionId, mentorId, onClose }) => {
  const { user } = useUser();
  const [rating, setRating] = useState(0);
  const [difficultyLevel, setDifficultyLevel] = useState(0);
  const [clarityScore, setClarityScore] = useState(0);
  const [valueScore, setValueScore] = useState(0);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0 || difficultyLevel === 0 || clarityScore === 0 || valueScore === 0) {
      alert('Please provide all ratings');
      return;
    }

    setLoading(true);
    try {
      const feedbackData = {
        sessionId,
        rating,
        difficultyLevel,
        clarityScore,
        valueScore,
        comments,
        fromUserId: user.id,
        toUserId: mentorId
      };
      
      await ApiService.submitFeedback(feedbackData);
      alert('Feedback submitted successfully!');
      onClose();
    } catch (error) {
      alert(error.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-overlay" onClick={onClose}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <div className="feedback-header">
          <div className="feedback-icon">⭐</div>
          <h2 className="feedback-title">Session Feedback</h2>
          <p className="feedback-subtitle">Help us improve by sharing your experience</p>
        </div>
        
        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="form-group">
            <label className="form-label">
              ⭐ Overall Rating <span className="required">*</span>
            </label>
            <div className="rating-container">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className={`rating-item star ${star <= rating ? 'active' : ''}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              📊 Difficulty Level <span className="required">*</span>
            </label>
            <div className="rating-container">
              {[1, 2, 3, 4, 5].map(level => (
                <span
                  key={level}
                  onClick={() => setDifficultyLevel(level)}
                  className={`rating-item dot ${level <= difficultyLevel ? 'active difficulty' : ''}`}
                >
                  ●
                </span>
              ))}
            </div>
            <p className="rating-hint">1 = Too Easy • 5 = Too Hard</p>
          </div>

          <div className="form-group">
            <label className="form-label">
              💡 Clarity Score <span className="required">*</span>
            </label>
            <div className="rating-container">
              {[1, 2, 3, 4, 5].map(score => (
                <span
                  key={score}
                  onClick={() => setClarityScore(score)}
                  className={`rating-item dot ${score <= clarityScore ? 'active clarity' : ''}`}
                >
                  ●
                </span>
              ))}
            </div>
            <p className="rating-hint">How clear was the explanation?</p>
          </div>

          <div className="form-group">
            <label className="form-label">
              💎 Value Score <span className="required">*</span>
            </label>
            <div className="rating-container">
              {[1, 2, 3, 4, 5].map(score => (
                <span
                  key={score}
                  onClick={() => setValueScore(score)}
                  className={`rating-item dot ${score <= valueScore ? 'active value' : ''}`}
                >
                  ●
                </span>
              ))}
            </div>
            <p className="rating-hint">How valuable was this session?</p>
          </div>

          <div className="form-group">
            <label className="form-label">💬 Comments (Optional)</label>
            <div className="textarea-wrapper">
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share your experience, suggestions, or what you learned..."
                maxLength={500}
                className="feedback-textarea"
              />
              <span className="char-count">{comments.length}/500</span>
            </div>
          </div>

          <div className="button-group">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? '⏳ Submitting...' : '✓ Submit Feedback'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-secondary"
            >
              Skip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
