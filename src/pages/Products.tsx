import React from 'react';
import { useStore } from '../lib/store';
import { Table } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Input } from '../components/common/Input';
import { ProductForm } from '../components/products/ProductForm';
import type { Product } from '../types';

export default function Products() {
  const products = useStore((state) => state.products);
  const [search, setSearch] = React.useState('');
  const [showForm, setShowForm] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.category.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (price: Product['price']) => {
    if (!price || typeof price.daily !== 'number') return 'N/A';
    return `$${price.daily.toFixed(2)}`;
  };

  const columns = [
    {
      header: 'Name',
      accessorKey: 'name',
    },
    {
      header: 'Category',
      accessorKey: 'category',
    },
    {
      header: 'Daily Price',
      accessorFn: (row: Product) => formatPrice(row.price),
    },
    {
      header: 'Stock',
      accessorFn: (row: Product) => 
        row.stockAvailable !== undefined ? `${row.stockAvailable}/${row.stockTotal}` : `0/${row.stockTotal}`,
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
              setEditingProduct(row.original);
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
    if (window.confirm('Are you sure you want to delete this product?')) {
      useStore.getState().deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Products
        </h1>
        <Button icon={Plus} onClick={() => setShowForm(true)}>
          Add Product
        </Button>
      </div>

      <div className="flex space-x-4">
        <div className="w-64">
          <Input
            label=""
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <Table data={filteredProducts} columns={columns} />
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}