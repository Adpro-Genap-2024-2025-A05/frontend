'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import konsultasiService, { CreateKonsultasiDto, Schedule } from '@/api/konsultasiApi';
import doctorListService, { Doctor } from '@/api/doctorListApi';
import { ArrowLeft, Search, Calendar, Clock, User, FileText, AlertCircle } from 'lucide-react';

export default function CreateKonsultasiPage() {
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<string>('');
  const [notes, setNotes] = useState('');

  const searchParams = useSearchParams();
  const preSelectedDoctorId = searchParams.get('doctorId');
  const preSelectedDoctorName = searchParams.get('doctorName');
  const preSelectedSpeciality = searchParams.get('speciality');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorLoading, setDoctorLoading] = useState(false);
  
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [timeLoading, setTimeLoading] = useState(false);

  useEffect(() => {
    if (preSelectedDoctorId && preSelectedDoctorName && preSelectedSpeciality) {
      const preSelectedDoctor: Doctor = {
        id: preSelectedDoctorId,
        caregiverId: preSelectedDoctorId,
        name: decodeURIComponent(preSelectedDoctorName),
        speciality: decodeURIComponent(preSelectedSpeciality),
        email: '',
        workAddress: '',
        phoneNumber: '',
        description: '',
        rating: 0,
        totalRatings: 0,
        workingSchedules: []
      };
      
      setSelectedDoctor(preSelectedDoctor);
      fetchSchedules(preSelectedDoctorId);
      setCurrentStep(2); 
    } else {
      fetchDoctors();
    }
  }, [preSelectedDoctorId, preSelectedDoctorName, preSelectedSpeciality]);

  const fetchDoctors = async () => {
    setDoctorLoading(true);
    try {
      const response = await doctorListService.searchDoctors({
        name: doctorSearch || undefined,
        size: 20
      });
      setDoctors(response.content);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Gagal memuat daftar dokter. Silakan coba lagi.');
    } finally {
      setDoctorLoading(false);
    }
  };

  const fetchSchedules = async (caregiverId: string) => {
    setScheduleLoading(true);
    try {
      const scheduleData = await konsultasiService.getCaregiverSchedulesById(caregiverId);
      setSchedules(scheduleData);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError('Gagal memuat jadwal dokter. Silakan coba lagi.');
    } finally {
      setScheduleLoading(false);
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

  const handleDoctorSelect = async (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedSchedule(null);
    setSelectedDateTime('');
    setAvailableTimes([]);
    await fetchSchedules(doctor.id);
    setCurrentStep(2);
  };

  const handleScheduleSelect = async (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setSelectedDateTime('');
    await fetchAvailableTimes(schedule.id);
    setCurrentStep(3);
  };

  const handleDateTimeSelect = (dateTime: string) => {
    setSelectedDateTime(dateTime);
    setCurrentStep(4);
  };

  const handleSubmit = async () => {
    if (!selectedSchedule || !selectedDateTime) {
      setError('Mohon lengkapi semua informasi yang diperlukan.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const createData: CreateKonsultasiDto = {
        scheduleId: selectedSchedule.id,
        scheduleDateTime: selectedDateTime,
        notes: notes.trim() || undefined
      };

      const result = await konsultasiService.createKonsultasi(createData);
      
      router.push(`/konsultasi/${result.id}`);
    } catch (error: any) {
      console.error('Error creating konsultasi:', error);
      setError(error.response?.data?.message || 'Gagal membuat konsultasi. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatScheduleTime = (schedule: Schedule) => {
    if (schedule.oneTime && schedule.specificDate) {
      return `${schedule.specificDate} ${schedule.startTime}-${schedule.endTime}`;
    }
    return `${schedule.day} ${schedule.startTime}-${schedule.endTime}`;
  };

  const formatDateTime = (dateTime: string) => {
    try {
      const date = new Date(dateTime);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateTime;
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step <= currentStep 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step}
            </div>
            {step < totalSteps && (
              <div className={`w-12 md:w-24 h-1 mx-2 ${
                step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="text-sm text-gray-600">
        Step {currentStep} dari {totalSteps}: {
          currentStep === 1 ? 'Pilih Dokter' :
          currentStep === 2 ? 'Pilih Jadwal' :
          currentStep === 3 ? 'Pilih Waktu' :
          'Konfirmasi & Catatan'
        }
      </div>
    </div>
  );

  const renderDoctorSelection = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Pilih Dokter</h2>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama dokter..."
          value={doctorSearch}
          onChange={(e) => setDoctorSearch(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && fetchDoctors()}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={fetchDoctors}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Cari
        </button>
      </div>

      {doctorLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded mb-1"></div>
              <div className="h-3 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Tidak ada dokter ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              onClick={() => handleDoctorSelect(doctor)}
              className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition"
            >
              <h3 className="font-semibold text-gray-900">Dr. {doctor.name}</h3>
              <p className="text-blue-600 text-sm">{doctor.speciality}</p>
              <p className="text-gray-600 text-xs mt-1">{doctor.workAddress}</p>
              <div className="flex items-center mt-2">
                <span className="text-yellow-400">★</span>
                <span className="text-sm text-gray-600 ml-1">
                  {doctor.rating.toFixed(1)} ({doctor.totalRatings} ulasan)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderScheduleSelection = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Pilih Jadwal</h2>
        <button
          onClick={() => setCurrentStep(1)}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          Ganti Dokter
        </button>
      </div>

      {selectedDoctor && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900">Dr. {selectedDoctor.name}</h3>
          <p className="text-blue-700 text-sm">{selectedDoctor.speciality}</p>
        </div>
      )}

      {scheduleLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Dokter ini belum memiliki jadwal yang tersedia</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              onClick={() => handleScheduleSelect(schedule)}
              className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {formatScheduleTime(schedule)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {schedule.oneTime ? 'Jadwal Khusus' : 'Jadwal Rutin'}
                  </p>
                </div>
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTimeSelection = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Pilih Waktu</h2>
        <button
          onClick={() => setCurrentStep(2)}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          Ganti Jadwal
        </button>
      </div>

      {selectedSchedule && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="font-medium text-blue-900">
            {formatScheduleTime(selectedSchedule)}
          </p>
        </div>
      )}

      {timeLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      ) : availableTimes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Tidak ada waktu yang tersedia untuk jadwal ini</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableTimes.map((time) => (
            <div
              key={time}
              onClick={() => handleDateTimeSelect(time)}
              className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition"
            >
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">
                    {formatDateTime(time)}
                  </p>
                  <p className="text-sm text-gray-600">Tersedia</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderConfirmation = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Konfirmasi & Catatan</h2>
        <button
          onClick={() => setCurrentStep(3)}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          Ganti Waktu
        </button>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">Ringkasan Konsultasi</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <User className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm">Dr. {selectedDoctor?.name} - {selectedDoctor?.speciality}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm">{selectedDateTime && formatDateTime(selectedDateTime)}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Catatan (Opsional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tuliskan keluhan atau informasi tambahan..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Catatan ini akan membantu dokter mempersiapkan konsultasi
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
      >
        {submitting ? 'Membuat Konsultasi...' : 'Buat Konsultasi'}
      </button>
    </div>
  );

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
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Buat Konsultasi Baru
            </h1>
            <p className="text-gray-600">
              Pilih dokter dan jadwal untuk konsultasi Anda
            </p>
          </div>

          {renderProgressBar()}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {currentStep === 1 && renderDoctorSelection()}
          {currentStep === 2 && renderScheduleSelection()}
          {currentStep === 3 && renderTimeSelection()}
          {currentStep === 4 && renderConfirmation()}
        </div>
      </div>
    </ProtectedRoute>
  );
}