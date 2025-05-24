'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import doctorListService, { Doctor } from '@/api/doctorListApi';
import ratingService from '@/api/ratingApi';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle, 
  Calendar,
  User,
  Award,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function DoctorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const doctorId = params.id as string;
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [ratingStats, setRatingStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);
  const [showAllRatings, setShowAllRatings] = useState(false);

  useEffect(() => {
    if (doctorId) {
      fetchDoctorDetail();
      fetchRatings();
    }
  }, [doctorId]);

  const fetchDoctorDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const doctorData = await doctorListService.getDoctorById(doctorId);
      setDoctor(doctorData);
    } catch (error) {
      console.error('Error fetching doctor detail:', error);
      setError('Gagal memuat detail dokter. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async () => {
    setRatingsLoading(true);
    try {
      const [ratingsData, statsData] = await Promise.all([
        ratingService.getRatingsByCaregiver(doctorId),
        ratingService.getCaregiverRatingStats(doctorId)
      ]);
      setRatings(ratingsData);
      setRatingStats(statsData);
    } catch (error) {
      console.error('Error fetching ratings:', error);
      // Don't set error for ratings, just log it
    } finally {
      setRatingsLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!doctor) return;
    
    setCreatingChat(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CHAT_BASE_URL}/chat/session/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          caregiver: doctor.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/chat/sessions/${result.data.id || result.sessionId}`);
      } else {
        throw new Error('Failed to create chat session');
      }
    } catch (error) {
      console.error('Error creating chat session:', error);
      alert('Gagal memulai chat. Silakan coba lagi.');
    } finally {
      setCreatingChat(false);
    }
  };

  const handleBookConsultation = () => {  
    router.push('/konsultasi/create');
  };

  const formatScheduleTime = (schedule: any) => {
    if (schedule.oneTime && schedule.specificDate) {
      return `${new Date(schedule.specificDate).toLocaleDateString('id-ID')} ${schedule.startTime}-${schedule.endTime}`;
    }
    return `${schedule.startTime}-${schedule.endTime}`;
  };

  const formatDayName = (day: string) => {
    const dayNames: { [key: string]: string } = {
      'MONDAY': 'Senin',
      'TUESDAY': 'Selasa',
      'WEDNESDAY': 'Rabu',
      'THURSDAY': 'Kamis',
      'FRIDAY': 'Jumat',
      'SATURDAY': 'Sabtu',
      'SUNDAY': 'Minggu'
    };
    return dayNames[day] || day;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const renderSmallStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const groupSchedulesByDay = () => {
    if (!doctor?.workingSchedules) return {};
    
    const grouped: { [key: string]: any[] } = {};
    
    doctor.workingSchedules.forEach(schedule => {
      if (schedule.oneTime) {
        const dateKey = `One-time: ${schedule.specificDate}`;
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(schedule);
      } else {
        const dayKey = schedule.day;
        if (!grouped[dayKey]) grouped[dayKey] = [];
        grouped[dayKey].push(schedule);
      }
    });
    
    return grouped;
  };

  const displayedRatings = showAllRatings ? ratings : ratings.slice(0, 3);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['PACILIAN']} requiredService="doctorList">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !doctor) {
    return (
      <ProtectedRoute allowedRoles={['PACILIAN']} requiredService="doctorList">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error || 'Dokter tidak ditemukan'}
            </h2>
            <button
              onClick={() => router.push('/doctors')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Kembali ke Daftar Dokter
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const groupedSchedules = groupSchedulesByDay();

  return (
    <ProtectedRoute allowedRoles={['PACILIAN']} requiredService="doctorList">
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Kembali
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Doctor Info Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Dr. {doctor.name}
                    </h1>
                    <div className="flex items-center mb-2">
                      <Award className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-lg text-blue-600 font-medium">
                        {doctor.speciality}
                      </span>
                    </div>
                    <div className="flex items-center mb-4">
                      <div className="flex">{renderStars(ratingStats?.averageRating || doctor.rating)}</div>
                      <span className="ml-3 text-sm text-gray-600">
                        {(ratingStats?.averageRating || doctor.rating).toFixed(1)} ({ratingStats?.totalRatings || doctor.totalReviews} ulasan)
                      </span>
                    </div>
                    <p className="text-gray-600">{doctor.description}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Informasi Kontak
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Alamat Praktik</p>
                      <p className="text-gray-600">{doctor.workAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Nomor Telepon</p>
                      <p className="text-gray-600">{doctor.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">{doctor.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Jadwal Praktik
                </h2>
                {Object.keys(groupedSchedules).length === 0 ? (
                  <p className="text-gray-600">Belum ada jadwal praktik yang tersedia.</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedSchedules).map(([day, schedules]) => (
                      <div key={day} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-center mb-3">
                          <Clock className="w-5 h-5 text-blue-600 mr-2" />
                          <h3 className="font-medium text-gray-900">
                            {day.startsWith('One-time') ? day : formatDayName(day)}
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {schedules.map((schedule, idx) => (
                            <div
                              key={idx}
                              className="bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                            >
                              {formatScheduleTime(schedule)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ratings Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Rating & Ulasan ({ratingStats?.totalRatings || 0})
                  </h2>
                  {ratingStats && (
                    <div className="text-right">
                      <div className="flex items-center justify-end mb-1">
                        <div className="flex mr-2">{renderStars(ratingStats.averageRating)}</div>
                        <span className="text-2xl font-bold text-gray-900">
                          {ratingStats.averageRating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Berdasarkan {ratingStats.totalRatings} ulasan
                      </p>
                    </div>
                  )}
                </div>

                {ratingsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="border rounded-lg p-4 animate-pulse">
                        <div className="flex items-center mb-2">
                          <div className="h-4 bg-gray-300 rounded w-24 mr-4"></div>
                          <div className="h-4 bg-gray-300 rounded w-32"></div>
                        </div>
                        <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : ratings.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Belum ada ulasan
                    </h3>
                    <p className="text-gray-600">
                      Jadilah yang pertama memberikan ulasan untuk dokter ini
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayedRatings.map((rating) => (
                      <div key={rating.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center mb-1">
                              <div className="flex mr-2">{renderSmallStars(rating.rating)}</div>
                              <span className="font-medium text-gray-900">
                                {rating.pacilianName}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {format(new Date(rating.createdAt), 'dd MMMM yyyy', { locale: id })}
                            </p>
                          </div>
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                            {rating.rating}/5
                          </span>
                        </div>
                        {rating.review && (
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {rating.review}
                          </p>
                        )}
                      </div>
                    ))}

                    {ratings.length > 3 && (
                      <button
                        onClick={() => setShowAllRatings(!showAllRatings)}
                        className="w-full flex items-center justify-center py-3 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {showAllRatings ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            Tampilkan Lebih Sedikit
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Tampilkan Semua Ulasan ({ratings.length})
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Action Buttons */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tindakan
                </h3>
                <div className="space-y-4">
                  {/* Chat Button */}
                  <button
                    onClick={handleStartChat}
                    disabled={creatingChat}
                    className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    {creatingChat ? 'Memulai Chat...' : 'Chat dengan Dokter'}
                  </button>

                  {/* Consultation Button */}
                  <button
                    onClick={handleBookConsultation}
                    className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Buat Jadwal Konsultasi
                  </button>

                  {/* Doctor Stats */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Statistik Dokter</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Rating:</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="font-medium">
                            {(ratingStats?.averageRating || doctor.rating).toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Ulasan:</span>
                        <span className="font-medium">
                          {ratingStats?.totalRatings || doctor.totalReviews}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Jadwal Tersedia:</span>
                        <span className="font-medium">{doctor.workingSchedules.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Speciality Badge */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-blue-900 mb-1">Spesialisasi</p>
                      <p className="text-xs text-blue-700">{doctor.speciality}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}