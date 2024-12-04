import React from 'react';
import { useStore } from '../lib/store';
import { Table } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { Plus, Search, FileText, CheckCircle } from 'lucide-react';
import { Input } from '../components/common/Input';
import { RentalForm } from '../components/rentals/RentalForm';
import { format } from 'date-fns';
import { generateInvoice } from '../lib/invoice';

export default function Rentals() {
  const rentals = useStore((state) => state.rentals);
  const customers = useStore((state) => state.customers);
  const products = useStore((state) => state.products);
  const updateRental = useStore((state) => state.updateRental);
  const [search, setSearch] = React.useState('');
  const [showForm, setShowForm] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState('all');

  const filteredRentals = rentals.filter((rental) => {
    const customer = customers.find((c) => c.id === rental.customerId);
    const searchMatch = customer?.firstName.toLowerCase().includes(search.toLowerCase()) ||
                       customer?.lastName.toLowerCase().includes(search.toLowerCase()) ||
                       rental.items.some(item => {
                         const product = products.find(p => p.id === item.productId);
                         return product?.name.toLowerCase().includes(search.toLowerCase());
                       });
    const statusMatch = statusFilter === 'all' || rental.status === statusFilter;
    return searchMatch && statusMatch;
  });

  const handleCompleteRental = async (rental: any) => {
    if (window.confirm('Are you sure you want to complete this rental?')) {
      try {
        await updateRental(rental.id, { ...rental, status: 'completed' });
      } catch (error) {
        console.error('Error completing rental:', error);
      }
    }
  };

  const handleGenerateInvoice = async (rental: any) => {
    try {
      const customer = customers.find(c => c.id === rental.customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      const rentalProducts = rental.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        return {
          ...product,
          quantity: item.quantity,
          dailyPrice: item.dailyPrice,
          deposit: item.deposit
        };
      });

      const invoiceData = {
        rental,
        customer,
        products: rentalProducts,
        date: format(new Date(), 'MMM dd, yyyy'),
      };

      await generateInvoice(invoiceData);
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice. Please try again.');
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'overdue':
        return 'Overdue';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const columns = [
    {
      header: 'Customer',
      accessorFn: (row: any) => {
        const customer = customers.find((c) => c.id === row.customerId);
        return `${customer?.firstName} ${customer?.lastName}`;
      },
    },
    {
      header: 'Products',
      accessorFn: (row: any) => {
        return row.items.map(item => {
          const product = products.find(p => p.id === item.productId);
          return `${product?.name} (${item.quantity}x)`;
        }).join(', ');
      },
    },
    {
      header: 'Start Date',
      accessorFn: (row: any) => format(new Date(row.startDate), 'MMM dd, yyyy'),
    },
    {
      header: 'End Date',
      accessorFn: (row: any) => format(new Date(row.endDate), 'MMM dd, yyyy'),
    },
    {
      header: 'Status',
      accessorFn: (row: any) => getStatusDisplay(row.status),
      cell: ({ row }: any) => {
        const status = row.original.status;
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              status === 'active'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : status === 'overdue'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : status === 'completed'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            }`}
          >
            {getStatusDisplay(status)}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            icon={FileText}
            onClick={() => handleGenerateInvoice(row.original)}
          >
            Invoice
          </Button>
          {row.original.status === 'active' && (
            <Button
              variant="secondary"
              size="sm"
              icon={CheckCircle}
              onClick={() => handleCompleteRental(row.original)}
            >
              Complete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Rentals
        </h1>
        <Button icon={Plus} onClick={() => setShowForm(true)}>
          New Rental
        </Button>
      </div>

      <div className="flex space-x-4">
        <div className="w-64">
          <Input
            label=""
            type="search"
            placeholder="Search rentals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
        </div>
        <select
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="overdue">Overdue</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <Table data={filteredRentals} columns={columns} />
      </div>

      {showForm && (
        <RentalForm
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}