'use client';

import { useEffect, useState } from 'react';
import { konsultasiApi } from '@/api';
import ScheduleCard from './ScheduleCard';

interface ScheduleListProps {
  refreshTrigger: number;
}

interface Schedule {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  oneTime: boolean;
  specificDate?: string;
}

export default function ScheduleList({ refreshTrigger }: ScheduleListProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSchedules = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const data = await konsultasiApi.getCaregiverSchedules();
        setSchedules(data);
      } catch (err) {
        console.error('Failed to fetch schedules:', err);
        setError('Failed to load schedules. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, [refreshTrigger]);

  const formatTime = (time: string) => {
    if (!time) return '';

    if (time.includes(':') && time.split(':').length === 3) {
      const [hours, minutes] = time.split(':');
      return `${hours}:${minutes}`;
    }
    
    return time;
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) {
      return;
    }
    
    try {
      await konsultasiApi.deleteSchedule(id);
      setSchedules(schedules.filter(schedule => schedule.id !== id));
    } catch (err) {
      console.error('Failed to delete schedule:', err);
      alert('Failed to delete schedule. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
        <span className="text-gray-600">Loading schedules...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (schedules.length === 0) {
    return <div className="text-gray-500 py-4 text-center">No schedules found. Create one to get started!</div>;
  }

  // Grid view for larger screens, list for mobile
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {schedules.map((schedule) => (
        <ScheduleCard
          key={schedule.id}
          id={schedule.id}
          day={schedule.day}
          startTime={schedule.startTime}
          endTime={schedule.endTime}
          oneTime={schedule.oneTime}
          specificDate={schedule.specificDate}
          onDelete={(id) => setSchedules(schedules.filter(s => s.id !== id))}
        />
      ))}
    </div>
  );
}