'use client';

import { useState } from 'react';
import ScheduleForm from './ScheduleForm';
import OneTimeScheduleForm from './OneTimeScheduleForm';
import BatchScheduleForm from './BatchScheduleForm';

interface ScheduleTabsProps {
  onScheduleCreated: () => void;
}

export default function ScheduleTabs({ onScheduleCreated }: ScheduleTabsProps) {
  const [activeTab, setActiveTab] = useState<'weekly' | 'oneTime' | 'batch'>('weekly');

  return (
    <div>
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`w-1/3 py-2 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === 'weekly'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Weekly Schedule
          </button>
          <button
            onClick={() => setActiveTab('oneTime')}
            className={`w-1/3 py-2 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === 'oneTime'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            One-Time
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`w-1/3 py-2 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === 'batch'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Multi-Day
          </button>
        </nav>
      </div>

      <div className="mt-4">
        {activeTab === 'weekly' ? (
          <ScheduleForm onScheduleCreated={onScheduleCreated} />
        ) : activeTab === 'oneTime' ? (
          <OneTimeScheduleForm onScheduleCreated={onScheduleCreated} />
        ) : (
          <BatchScheduleForm onScheduleCreated={onScheduleCreated} />
        )}
      </div>
    </div>
  );
}