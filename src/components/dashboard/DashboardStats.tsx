import React from 'react';
import { DollarSign, Package, Users, Clock } from 'lucide-react';
import { useStore } from '../../lib/store';
import { differenceInDays, subMonths } from 'date-fns';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: {
    value: string;
    positive: boolean;
  };
}

function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <span className={`text-sm font-medium ${trend.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </span>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 ml-2">vs last month</span>
      </div>
    </div>
  );
}

export function DashboardStats() {
  const rentals = useStore((state) => state.rentals);
  const customers = useStore((state) => state.customers);

  const now = new Date();
  const lastMonth = subMonths(now, 1);

  // Calculate current month's metrics
  const currentMonthRentals = rentals.filter(rental => new Date(rental.startDate) >= lastMonth);
  const currentRevenue = currentMonthRentals.reduce((sum, rental) => sum + rental.totalPrice, 0);

  // Calculate last month's metrics
  const twoMonthsAgo = subMonths(now, 2);
  const lastMonthRentals = rentals.filter(
    rental => new Date(rental.startDate) >= twoMonthsAgo && new Date(rental.startDate) < lastMonth
  );
  const lastMonthRevenue = lastMonthRentals.reduce((sum, rental) => sum + rental.totalPrice, 0);

  // Calculate trends
  const revenueTrend = ((currentRevenue - lastMonthRevenue) / lastMonthRevenue * 100) || 0;
  const activeRentals = rentals.filter(rental => rental.status === 'active').length;
  const lastMonthActiveRentals = lastMonthRentals.filter(rental => rental.status === 'active').length;
  const rentalsTrend = ((activeRentals - lastMonthActiveRentals) / lastMonthActiveRentals * 100) || 0;

  // Calculate customer trends
  const newCustomers = customers.filter(customer => new Date(customer.joinDate) >= lastMonth).length;
  const lastMonthNewCustomers = customers.filter(
    customer => new Date(customer.joinDate) >= twoMonthsAgo && new Date(customer.joinDate) < lastMonth
  ).length;
  const customersTrend = ((newCustomers - lastMonthNewCustomers) / lastMonthNewCustomers * 100) || 0;

  // Count overdue rentals
  const overdueRentals = rentals.filter(rental => {
    const endDate = new Date(rental.endDate);
    return rental.status === 'active' && endDate < now;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Revenue"
        value={`$${currentRevenue.toFixed(2)}`}
        icon={<DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
        trend={{ value: `${Math.abs(revenueTrend).toFixed(1)}%`, positive: revenueTrend >= 0 }}
      />
      <StatCard
        title="Active Rentals"
        value={activeRentals.toString()}
        icon={<Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
        trend={{ value: `${Math.abs(rentalsTrend).toFixed(1)}%`, positive: rentalsTrend >= 0 }}
      />
      <StatCard
        title="New Customers"
        value={newCustomers.toString()}
        icon={<Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
        trend={{ value: `${Math.abs(customersTrend).toFixed(1)}%`, positive: customersTrend >= 0 }}
      />
      <StatCard
        title="Overdue Rentals"
        value={overdueRentals.toString()}
        icon={<Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
        trend={{ value: "N/A", positive: false }}
      />
    </div>
  );
}