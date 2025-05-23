"use client"
import AllRatingCaregiver from '@/components/rating/AllRatingCaregiver';

interface CaregiverRatingPageProps {
  params: {
    id: string;
  };
}

export default function CaregiverRatingPage({ params }: CaregiverRatingPageProps) {
  return <AllRatingCaregiver caregiverId={params.id} />;
} 