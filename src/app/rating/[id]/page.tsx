"use client"
import RatingDetail from '@/components/rating/RatingDetail';
import { useEffect, useState } from 'react';

interface RatingPageProps {
  params: {
    id: string;
  };
}

export default function RatingPage({ params }: RatingPageProps) {
  const [isUserRating, setIsUserRating] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setIsUserRating(!!userId);
  }, []);

  return (
    <RatingDetail 
      ratingId={params.id} 
      isUserRating={isUserRating}
    />
  );
} 