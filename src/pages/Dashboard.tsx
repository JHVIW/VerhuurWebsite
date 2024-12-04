import React from 'react';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { RecentRentals } from '../components/dashboard/RecentRentals';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Dashboard
        </h1>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
            Revenue Overview
          </h2>
          <RevenueChart />
        </div>
        <RecentRentals />
      </div>
    </div>
  );
}