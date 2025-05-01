import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import SideBar from './BuyerSideBar';
import './Rating.css';

const Rating = ({ reviews = [] }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [allReviews, setAllReviews] = useState(reviews);
  const [averageRating, setAverageRating] = useState(0);

  const navigate = useNavigate();

  // ✅ Extract vehicleId and userId from URL
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const vehicleId = queryParams.get("vehicleId");
  const id = queryParams.get("id");

  useEffect(() => {
    console.log("Extracted vehicleId:", vehicleId);
    console.log("Extracted userId:", id);

    if (reviews.length) {
      const avg = (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1);
      setAverageRating(avg);
    }
  }, [vehicleId, id, reviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating) {
      alert('Please select a rating');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:3000/buyer/${vehicleId}/rating`, {
        userId:id,
        rating,
        comment,
      });

      if (response.status === 200) {
        setAllReviews(response.data.vehicle.reviews);
        setAverageRating(response.data.vehicle.rating);
        setRating(0);
        setComment('');
        navigate(`/rented-vehicles/${id}`)
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  return (
    <div className='app'>
      <nav className='sidebar'>
        <SideBar activeLink={location.pathname} id={id} />
      </nav>
      <div className='main-content'>
        <div className="reviews-container">
          <div className="reviews-summary">
            <h2>Customer Reviews</h2>
            <div className="average-rating">
              <span className="rating-number">{averageRating}</span>
              <div className="stars-display">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`star ${star <= averageRating ? 'filled' : ''}`} size={24} />
                ))}
              </div>
              <span className="review-count">({allReviews.length} reviews)</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="review-form">
            <h3>Write a Review</h3>
            <div className="rating-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`star ${star <= (hoveredRating || rating) ? 'filled' : ''}`}
                  size={28}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                />
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this vehicle..."
              className="review-textarea"
              required
            />
            <button type="submit" className="submit-review-btn">
              Submit Review
            </button>
          </form>

          <div className="reviews-list">
            {allReviews.map((review, index) => (
              <div key={index} className="review-card">
                <div className="review-header">
                  <div className="stars-display">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`star ${star <= review.rating ? 'filled' : ''}`} size={16} />
                    ))}
                  </div>
                  <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="review-comment">{review.comment}</p>
                <div className="review-footer">
                  <span className="reviewer-name">{review.buyer?.name || 'Anonymous'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rating;
