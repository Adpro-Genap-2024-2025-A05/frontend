import React from 'react';
import { Star, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Rating } from '@/services/rating';

interface RatingCardProps {
  rating: Rating
  isUserRating?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const RatingCard: React.FC<RatingCardProps> = ({ 
  rating, 
  isUserRating = false,
  onEdit,
  onDelete 
}) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/ratings/${rating.id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(rating.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(rating.id);
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{rating.pacilianName}</h3>
          <p className="text-sm text-gray-500">
            {format(new Date(rating.createdAt), 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                className={`w-5 h-5 ${
                  index < rating.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      </div>
      
      {rating.review && (
        <p className="text-gray-700 mt-2 line-clamp-3">{rating.review}</p>
      )}

      {isUserRating && (
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleEditClick}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit rating"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete rating"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default RatingCard;