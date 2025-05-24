'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import useAuth from '@/hooks/useAuth';
import konsultasiService, { KonsultasiResponse, UpdateKonsultasiRequestDto, Schedule } from '@/api/konsultasiApi';
import { ArrowLeft, Calendar, Clock, FileText, AlertCircle, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function UpdateKonsultasiRequestPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const konsultasiId = params.id as string;
  
  const [konsultasi, setKonsultasi] = useState<KonsultasiResponse | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const [selectedDateTime, setSelectedDateTime] = useState<string>('');
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [timeLoading, setTimeLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (konsultasiId) {
      fetchKonsultasiDetail();
    }
  }, [konsultasiId]);

  const fetchKonsultasiDetail = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await konsultasiService.getKonsultasiById(konsultasiId, user?.role || '');
      setKonsultasi(data);
      
      const scheduleData = await konsultasiService.getCaregiverSchedulesById(data.caregiverId);
      setSchedules(scheduleData);
      
      setSelectedScheduleId(data.scheduleId);
      setSelectedDateTime(data.scheduleDateTime);
      setNotes(data.notes || '');
      
      await fetchAvailableTimes(data.scheduleId);
    } catch (err: any) {
      console.error('Error fetching konsultasi detail:', err);
      setError('Gagal memuat detail konsultasi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTimes = async (scheduleId: string) => {
    setTimeLoading(true);
    try {
      const times = await konsultasiService.getAvailableTimes(scheduleId, 4);
      setAvailableTimes(times);
    } catch (error) {
      console.error('Error fetching available times:', error);
      setError('Gagal memuat waktu yang tersedia. Silakan coba lagi.');
    } finally {
      setTimeLoading(false);
    }
  };

  const handleScheduleChange = async (scheduleId: string) => {
    setSelectedScheduleId(scheduleId);
    setSelectedDateTime('');
    
    if (scheduleId) {
      await fetchAvailableTimes(scheduleId);
    } else {
      setAvailableTimes([]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDateTime) {
      setError('Mohon pilih waktu konsultasi.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const updateData: UpdateKonsultasiRequestDto = {
        newScheduleDateTime: selectedDateTime,
        newScheduleId: selectedScheduleId !== konsultasi?.scheduleId ? selectedScheduleId : undefined,
        notes: notes.trim() || undefined
      };

      await konsultasiService.updateKonsultasiRequest(konsultasiId, updateData);
      
      router.push(`/konsultasi/${konsultasiId}`);
    } catch (error: any) {
      console.error('Error updating konsultasi request:', error);
      setError(error.response?.data?.message || 'Gagal mengupdate request konsultasi. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    return format(new Date(dateTime), 'EEEE, dd MMMM yyyy, HH:mm', { locale: id });
  };

  const formatScheduleTime = (schedule: Schedule) => {
    if (schedule.oneTime && schedule.specificDate) {
      return `${schedule.specificDate} ${schedule.startTime}-${schedule.endTime}`;
    }
    return `${schedule.day} ${schedule.startTime}-${schedule.endTime}`;
  };

  if (user && user.role !== 'PACILIAN') {
    return (
      <ProtectedRoute allowedRoles={['PACILIAN']} requiredService="konsultasi">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Akses Ditolak
            </h2>
            <p className="text-gray-600 mb-4">
              Hanya pasien yang dapat mengupdate request konsultasi.
            </p>
            <button
              onClick={() => router.push('/konsultasi')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Kembali ke Daftar Konsultasi
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['PACILIAN']} requiredService="konsultasi">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !konsultasi) {
    return (
      <ProtectedRoute allowedRoles={['PACILIAN']} requiredService="konsultasi">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Gagal memuat data konsultasi
            </h2>
            <button
              onClick={() => router.push('/konsultasi')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Kembali ke Daftar Konsultasi
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (konsultasi?.status !== 'REQUESTED') {
    return (
      <ProtectedRoute allowedRoles={['PACILIAN']} requiredService="konsultasi">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Request Tidak Dapat Diupdate
            </h2>
            <p className="text-gray-600 mb-4">
              Hanya request konsultasi dengan status "Menunggu Konfirmasi" yang dapat diupdate.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Status saat ini: {konsultasi?.status === 'CONFIRMED' && 'Dikonfirmasi'}
              {konsultasi?.status === 'RESCHEDULED' && 'Menunggu Persetujuan Reschedule'}
              {konsultasi?.status === 'CANCELLED' && 'Dibatalkan'}
              {konsultasi?.status === 'DONE' && 'Selesai'}
            </p>
            <button
              onClick={() => router.push(`/konsultasi/${konsultasiId}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Kembali ke Detail
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['PACILIAN']} requiredService="konsultasi">
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Kembali
            </button>
            
            <div className="flex items-center mb-2">
              <Edit className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">
                Update Request Konsultasi
              </h1>
            </div>
            <p className="text-gray-600">
              ID: {konsultasi?.id}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Request Konsultasi Saat Ini
                </h2>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-medium">
                      {konsultasi && formatDateTime(konsultasi.scheduleDateTime)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Request yang menunggu konfirmasi dokter
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Update Jadwal Konsultasi
                </h2>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jadwal Dokter
                  </label>
                  <select
                    value={selectedScheduleId}
                    onChange={(e) => handleScheduleChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih jadwal...</option>
                    {schedules.map((schedule) => (
                      <option key={schedule.id} value={schedule.id}>
                        {formatScheduleTime(schedule)} - {schedule.oneTime ? 'Jadwal Khusus' : 'Jadwal Rutin'}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedScheduleId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Waktu yang Tersedia
                    </label>
                    
                    {timeLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="border rounded-lg p-4 animate-pulse">
                            <div className="h-4 bg-gray-300 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : availableTimes.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">
                          Tidak ada waktu yang tersedia untuk jadwal ini
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availableTimes.map((time) => (
                          <label
                            key={time}
                            className={`border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition ${
                              selectedDateTime === time ? 'border-blue-500 bg-blue-50' : ''
                            }`}
                          >
                            <input
                              type="radio"
                              name="dateTime"
                              value={time}
                              checked={selectedDateTime === time}
                              onChange={(e) => setSelectedDateTime(e.target.value)}
                              className="sr-only"
                            />
                            <div className="flex items-center">
                              <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {formatDateTime(time)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {selectedDateTime === time ? 'Terpilih' : 'Tersedia'}
                                </p>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Catatan Konsultasi
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keluhan atau Informasi Tambahan (Opsional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Jelaskan keluhan atau informasi yang ingin Anda sampaikan kepada dokter..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Catatan ini akan membantu dokter mempersiapkan konsultasi Anda
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Konfirmasi Update
                </h3>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {selectedDateTime && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Jadwal Terpilih:</h4>
                    <p className="text-sm text-blue-700">
                      {formatDateTime(selectedDateTime)}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!selectedDateTime || submitting}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Mengupdate Request...' : 'Update Request'}
                </button>

                <p className="text-xs text-gray-500 mt-3 text-center">
                  Request yang diupdate masih perlu konfirmasi dokter
                </p>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Informasi</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Anda dapat mengubah request selama dokter belum konfirmasi</p>
                    <p>• Perubahan jadwal atau catatan akan langsung tersimpan</p>
                    <p>• Dokter akan melihat request terbaru saat konfirmasi</p>
                    <p>• Status akan tetap "Menunggu Konfirmasi" setelah update</p>
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