import React from 'react';

interface KonsultasiStatusBadgeProps {
  status: 'REQUESTED' | 'CONFIRMED' | 'CANCELLED' | 'DONE' | 'RESCHEDULED';
}

export default function KonsultasiStatusBadge({ status }: KonsultasiStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          label: 'Menunggu Konfirmasi'
        };
      case 'CONFIRMED':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          label: 'Dikonfirmasi'
        };
      case 'CANCELLED':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          label: 'Dibatalkan'
        };
      case 'DONE':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'Selesai'
        };
      case 'RESCHEDULED':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          label: 'Menunggu Persetujuan Reschedule'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          label: status
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
}