'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import useAuth from '@/hooks/useAuth';
import profileService, { UserProfile, UpdateProfileRequest, PasswordChangeRequest } from '@/api/authApi';
import { User, Edit, Save, X, Eye, EyeOff, Trash2, History, Phone, MapPin, FileText, Briefcase, Stethoscope } from 'lucide-react';

const ROLES = {
  PACILIAN: 'PACILIAN',
  CAREGIVER: 'CAREGIVER'
} as const;

const SPECIALITY_ENUMS: { value: string; label: string }[] = [
    { value: "Dokter Umum", label: "Dokter Umum" },
    { value: "Spesialis Anak", label: "Spesialis Anak" },
    { value: "Spesialis Kulit", label: "Spesialis Kulit" },
    { value: "Spesialis Penyakit Dalam", label: "Spesialis Penyakit Dalam" },
    { value: "Spesialis THT", label: "Spesialis THT" },
    { value: "Spesialis Kandungan", label: "Spesialis Kandungan" },
    { value: "Kesehatan Paru", label: "Kesehatan Paru" },
    { value: "Psikiater", label: "Psikiater" },
    { value: "Dokter Hewan", label: "Dokter Hewan" },
    { value: "Psikolog Klinis", label: "Psikolog Klinis" },
    { value: "Spesialis Mata", label: "Spesialis Mata" },
    { value: "Seksologi & Spesialis Reproduksi Pria", label: "Seksologi & Spesialis Reproduksi Pria" },
    { value: "Spesialis Gizi Klinik", label: "Spesialis Gizi Klinik" },
    { value: "Dokter Gigi", label: "Dokter Gigi" },
    { value: "Spesialis Saraf", label: "Spesialis Saraf" },
    { value: "Spesialis Bedah", label: "Spesialis Bedah" },
    { value: "Perawatan Rambut", label: "Perawatan Rambut" },
    { value: "Bidanku", label: "Bidanku" },
    { value: "Spesialis Jantung", label: "Spesialis Jantung" },
    { value: "Talk Therapy Clinic", label: "Talk Therapy Clinic" },
    { value: "Dokter Konsulen", label: "Dokter Konsulen" },
    { value: "Laktasi", label: "Laktasi" },
    { value: "Program Hamil", label: "Program Hamil" },
    { value: "Fisioterapi & Rehabilitasi", label: "Fisioterapi & Rehabilitasi" },
    { value: "Medikolegal & Hukum Kesehatan", label: "Medikolegal & Hukum Kesehatan" },
    { value: "Pemeriksaan Lab", label: "Pemeriksaan Lab" },
    { value: "Layanan Kontrasepsi", label: "Layanan Kontrasepsi" },
    { value: "Spesialisasi Lainnya", label: "Spesialisasi Lainnya" },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editForm, setEditForm] = useState<UpdateProfileRequest>({});
  const [passwordForm, setPasswordForm] = useState<PasswordChangeRequest>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const isPacilian = () => {
    return profile?.role === ROLES.PACILIAN || 
           profile?.role?.toString?.().toUpperCase?.() === ROLES.PACILIAN;
  };

  const isCaregiver = () => {
    return profile?.role === ROLES.CAREGIVER || 
           profile?.role?.toString?.().toUpperCase?.() === ROLES.CAREGIVER;
  };

  const getRoleDisplayName = () => {
    if (isPacilian()) return '🐼 Pacilian';
    if (isCaregiver()) return '🩺 Caregiver';
    return '👤 User';
  };

    const getSpecialityDisplayName = (speciality: string | undefined): string => {
    if (!speciality) return '';
    const found = SPECIALITY_ENUMS.find(s => s.value === speciality);
    return found ? found.label : speciality;
    };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const profileData = await profileService.getProfile();
      setProfile(profileData);
      
      setEditForm({
        name: profileData.name || '',
        address: profileData.address || '',
        phoneNumber: profileData.phoneNumber || '',
        medicalHistory: profileData.medicalHistory || '',
        speciality: profileData.speciality || '',
        workAddress: profileData.workAddress || ''
      });
    } catch (error) {
      setError('Gagal memuat profil');
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (profile) {
      setEditForm({
        name: profile.name || '',
        address: profile.address || '',
        phoneNumber: profile.phoneNumber || '',
        medicalHistory: profile.medicalHistory || '',
        speciality: profile.speciality || '',
        workAddress: profile.workAddress || ''
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      const updateRequest: UpdateProfileRequest = {
        name: editForm.name,
        phoneNumber: editForm.phoneNumber
      };

      if (isPacilian()) {
        updateRequest.address = editForm.address;
        updateRequest.medicalHistory = editForm.medicalHistory;
      } else if (isCaregiver()) {
        updateRequest.speciality = editForm.speciality;
        updateRequest.workAddress = editForm.workAddress;
        updateRequest.address = editForm.address;
      }
      
      const updatedProfile = await profileService.updateProfile(updateRequest);
      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccess('Profil berhasil diperbarui');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || 'Gagal memperbarui profil');
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setError('Password baru dan konfirmasi password tidak cocok');
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        setError('Password baru harus minimal 6 karakter');
        return;
      }
      
      await profileService.changePassword(passwordForm);
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password berhasil diubah');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || 'Gagal mengubah password');
      console.error('Error changing password:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsSaving(true);
      await profileService.deleteAccount();
      localStorage.removeItem('token');
      router.push('/login');
    } catch (error: any) {
      setError(error.message || 'Gagal menghapus akun');
      console.error('Error deleting account:', error);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredService="auth">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Memuat profil...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute requiredService="auth">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-red-500">Gagal memuat profil</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredService="auth">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isPacilian() ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  <User className={`w-8 h-8 ${
                    isPacilian() ? 'text-green-500' : 'text-blue-400'
                  }`} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                  <p className="text-gray-400 font-medium">{getRoleDisplayName()}</p>
                  {isCaregiver() && profile.speciality && (
                    <p className="text-sm text-gray-500">
                      {getSpecialityDisplayName(profile.speciality)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push('/konsultasi/history')}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <History className="w-4 h-4 mr-2" />
                  Riwayat Konsultasi
                </button>
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className={`flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors ${
                      isPacilian() ? 'bg-green-500 hover:bg-green-700' : 'bg-blue-400 hover:bg-blue-700'
                    }`}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <X className="w-4 h-4 mr-2" />
                {error}
              </div>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <Save className="w-4 h-4 mr-2" />
                {success}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Profil</h2>
              
              <div className="space-y-4">
                {/* Email - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={profile.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* NIK - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
                  <input
                    type="text"
                    value={profile.nik || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={isEditing ? editForm.name || '' : profile.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isEditing 
                        ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    value={isEditing ? editForm.phoneNumber || '' : profile.phoneNumber || ''}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isEditing 
                        ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  />
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Alamat
                    </label>
                    <textarea
                      value={isEditing ? editForm.address || '' : profile.address || ''}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      disabled={!isEditing}
                      rows={3}
                      placeholder="Masukkan alamat lengkap Anda"
                      className={`w-full px-3 py-2 border rounded-lg resize-none ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                          : 'border-gray-300 bg-gray-50'
                      }`}
                    />
                  </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className={`flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors ${
                      isPacilian() ? 'bg-green-500' : 'bg-blue-400'
                    }`}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="flex items-center px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Batal
                  </button>
                </div>
              )}
            </div>

            {/* Role-specific Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {isPacilian() ? 'Informasi Medis' : 'Informasi Profesional'}
              </h2>
              
              <div className="space-y-4">
                {isPacilian() ? (
                  /* Medical History for PACILIAN */
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FileText className="w-4 h-4 inline mr-1" />
                      Riwayat Medis
                    </label>
                    <textarea
                      value={isEditing ? editForm.medicalHistory || '' : profile.medicalHistory || ''}
                      onChange={(e) => setEditForm({ ...editForm, medicalHistory: e.target.value })}
                      disabled={!isEditing}
                      rows={8}
                      placeholder="Masukkan riwayat medis Anda (opsional)..."
                      className={`w-full px-3 py-2 border rounded-lg resize-none ${
                        isEditing 
                          ? 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500' 
                          : 'border-gray-300 bg-gray-50'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Informasi ini akan membantu caregiver memahami kondisi kesehatan Anda
                    </p>
                  </div>
                ) : isCaregiver() ? (
                  /* Speciality and Work Address for CAREGIVER */
                  <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Stethoscope className="w-4 h-4 inline mr-1" />
                            Spesialisasi
                        </label>
                        <select
                            value={isEditing ? editForm.speciality || '' : profile.speciality || ''}
                            onChange={(e) => setEditForm({ ...editForm, speciality: e.target.value })}
                            disabled={!isEditing}
                            className={`w-full px-3 py-2 border rounded-lg ${
                            isEditing 
                                ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                                : 'border-gray-300 bg-gray-50'
                            }`}
                        >
                            <option value="">Pilih spesialisasi</option>
                            {SPECIALITY_ENUMS.map((spec) => (
                            <option key={spec.value} value={spec.value}>
                                {spec.label}
                            </option>
                            ))}
                        </select>
                        </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Alamat Tempat Kerja
                      </label>
                      <textarea
                        value={isEditing ? editForm.workAddress || '' : profile.workAddress || ''}
                        onChange={(e) => setEditForm({ ...editForm, workAddress: e.target.value })}
                        disabled={!isEditing}
                        rows={4}
                        placeholder="Masukkan alamat tempat kerja (rumah sakit, klinik, dll)..."
                        className={`w-full px-3 py-2 border rounded-lg resize-none ${
                          isEditing 
                            ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                            : 'border-gray-300 bg-gray-50'
                        }`}
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Informasi role tidak tersedia</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Keamanan Akun</h2>
            
            {!isChangingPassword ? (
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Ubah Password
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Hapus Akun
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                      placeholder="Masukkan password saat ini"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-800"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                      placeholder="Masukkan password baru (min. 6 karakter)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-800"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                      placeholder="Ulangi password baru"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-800"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleChangePassword}
                    disabled={isSaving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSaving ? 'Menyimpan...' : 'Simpan Password'}
                  </button>
                  <button
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setError(null);
                    }}
                    disabled={isSaving}
                    className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center mb-4">
                  <Trash2 className="w-6 h-6 text-red-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Hapus Akun</h3>
                </div>
                <p className="text-gray-400 mb-6">
                  Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan dan semua data Anda akan dihapus secara permanen.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {isSaving ? 'Menghapus...' : 'Ya, Hapus Akun'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}