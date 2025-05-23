"use client"
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getRatingById, updateRating } from '@/services/rating';

interface EditRatingProps {
  ratingId: string;
}

const EditRating: React.FC<EditRatingProps> = ({ ratingId }) => {
  const router = useRouter();
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchRating = async () => {
      try {
        setIsLoading(true);
        const data = await getRatingById(ratingId);
        setRating(data.rating);
        setReview(data.review || '');
      } catch (err) {
        setError('Failed to load rating');
        console.error('Error loading rating:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRating();
  }, [ratingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await updateRating(ratingId, {
        rating,
        review: review.trim() || undefined,
      });
      
      router.push('/rating/success');
    } catch (err) {
      setError('Failed to update rating. Please try again.');
      console.error('Error updating rating:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Very Dissatisfied';
      case 2: return 'Dissatisfied';
      case 3: return 'Neutral';
      case 4: return 'Satisfied';
      case 5: return 'Very Satisfied';
      default: return 'Select a rating';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Edit Your Rating</h2>
          <p className="text-gray-600">Update your feedback to help us improve our services</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">
              How would you rate your experience?
            </label>
            <div className="flex flex-col items-center space-y-4">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transform transition-transform duration-200 hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors duration-200 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className={`text-lg font-medium transition-colors duration-200 ${
                rating ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {getRatingText(hoveredRating || rating)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label htmlFor="review" className="block text-sm font-semibold text-gray-700">
              Share your thoughts (Optional)
            </label>
            <textarea
              id="review"
              rows={4}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
              placeholder="Tell us about your experience..."
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-[1.02]'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              'Update Rating'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditRating; 