'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import ratingService from '@/api/ratingApi';
import { Star, ArrowLeft, AlertCircle } from 'lucide-react';

interface EditRatingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditRatingPage({ params }: EditRatingPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const ratingId = resolvedParams.id;
  
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [ratingData, setRatingData] = useState<any>(null);

  useEffect(() => {
    fetchRating();
  }, [ratingId]);

  const fetchRating = async () => {
    try {
      setIsLoading(true);
      const data = await ratingService.getRatingById(ratingId);
      setRatingData(data);
      setRating(data.rating);
      setReview(data.review || '');
    } catch (err: any) {
      console.error('Error loading rating:', err);
      setError('Gagal memuat data rating');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Silakan pilih rating');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      await ratingService.updateRating(ratingId, {
        rating,
        review: review.trim() || undefined,
      });
      
      router.push('/konsultasi/history?success=rating_updated');
    } catch (err: any) {
      console.error('Error updating rating:', err);
      setError('Gagal mengupdate rating. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus rating ini?')) return;

    try {
      await ratingService.deleteRating(ratingId);
      router.push('/konsultasi/history?success=rating_deleted');
    } catch (err: any) {
      console.error('Error deleting rating:', err);
      setError('Gagal menghapus rating. Silakan coba lagi.');
    }
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Sangat Tidak Puas';
      case 2: return 'Tidak Puas';
      case 3: return 'Biasa Saja';
      case 4: return 'Puas';
      case 5: return 'Sangat Puas';
      default: return 'Pilih Rating';
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['PACILIAN']} requiredService="rating">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !ratingData) {
    return (
      <ProtectedRoute allowedRoles={['PACILIAN']} requiredService="rating">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/konsultasi/history')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Kembali ke Riwayat
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['PACILIAN']} requiredService="rating">
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => router.push('/konsultasi/history')}
              className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Kembali ke Riwayat
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Edit Rating Anda</h2>
              <p className="text-gray-600">Perbarui penilaian dan ulasan Anda</p>
            </div>

            {/* Rating Info */}
            {ratingData && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Rating untuk Konsultasi</h4>
                <p className="text-sm text-gray-600">
                  Konsultasi ID: {ratingData.konsultasiId}
                </p>
                <p className="text-sm text-gray-600">
                  Dibuat: {new Date(ratingData.createdAt).toLocaleDateString('id-ID')}
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Bagaimana penilaian Anda terhadap konsultasi ini?
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
                          className={`w-12 h-12 transition-colors duration-200 ${
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
                  Ulasan (Opsional)
                </label>
                <textarea
                  id="review"
                  rows={4}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  placeholder="Ceritakan pengalaman Anda dengan dokter ini..."
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  <div className="flex items-start">
                    <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    {error}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className={`flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    !isSubmitting && rating > 0 ? 'transform hover:scale-[1.02]' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mengupdate...
                    </>
                  ) : (
                    'Update Rating'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 py-3 px-4 border border-red-300 rounded-lg shadow-sm text-base font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                >
                  Hapus Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}