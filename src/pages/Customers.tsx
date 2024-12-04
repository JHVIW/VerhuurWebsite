import React from 'react';
import { useStore } from '../lib/store';
import { Table } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Input } from '../components/common/Input';
import { CustomerForm } from '../components/customers/CustomerForm';
import { format } from 'date-fns';

export default function Customers() {
  const customers = useStore((state) => state.customers);
  const [search, setSearch] = React.useState('');
  const [showForm, setShowForm] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<any>(null);

  const filteredCustomers = customers.filter((customer) =>
    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    customer.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Name',
      accessorFn: (row: any) => `${row.firstName} ${row.lastName}`,
    },
    {
      header: 'Email',
      accessorKey: 'email',
    },
    {
      header: 'Phone',
      accessorKey: 'phone',
    },
    {
      header: 'Join Date',
      accessorFn: (row: any) => format(new Date(row.joinDate), 'MMM dd, yyyy'),
    },
    {
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Edit2}
            onClick={() => {
              setEditingCustomer(row.original);
              setShowForm(true);
            }}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => handleDelete(row.original.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      useStore.getState().deleteCustomer(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Customers
        </h1>
        <Button icon={Plus} onClick={() => setShowForm(true)}>
          Add Customer
        </Button>
      </div>

      <div className="flex space-x-4">
        <div className="w-64">
          <Input
            label=""
            type="search"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <Table data={filteredCustomers} columns={columns} />
      </div>

      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onClose={() => {
            setShowForm(false);
            setEditingCustomer(null);
          }}
        />
      )}
    </div>
  );
}