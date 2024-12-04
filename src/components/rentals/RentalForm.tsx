import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useStore } from '../../lib/store';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Rental, RentalItem } from '../../types';
import { differenceInDays } from 'date-fns';

interface RentalFormProps {
  rental?: Rental;
  onClose: () => void;
}

interface AddressFieldsProps {
  register: any;
  errors: any;
  prefix: string;
  label: string;
}

function AddressFields({ register, errors, prefix, label }: AddressFieldsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{label}</h3>
      <Input
        label="Street"
        {...register(`${prefix}.street`, { required: 'Street is required' })}
        error={errors[prefix]?.street?.message}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="City"
          {...register(`${prefix}.city`, { required: 'City is required' })}
          error={errors[prefix]?.city?.message}
        />
        <Input
          label="State"
          {...register(`${prefix}.state`, { required: 'State is required' })}
          error={errors[prefix]?.state?.message}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="ZIP Code"
          {...register(`${prefix}.zipCode`, { required: 'ZIP code is required' })}
          error={errors[prefix]?.zipCode?.message}
        />
        <Input
          label="Country"
          {...register(`${prefix}.country`, { required: 'Country is required' })}
          error={errors[prefix]?.country?.message}
        />
      </div>
    </div>
  );
}

export function RentalForm({ rental, onClose }: RentalFormProps) {
  const addRental = useStore((state) => state.addRental);
  const customers = useStore((state) => state.customers);
  const products = useStore((state) => state.products);
  const [useCustomDeliveryAddress, setUseCustomDeliveryAddress] = React.useState(false);
  const [stockErrors, setStockErrors] = React.useState<{ [key: string]: string }>({});

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: rental || {
      customerId: '',
      items: [{ productId: '', quantity: 1, dailyPrice: 0, deposit: 0 }],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      totalPrice: 0,
      totalDeposit: 0,
      deliveryAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const selectedCustomerId = watch('customerId');
  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const items = watch('items');

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Validate stock availability when quantity changes
  const validateStock = React.useCallback((items: RentalItem[]) => {
    const newStockErrors: { [key: string]: string } = {};
    const productQuantities: { [key: string]: number } = {};

    // First, aggregate quantities for each product
    items.forEach((item, index) => {
      if (item.productId && item.quantity) {
        productQuantities[item.productId] = (productQuantities[item.productId] || 0) + item.quantity;
      }
    });

    // Then check if the total quantity for each product exceeds available stock
    Object.entries(productQuantities).forEach(([productId, totalQuantity]) => {
      const product = products.find(p => p.id === productId);
      if (product && totalQuantity > product.stockAvailable) {
        items.forEach((item, index) => {
          if (item.productId === productId) {
            newStockErrors[`items.${index}.quantity`] = 
              `Only ${product.stockAvailable} units available`;
          }
        });
      }
    });

    setStockErrors(newStockErrors);
    return Object.keys(newStockErrors).length === 0;
  }, [products]);

  React.useEffect(() => {
    validateStock(items);
  }, [items, validateStock]);

  React.useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = differenceInDays(end, start) + 1;

      if (days > 0) {
        let totalPrice = 0;
        let totalDeposit = 0;

        items.forEach((item, index) => {
          const product = products.find(p => p.id === item.productId);
          if (product && item.quantity > 0) {
            let itemPrice = 0;
            
            // Calculate price based on rental duration
            if (product.price.monthly && days >= 30) {
              const months = Math.floor(days / 30);
              const remainingDays = days % 30;
              itemPrice += months * product.price.monthly;
              itemPrice += remainingDays * product.price.daily;
            } else if (product.price.weekly && days >= 7) {
              const weeks = Math.floor(days / 7);
              const remainingDays = days % 7;
              itemPrice += weeks * product.price.weekly;
              itemPrice += remainingDays * product.price.daily;
            } else {
              itemPrice = days * product.price.daily;
            }

            itemPrice *= item.quantity;
            totalPrice += itemPrice;
            totalDeposit += product.price.deposit * item.quantity;

            setValue(`items.${index}.dailyPrice`, product.price.daily);
            setValue(`items.${index}.deposit`, product.price.deposit);
          }
        });

        setValue('totalPrice', totalPrice);
        setValue('totalDeposit', totalDeposit);
      }
    }
  }, [items, startDate, endDate, products, setValue]);

  React.useEffect(() => {
    if (selectedCustomer && !useCustomDeliveryAddress) {
      const address = selectedCustomer.deliveryAddress || selectedCustomer.homeAddress;
      Object.keys(address).forEach((key) => {
        setValue(`deliveryAddress.${key}`, address[key]);
      });
    }
  }, [selectedCustomer, useCustomDeliveryAddress, setValue]);

  const onSubmit = (data: any) => {
    // Filter out items with no product selected
    data.items = data.items.filter((item: RentalItem) => item.productId && item.quantity > 0);
    
    // Validate stock availability before submitting
    if (!validateStock(data.items)) {
      return;
    }
    
    addRental({
      ...data,
      status: 'active',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            New Rental
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Customer
            </label>
            <select
              {...register('customerId', { required: 'Customer is required' })}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm
                focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.firstName} {customer.lastName}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.customerId.message}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Products
              </h3>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={() => append({ productId: '', quantity: 1, dailyPrice: 0, deposit: 0 })}
              >
                Add Product
              </Button>
            </div>

            {fields.map((field, index) => {
              const selectedProduct = products.find(p => p.id === items[index]?.productId);
              
              return (
                <div key={field.id} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Product
                    </label>
                    <select
                      {...register(`items.${index}.productId`, { required: 'Product is required' })}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm
                        focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                        dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Select a product</option>
                      {products.filter(p => p.stockAvailable > 0).map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} (${product.price.daily}/day) - {product.stockAvailable} available
                        </option>
                      ))}
                    </select>
                    {errors.items?.[index]?.productId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.items[index].productId.message}
                      </p>
                    )}
                  </div>

                  <div className="w-32">
                    <Input
                      label="Quantity"
                      type="number"
                      min="1"
                      max={selectedProduct?.stockAvailable}
                      {...register(`items.${index}.quantity`, {
                        required: 'Quantity is required',
                        min: { value: 1, message: 'Minimum quantity is 1' },
                        max: { 
                          value: selectedProduct?.stockAvailable || 1,
                          message: `Maximum quantity is ${selectedProduct?.stockAvailable}`
                        },
                        valueAsNumber: true,
                      })}
                      error={errors.items?.[index]?.quantity?.message || stockErrors[`items.${index}.quantity`]}
                    />
                  </div>

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      onClick={() => remove(index)}
                      className="mt-6"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              {...register('startDate', { required: 'Start date is required' })}
              error={errors.startDate?.message}
            />

            <Input
              label="End Date"
              type="date"
              {...register('endDate', {
                required: 'End date is required',
                validate: (value) =>
                  !startDate || new Date(value) >= new Date(startDate) ||
                  'End date must be after start date',
              })}
              error={errors.endDate?.message}
            />
          </div>

          {items.some(item => item.productId) && startDate && endDate && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Price
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  ${watch('totalPrice')?.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Security Deposit
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  ${watch('totalDeposit')?.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useCustomDeliveryAddress"
                checked={useCustomDeliveryAddress}
                onChange={(e) => setUseCustomDeliveryAddress(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="useCustomDeliveryAddress"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Use custom delivery address
              </label>
            </div>

            {selectedCustomer && (
              <AddressFields
                register={register}
                errors={errors}
                prefix="deliveryAddress"
                label={useCustomDeliveryAddress ? "Custom Delivery Address" : "Delivery Address"}
              />
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={Object.keys(stockErrors).length > 0}
            >
              Create Rental
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}