import AllRatingByUser from '@/components/rating/AllRatingByUser';

interface PacilianRatingPageProps {
  params: {
    id: string;
  };
}

export default function PacilianRatingPage({ params }: PacilianRatingPageProps) {
  if (!localStorage.getItem('token')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Authentication required</div>
      </div>
    );
  }

  return <AllRatingByUser pacilianId={params.id} />;
} 