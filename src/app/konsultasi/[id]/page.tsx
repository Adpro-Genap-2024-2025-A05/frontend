'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Phone, 
  Mail,
  CheckCircle,
  XCircle,
  Edit,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function KonsultasiDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const konsultasiId = params.id as string;
  
  const [konsultasi, setKonsultasi] = useState<KonsultasiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
    } catch (err: any) {
      console.error('Error fetching konsultasi detail:', err);
      setError('Gagal memuat detail konsultasi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, actionFn: () => Promise<void>) => {
    setActionLoading(action);
    try {
      await actionFn();
      await fetchKonsultasiDetail();
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      alert(`Gagal melakukan ${action}. Silakan coba lagi.`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirm = async () => {
    if (!confirm('Apakah Anda yakin ingin mengkonfirmasi konsultasi ini?')) return;
    await handleAction('confirm', async () => {
      await konsultasiService.confirmKonsultasi(konsultasiId);
    });
  };

  const handleCancel = async () => {
    if (!confirm('Apakah Anda yakin ingin membatalkan konsultasi ini?')) return;
    await handleAction('cancel', async () => {
      await konsultasiService.cancelKonsultasi(konsultasiId);
    });
  };

  const handleComplete = async () => {
    if (!confirm('Apakah Anda yakin konsultasi ini sudah selesai?')) return;
    await handleAction('complete', async () => {
      await konsultasiService.completeKonsultasi(konsultasiId);
    });
  };

  const handleUpdateRequest = () => {
    router.push(`/konsultasi/${konsultasiId}/update`);
  };

  const handleReschedule = () => {
    router.push(`/konsultasi/${konsultasiId}/reschedule`);
  };

  const handleAcceptReschedule = async () => {
    if (!confirm('Apakah Anda yakin ingin menerima perubahan jadwal ini?')) return;
    await handleAction('accept', async () => {
      await konsultasiService.acceptReschedule(konsultasiId);
    });
  };

  const handleRejectReschedule = async () => {
    if (!confirm('Apakah Anda yakin ingin menolak perubahan jadwal ini?')) return;
    await handleAction('reject', async () => {
      await konsultasiService.rejectReschedule(konsultasiId);
    });
  };

  const formatDateTime = (dateTime: string) => {
    return format(new Date(dateTime), 'EEEE, dd MMMM yyyy, HH:mm', { locale: id });
  };

  const canPerformAction = (action: string) => {
    if (!konsultasi || !user) return false;
    
    switch (action) {
      case 'confirm':
        return konsultasi.status === 'REQUESTED' && user.role === 'CAREGIVER';
      case 'cancel':
        return konsultasi.status === 'REQUESTED';
      case 'complete':
        return konsultasi.status === 'CONFIRMED' && user.role === 'CAREGIVER';
      case 'update_request':
        return konsultasi.status === 'REQUESTED' && user.role === 'PACILIAN';
      case 'reschedule':
        return konsultasi.status === 'CONFIRMED' && user.role === 'CAREGIVER';
      case 'accept_reschedule':
        return konsultasi.status === 'RESCHEDULED' && user.role === 'PACILIAN';
      case 'reject_reschedule':
        return konsultasi.status === 'RESCHEDULED' && user.role === 'PACILIAN';
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['PACILIAN', 'CAREGIVER']} requiredService="konsultasi">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !konsultasi) {
    return (
      <ProtectedRoute allowedRoles={['PACILIAN', 'CAREGIVER']} requiredService="konsultasi">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error || 'Konsultasi tidak ditemukan'}
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

  return (
    <ProtectedRoute allowedRoles={['PACILIAN', 'CAREGIVER']} requiredService="konsultasi">
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
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Konsultasi {konsultasi.caregiverData?.name || 'Detail Konsultasi'}
                </h1>
              </div>
              <KonsultasiStatusBadge status={konsultasi.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Informasi Konsultasi
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Tanggal & Waktu</p>
                      <p className="text-gray-600">{formatDateTime(konsultasi.scheduleDateTime)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {user?.role === 'PACILIAN' ? 'Dokter' : 'Pasien'}
                      </p>
                      <p className="text-gray-600">
                        {user?.role === 'PACILIAN' 
                          ? (konsultasi.caregiverData?.name || 'Dr. [Data tidak tersedia]')
                          : (konsultasi.pacilianData?.name || '[Nama tidak tersedia]')
                        }
                      </p>
                    </div>
                  </div>

                  {konsultasi.notes && (
                    <div className="flex items-start">
                      <FileText className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Catatan</p>
                        <p className="text-gray-600 whitespace-pre-wrap">{konsultasi.notes}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Terakhir Diupdate</p>
                      <p className="text-gray-600">{formatDateTime(konsultasi.lastUpdated)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Status Konsultasi
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Status Saat Ini</p>
                      <p className="text-sm text-gray-600">
                        {konsultasi.status === 'REQUESTED' && 'Menunggu konfirmasi dari dokter'}
                        {konsultasi.status === 'CONFIRMED' && 'Konsultasi telah dikonfirmasi'}
                        {konsultasi.status === 'RESCHEDULED' && 'Dokter mengajukan perubahan jadwal'}
                        {konsultasi.status === 'CANCELLED' && 'Konsultasi telah dibatalkan'}
                        {konsultasi.status === 'DONE' && 'Konsultasi telah selesai'}
                      </p>
                    </div>
                    <KonsultasiStatusBadge status={konsultasi.status} />
                  </div>

                  {konsultasi.status === 'RESCHEDULED' && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h3 className="font-medium text-purple-900 mb-2">
                        Perubahan Jadwal Diajukan
                      </h3>
                      <p className="text-sm text-purple-700">
                        {user?.role === 'PACILIAN' 
                          ? 'Dokter telah mengajukan perubahan jadwal. Silakan terima atau tolak perubahan ini.'
                          : 'Anda telah mengajukan perubahan jadwal. Menunggu persetujuan dari pasien.'
                        }
                      </p>
                    </div>
                  )}

                  {konsultasi.status === 'REQUESTED' && user?.role === 'PACILIAN' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-medium text-blue-900 mb-2">
                        Request Masih Dapat Diubah
                      </h3>
                      <p className="text-sm text-blue-700">
                        Selama dokter belum mengkonfirmasi, Anda masih dapat mengubah jadwal atau catatan konsultasi.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Informasi Kontak
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Nomor Telepon</p>
                      <p className="text-gray-600">
                        {user?.role === 'PACILIAN' 
                          ? (konsultasi.caregiverData?.phoneNumber || '[Telepon tidak tersedia]')
                          : (konsultasi.pacilianData?.phoneNumber || '[Telepon tidak tersedia]')
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">
                        {user?.role === 'PACILIAN' 
                          ? (konsultasi.caregiverData?.email || '[Email tidak tersedia]')
                          : (konsultasi.pacilianData?.email || '[Email tidak tersedia]')
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tindakan
                </h3>
                
                <div className="space-y-3">
                  {canPerformAction('confirm') && (
                    <button
                      onClick={handleConfirm}
                      disabled={actionLoading === 'confirm'}
                      className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {actionLoading === 'confirm' ? 'Mengkonfirmasi...' : 'Konfirmasi'}
                    </button>
                  )}

                  {canPerformAction('complete') && (
                    <button
                      onClick={handleComplete}
                      disabled={actionLoading === 'complete'}
                      className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {actionLoading === 'complete' ? 'Menyelesaikan...' : 'Selesai'}
                    </button>
                  )}

                  {canPerformAction('update_request') && (
                    <button
                      onClick={handleUpdateRequest}
                      className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      <Edit className="w-5 h-5 mr-2" />
                      Update Request
                    </button>
                  )}

                  {canPerformAction('reschedule') && (
                    <button
                      onClick={handleReschedule}
                      className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Ajukan Reschedule
                    </button>
                  )}

                  {canPerformAction('accept_reschedule') && (
                    <button
                      onClick={handleAcceptReschedule}
                      disabled={actionLoading === 'accept'}
                      className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {actionLoading === 'accept' ? 'Menerima...' : 'Terima Reschedule'}
                    </button>
                  )}

                  {canPerformAction('reject_reschedule') && (
                    <button
                      onClick={handleRejectReschedule}
                      disabled={actionLoading === 'reject'}
                      className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      {actionLoading === 'reject' ? 'Menolak...' : 'Tolak Reschedule'}
                    </button>
                  )}

                  {canPerformAction('cancel') && (
                    <button
                      onClick={handleCancel}
                      disabled={actionLoading === 'cancel'}
                      className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      {actionLoading === 'cancel' ? 'Membatalkan...' : 'Batalkan'}
                    </button>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Informasi</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    {user?.role === 'PACILIAN' ? (
                      <>
                        {konsultasi.status === 'REQUESTED' && (
                          <p>• Anda dapat mengubah request selama dokter belum konfirmasi</p>
                        )}
                        {konsultasi.status === 'RESCHEDULED' && (
                          <p>• Dokter telah mengajukan perubahan jadwal, silakan terima atau tolak</p>
                        )}
                      </>
                    ) : (
                      <>
                        {konsultasi.status === 'REQUESTED' && (
                          <p>• Silakan konfirmasi atau batalkan request dari pasien</p>
                        )}
                        {konsultasi.status === 'CONFIRMED' && (
                          <p>• Anda dapat mengajukan reschedule atau menyelesaikan konsultasi</p>
                        )}
                        {konsultasi.status === 'RESCHEDULED' && (
                          <p>• Menunggu pasien menerima atau menolak reschedule Anda</p>
                        )}
                      </>
                    )}
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