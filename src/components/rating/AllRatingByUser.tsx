"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RatingCard from '../elements/RatingCard';
import { getUserRatings, deleteRating, Rating } from '@/services/rating';

interface AllRatingByUserProps {
  pacilianId: string;
}

const AllRatingByUser: React.FC<AllRatingByUserProps> = ({ pacilianId }) => {
  const router = useRouter();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchRatings = async () => {
    try {
      setIsLoading(true);
      const data = await getUserRatings(pacilianId);
      setRatings(data);
    } catch (err) {
      setError('Failed to load ratings');
      console.error('Error loading ratings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [pacilianId]);

  const handleEdit = (ratingId: string) => {
    router.push(`/rating/edit/${ratingId}`);
  };

  const handleDelete = async (ratingId: string) => {
    try {
      await deleteRating(ratingId);
      setRatings(ratings.filter(rating => rating.id !== ratingId));
    } catch (err) {
      setError('Failed to delete rating');
      console.error('Error deleting rating:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Your Ratings</h2>
          <p className="mt-2 text-gray-600">Manage and view all your ratings</p>
        </div>

        {ratings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">You haven't created any ratings yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ratings.map((rating) => (
              <RatingCard
                key={rating.id}
                rating={rating}
                isUserRating={true}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllRatingByUser;