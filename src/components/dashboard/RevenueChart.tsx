import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useStore } from '../../lib/store';
import { startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, format, subDays, subQuarters, subYears } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        boxWidth: 10,
        padding: 10,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: number) => `$${value.toFixed(2)}`,
      },
      grid: {
        drawBorder: false,
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  layout: {
    padding: {
      left: 10,
      right: 10,
      top: 10,
      bottom: 10,
    },
  },
  elements: {
    line: {
      tension: 0.3,
    },
    point: {
      radius: 4,
      hitRadius: 10,
      hoverRadius: 6,
    },
  },
};

interface RevenueChartProps {
  dateRange?: 'week' | 'month' | 'quarter' | 'year' | 'all';
}

export function RevenueChart({ dateRange = 'month' }: RevenueChartProps) {
  const rentals = useStore((state) => state.rentals);
  
  const getDateInterval = () => {
    const now = new Date();
    switch (dateRange) {
      case 'week':
        return { start: subDays(now, 7), end: now };
      case 'month':
        return { start: subMonths(now, 1), end: now };
      case 'quarter':
        return { start: subQuarters(now, 1), end: now };
      case 'year':
        return { start: subYears(now, 1), end: now };
      case 'all':
        const dates = rentals.map(r => new Date(r.startDate));
        const earliestDate = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : now;
        return { start: earliestDate, end: now };
      default:
        return { start: subMonths(now, 1), end: now };
    }
  };

  const interval = getDateInterval();
  const months = eachMonthOfInterval(interval);
  
  const revenueData = months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    return rentals
      .filter(rental => {
        const rentalDate = new Date(rental.startDate);
        return rentalDate >= monthStart && rentalDate <= monthEnd;
      })
      .reduce((sum, rental) => sum + rental.totalPrice, 0);
  });

  const data = {
    labels: months.map(month => format(month, 'MMM yyyy')),
    datasets: [
      {
        label: 'Revenue',
        data: revenueData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="relative h-[300px] w-full">
      <Line options={options} data={data} />
    </div>
  );
}