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

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

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

  const handleScheduleDelete = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  const groupAndSortSchedules = () => {
    const grouped: Record<string, Schedule[]> = {};
    
    daysOfWeek.forEach(day => {
      grouped[day] = [];
    });
    grouped['ONE_TIME'] = [];

    schedules.forEach(schedule => {
      if (schedule.oneTime) {
        grouped['ONE_TIME'].push(schedule);
      } else {
        if (grouped[schedule.day]) {
          grouped[schedule.day].push(schedule);
        }
      }
    });

    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => {
        if (day === 'ONE_TIME') {
          if (a.specificDate && b.specificDate) {
            const dateComparison = a.specificDate.localeCompare(b.specificDate);
            if (dateComparison !== 0) return dateComparison;
          }
        }
        return a.startTime.localeCompare(b.startTime);
      });
    });

    return grouped;
  };

  const formatDayName = (day: string) => {
    if (day === 'ONE_TIME') return 'One-Time Schedules';
    return day.charAt(0) + day.slice(1).toLowerCase();
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

  const groupedSchedules = groupAndSortSchedules();

  return (
    <div className="space-y-4">
      {daysOfWeek.map(day => {
        const daySchedules = groupedSchedules[day] || [];
        
        if (daySchedules.length === 0) return null;

        return (
          <div key={day} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 flex items-center justify-between">
                <span className="flex items-center">
                  <span className="mr-2">📅</span>
                  {formatDayName(day)}
                </span>
                <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full">
                  {daySchedules.length} slot{daySchedules.length !== 1 ? 's' : ''}
                </span>
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {daySchedules.map((schedule, index) => (
                  <div key={schedule.id} className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500 w-8">
                      {index + 1}.
                    </span>
                    <div className="flex-1">
                      <ScheduleCard
                        id={schedule.id}
                        day={schedule.day}
                        startTime={schedule.startTime}
                        endTime={schedule.endTime}
                        oneTime={schedule.oneTime}
                        specificDate={schedule.specificDate}
                        onDelete={handleScheduleDelete}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* One-time schedules section */}
      {groupedSchedules['ONE_TIME'].length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-3 border-b border-orange-200">
            <h3 className="text-lg font-semibold text-orange-900 flex items-center justify-between">
              <span className="flex items-center">
                <span className="mr-2">📅</span>
                One-Time Schedules
              </span>
              <span className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full">
                {groupedSchedules['ONE_TIME'].length} slot{groupedSchedules['ONE_TIME'].length !== 1 ? 's' : ''}
              </span>
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {groupedSchedules['ONE_TIME'].map((schedule, index) => (
                <div key={schedule.id} className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500 w-8">
                    {index + 1}.
                  </span>
                  <div className="flex-1">
                    <ScheduleCard
                      id={schedule.id}
                      day={schedule.day}
                      startTime={schedule.startTime}
                      endTime={schedule.endTime}
                      oneTime={schedule.oneTime}
                      specificDate={schedule.specificDate}
                      onDelete={handleScheduleDelete}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}