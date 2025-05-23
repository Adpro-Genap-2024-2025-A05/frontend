import React, { useState } from 'react';
import { Calendar, Clock, User, FileText, MoreVertical } from 'lucide-react';
import KonsultasiStatusBadge from './KonsultasiStatusBadge';
import { KonsultasiResponse } from '@/api/konsultasiApi';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface KonsultasiCardProps {
  konsultasi: KonsultasiResponse;
  userRole: 'PACILIAN' | 'CAREGIVER';
  onView: (id: string) => void;
  onCancel?: (id: string) => void;
  onConfirm?: (id: string) => void;
  onComplete?: (id: string) => void;
  onReschedule?: (id: string) => void;
  onAcceptReschedule?: (id: string) => void;
  onRejectReschedule?: (id: string) => void;
  caregiverName?: string;
  pacilianName?: string;
}

export default function KonsultasiCard({
  konsultasi,
  userRole,
  onView,
  onCancel,
  onConfirm,
  onComplete,
  onReschedule,
  onAcceptReschedule,
  onRejectReschedule,
  caregiverName,
  pacilianName
}: KonsultasiCardProps) {
  const [showActions, setShowActions] = useState(false);

  const formatDateTime = (dateTime: string) => {
    return format(new Date(dateTime), 'dd MMMM yyyy, HH:mm', { locale: id });
  };

  const canCancel = () => {
    return konsultasi.status === 'REQUESTED' && onCancel;
  };

  const canConfirm = () => {
    return konsultasi.status === 'REQUESTED' && userRole === 'CAREGIVER' && onConfirm;
  };

  const canComplete = () => {
    return konsultasi.status === 'CONFIRMED' && userRole === 'CAREGIVER' && onComplete;
  };

  const canReschedule = () => {
    return konsultasi.status === 'REQUESTED' && onReschedule;
  };

  const canAcceptReject = () => {
    return konsultasi.status === 'RESCHEDULED' && userRole === 'CAREGIVER';
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Konsultasi #{konsultasi.id.slice(-8)}
              </h3>
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
                
                {showActions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onView(konsultasi.id);
                          setShowActions(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Lihat Detail
                      </button>
                      
                      {canConfirm() && (
                        <button
                          onClick={() => {
                            onConfirm!(konsultasi.id);
                            setShowActions(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-gray-100"
                        >
                          Konfirmasi
                        </button>
                      )}
                      
                      {canComplete() && (
                        <button
                          onClick={() => {
                            onComplete!(konsultasi.id);
                            setShowActions(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-gray-100"
                        >
                          Selesai
                        </button>
                      )}
                      
                      {canReschedule() && (
                        <button
                          onClick={() => {
                            onReschedule!(konsultasi.id);
                            setShowActions(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-purple-700 hover:bg-gray-100"
                        >
                          Reschedule
                        </button>
                      )}
                      
                      {canAcceptReject() && (
                        <>
                          <button
                            onClick={() => {
                              onAcceptReschedule!(konsultasi.id);
                              setShowActions(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-gray-100"
                          >
                            Terima Reschedule
                          </button>
                          <button
                            onClick={() => {
                              onRejectReschedule!(konsultasi.id);
                              setShowActions(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                          >
                            Tolak Reschedule
                          </button>
                        </>
                      )}
                      
                      {canCancel() && (
                        <button
                          onClick={() => {
                            onCancel!(konsultasi.id);
                            setShowActions(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                        >
                          Batalkan
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <KonsultasiStatusBadge status={konsultasi.status} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{formatDateTime(konsultasi.scheduleDateTime)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>
              {userRole === 'PACILIAN' 
                ? `Dokter: ${caregiverName || 'Loading...'}`
                : `Pasien: ${pacilianName || 'Loading...'}`
              }
            </span>
          </div>

          {konsultasi.notes && (
            <div className="flex items-start text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{konsultasi.notes}</span>
            </div>
          )}

          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            <span>Terakhir diupdate: {formatDateTime(konsultasi.lastUpdated)}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
          <button
            onClick={() => onView(konsultasi.id)}
            className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition"
          >
            Lihat Detail
          </button>
          
          {canConfirm() && (
            <button
              onClick={() => onConfirm!(konsultasi.id)}
              className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition"
            >
              Konfirmasi
            </button>
          )}
          
          {canComplete() && (
            <button
              onClick={() => onComplete!(konsultasi.id)}
              className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
            >
              Selesai
            </button>
          )}
        </div>
      </div>

      {showActions && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
}