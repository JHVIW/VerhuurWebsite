import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useStore } from '../../lib/store';
import { X } from 'lucide-react';
import type { Product } from '../../types';

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
}

export function ProductForm({ product, onClose }: ProductFormProps) {
  const addProduct = useStore((state) => state.addProduct);
  const updateProduct = useStore((state) => state.updateProduct);
  const [hasWeeklyRate, setHasWeeklyRate] = React.useState(!!product?.price.weekly);
  const [hasMonthlyRate, setHasMonthlyRate] = React.useState(!!product?.price.monthly);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: product || {
      name: '',
      description: '',
      category: '',
      price: {
        daily: 0,
        weekly: 0,
        monthly: 0,
        deposit: 0,
      },
      stockTotal: 0,
      imageUrl: '',
    },
  });

  const dailyRate = watch('price.daily');
  const calculateSuggestedRate = (days: number) => {
    return (dailyRate * days * 0.9).toFixed(2); // 10% discount
  };

  const onSubmit = (data: any) => {
    const formattedData = {
      ...data,
      price: {
        daily: parseFloat(data.price.daily),
        deposit: parseFloat(data.price.deposit),
        ...(hasWeeklyRate && { weekly: parseFloat(data.price.weekly) }),
        ...(hasMonthlyRate && { monthly: parseFloat(data.price.monthly) }),
      },
      stockTotal: parseInt(data.stockTotal, 10),
    };

    // Remove imageUrl if empty
    if (!formattedData.imageUrl) {
      delete formattedData.imageUrl;
    }

    if (product) {
      updateProduct(product.id, formattedData);
    } else {
      addProduct(formattedData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <Button
            variant="secondary"
            size="sm"
            icon={X}
            onClick={onClose}
          >
            Close
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
          />

          <Input
            label="Description"
            {...register('description', { required: 'Description is required' })}
            error={errors.description?.message}
          />

          <Input
            label="Category"
            {...register('category', { required: 'Category is required' })}
            error={errors.category?.message}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Pricing</h3>
            
            <Input
              label="Daily Rate"
              type="number"
              step="0.01"
              {...register('price.daily', {
                required: 'Daily rate is required',
                min: { value: 0, message: 'Price must be positive' },
                valueAsNumber: true,
              })}
              error={errors.price?.daily?.message}
            />

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasWeeklyRate"
                checked={hasWeeklyRate}
                onChange={(e) => setHasWeeklyRate(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="hasWeeklyRate"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Add weekly rate
              </label>
            </div>

            {hasWeeklyRate && (
              <Input
                label={`Weekly Rate (Suggested: $${calculateSuggestedRate(7)})`}
                type="number"
                step="0.01"
                {...register('price.weekly', {
                  required: hasWeeklyRate ? 'Weekly rate is required' : false,
                  min: { value: 0, message: 'Price must be positive' },
                  valueAsNumber: true,
                })}
                error={errors.price?.weekly?.message}
              />
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasMonthlyRate"
                checked={hasMonthlyRate}
                onChange={(e) => setHasMonthlyRate(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="hasMonthlyRate"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Add monthly rate
              </label>
            </div>

            {hasMonthlyRate && (
              <Input
                label={`Monthly Rate (Suggested: $${calculateSuggestedRate(30)})`}
                type="number"
                step="0.01"
                {...register('price.monthly', {
                  required: hasMonthlyRate ? 'Monthly rate is required' : false,
                  min: { value: 0, message: 'Price must be positive' },
                  valueAsNumber: true,
                })}
                error={errors.price?.monthly?.message}
              />
            )}

            <Input
              label="Security Deposit"
              type="number"
              step="0.01"
              {...register('price.deposit', {
                required: 'Security deposit is required',
                min: { value: 0, message: 'Deposit must be positive' },
                valueAsNumber: true,
              })}
              error={errors.price?.deposit?.message}
            />
          </div>

          <Input
            label="Total Stock"
            type="number"
            {...register('stockTotal', {
              required: 'Stock is required',
              min: { value: 0, message: 'Stock must be positive' },
              valueAsNumber: true,
            })}
            error={errors.stockTotal?.message}
          />

          <Input
            label="Image URL"
            {...register('imageUrl')}
            error={errors.imageUrl?.message}
          />

          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {product ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}