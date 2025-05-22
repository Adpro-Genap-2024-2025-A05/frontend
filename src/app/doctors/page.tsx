'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import doctorListService, { Doctor, DoctorSearchParams } from '@/api/doctorListApi';
import { Search, Star, MapPin, Phone, Mail, Clock, User } from 'lucide-react';

const SPECIALITIES = [
  'Dokter Umum',
  'Spesialis Anak',
  'Spesialis Kulit',
  'Spesialis Penyakit Dalam',
  'Spesialis THT',
  'Spesialis Kandungan',
  'Kesehatan Paru',
  'Psikiater',
  'Dokter Hewan',
  'Psikolog Klinis',
  'Spesialis Mata',
  'Seksologi & Spesialis Reproduksi Pria',
  'Spesialis Gizi Klinik',
  'Dokter Gigi',
  'Spesialis Saraf',
  'Spesialis Bedah',
  'Perawatan Rambut',
  'Bidanku',
  'Spesialis Jantung',
  'Talk Therapy Clinic',
  'Dokter Konsulen',
  'Laktasi',
  'Program Hamil',
  'Fisioterapi & Rehabilitasi',
  'Medikolegal & Hukum Kesehatan',
  'Pemeriksaan Lab',
  'Layanan Kontrasepsi',
  'Spesialisasi Lainnya'
];

const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY', 
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY'
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  const nextHour = ((i + 1) % 24).toString().padStart(2, '0');
  return {
    value: `${hour}:00`,
    label: `${hour}:00 - ${nextHour}:00`
  };
});

export default function DoctorsPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<DoctorSearchParams>({
    page: 0,
    size: 12
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [nameFilter, setNameFilter] = useState('');
  const [specialityFilter, setSpecialityFilter] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const fetchDoctors = async (params: DoctorSearchParams = searchParams) => {
    setLoading(true);
    try {
      const response = await doctorListService.searchDoctors(params);
      setDoctors(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextHour = (timeStr: string): string => {
    const [hours] = timeStr.split(':').map(Number);
    const nextHour = (hours + 1) % 24;
    return `${nextHour.toString().padStart(2, '0')}:00`;
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSearch = () => {
    const newParams: DoctorSearchParams = {
      name: nameFilter || undefined,
      speciality: specialityFilter || undefined,
      workingDay: selectedDay || undefined,
      startTime: selectedTime || undefined,
      endTime: selectedTime ? getNextHour(selectedTime) : undefined,
      page: 0,
      size: searchParams.size
    };

    setSearchParams(newParams);
    fetchDoctors(newParams);
  };

  const handleClearFilters = () => {
    setNameFilter('');
    setSpecialityFilter('');
    setSelectedDay('');
    setSelectedTime('');
    const newParams: DoctorSearchParams = { page: 0, size: searchParams.size };
    setSearchParams(newParams);
    fetchDoctors(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = { ...searchParams, page: newPage };
    setSearchParams(newParams);
    fetchDoctors(newParams);
  };

  const formatScheduleTime = (schedule: any) => {
    if (schedule.oneTime && schedule.specificDate) {
      return `${schedule.specificDate} ${schedule.startTime}-${schedule.endTime}`;
    }
    return `${schedule.day} ${schedule.startTime}-${schedule.endTime}`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <ProtectedRoute allowedRoles={['PACILIAN']} requiredService="doctorList">
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-4">Cari Dokter</h1>
            <p className="text-gray-600">Temukan dokter yang tepat untuk kebutuhan kesehatan Anda</p>
          </div>

          {/* Search Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Name Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Dokter
                </label>
                <input
                  type="text"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  placeholder="Cari nama dokter..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Speciality Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spesialisasi
                </label>
                <select
                  value={specialityFilter}
                  onChange={(e) => setSpecialityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Spesialisasi</option>
                  {SPECIALITIES.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              {/* Day Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hari Praktik
                </label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Hari</option>
                  {DAYS_OF_WEEK.map(day => (
                    <option key={day} value={day}>
                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waktu Praktik
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!selectedDay}
                >
                  <option value="">Pilih Waktu</option>
                  {TIME_SLOTS.map(timeSlot => (
                    <option key={timeSlot.value} value={timeSlot.value}>
                      {timeSlot.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleSearch}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                <Search className="w-4 h-4 mr-2" />
                Cari Dokter
              </button>
              <button
                onClick={handleClearFilters}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
              >
                Reset Filter
              </button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-gray-600">
              Menampilkan {doctors.length} dari {totalElements} dokter
            </p>
          </div>

          {/* Doctor List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-3 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada dokter ditemukan</h3>
              <p className="text-gray-600">Coba ubah filter pencarian Anda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Doctor Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          Dr. {doctor.name}
                        </h3>
                        <p className="text-blue-600 font-medium">{doctor.speciality}</p>
                      </div>
                      <div className="flex items-center">
                        <div className="flex">{renderStars(doctor.rating)}</div>
                        <span className="ml-2 text-sm text-gray-600">
                          ({doctor.totalReviews})
                        </span>
                      </div>
                    </div>

                    {/* Doctor Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{doctor.workAddress}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{doctor.phoneNumber}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{doctor.email}</span>
                      </div>
                    </div>

                    {/* Schedule Preview */}
                    {doctor.workingSchedules.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>Jadwal Praktik:</span>
                        </div>
                        <div className="text-xs text-gray-500 max-h-16 overflow-hidden">
                          {doctor.workingSchedules.slice(0, 2).map((schedule, idx) => (
                            <div key={idx}>
                              {formatScheduleTime(schedule)}
                            </div>
                          ))}
                          {doctor.workingSchedules.length > 2 && (
                            <div className="text-blue-600">+{doctor.workingSchedules.length - 2} lainnya</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => router.push(`/doctors/${doctor.id}`)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(searchParams.page! - 1)}
                  disabled={searchParams.page === 0}
                  className="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(0, Math.min(totalPages - 5, searchParams.page! - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm border rounded-md ${
                        pageNum === searchParams.page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(searchParams.page! + 1)}
                  disabled={searchParams.page === totalPages - 1}
                  className="px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}