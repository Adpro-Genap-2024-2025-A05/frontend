'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import useAuth from '@/hooks/useAuth';
import konsultasiService, { KonsultasiResponse } from '@/api/konsultasiApi';
import KonsultasiCard from '@/components/konsultasi/KonsultasiCard';
import { Plus, Filter, RefreshCw, Search, History } from 'lucide-react';

export default function KonsultasiPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [konsultasiList, setKonsultasiList] = useState<KonsultasiResponse[]>([]);
  const [filteredList, setFilteredList] = useState<KonsultasiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const statusOptions = [
    { value: 'ALL', label: 'Semua Status' },
    { value: 'REQUESTED', label: 'Menunggu Konfirmasi' },
    { value: 'CONFIRMED', label: 'Dikonfirmasi' },
    { value: 'RESCHEDULED', label: 'Perlu Konfirmasi Reschedule' },
  ];

  const dateOptions = [
    { value: 'ALL', label: 'Semua Waktu' },
    { value: 'TODAY', label: 'Hari Ini' },
    { value: 'UPCOMING', label: 'Mendatang' },
    { value: 'PAST', label: 'Masa Lalu' }
  ];

  useEffect(() => {
    fetchKonsultasi();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [konsultasiList, statusFilter, dateFilter, searchTerm]);

  const fetchKonsultasi = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let data: KonsultasiResponse[];

      if (user.role === 'PACILIAN') {
        data = await konsultasiService.getPacilianKonsultasi();
      } else {
        data = await konsultasiService.getCaregiverKonsultasi();
      }

      data.sort((a, b) => new Date(b.scheduleDateTime).getTime() - new Date(a.scheduleDateTime).getTime());

      setKonsultasiList(data);
    } catch (err: any) {
      console.error('Error fetching konsultasi:', err);
      setError('Gagal memuat data konsultasi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = konsultasiList.filter(k => k.status !== 'DONE' && k.status !== 'CANCELLED');

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(k => k.status === statusFilter);
    }

    if (dateFilter !== 'ALL') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(k => {
        const scheduleDate = new Date(k.scheduleDateTime);
        const scheduleDateOnly = new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate());

        switch (dateFilter) {
          case 'TODAY':
            return scheduleDateOnly.getTime() === today.getTime();
          case 'UPCOMING':
            return scheduleDate > now;
          case 'PAST':
            return scheduleDate < now;
          default:
            return true;
        }
      });
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(k =>
        k.id.toLowerCase().includes(search) ||
        (k.notes && k.notes.toLowerCase().includes(search))
      );
    }

    setFilteredList(filtered);
  };

  const handleViewDetail = (id: string) => {
    router.push(`/konsultasi/${id}`);
  };

  const handleCreateNew = () => {
    router.push('/konsultasi/create');
  };

  const handleConfirm = async (id: string) => {
    try {
      await konsultasiService.confirmKonsultasi(id);
      await fetchKonsultasi();
    } catch (error) {
      console.error('Error confirming konsultasi:', error);
      alert('Gagal mengkonfirmasi konsultasi. Silakan coba lagi.');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan konsultasi ini?')) return;

    try {
      await konsultasiService.cancelKonsultasi(id);
      await fetchKonsultasi();
    } catch (error) {
      console.error('Error canceling konsultasi:', error);
      alert('Gagal membatalkan konsultasi. Silakan coba lagi.');
    }
  };

  const handleComplete = async (id: string) => {
    if (!confirm('Apakah Anda yakin konsultasi ini sudah selesai?')) return;

    try {
      await konsultasiService.completeKonsultasi(id);
      await fetchKonsultasi();
    } catch (error) {
      console.error('Error completing konsultasi:', error);
      alert('Gagal menyelesaikan konsultasi. Silakan coba lagi.');
    }
  };

  const handleUpdateRequest = (id: string) => {
    router.push(`/konsultasi/${id}/update`);
  };

  const handleReschedule = (id: string) => {
    router.push(`/konsultasi/${id}/reschedule`);
  };

  const handleAcceptReschedule = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menerima perubahan jadwal ini?')) return;

    try {
      await konsultasiService.acceptReschedule(id);
      await fetchKonsultasi();
    } catch (error) {
      console.error('Error accepting reschedule:', error);
      alert('Gagal menerima perubahan jadwal. Silakan coba lagi.');
    }
  };

  const handleRejectReschedule = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menolak perubahan jadwal ini?')) return;

    try {
      await konsultasiService.rejectReschedule(id);
      await fetchKonsultasi();
    } catch (error) {
      console.error('Error rejecting reschedule:', error);
      alert('Gagal menolak perubahan jadwal. Silakan coba lagi.');
    }
  };

  if (!user) return null;

  return (
    <ProtectedRoute allowedRoles={['PACILIAN', 'CAREGIVER']} requiredService="konsultasi">
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-blue-600">
                  {user.role === 'PACILIAN' ? 'Konsultasi Saya' : 'Manajemen Konsultasi'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {user.role === 'PACILIAN'
                    ? 'Kelola jadwal konsultasi dengan dokter'
                    : 'Kelola konsultasi dari pasien'
                  }
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/konsultasi/history')}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                >
                  <History className="w-4 h-4 mr-2" />
                  Riwayat
                </button>
                {user.role === 'PACILIAN' && (
                  <button
                    onClick={handleCreateNew}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Konsultasi Baru
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">Filter</h3>
              <button
                onClick={fetchKonsultasi}
                className="ml-auto flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari konsultasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {dateOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setStatusFilter('ALL');
                  setDateFilter('ALL');
                  setSearchTerm('');
                }}
                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
              >
                Reset Filter
              </button>
            </div>
          </div>

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
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={fetchKonsultasi}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {konsultasiList.length === 0 ? 'Belum ada konsultasi' : 'Tidak ada hasil yang sesuai filter'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {konsultasiList.length === 0
                    ? (user.role === 'PACILIAN'
                      ? 'Mulai buat konsultasi pertama Anda dengan dokter.'
                      : 'Belum ada pasien yang membuat konsultasi.'
                    )
                    : 'Coba ubah filter pencarian Anda.'
                  }
                </p>
                {user.role === 'PACILIAN' && konsultasiList.length === 0 && (
                  <button
                    onClick={handleCreateNew}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Buat Konsultasi Baru
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-600">
                  Menampilkan {filteredList.length} dari {konsultasiList.length} konsultasi
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredList.map((konsultasi) => (
                  <KonsultasiCard
                    key={konsultasi.id}
                    konsultasi={konsultasi}
                    userRole={user.role as 'PACILIAN' | 'CAREGIVER'}
                    onView={handleViewDetail}
                    onCancel={handleCancel}
                    onConfirm={handleConfirm}
                    onComplete={handleComplete}
                    onUpdateRequest={handleUpdateRequest}
                    onReschedule={handleReschedule}
                    onAcceptReschedule={handleAcceptReschedule}
                    onRejectReschedule={handleRejectReschedule}
                    caregiverName={konsultasi.caregiverData?.name || 'Dr. [Data tidak tersedia]'}
                    pacilianName={konsultasi.pacilianData?.name || '[Nama tidak tersedia]'}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}