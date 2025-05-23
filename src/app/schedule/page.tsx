'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScheduleTabs from '@/components/schedule/ScheduleTabs';
import ScheduleList from '@/components/schedule/ScheduleList';

export default function SchedulePage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleScheduleCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <ProtectedRoute allowedRoles={['CAREGIVER']} requiredService="konsultasi">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-8">Manage Your Schedule</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Create Schedule</h2>
            <ScheduleTabs onScheduleCreated={handleScheduleCreated} />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Your Schedules</h2>
            <ScheduleList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}