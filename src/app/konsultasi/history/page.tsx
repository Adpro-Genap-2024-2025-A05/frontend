'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import useAuth from '@/hooks/useAuth';
import konsultasiService, { KonsultasiResponse } from '@/api/konsultasiApi';
import KonsultasiStatusBadge from '@/components/konsultasi/KonsultasiStatusBadge';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Search,
  Filter,
  RefreshCw,
  Eye,
  History,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function KonsultasiHistoryPage() {
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
    { value: 'RESCHEDULED', label: 'Menunggu Persetujuan Reschedule' },
    { value: 'DONE', label: 'Selesai' },
    { value: 'CANCELLED', label: 'Dibatalkan' }
  ];

  const dateOptions = [
    { value: 'ALL', label: 'Semua Waktu' },
    { value: 'TODAY', label: 'Hari Ini' },
    { value: 'THIS_WEEK', label: 'Minggu Ini' },
    { value: 'THIS_MONTH', label: 'Bulan Ini' },
    { value: 'LAST_MONTH', label: 'Bulan Lalu' },
    { value: 'LAST_3_MONTHS', label: '3 Bulan Terakhir' }
  ];

  useEffect(() => {
    if (user) {
      fetchKonsultasiHistory();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [konsultasiList, statusFilter, dateFilter, searchTerm]);

  const fetchKonsultasiHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
        let data: KonsultasiResponse[];
        
        if (user?.role === 'PACILIAN') {
        data = await konsultasiService.getPacilianKonsultasi();
        } else {
        data = await konsultasiService.getCaregiverKonsultasi();
        }
      
      data.sort((a, b) => new Date(b.scheduleDateTime).getTime() - new Date(a.scheduleDateTime).getTime());
      
      setKonsultasiList(data);
    } catch (err: any) {
      console.error('Error fetching konsultasi history:', err);
      setError('Gagal memuat riwayat konsultasi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...konsultasiList];
    
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(k => k.status === statusFilter);
    }
    
    if (dateFilter !== 'ALL') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(k => {
        const scheduleDate = new Date(k.scheduleDateTime);
        
        switch (dateFilter) {
          case 'TODAY':
            const scheduleDateOnly = new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate());
            return scheduleDateOnly.getTime() === today.getTime();
          
          case 'THIS_WEEK':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return scheduleDate >= weekStart && scheduleDate <= weekEnd;
          
          case 'THIS_MONTH':
            return scheduleDate.getMonth() === now.getMonth() && scheduleDate.getFullYear() === now.getFullYear();
          
          case 'LAST_MONTH':
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return scheduleDate.getMonth() === lastMonth.getMonth() && scheduleDate.getFullYear() === lastMonth.getFullYear();
          
          case 'LAST_3_MONTHS':
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            return scheduleDate >= threeMonthsAgo;
          
          default:
            return true;
        }
      });
    }
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(k => 
        k.id.toLowerCase().includes(search) ||
        (k.notes && k.notes.toLowerCase().includes(search)) ||
        (k.caregiverData?.name && k.caregiverData.name.toLowerCase().includes(search))
      );
    }
    
    setFilteredList(filtered);
  };

  const handleViewDetail = (id: string) => {
    router.push(`/konsultasi/${id}`);
  };

  const formatDateTime = (dateTime: string) => {
    return format(new Date(dateTime), 'dd MMM yyyy, HH:mm', { locale: id });
  };

  const formatDetailDateTime = (dateTime: string) => {
    return format(new Date(dateTime), 'EEEE, dd MMMM yyyy, HH:mm', { locale: id });
  };

  const getStatusStats = () => {
    const stats = {
      total: konsultasiList.length,
      requested: konsultasiList.filter(k => k.status === 'REQUESTED').length,
      confirmed: konsultasiList.filter(k => k.status === 'CONFIRMED').length,
      rescheduled: konsultasiList.filter(k => k.status === 'RESCHEDULED').length,
      done: konsultasiList.filter(k => k.status === 'DONE').length,
      cancelled: konsultasiList.filter(k => k.status === 'CANCELLED').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  return (
    <ProtectedRoute allowedRoles={['PACILIAN', 'CAREGIVER']} requiredService="konsultasi">
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <button
              onClick={() => router.push('/konsultasi')}
              className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Kembali ke Konsultasi
            </button>
            
            <div className="flex items-center mb-4">
              <History className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-blue-600">Riwayat Konsultasi</h1>
                <p className="text-gray-600 mt-1">
                  Semua konsultasi yang pernah Anda buat
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.requested}</div>
              <div className="text-sm text-gray-600">Menunggu</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
              <div className="text-sm text-gray-600">Dikonfirmasi</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.rescheduled}</div>
              <div className="text-sm text-gray-600">Reschedule</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.done}</div>
              <div className="text-sm text-gray-600">Selesai</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
              <div className="text-sm text-gray-600">Dibatalkan</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">Filter & Pencarian</h3>
              <button
                onClick={fetchKonsultasiHistory}
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
                  placeholder="Cari konsultasi atau dokter..."
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

            {(statusFilter !== 'ALL' || dateFilter !== 'ALL' || searchTerm) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Filter Aktif:</p>
                <div className="flex flex-wrap gap-2">
                  {statusFilter !== 'ALL' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Status: {statusOptions.find(s => s.value === statusFilter)?.label}
                    </span>
                  )}
                  {dateFilter !== 'ALL' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Waktu: {dateOptions.find(d => d.value === dateFilter)?.label}
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Pencarian: "{searchTerm}"
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-300 rounded w-24"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchKonsultasiHistory}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-md p-8">
                <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {konsultasiList.length === 0 ? 'Belum ada riwayat konsultasi' : 'Tidak ada hasil yang sesuai filter'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {konsultasiList.length === 0 
                    ? 'Mulai buat konsultasi pertama Anda dengan dokter.'
                    : 'Coba ubah filter pencarian Anda.'
                  }
                </p>
                {konsultasiList.length === 0 && (
                  <button
                    onClick={() => router.push('/konsultasi/create')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Buat Konsultasi Baru
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600">
                  Menampilkan {filteredList.length} dari {konsultasiList.length} konsultasi
                </p>
                <div className="text-sm text-gray-500">
                  Diurutkan berdasarkan tanggal terbaru
                </div>
              </div>

              <div className="space-y-4">
                {filteredList.map((konsultasi) => (
                  <div key={konsultasi.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Konsultasi {user?.role === 'CAREGIVER' 
                                ? konsultasi.pacilianData?.name 
                                : konsultasi.caregiverData?.name}
                            </h3>
                            <KonsultasiStatusBadge status={konsultasi.status} />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{formatDetailDateTime(konsultasi.scheduleDateTime)}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <User className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>
                            {user?.role === 'PACILIAN'
                              ? `Dokter: ${konsultasi.caregiverData?.name || 'Dr. [Data tidak tersedia]'}`
                              : `Pasien: ${konsultasi.pacilianData?.name || 'Pasien [Data tidak tersedia]'}`
                            }
                          </span>
                        </div>
                      </div>

                      {konsultasi.notes && (
                        <div className="mb-4">
                          <div className="flex items-start text-sm text-gray-600">
                            <FileText className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-medium">Catatan: </span>
                              <span className="line-clamp-2">{konsultasi.notes}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>Terakhir diupdate: {formatDateTime(konsultasi.lastUpdated)}</span>
                        </div>
                        
                        <button
                          onClick={() => handleViewDetail(konsultasi.id)}
                          className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}