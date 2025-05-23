"use client"
import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import RatingCard from '../elements/RatingCard';
import { getCaregiverRatingStats, RatingStats } from '@/services/rating';

// Dummy data for demonstration
const dummyStats: RatingStats = {
  caregiverId: "123",
  averageRating: 4.5,
  totalRatings: 8,
  ratings: [
    {
      id: "1",
      konsultasiId: "k1",
      pacilianId: "p1",
      caregiverId: "123",
      rating: 5,
      review: "Excellent service! The doctor was very professional and thorough in explaining everything. Highly recommended!",
      pacilianName: "John Doe",
      createdAt: "2024-03-15T10:30:00Z",
      updatedAt: "2024-03-15T10:30:00Z"
    },
    {
      id: "2",
      konsultasiId: "k2",
      pacilianId: "p2",
      caregiverId: "123",
      rating: 4,
      review: "Very good consultation. The doctor was knowledgeable and patient.",
      pacilianName: "Jane Smith",
      createdAt: "2024-03-14T15:45:00Z",
      updatedAt: "2024-03-14T15:45:00Z"
    },
    {
      id: "3",
      konsultasiId: "k3",
      pacilianId: "p3",
      caregiverId: "123",
      rating: 5,
      review: "Amazing experience! The doctor was very caring and attentive.",
      pacilianName: "Mike Johnson",
      createdAt: "2024-03-13T09:15:00Z",
      updatedAt: "2024-03-13T09:15:00Z"
    },
    {
      id: "4",
      konsultasiId: "k4",
      pacilianId: "p4",
      caregiverId: "123",
      rating: 4,
      review: "Great consultation. The doctor explained everything clearly.",
      pacilianName: "Sarah Williams",
      createdAt: "2024-03-12T14:20:00Z",
      updatedAt: "2024-03-12T14:20:00Z"
    },
    {
      id: "5",
      konsultasiId: "k5",
      pacilianId: "p5",
      caregiverId: "123",
      rating: 5,
      review: "Outstanding service! The doctor was very thorough and professional.",
      pacilianName: "David Brown",
      createdAt: "2024-03-11T11:00:00Z",
      updatedAt: "2024-03-11T11:00:00Z"
    }
  ]
};

interface AllRatingDoctorProps {
  caregiverId: string;
}

const AllRatingDoctor: React.FC<AllRatingDoctorProps> = ({ caregiverId }) => {
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Simulate API call with dummy data
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(dummyStats);
      } catch (err) {
        setError('Failed to load ratings');
        console.error('Error loading ratings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [caregiverId]);

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

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const decimalPart = rating - fullStars;
    const stars = [];

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="w-6 h-6 fill-yellow-400 text-yellow-400"
        />
      );
    }

    // Add partial star if there's a decimal part
    if (decimalPart > 0) {
      const percentage = Math.round(decimalPart * 100);
      stars.push(
        <div key="partial" className="relative w-6 h-6">
          <Star className="w-6 h-6 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden" style={{ width: `${percentage}%` }}>
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      );
    }

    // Add empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star
          key={`empty-${i}`}
          className="w-6 h-6 text-gray-300"
        />
      );
    }

    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Stats Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Rating Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-50 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {stats?.averageRating.toFixed(1) || '0.0'}
              </div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {stats?.totalRatings || 0}
              </div>
              <div className="text-gray-600">Total Ratings</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-6 text-center">
              <div className="flex justify-center items-center mb-2">
                {renderStars(stats?.averageRating || 0)}
              </div>
              <div className="text-gray-600">Overall Rating</div>
            </div>
          </div>
        </div>

        {/* Ratings List */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">All Ratings</h3>
          {stats?.ratings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No ratings yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats?.ratings.map((rating) => (
                <RatingCard key={rating.id} rating={rating} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllRatingDoctor;