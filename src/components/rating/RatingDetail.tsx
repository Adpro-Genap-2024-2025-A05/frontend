"use client"
import React, { useEffect, useState } from 'react';
import { Star, ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getRatingById, deleteRating, Rating } from '@/services/rating';
import { format } from 'date-fns';
import DeleteConfirmationModal from '../elements/DeleteConfirmationModal';

interface RatingDetailProps {
  ratingId: string;
  isUserRating?: boolean;
}

const RatingDetail: React.FC<RatingDetailProps> = ({ ratingId, isUserRating = false }) => {
  const router = useRouter();
  const [rating, setRating] = useState<Rating | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        setIsLoading(true);
        const data = await getRatingById(ratingId);
        setRating(data);
      } catch (err) {
        setError('Failed to load rating details');
        console.error('Error loading rating:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRating();
  }, [ratingId]);

  const handleEdit = () => {
    router.push(`/rating/edit/${ratingId}`);
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setIsDeleting(true);
      await deleteRating(ratingId);
      router.push('/rating');
    } catch (err) {
      setError('Failed to delete rating');
      console.error('Error deleting rating:', err);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-6 h-6 ${
          index < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !rating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error || 'Rating not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          {isUserRating && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-5 h-5 mr-2" />
                Edit
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Rating Details
              </h1>
              <p className="text-gray-600">
                Posted by {rating.pacilianName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {renderStars(rating.rating)}
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Review
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {rating.review || 'No review provided'}
              </p>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Details
              </h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Rating ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{rating.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created At</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {format(new Date(rating.createdAt), 'MMMM d, yyyy h:mm a')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {format(new Date(rating.updatedAt), 'MMMM d, yyyy h:mm a')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Rating"
        message="Are you sure you want to delete this rating? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default RatingDetail; 