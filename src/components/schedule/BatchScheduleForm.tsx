'use client';

import { useState } from 'react';
import { konsultasiApi } from '@/api';
import ScheduleWeekSelector from './ScheduleWeekSelector';

interface BatchScheduleFormProps {
  onScheduleCreated: () => void;
}

export default function BatchScheduleForm({ onScheduleCreated }: BatchScheduleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [form, setForm] = useState({
    selectedDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    selectedTimeSlots: ['09:00'],
  });

  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00'
  ];

  const handleDaysChange = (selectedDays: string[]) => {
    setForm(prev => ({ ...prev, selectedDays }));
  };

  const handleTimeSlotToggle = (timeSlot: string) => {
    setForm(prev => ({
      ...prev,
      selectedTimeSlots: prev.selectedTimeSlots.includes(timeSlot)
        ? prev.selectedTimeSlots.filter(slot => slot !== timeSlot)
        : [...prev.selectedTimeSlots, timeSlot].sort()
    }));
  };

  const getEndTime = (startTime: string) => {
    const hour = parseInt(startTime.split(':')[0]);
    const nextHour = hour + 1;
    return `${nextHour.toString().padStart(2, '0')}:00`;
  };

  const validateForm = () => {
    const errors = [];
    
    if (form.selectedDays.length === 0) {
      errors.push("At least one day must be selected");
    }
    
    if (form.selectedTimeSlots.length === 0) {
      errors.push("At least one time slot must be selected");
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join('. '));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const scheduleRequests = [];
      
      for (const day of form.selectedDays) {
        for (const timeSlot of form.selectedTimeSlots) {
          const endTime = getEndTime(timeSlot);
          scheduleRequests.push({
            day,
            timeSlot,
            endTime,
            displayName: `${day.charAt(0) + day.slice(1).toLowerCase()} ${timeSlot}-${endTime}`,
            request: {
              day,
              startTime: `${timeSlot}:00`,
              endTime: `${endTime}:00`
            }
          });
        }
      }
      
      const results = await Promise.allSettled(
        scheduleRequests.map(async (schedule) => {
          try {
            await konsultasiApi.createSchedule(schedule.request);
            return { success: true, schedule: schedule.displayName };
          } catch (error: any) {
            let errorMessage = 'Unknown error';
            
            if (error?.response?.data?.message) {
              errorMessage = error.response.data.message;
            } else if (error?.response?.status === 409) {
              errorMessage = 'Schedule conflict - this time slot may already exist';
            } else if (error?.message && !error.message.includes('Request failed with status code')) {
              errorMessage = error.message;
            } else if (error?.response?.status) {
              errorMessage = `Server error (${error.response.status})`;
            }
            
            return { 
              success: false, 
              schedule: schedule.displayName, 
              error: errorMessage
            };
          }
        })
      );
      
      const successful = results.filter((result): result is PromiseFulfilledResult<{success: true, schedule: string}> => 
        result.status === 'fulfilled' && result.value.success
      );
      const failed = results.filter((result): result is PromiseFulfilledResult<{success: false, schedule: string, error: string}> => 
        result.status === 'fulfilled' && !result.value.success
      );
      const rejected = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');
      
      const totalSuccessful = successful.length;
      const totalFailed = failed.length + rejected.length;
      const totalAttempted = scheduleRequests.length;
      
      if (totalSuccessful === totalAttempted) {
        setSuccess(`Successfully created all ${totalSuccessful} schedules!`);
        setForm({
          selectedDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
          selectedTimeSlots: ['09:00'],
        });
        onScheduleCreated();
      } else if (totalSuccessful > 0) {
        let message = `Partially successful: ${totalSuccessful} out of ${totalAttempted} schedules created successfully.`;
        
        if (totalFailed > 0) {
          const failedSchedules = failed.map(result => result.value).slice(0, 3); // Show first 3 failures
          const failureReasons = [...new Set(failedSchedules.map(f => f.error))]; // Unique error messages
          
          message += `\n\nFailed schedules:`;
          failedSchedules.forEach(failure => {
            message += `\n• ${failure.schedule}: ${failure.error}`;
          });
          
          if (totalFailed > 3) {
            message += `\n• ... and ${totalFailed - 3} more`;
          }

          if (failureReasons.some(reason => reason.toLowerCase().includes('overlap') || reason.toLowerCase().includes('conflict'))) {
            message += `\n\nTip: Some schedules may conflict with existing ones. Try selecting different time slots.`;
          }
        }
        
        setSuccess(message);
        onScheduleCreated(); // Refresh the schedule list
      } else {
        // All failed
        const firstError = failed.length > 0 ? failed[0].value.error : 'Unknown error occurred';
        setError(`Failed to create any schedules. ${firstError}. Please check your selections and try again.`);
      }
      
    } catch (err: any) {
      console.error('Unexpected error in batch schedule creation:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Days of Week
        </label>
        <ScheduleWeekSelector 
          selectedDays={form.selectedDays}
          onChange={handleDaysChange}
        />
        <p className="text-xs text-gray-500 mt-1">
          Selected: {form.selectedDays.length} day{form.selectedDays.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Time Slots (1 hour each)
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
          {timeSlots.map(time => (
            <button
              key={time}
              type="button"
              onClick={() => handleTimeSlotToggle(time)}
              className={`p-2 text-sm rounded border transition-colors ${
                form.selectedTimeSlots.includes(time)
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-xs font-medium">
                {time} - {getEndTime(time)}
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Selected: {form.selectedTimeSlots.length} time slot{form.selectedTimeSlots.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Preview</h4>
        <p className="text-sm text-blue-700">
          This will create <strong>{form.selectedDays.length * form.selectedTimeSlots.length}</strong> individual schedule slots:
        </p>
        <ul className="text-xs text-blue-600 mt-1 space-y-1">
          <li>• {form.selectedDays.length} day{form.selectedDays.length !== 1 ? 's' : ''}: {form.selectedDays.map(day => day.charAt(0) + day.slice(1).toLowerCase()).join(', ')}</li>
          <li>• {form.selectedTimeSlots.length} time slot{form.selectedTimeSlots.length !== 1 ? 's' : ''}: {form.selectedTimeSlots.map(slot => `${slot}-${getEndTime(slot)}`).join(', ')}</li>
        </ul>
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting || form.selectedDays.length === 0 || form.selectedTimeSlots.length === 0}
        className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        {isSubmitting 
          ? "Creating Schedules..." 
          : `Create ${form.selectedDays.length * form.selectedTimeSlots.length} Schedule${form.selectedDays.length * form.selectedTimeSlots.length !== 1 ? 's' : ''}`
        }
      </button>
    </form>
  );
}