import React from 'react';
import { useStore } from '../../lib/store';
import { Table } from '../common/Table';
import { format } from 'date-fns';

export function RecentRentals() {
  const rentals = useStore((state) => state.rentals);
  const customers = useStore((state) => state.customers);
  const products = useStore((state) => state.products);

  const columns = [
    {
      header: 'Customer',
      accessorFn: (row: any) => {
        const customer = customers.find((c) => c.id === row.customerId);
        return `${customer?.firstName} ${customer?.lastName}`;
      },
    },
    {
      header: 'Product',
      accessorFn: (row: any) => {
        const product = products.find((p) => p.id === row.productId);
        return product?.name;
      },
    },
    {
      header: 'Start Date',
      accessorFn: (row: any) => format(new Date(row.startDate), 'MMM dd, yyyy'),
    },
    {
      header: 'Status',
      accessorFn: (row: any) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            row.status === 'active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : row.status === 'overdue'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Recent Rentals
        </h2>
      </div>
      <div className="p-6">
        <Table
          data={rentals.slice(0, 5)}
          columns={columns}
        />
      </div>
    </div>
  );
}