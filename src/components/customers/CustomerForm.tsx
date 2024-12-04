import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useStore } from '../../lib/store';
import { X, Copy } from 'lucide-react';
import type { Customer, Address } from '../../types';

interface CustomerFormProps {
  customer?: Customer;
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

export function CustomerForm({ customer, onClose }: CustomerFormProps) {
  const addCustomer = useStore((state) => state.addCustomer);
  const updateCustomer = useStore((state) => state.updateCustomer);
  const [useDeliveryAddress, setUseDeliveryAddress] = React.useState(
    !!customer?.deliveryAddress
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: customer || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      homeAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      deliveryAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
    },
  });

  const copyHomeAddress = () => {
    const homeAddress = watch('homeAddress');
    Object.keys(homeAddress).forEach((key) => {
      setValue(`deliveryAddress.${key}`, homeAddress[key]);
    });
  };

  const onSubmit = (data: any) => {
    if (!useDeliveryAddress) {
      delete data.deliveryAddress;
    }
    
    if (customer) {
      updateCustomer(customer.id, data);
    } else {
      addCustomer(data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {customer ? 'Edit Customer' : 'Add Customer'}
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
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              {...register('firstName', { required: 'First name is required' })}
              error={errors.firstName?.message}
            />
            <Input
              label="Last Name"
              {...register('lastName', { required: 'Last name is required' })}
              error={errors.lastName?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              error={errors.email?.message}
            />
            <Input
              label="Phone"
              {...register('phone', {
                required: 'Phone is required',
                pattern: {
                  value: /^\+?[\d\s-]+$/,
                  message: 'Invalid phone number',
                },
              })}
              error={errors.phone?.message}
            />
          </div>

          <AddressFields
            register={register}
            errors={errors}
            prefix="homeAddress"
            label="Home Address"
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="useDeliveryAddress"
              checked={useDeliveryAddress}
              onChange={(e) => setUseDeliveryAddress(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="useDeliveryAddress"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Add delivery address
            </label>
          </div>

          {useDeliveryAddress && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <AddressFields
                  register={register}
                  errors={errors}
                  prefix="deliveryAddress"
                  label="Delivery Address"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Copy}
                  onClick={copyHomeAddress}
                  className="ml-4"
                >
                  Copy Home Address
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {customer ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}