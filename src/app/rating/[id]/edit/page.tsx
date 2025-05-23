"use client"
import EditRating from '@/components/rating/EditRating';

interface EditRatingPageProps {
  params: {
    id: string;
  };
}

export default function EditRatingPage({ params }: EditRatingPageProps) {
  if (!localStorage.getItem('token')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Authentication required</div>
      </div>
    );
  }

  return <EditRating ratingId={params.id} />;
} 