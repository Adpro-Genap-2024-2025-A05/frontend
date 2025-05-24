'use client';

import { useState } from 'react';
import { konsultasiApi } from '@/api';

interface ScheduleCardProps {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  oneTime: boolean;
  specificDate?: string;
  onDelete: (id: string) => void;
}

export default function ScheduleCard({
  id,
  day,
  startTime,
  endTime,
  oneTime,
  specificDate,
  onDelete
}: ScheduleCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const formatTime = (time: string) => {
    if (!time) return '';

    if (time.includes(':') && time.split(':').length === 3) {
      const [hours, minutes] = time.split(':');
      return `${hours}:${minutes}`;
    }
    
    return time;
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this schedule?')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await konsultasiApi.deleteSchedule(id);
      onDelete(id);
    } catch (err) {
      console.error('Failed to delete schedule:', err);
      alert('Failed to delete schedule. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {oneTime && specificDate 
                ? new Date(specificDate).toLocaleDateString()
                : day.charAt(0) + day.slice(1).toLowerCase()}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {formatTime(startTime)} - {formatTime(endTime)}
            </p>
            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 mt-2 rounded-full">
              {oneTime ? 'One-time' : 'Weekly'}
            </span>
          </div>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-800 disabled:text-red-400"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}