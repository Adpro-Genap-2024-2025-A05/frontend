'use client';

import { useState } from 'react';

interface ScheduleWeekSelectorProps {
  selectedDays: string[];
  onChange: (days: string[]) => void;
}

export default function ScheduleWeekSelector({
  selectedDays,
  onChange,
}: ScheduleWeekSelectorProps) {
  const daysOfWeek = [
    { key: 'MONDAY', label: 'Mon' },
    { key: 'TUESDAY', label: 'Tue' },
    { key: 'WEDNESDAY', label: 'Wed' },
    { key: 'THURSDAY', label: 'Thu' },
    { key: 'FRIDAY', label: 'Fri' },
    { key: 'SATURDAY', label: 'Sat' },
    { key: 'SUNDAY', label: 'Sun' },
  ];

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day));
    } else {
      onChange([...selectedDays, day]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {daysOfWeek.map((day) => (
        <button
          key={day.key}
          type="button"
          onClick={() => toggleDay(day.key)}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
            selectedDays.includes(day.key)
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {day.label}
        </button>
      ))}
    </div>
  );
}