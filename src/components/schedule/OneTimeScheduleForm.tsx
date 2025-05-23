'use client';

import { useState } from 'react';
import { konsultasiApi } from '@/api';

interface OneTimeScheduleFormProps {
  onScheduleCreated: () => void;
}

export default function OneTimeScheduleForm({ onScheduleCreated }: OneTimeScheduleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [form, setForm] = useState({
    specificDate: getTomorrowDate(),
    startTime: '09:00',
  });

  function getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const getEndTime = (startTime: string) => {
    const hour = parseInt(startTime.split(':')[0]);
    const nextHour = hour + 1;
    return `${nextHour.toString().padStart(2, '0')}:00`;
  };

  const validateForm = () => {
    const errors = [];
    
    if (!form.specificDate) {
      errors.push("Date is required");
    } else {
      const selectedDate = new Date(form.specificDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.push("Date must be in the future");
      }
    }
    
    if (!form.startTime) {
      errors.push("Time slot is required");
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
      const endTime = getEndTime(form.startTime);
      
      await konsultasiApi.createOneTimeSchedule({
        specificDate: form.specificDate,
        startTime: `${form.startTime}:00`,
        endTime: `${endTime}:00`
      });
      
      setSuccess('One-time schedule created successfully!');
      setForm({
        specificDate: getTomorrowDate(),
        startTime: '09:00',
      });
      
      onScheduleCreated();
    } catch (err: any) {
      console.error('Failed to create one-time schedule:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to create one-time schedule. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          type="date"
          name="specificDate"
          value={form.specificDate}
          onChange={handleChange}
          min={getTomorrowDate()}
          className="block w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Time Slot (1 hour)
        </label>
        <select
          name="startTime"
          value={form.startTime}
          onChange={handleChange}
          className="block w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {timeSlots.map(time => (
            <option key={time} value={time}>
              {time} - {getEndTime(time)}
            </option>
          ))}
        </select>
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75"
      >
        {isSubmitting ? "Creating..." : "Create One-Time Schedule"}
      </button>
    </form>
  );
}